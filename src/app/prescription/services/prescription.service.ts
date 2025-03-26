import { Injectable, Optional } from '@angular/core';
import { Firestore, collection, doc, addDoc, updateDoc, deleteDoc, getDoc, getDocs, query, where, writeBatch, orderBy, Timestamp } from '@angular/fire/firestore';
import { from, Observable, of, throwError } from 'rxjs';
import { map, switchMap, catchError } from 'rxjs/operators';
import { Storage, ref as storageRef, uploadBytes, getDownloadURL, deleteObject, ref } from '@angular/fire/storage';
import { Medication, Prescription, Test, TestResult } from '../../models/prescription.model';


@Injectable({
  providedIn: 'root'
})
export class PrescriptionService {
  constructor(
    private firestore: Firestore,
    @Optional() private storage: Storage
  ) {
    if (!this.storage) {
      console.warn('Firebase Storage is not available. Some features will be limited.');
    }
  }

  
  getPrescriptionsByPatient(patientId: string): Observable<Prescription[]> {
    const prescriptionsRef = collection(this.firestore, 'prescriptions');
    const q = query(
      prescriptionsRef, 
      where('patientId', '==', patientId),
      orderBy('date', 'desc')
    );

    return from(getDocs(q)).pipe(
      map(snapshot => {
        return snapshot.docs.map(doc => {
          const data = doc.data();
          return {
            id: doc.id,
            ...data,
            date: data['date'].toDate(),
            nextVisit: data['nextVisit'] ? data['nextVisit'].toDate() : null,
            createdAt: data['createdAt'].toDate(),
            updatedAt: data['updatedAt'].toDate()
          } as Prescription;
        });
      }),
      catchError(error => {
        console.error('Error fetching prescriptions:', error);
        return throwError(() => new Error('Failed to fetch prescriptions'));
      })
    );
  }

  
  getPrescription(prescriptionId: string): Observable<Prescription> {
    const prescriptionRef = doc(this.firestore, 'prescriptions', prescriptionId);
    
    return from(getDoc(prescriptionRef)).pipe(
      map(docSnapshot => {
        if (!docSnapshot.exists()) {
          throw new Error('Prescription not found');
        }
        
        const data = docSnapshot.data();
        return {
          id: docSnapshot.id,
          ...data,
          date: data['date'].toDate(),
          nextVisit: data['nextVisit'] ? data['nextVisit'].toDate() : null,
          createdAt: data['createdAt'].toDate(),
          updatedAt: data['updatedAt'].toDate()
        } as Prescription;
      }),
      catchError(error => {
        console.error('Error fetching prescription:', error);
        return throwError(() => new Error('Failed to fetch prescription'));
      })
    );
  }

  
  createPrescription(prescription: Omit<Prescription, 'id' | 'createdAt' | 'updatedAt'>): Observable<string> {
    const prescriptionData = {
      ...prescription,
      date: Timestamp.fromDate(prescription.date),
      nextVisit: prescription.nextVisit ? Timestamp.fromDate(prescription.nextVisit) : null,
      createdAt: Timestamp.fromDate(new Date()),
      updatedAt: Timestamp.fromDate(new Date())
    };
    
    return from(addDoc(collection(this.firestore, 'prescriptions'), prescriptionData)).pipe(
      map(docRef => docRef.id),
      catchError(error => {
        console.error('Error creating prescription:', error);
        return throwError(() => new Error('Failed to create prescription'));
      })
    );
  }

  
  updatePrescription(prescriptionId: string, prescription: Partial<Omit<Prescription, 'id' | 'createdAt' | 'updatedAt'>>): Observable<void> {
    const prescriptionRef = doc(this.firestore, 'prescriptions', prescriptionId);
    
    const updateData: any = {
        ...prescription,
        updatedAt: Timestamp.fromDate(new Date())
      };
      
      if (prescription.date) {
        updateData.date = Timestamp.fromDate(prescription.date);
      }
      
      if (prescription.nextVisit) {
        updateData.nextVisit = Timestamp.fromDate(prescription.nextVisit);
      }
    
    return from(updateDoc(prescriptionRef, updateData)).pipe(
      catchError(error => {
        console.error('Error updating prescription:', error);
        return throwError(() => new Error('Failed to update prescription'));
      })
    );
  }

  
  deletePrescription(prescriptionId: string): Observable<void> {
    const prescriptionRef = doc(this.firestore, 'prescriptions', prescriptionId);
    
    return from(deleteDoc(prescriptionRef)).pipe(
      catchError(error => {
        console.error('Error deleting prescription:', error);
        return throwError(() => new Error('Failed to delete prescription'));
      })
    );
  }

  
  addTestResult(testId: string, file: File, notes: string): Observable<TestResult> {
   
    const filePath = `test-results/${testId}_${new Date().getTime()}`;
    const fileRef = ref(this.storage, filePath);

    if (!this.storage) {
      return throwError(() => new Error('Storage is not available'));
    }
    
    return from(uploadBytes(fileRef, file)).pipe(
      switchMap(() => from(getDownloadURL(fileRef))),
      switchMap(downloadURL => {
        const testResult: Omit<TestResult, 'id'> = {
          testId,
          fileUrl: downloadURL,
          fileType: file.type,
          notes,
          uploadedAt: new Date()
        };
        
        return from(addDoc(collection(this.firestore, 'testResults'), {
          ...testResult,
          uploadedAt: Timestamp.fromDate(testResult.uploadedAt)
        })).pipe(
          map(docRef => ({
            id: docRef.id,
            ...testResult
          }))
        );
      }),
      catchError(error => {
        console.error('Error uploading test result:', error);
        return throwError(() => new Error('Failed to upload test result'));
      })
    );
  }

  
  getQuickTextOptions(): Observable<Record<string, string[]>> {
    return of({
      complaints: [
        'Headache', 'Nausea', 'Vomiting', 'Abdominal pain', 'Back pain',
        'Swelling in feet', 'Blurred vision', 'Fatigue', 'Dizziness',
        'Cramps', 'Insomnia', 'Shortness of breath', 'Frequent urination'
      ],
      diagnoses: [
        'Pregnancy-induced hypertension', 'Gestational diabetes', 'Anemia',
        'Urinary tract infection', 'Preeclampsia', 'Hyperemesis gravidarum',
        'Ectopic pregnancy', 'Placenta previa', 'Gestational thrombocytopenia'
      ],
      advice: [
        'Adequate rest', 'Stay hydrated', 'Avoid heavy lifting',
        'Take prenatal vitamins as directed', 'Call immediately if bleeding occurs',
        'Follow recommended diet plan', 'Moderate exercise as tolerated',
        'Avoid alcohol and smoking', 'Regular blood glucose monitoring'
      ]
    });
  }

  
  getCommonMedications(): Observable<Partial<Medication>[]> {
    return of([
      { name: 'Prenatal Vitamin', dosage: '1 tablet', frequency: '1+0+0+0', duration: '30 days', instructions: 'Take after breakfast' },
      { name: 'Folic Acid 5mg', dosage: '1 tablet', frequency: '1+0+0+0', duration: '30 days', instructions: 'Take after breakfast' },
      { name: 'Calcium 500mg', dosage: '1 tablet', frequency: '0+1+0+1', duration: '30 days', instructions: 'Take after meals' },
      { name: 'Iron Supplement', dosage: '1 tablet', frequency: '0+0+1+0', duration: '30 days', instructions: 'Take after dinner' },
      { name: 'Methyldopa 250mg', dosage: '1 tablet', frequency: '1+0+1+0', duration: '15 days', instructions: 'For high blood pressure' },
      { name: 'Paracetamol 500mg', dosage: '1 tablet', frequency: '1+0+1+0', duration: 'As needed', instructions: 'Take when needed for pain, not exceeding 4 tablets per day' }
    ]);
  }

  
  getCommonTests(): Observable<Partial<Test>[]> {
    return of([
      { name: 'Complete Blood Count (CBC)', description: 'Check for anemia and infections' },
      { name: 'Blood Glucose Test', description: 'Monitor for gestational diabetes' },
      { name: 'Urine Analysis', description: 'Check for infections and protein' },
      { name: 'Ultrasound', description: 'Check fetal development and position' },
      { name: 'Blood Pressure Monitoring', description: 'Check for hypertension' },
      { name: 'Thyroid Function Test', description: 'Check thyroid hormone levels' }
    ]);
  }

  
  getPatientInfo(patientId: string): Observable<any> {
    const patientRef = doc(this.firestore, 'patients', patientId);
    
    return from(getDoc(patientRef)).pipe(
      map(docSnapshot => {
        if (!docSnapshot.exists()) {
          throw new Error('Patient not found');
        }
        
        return { id: docSnapshot.id, ...docSnapshot.data() };
      }),
      catchError(error => {
        console.error('Error fetching patient info:', error);
        return throwError(() => new Error('Failed to fetch patient info'));
      })
    );
  }
}


