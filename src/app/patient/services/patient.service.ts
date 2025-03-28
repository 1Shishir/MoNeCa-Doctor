// patient.service.ts
import { Injectable, Inject, PLATFORM_ID } from '@angular/core';
import { Firestore, collection, doc, setDoc, getDoc, getDocs, query, where, updateDoc, orderBy, limit, startAfter, DocumentSnapshot, deleteDoc } from '@angular/fire/firestore';
import { from, Observable, throwError, BehaviorSubject } from 'rxjs';
import { catchError, map } from 'rxjs/operators';

import { isPlatformBrowser } from '@angular/common';
import { AuthService } from '../../auth/services/auth.service';
import { Patient, Criticality } from '../model/patient.model';

@Injectable({
  providedIn: 'root'
})
export class PatientService {
  private patientsSubject = new BehaviorSubject<Patient[]>([]);
  public patients$ = this.patientsSubject.asObservable();
  private isBrowser: boolean;

  constructor(
    private firestore: Firestore,
    private authService: AuthService,
    @Inject(PLATFORM_ID) private platformId: Object
  ) {
    this.isBrowser = isPlatformBrowser(this.platformId);
  }

  addPatient(patientData: any): Observable<string> {
    const currentDoctor = this.authService.getCurrentDoctor();
    
    // Set createdBy field
    patientData.createdBy = currentDoctor?.uid || patientData.createdBy || 'unknown-doctor';
    
    // Get phone number for document ID
    const phoneNumber = patientData.personalInfo?.phoneNumber;
    if (!phoneNumber) {
      return throwError(() => new Error('Phone number is required'));
    }
    
    // Normalize phone number (remove spaces, special chars)
    const normalizedPhone = phoneNumber.replace(/[^\d]/g, '');
    
    // Generate UUID and add as field
    const patientCollection = collection(this.firestore, 'patients');
    const tempRef = doc(patientCollection);
    const uuid = tempRef.id;
    
    // Create document with phone number as ID
    const patientRef = doc(this.firestore, 'patients', normalizedPhone);
    
    // Add metadata
    patientData.uuid = uuid; // Store original UUID as field
    patientData.id = normalizedPhone; // For consistency
    patientData.createdAt = new Date();
    patientData.updatedAt = new Date();
  
    return from(setDoc(patientRef, patientData)).pipe(
      map(() => normalizedPhone),
      catchError(error => {
        console.error('Error adding patient:', error);
        return throwError(() => error);
      })
    );
  }
  // Add a new patient using uuid
// addPatient(patientData: any): Observable<string> {
//     const currentDoctor = this.authService.getCurrentDoctor();
    
//     // Ensure createdBy is never undefined
//     if (!patientData.createdBy) {
//       if (currentDoctor?.uid) {
//         patientData.createdBy = currentDoctor.uid;
//       } else {
//         // Use provided fallback or generate a placeholder
//         patientData.createdBy = patientData.createdBy || 'unknown-doctor';
//       }
//     }
    
//     const patientCollection = collection(this.firestore, 'patients');
//     const patientRef = doc(patientCollection);
//     const patientId = patientRef.id;
    
//     // Add patient ID to data
//     patientData.id = patientId;
//     patientData.createdAt = new Date();
//     patientData.updatedAt = new Date();
  
//     return from(setDoc(patientRef, patientData)).pipe(
//       map(() => patientId),
//       catchError(error => {
//         console.error('Error adding patient:', error);
//         return throwError(() => error);
//       })
//     );
//   }

  // Update an existing patient
  updatePatient(patientId: string, patientData: Partial<Patient>): Observable<void> {
    const patientRef = doc(this.firestore, 'patients', patientId);
    
    const updateData = {
      ...patientData,
      updatedAt: new Date()
    };

    return from(updateDoc(patientRef, updateData)).pipe(
      catchError(error => {
        console.error('Error updating patient:', error);
        return throwError(() => error);
      })
    );
  }

