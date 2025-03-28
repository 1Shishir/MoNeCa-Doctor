import { Injectable, NgZone } from '@angular/core';
import { Firestore, collection, getDocs, query, where } from '@angular/fire/firestore';
import { Observable, of, from, BehaviorSubject } from 'rxjs';
import { map, tap, catchError, shareReplay } from 'rxjs/operators';
import { Doctor } from '../../models/doctor.model';

@Injectable({
  providedIn: 'root'
})
export class DoctorService {
  private cachedDoctors: Doctor[] | null = null;
  private doctorsSubject = new BehaviorSubject<Doctor[]>([]);
  private doctorsLoading = false;
  private doctorsObservable: Observable<Doctor[]> | null = null;
  
  constructor(private firestore: Firestore, private ngZone: NgZone) {}

  getDoctors(): Observable<Doctor[]> {
    // Return cached doctors if available
    if (this.cachedDoctors?.length) {
      return of(this.cachedDoctors);
    }
    
    // Return existing observable if a request is already in progress
    if (this.doctorsObservable && this.doctorsLoading) {
      return this.doctorsObservable;
    }
    
    // Otherwise, fetch the doctors from Firestore
    this.doctorsLoading = true;
    
    const doctorsCollection = collection(this.firestore, 'doctors');
    const doctorsQuery = query(doctorsCollection, where('isApproved', '==', true));
    
    this.doctorsObservable = from(getDocs(doctorsQuery)).pipe(
      map(querySnapshot => {
        const doctors: Doctor[] = [];
        querySnapshot.forEach(doc => {
          const data = doc.data();
          doctors.push({
            uid: doc.id,
            email: data['email'] || '',
            fullName: data['fullName'] || '',
            specialization: data['specialization'] || '',
            phoneNumber: data['phoneNumber'] || '',
            licenseNumber: data['licenseNumber'] || '',
            hospital: data['hospital'],
            profileImage: data['profileImage'],
            isApproved: data['isApproved'] !== false,
            createdAt: data['createdAt']?.toDate?.() || new Date(),
            updatedAt: data['updatedAt']?.toDate?.() || new Date()
          });
        });
        return doctors;
      }),
      tap(doctors => {
        // Update the cache
        this.cachedDoctors = doctors;
        this.doctorsSubject.next(doctors);
        this.doctorsLoading = false;
        
        // Force UI update through zone
        this.ngZone.run(() => {});
      }),
      catchError(error => {
        console.error('Error fetching doctors:', error);
        this.doctorsLoading = false;
        return of([]);
      }),
      // shareReplay ensures the same response is shared with all subscribers
      shareReplay(1)
    );
    
    return this.doctorsObservable;
  }
  
  // Method to manually refresh the doctor list
  refreshDoctors(): Observable<Doctor[]> {
    this.cachedDoctors = null;
    this.doctorsObservable = null;
    this.doctorsLoading = false;
    return this.getDoctors();
  }
  
  // Method to get doctors as a BehaviorSubject for real-time updates
  getDoctorsAsSubject(): BehaviorSubject<Doctor[]> {
    // Trigger loading if not already cached
    if (!this.cachedDoctors) {
      this.getDoctors().subscribe();
    }
    return this.doctorsSubject;
  }
}