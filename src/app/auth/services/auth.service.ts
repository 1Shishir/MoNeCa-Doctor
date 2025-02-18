import { Injectable } from '@angular/core';
import { Auth, createUserWithEmailAndPassword, signInWithEmailAndPassword, signOut, sendPasswordResetEmail } from '@angular/fire/auth';
import { Firestore, doc, setDoc } from '@angular/fire/firestore';
import { from, Observable, switchMap } from 'rxjs';
import { SignupData, Doctor } from '../models/auth.model';

@Injectable({
  providedIn: 'root'
})
export class AuthService {
  constructor(
    private auth: Auth,
    private firestore: Firestore
  ) {}

  signup(signupData: SignupData): Observable<void> {
    return from(createUserWithEmailAndPassword(
      this.auth,
      signupData.email,
      signupData.password
    )).pipe(
      switchMap(credential => {
        const doctor: Doctor = {
          uid: credential.user.uid,
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

  login(email: string, password: string): Observable<any> {
    return from(signInWithEmailAndPassword(this.auth, email, password));
  }

  logout(): Observable<void> {
    return from(signOut(this.auth));
  }

  forgotPassword(email: string): Observable<void> {
    return from(sendPasswordResetEmail(this.auth, email));
  }
}