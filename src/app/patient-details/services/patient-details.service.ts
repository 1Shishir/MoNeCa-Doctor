// import { Injectable, Inject, PLATFORM_ID } from '@angular/core';
// import { Firestore, doc, getDoc,  } from '@angular/fire/firestore';
// import { from, Observable, throwError, BehaviorSubject} from 'rxjs';
// import { catchError, map, } from 'rxjs/operators';

// import { isPlatformBrowser } from '@angular/common';
// import { Criticality, Patient } from '../../patient/model/patient.model';


// @Injectable({
//     providedIn: 'root'
// })
// export class PatientDetailsService {
//     private patientsSubject = new BehaviorSubject<Patient[]>([]);
//     public patients$ = this.patientsSubject.asObservable();
//     private patientId: string | null = null;
//     private isBrowser: boolean;

//     constructor(
//         private firestore: Firestore,
//         @Inject(PLATFORM_ID) private platformId: Object
//     ) {
//         this.isBrowser = isPlatformBrowser(this.platformId);
//         this.patientId = sessionStorage.getItem('patientId');
//     }
//     setPatientId(id: string) {
//         this.patientId = id;
//         sessionStorage.setItem('patientId', id);
//       }

//       getPatientId(): string | null {
//         return this.patientId;
//       }

//       clearPatientId() {
//         this.patientId = null;
//         sessionStorage.removeItem('patientId');
//       }
    
//     // Get a single patient by ID
//     getPatient(patientId: string): Observable<Patient | null> {
//         const patientRef = doc(this.firestore, 'patients', patientId);

//         return from(getDoc(patientRef)).pipe(
//             map(docSnap => {
//                 if (docSnap.exists()) {
//                     return { id: docSnap.id, ...docSnap.data() } as Patient;
//                 } else {
//                     return null;
//                 }
//             }),
//             catchError(error => {
//                 console.error('Error getting patient:', error);
//                 return throwError(() => error);
//             })
//         );
//     }
// }

import { Injectable, Inject, PLATFORM_ID } from '@angular/core';
import { Firestore, doc, getDoc } from '@angular/fire/firestore';
import { from, Observable, throwError, BehaviorSubject } from 'rxjs';
import { catchError, map } from 'rxjs/operators';
import { isPlatformBrowser } from '@angular/common';
import { Criticality, Patient } from '../../patient/model/patient.model';

@Injectable({
    providedIn: 'root'
})
export class PatientDetailsService {
    private patientsSubject = new BehaviorSubject<Patient[]>([]);
    public patients$ = this.patientsSubject.asObservable();
    private patientId: string | null = null;
    private isBrowser: boolean;

    constructor(
        private firestore: Firestore,
        @Inject(PLATFORM_ID) private platformId: Object
    ) {
        this.isBrowser = isPlatformBrowser(this.platformId);
        
        // Only access sessionStorage in browser environment
        if (this.isBrowser) {
            this.patientId = sessionStorage.getItem('patientId');
        }
    }
    
    setPatientId(id: string) {
        this.patientId = id;
        if (this.isBrowser) {
            sessionStorage.setItem('patientId', id);
        }
    }

    getPatientId(): string | null {
        if (this.patientId) {
            return this.patientId;
        }
        
        if (this.isBrowser) {
            return sessionStorage.getItem('patientId');
        }
        
        return null;
    }

    clearPatientId() {
        this.patientId = null;
        if (this.isBrowser) {
            sessionStorage.removeItem('patientId');
        }
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
}