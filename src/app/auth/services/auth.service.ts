import { Injectable, Inject, PLATFORM_ID } from '@angular/core';
import { Auth, createUserWithEmailAndPassword, signInWithEmailAndPassword, signOut, sendPasswordResetEmail, onAuthStateChanged } from '@angular/fire/auth';
import { Firestore, doc, setDoc, getDoc } from '@angular/fire/firestore';
import { from, Observable, throwError, BehaviorSubject, switchMap, tap, catchError, map, of } from 'rxjs';
import { SignupData, Doctor } from '../../models/auth.model';
import { Router } from '@angular/router';
import { isPlatformBrowser } from '@angular/common';

@Injectable({
  providedIn: 'root'
})
export class AuthService {
  private currentDoctorSubject = new BehaviorSubject<Doctor | null>(null);
  public currentDoctor$ = this.currentDoctorSubject.asObservable();
  private readonly DOCTOR_DATA_KEY = 'doctorData';
  private readonly AUTH_PERSISTENCE_KEY = 'authPersistence';
  private isBrowser: boolean;

  constructor(
    private auth: Auth,
    private firestore: Firestore,
    private router: Router,
    @Inject(PLATFORM_ID) private platformId: Object
  ) {
    this.isBrowser = isPlatformBrowser(this.platformId);
    
    // Only run browser-specific code when in browser environment
    if (this.isBrowser) {
      // Try to load from localStorage
      try {
        const storedData = localStorage.getItem(this.DOCTOR_DATA_KEY);
        if (storedData) {
          this.currentDoctorSubject.next(JSON.parse(storedData));
        }
      } catch (e) {
        console.log('Error loading from localStorage', e);
      }

      // Listen for auth state changes
      onAuthStateChanged(this.auth, (user) => {
        if (user) {
          this.loadDoctorData(user.uid).then(doctor => {
            if (doctor) this.setDoctorData(doctor);
          });
        } else {
          this.clearAuthState();
        }
      });
    }
  }

  signup(signupData: SignupData): Observable<void> {
    return from(createUserWithEmailAndPassword(
      this.auth,
      signupData.email,
      signupData.password
    )).pipe(
      switchMap(credential => {
        const doctor: Doctor = {
          uuid: credential.user.uid,
          email: signupData.email,
          fullName: signupData.fullName,
          specialization: signupData.specialization,
          licenseNumber: signupData.licenseNumber,
          phoneNumber: signupData.phoneNumber,
          hospital: signupData.hospital,
          isApproved: false,
          createdAt: new Date(),
          updatedAt: new Date()
        };

        const doctorRef = doc(this.firestore, 'doctors', credential.user.uid);
        return from(setDoc(doctorRef, doctor));
      })
    );
  }

  login(email: string, password: string): Observable<Doctor> {
    return from(signInWithEmailAndPassword(this.auth, email, password)).pipe(
      switchMap(credential => {
        return from(this.loadDoctorData(credential.user.uid)).pipe(
          map(doctorData => {
            if (!doctorData) {
              throw new Error('Doctor data not found');
            }
            return doctorData;
          })
        );
      }),
      tap(doctorData => {
        this.setDoctorData(doctorData);
      }),
      catchError(error => {
        console.error('Login error:', error);
        return throwError(() => error);
      })
    );
  }

  private async loadDoctorData(userId: string): Promise<Doctor | null> {
    try {
      const doctorRef = doc(this.firestore, 'doctors', userId);
      const docSnap = await getDoc(doctorRef);
      
      if (docSnap.exists()) {
        return docSnap.data() as Doctor;
      } else {
        console.error('No doctor record found!');
        return null;
      }
    } catch (error) {
      console.error('Error loading doctor data:', error);
      return null;
    }
  }

  private setDoctorData(doctorData: Doctor): void {
    // Store in memory
    this.currentDoctorSubject.next(doctorData);
    
    // Store in localStorage (only in browser)
    if (this.isBrowser) {
      try {
        localStorage.setItem(this.DOCTOR_DATA_KEY, JSON.stringify(doctorData));
        localStorage.setItem(this.AUTH_PERSISTENCE_KEY, 'true');
      } catch (e) {
        console.log('Error saving to localStorage', e);
      }
    }
  }

  logout(): Observable<void> {
    return from(signOut(this.auth)).pipe(
      tap(() => {
        this.clearAuthState();
        this.router.navigate(['/auth/login']);
      })
    );
  }

  private clearAuthState(): void {
    this.currentDoctorSubject.next(null);
    
    if (this.isBrowser) {
      try {
        localStorage.removeItem(this.DOCTOR_DATA_KEY);
        localStorage.removeItem(this.AUTH_PERSISTENCE_KEY);
      } catch (e) {
        console.log('Error removing from localStorage', e);
      }
    }
  }

  forgotPassword(email: string): Observable<void> {
    return from(sendPasswordResetEmail(this.auth, email));
  }

  isAuthenticated(): boolean {
    // Check memory first
    if (this.currentDoctorSubject.value) {
      return true;
    }
    
    // Check storage if in browser
    if (this.isBrowser) {
      try {
        return localStorage.getItem(this.AUTH_PERSISTENCE_KEY) === 'true';
      } catch (e) {
        return false;
      }
    }
    
    return false;
  }
  getCurrentDoctor(): Doctor | null {
    // Return null during SSR to avoid client/server mismatches
    if (!this.isBrowser) {
      return null;
    }
    return this.currentDoctorSubject.value;
  }
  getDoctorById(userId: string): Observable<Doctor | null> {
    if (!userId) {
      return of(null); // Return observable of null if userId is not provided
    }
  
    return from(this.loadDoctorData(userId)).pipe(
      catchError(error => {
        console.error('Error in getDoctorById:', error);
        return of(null);
      })
    );
  }
  
}
  
