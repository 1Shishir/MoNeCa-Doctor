import { Injectable } from '@angular/core';
import { Firestore, collection, doc, addDoc, setDoc, updateDoc, deleteDoc, getDoc, getDocs, query, where, orderBy, Timestamp, deleteField } from '@angular/fire/firestore';
import { Storage, ref as storageRef, uploadBytes, getDownloadURL } from '@angular/fire/storage';
import { from, Observable, of, throwError, forkJoin } from 'rxjs';
import { map, switchMap, catchError } from 'rxjs/operators';
import { Medication, Prescription, Test, TestResult, QuickOptions } from '../../models/prescription.model';
import { AuthService } from '../../auth/services/auth.service';

@Injectable({
  providedIn: 'root'
})
export class PrescriptionService {
  constructor(
    private firestore: Firestore,
    private storage: Storage,
    private authService: AuthService
  ) {}

  /**
   * Convert Firestore Timestamp to JavaScript Date
   */
  private safeToDate(value: any): Date {
    if (!value) return new Date();
    
    // Handle Firestore Timestamp
    if (value && typeof value.toDate === 'function') {
      return value.toDate();
    }
    
    // Handle string or number
    if (typeof value === 'string' || typeof value === 'number') {
      const parsedDate = new Date(value);
      return isNaN(parsedDate.getTime()) ? new Date() : parsedDate;
    }
    
    // Handle JavaScript Date
    if (value instanceof Date) {
      return value;
    }
    
    return new Date();
  }

  /**
   * Get prescriptions for a specific patient
   */
  getPrescriptionsByPatient(patientId: string): Observable<Prescription[]> {
    console.log(`Fetching prescriptions for patient: ${patientId}`);
    
    // Create document reference to the patient's prescriptions
    const prescriptionsRef = doc(this.firestore, 'prescriptions', patientId);
    
    return from(getDoc(prescriptionsRef)).pipe(
      map(docSnapshot => {
        if (!docSnapshot.exists()) {
          console.log(`No Firestore document exists for patient ${patientId}`);
          return [];
        }
        
        const data = docSnapshot.data() as Record<string, any>;
        const prescriptions: Prescription[] = [];
        
        // Process each date key in the patient's prescriptions
        Object.keys(data || {}).forEach(dateKey => {
          try {
            const prescriptionData = data[dateKey] as Record<string, any>;
            if (!prescriptionData) return;
            
            // Create a prescription ID combining patient ID and date key
            const id = `${patientId}_${dateKey}`;
            
            // Convert all date fields to JavaScript Date objects
            const prescription: Prescription = {
              id,
              patientId: prescriptionData['patientId'] || patientId,
              doctorId: prescriptionData['doctorId'],
              date: this.safeToDate(prescriptionData['date']),
              chiefComplaints: prescriptionData['chiefComplaints'] || '',
              clinicalFindings: prescriptionData['clinicalFindings'] || '',
              diagnosis: prescriptionData['diagnosis'] || [],
              medications: prescriptionData['medications'] || [],
              tests: (prescriptionData['tests'] || []).map((test: any) => ({
                ...test,
                result: test.result ? {
                  ...test.result,
                  uploadedAt: this.safeToDate(test.result.uploadedAt)
                } : undefined
              })),
              advice: prescriptionData['advice'] || '',
              nextVisit: prescriptionData['nextVisit'] ? this.safeToDate(prescriptionData['nextVisit']) : null,
              vitalSigns: prescriptionData['vitalSigns'] || {},
              createdAt: this.safeToDate(prescriptionData['createdAt']),
              updatedAt: this.safeToDate(prescriptionData['updatedAt'])
            };
            
            prescriptions.push(prescription);
          } catch (error) {
            console.error(`Error processing prescription with key ${dateKey}:`, error);
          }
        });
        
        console.log(`Found ${prescriptions.length} prescriptions for patient ${patientId}`);
        return prescriptions.sort((a, b) => b.date.getTime() - a.date.getTime());
      }),
      catchError(error => {
        console.error(`Error fetching prescriptions for patient ${patientId}:`, error);
        return of([]);
      })
    );
  }