  // Get a single patient by ID
  getPatient(patientId: string): Observable<Patient | null> {
    const patientRef = doc(this.firestore, 'patients', patientId);
    
    return from(getDoc(patientRef)).pipe(
      map(docSnap => {
        if (docSnap.exists()) {
          return { id: docSnap.id, ...docSnap.data() } as Patient;
        } else {
          return null;
        }
      }),
      catchError(error => {
        console.error('Error getting patient:', error);
        return throwError(() => error);
      })
    );
  }

  // Get all patients for the current doctor
  getPatients(): Observable<Patient[]> {
    const currentDoctor = this.authService.getCurrentDoctor();
    if (!currentDoctor) {
      return throwError(() => new Error('No authenticated doctor found'));
    }

    const patientsCollection = collection(this.firestore, 'patients');
    const doctorPatientsQuery = query(
      patientsCollection, 
      where('createdBy', '==', currentDoctor.uid),
      orderBy('updatedAt', 'desc')
    );

    return from(getDocs(doctorPatientsQuery)).pipe(
      map(querySnapshot => {
        const patients: Patient[] = [];
        querySnapshot.forEach(doc => {
          patients.push({ id: doc.id, ...doc.data() } as Patient);
        });
        this.patientsSubject.next(patients);
        return patients;
      }),
      catchError(error => {
        console.error('Error getting patients:', error);
        return throwError(() => error);
      })
    );
  }

  // Get patients with pagination
  getPatientsWithPagination(pageSize: number, lastDoc?: DocumentSnapshot<unknown>): Observable<{patients: Patient[], lastDoc: DocumentSnapshot<unknown> | null}> {
    const currentDoctor = this.authService.getCurrentDoctor();
    if (!currentDoctor) {
      return throwError(() => new Error('No authenticated doctor found'));
    }

    const patientsCollection = collection(this.firestore, 'patients');
    
    let patientsQuery;
    if (lastDoc) {
      patientsQuery = query(
        patientsCollection,
        where('createdBy', '==', currentDoctor.uid),
        orderBy('updatedAt', 'desc'),
        startAfter(lastDoc),
        limit(pageSize)
      );
    } else {
      patientsQuery = query(
        patientsCollection,
        where('createdBy', '==', currentDoctor.uid),
        orderBy('updatedAt', 'desc'),
        limit(pageSize)
      );
    }

    return from(getDocs(patientsQuery)).pipe(
      map(querySnapshot => {
        const patients: Patient[] = [];
        let lastVisible = null;
        
        if (!querySnapshot.empty) {
          querySnapshot.forEach(doc => {
            patients.push({ id: doc.id, ...doc.data() } as Patient);
          });
          lastVisible = querySnapshot.docs[querySnapshot.docs.length-1];
        }
        
        return { patients, lastDoc: lastVisible };
      }),
      catchError(error => {
        console.error('Error getting paginated patients:', error);
        return throwError(() => error);
      })
    );
  }

  // Delete a patient
  deletePatient(patientId: string): Observable<void> {
    const patientRef = doc(this.firestore, 'patients', patientId);
    
    return from(deleteDoc(patientRef)).pipe(
      catchError(error => {
        console.error('Error deleting patient:', error);
        return throwError(() => error);
      })
    );
  }
  
  // Filter patients
  filterPatients(criticality?: Criticality | 'all', healthWorker?: string, searchTerm?: string): Observable<Patient[]> {
    return this.patients$.pipe(
      map(patients => {
        let filteredPatients = [...patients];
        
        if (criticality && criticality !== 'all') {
          filteredPatients = filteredPatients.filter(patient => patient.criticality === criticality as Criticality);
        }
        
        if (healthWorker && healthWorker !== 'all') {
          filteredPatients = filteredPatients.filter(patient => patient.assignmentInfo.assignedHealthWorker === healthWorker);
        }
        
        if (searchTerm && searchTerm.trim() !== '') {
          const term = searchTerm.toLowerCase().trim();
          filteredPatients = filteredPatients.filter(patient => 
            patient.personalInfo.fullName.toLowerCase().includes(term) || 
            patient.personalInfo.phoneNumber.includes(term)
          );
        }
        
        return filteredPatients;
      })
    );
  }
}