  /**
   * Get a specific prescription by ID
   */
  getPrescription(prescriptionId: string): Observable<Prescription> {
    const [patientId, dateKey] = prescriptionId.split('_');
    
    if (!patientId || !dateKey) {
      return throwError(() => new Error('Invalid prescription ID format'));
    }
    
    const prescriptionsRef = doc(this.firestore, 'prescriptions', patientId);
    
    return from(getDoc(prescriptionsRef)).pipe(
      map(docSnapshot => {
        if (!docSnapshot.exists()) {
          throw new Error('Prescription not found');
        }
        
        const data = docSnapshot.data() as Record<string, any>;
        const prescriptionData = data[dateKey];
        
        if (!prescriptionData) {
          throw new Error('Prescription not found');
        }
        
        return {
          id: prescriptionId,
          patientId: prescriptionData['patientId'] || patientId,
          doctorId: prescriptionData['doctorId'],
          date: this.safeToDate(prescriptionData['date']),
          chiefComplaints: prescriptionData['chiefComplaints'] || '',
          clinicalFindings: prescriptionData['clinicalFindings'] || '',
          diagnosis: prescriptionData['diagnosis'] || [],
          medications: prescriptionData['medications'] || [],
          tests: (prescriptionData['tests'] || []).map((test: any) => ({
            ...test,
            result: test.result ? {
              ...test.result,
              uploadedAt: this.safeToDate(test.result.uploadedAt)
            } : undefined
          })),
          advice: prescriptionData['advice'] || '',
          nextVisit: prescriptionData['nextVisit'] ? this.safeToDate(prescriptionData['nextVisit']) : null,
          vitalSigns: prescriptionData['vitalSigns'] || {},
          createdAt: this.safeToDate(prescriptionData['createdAt']),
          updatedAt: this.safeToDate(prescriptionData['updatedAt'])
        } as Prescription;
      }),
      catchError(error => {
        console.error(`Error fetching prescription ${prescriptionId}:`, error);
        return throwError(() => error);
      })
    );
  }

  /**
   * Create a new prescription
   */
  createPrescription(prescription: Omit<Prescription, 'id' | 'createdAt' | 'updatedAt'>): Observable<string> {
    const now = new Date();
    const dateKey = this.formatDateTimeKey(now);
    const currentDoctor = this.authService.getCurrentDoctor();
    
    if (!currentDoctor) {
      return throwError(() => new Error('No authenticated doctor found'));
    }
    
    const prescriptionWithDates = {
      ...prescription,
      doctorId: currentDoctor.uuid,
      createdAt: now,
      updatedAt: now
    };
    
    const prescriptionsRef = doc(this.firestore, 'prescriptions', prescription.patientId);
    
    // Check if the patient document exists first
    return from(getDoc(prescriptionsRef)).pipe(
      switchMap(docSnapshot => {
        const prescriptionId = `${prescription.patientId}_${dateKey}`;
        
        if (!docSnapshot.exists()) {
          // Create new document with the prescription
          return from(setDoc(prescriptionsRef, {
            [dateKey]: prescriptionWithDates
          })).pipe(
            map(() => prescriptionId)
          );
        } else {
          // Update existing document with new prescription
          return from(updateDoc(prescriptionsRef, {
            [dateKey]: prescriptionWithDates
          })).pipe(
            map(() => prescriptionId)
          );
        }
      }),
      catchError(error => {
        console.error('Error creating prescription:', error);
        return throwError(() => error);
      })
    );
  }

  /**
   * Update an existing prescription
   */
  updatePrescription(prescriptionId: string, prescriptionUpdates: Partial<Omit<Prescription, 'id' | 'createdAt' | 'updatedAt'>>): Observable<void> {
    const [patientId, dateKey] = prescriptionId.split('_');
    
    if (!patientId || !dateKey) {
      return throwError(() => new Error('Invalid prescription ID format'));
    }
    
    const prescriptionsRef = doc(this.firestore, 'prescriptions', patientId);
    
    // First get the existing prescription
    return from(getDoc(prescriptionsRef)).pipe(
      switchMap(docSnapshot => {
        if (!docSnapshot.exists()) {
          throw new Error('Prescription not found');
        }
        
        const data = docSnapshot.data() as Record<string, any>;
        const existingPrescription = data[dateKey];
        
        if (!existingPrescription) {
          throw new Error('Prescription not found');
        }
        
        // Merge updates with existing data
        const updatedPrescription = {
          ...existingPrescription,
          ...prescriptionUpdates,
          updatedAt: new Date()
        };
        
        // Update the prescription
        return from(updateDoc(prescriptionsRef, {
          [dateKey]: updatedPrescription
        }));
      }),
      catchError(error => {
        console.error(`Error updating prescription ${prescriptionId}:`, error);
        return throwError(() => error);
      })
    );
  }

  /**
   * Delete a prescription
   */
  deletePrescription(prescriptionId: string): Observable<void> {
    const [patientId, dateKey] = prescriptionId.split('_');
    
    if (!patientId || !dateKey) {
      return throwError(() => new Error('Invalid prescription ID format'));
    }
    
    const prescriptionsRef = doc(this.firestore, 'prescriptions', patientId);
    
    // Create an update object that sets the dateKey field to be deleted
    const updateData: Record<string, any> = {};
    updateData[dateKey] = deleteField();
    
    // Update the document to remove the field
    return from(updateDoc(prescriptionsRef, updateData)).pipe(
      catchError(error => {
        console.error(`Error deleting prescription ${prescriptionId}:`, error);
        return throwError(() => error);
      })
    );
  }

  /**
   * Get patient information
   */
  getPatientInfo(patientId: string): Observable<any> {
    const patientRef = doc(this.firestore, 'patients', patientId);
    
    return from(getDoc(patientRef)).pipe(
      map(docSnapshot => {
        if (!docSnapshot.exists()) {
          return null;
        }
        
        const data = docSnapshot.data();
        return data['personalInfo'] || { fullName: 'Unknown Patient' };
      }),
      catchError(error => {
        console.error(`Error getting patient info for ${patientId}:`, error);
        return of(null);
      })
    );
  }

  /**
   * Get preset quick text options
   */
  getQuickTextOptions(): Observable<QuickOptions> {
    return of({
      complaints: [
        "Headache", "Nausea", "Fatigue", "Back pain", "Swelling",
        "Morning sickness", "Abdominal cramping", "Heartburn",
        "Dizziness", "Spotting", "Constipation", "Insomnia"
      ],
      diagnoses: [
        "Normal pregnancy", "Gestational diabetes", "Mild preeclampsia",
        "Hyperemesis gravidarum", "Placenta previa", "Iron deficiency anemia",
        "Braxton Hicks contractions", "Round ligament pain"
      ],
      advice: [
        "Stay hydrated", "Take prenatal vitamins", "Maintain a balanced diet",
        "Avoid caffeine and alcohol", "Get adequate rest", "Light daily exercise like walking",
        "Elevate feet when sitting", "Avoid heavy lifting", "Schedule next ultrasound"
      ]
    });
  }

  /**
   * Get common medications for quick entry
   */
  getCommonMedications(): Observable<Partial<Medication>[]> {
    return of([
      { name: 'Prenatal Vitamin', dosage: '1 tablet', frequency: '1+0+0+0', duration: '30 days' },
      { name: 'Folic Acid', dosage: '5mg', frequency: '1+0+0+0', duration: 'Ongoing' },
      { name: 'Iron Supplement', dosage: '65mg', frequency: '1+0+0+0', duration: '30 days' },
      { name: 'Calcium Supplement', dosage: '500mg', frequency: '1+0+1+0', duration: 'Ongoing' },
      { name: 'Vitamin B6', dosage: '25mg', frequency: '1+1+1+0', duration: '14 days' }
    ]);
  }

  /**
   * Get common tests for quick entry
   */
  getCommonTests(): Observable<Partial<Test>[]> {
    return of([
      { name: 'Complete Blood Count', description: 'Check for anemia and infections' },
      { name: 'Ultrasound', description: 'Monitor fetal development' },
      { name: 'Glucose Tolerance Test', description: 'Screen for gestational diabetes' },
      { name: 'Urine Protein', description: 'Check for preeclampsia' },
      { name: 'Blood Pressure Monitoring', description: 'Track maternal health' }
    ]);
  }

  /**
   * Add a test result to an existing test
   */
  addTestResult(testId: string, file: File, notes: string): Observable<TestResult> {
    if (!this.storage) {
      return throwError(() => new Error('Firebase Storage is not available'));
    }
    
    const resultId = `result_${new Date().getTime()}`;
    const path = `test-results/${testId}/${file.name}`;
    const fileRef = storageRef(this.storage, path);
    
    return from(uploadBytes(fileRef, file)).pipe(
      switchMap(() => from(getDownloadURL(fileRef))),
      map(fileUrl => {
        const result: TestResult = {
          id: resultId,
          testId,
          fileUrl,
          fileType: file.type,
          notes,
          uploadedAt: new Date()
        };
        
        return result;
      }),
      catchError(error => {
        console.error('Error uploading test result:', error);
        return throwError(() => error);
      })
    );
  }

  /**
   * Helper method to format date as a key for Firestore
   */
  private formatDateTimeKey(date: Date): string {
    const year = date.getFullYear();
    const month = String(date.getMonth() + 1).padStart(2, '0');
    const day = String(date.getDate()).padStart(2, '0');
    const hours = String(date.getHours()).padStart(2, '0');
    const minutes = String(date.getMinutes()).padStart(2, '0');
    
    return `${year}-${month}-${day}_${hours}${minutes}`;
  }
}