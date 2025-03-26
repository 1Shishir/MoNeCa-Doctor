// dashboard/service/dashboard.service.ts
import { Injectable, Inject, PLATFORM_ID, NgZone } from '@angular/core';
import { Firestore, collection, query, where, orderBy, limit, getDocs, doc, getDoc, DocumentData } from '@angular/fire/firestore';
import { Observable, from, of, forkJoin, BehaviorSubject, timer, EMPTY } from 'rxjs';
import { map, catchError, tap, switchMap, shareReplay, take } from 'rxjs/operators';
import { Auth } from '@angular/fire/auth';
import { isPlatformBrowser } from '@angular/common';
import { AuthService } from '../../auth/services/auth.service';

interface DashboardStats {
  totalPatients: number;
  criticalPatients: number;
  todayAppointments: number;
  pendingReports: number;
}

interface CacheItem<T> {
  data: T;
  timestamp: number;
}

@Injectable({
  providedIn: 'root'
})
export class DashboardService {
  private readonly CACHE_DURATION = 5 * 60 * 1000; // 5 minutes in milliseconds
  private isBrowser: boolean;
  
  // Cache storage
  private statsCache: CacheItem<DashboardStats> | null = null;
  private appointmentsCache: CacheItem<any[]> | null = null;
  private criticalPatientsCache: CacheItem<any[]> | null = null;
  private criticalAlertCache: CacheItem<any | null> | null = null;
  
  // BehaviorSubjects for reactive updates
  private statsSubject = new BehaviorSubject<DashboardStats | null>(null);
  private appointmentsSubject = new BehaviorSubject<any[]>([]);
  private criticalPatientsSubject = new BehaviorSubject<any[]>([]);
  private criticalAlertSubject = new BehaviorSubject<any | null>(null);
  
  // Public observables
  public stats$ = this.statsSubject.asObservable();
  public appointments$ = this.appointmentsSubject.asObservable();
  public criticalPatients$ = this.criticalPatientsSubject.asObservable();
  public criticalAlert$ = this.criticalAlertSubject.asObservable();
  
  // Loading states
  private loadingStats = false;
  private loadingAppointments = false;
  private loadingCriticalPatients = false;
  private loadingCriticalAlert = false;
  
  // Timer subscription
  private timerSubscription: any = null;
  
  constructor(
    private firestore: Firestore,
    private authService: AuthService,
    private ngZone: NgZone,
    @Inject(PLATFORM_ID) private platformId: Object
  ) {
    this.isBrowser = isPlatformBrowser(this.platformId);
    
    // Only set up timers and initialize data in browser environment
    if (this.isBrowser) {
      // Run inside NgZone to ensure change detection
      this.ngZone.runOutsideAngular(() => {
        this.timerSubscription = timer(1000, 2 * 60 * 1000).subscribe(() => {
          this.ngZone.run(() => this.refreshAllData());
        });
      });
    }
  }

  /**
   * Safely get current user ID from auth service
   */
  private getCurrentUserId(): string {
    // Only try to access auth in browser environment
    if (!this.isBrowser) {
      return '';
    }
    
    const currentDoctor = this.authService.getCurrentDoctor();
    return currentDoctor?.uid || '';
  }
  
  /**
   * Safely clean up resources when service is destroyed
   */
  ngOnDestroy(): void {
    if (this.timerSubscription) {
      this.timerSubscription.unsubscribe();
    }
  }

  /**
   * Refreshes all dashboard data
   */
  refreshAllData(): void {
    // Skip refresh if not in browser
    if (!this.isBrowser) {
      return;
    }
    
    const doctorId = this.getCurrentUserId();
    if (!doctorId) {
      console.warn('Cannot refresh data: No authenticated doctor');
      return;
    }
    
    this.fetchDashboardStats();
    this.fetchTodayAppointments();
    this.fetchCriticalPatients();
    this.fetchMostCriticalAlert();
  }

  /**
   * Gets dashboard statistics by counting various collections
   */
  getDashboardStats(): Observable<DashboardStats> {
    console.log('Getting dashboard stats...');
    
    // If not in browser, return default stats
    if (!this.isBrowser) {
      return of(this.getFallbackStats());
    }
    
    const doctorId = this.getCurrentUserId();
    if (!doctorId) {
      console.warn('No authenticated doctor for stats');
      return of(this.getFallbackStats());
    }
    
    // Check cache first
    if (this.statsCache && Date.now() - this.statsCache.timestamp < this.CACHE_DURATION) {
      console.log('Returning cached dashboard stats');
      return of(this.statsCache.data);
    }
    
    // Fetch fresh data if not loading already
    if (!this.loadingStats) {
      this.fetchDashboardStats();
    }
    
    // Return the behavior subject as an observable
    return this.stats$.pipe(
      map(stats => stats || this.getFallbackStats())
    );
  }
  
  private fetchDashboardStats(): void {
    // Skip if already loading or not in browser
    if (this.loadingStats || !this.isBrowser) return;
    
    this.loadingStats = true;
    const doctorId = this.getCurrentUserId();
    
    if (!doctorId) {
      console.warn('Cannot fetch stats: No doctor ID available');
      this.loadingStats = false;
      this.statsSubject.next(this.getFallbackStats());
      return;
    }
    
    // Get current date for today's appointments
    const today = new Date();
    today.setHours(0, 0, 0, 0);
    const todayStr = today.toISOString().split('T')[0];
    
    // Query collections to get counts
    forkJoin({
      patients: this.getPatientCount(doctorId),
      criticalPatients: this.getCriticalPatientCount(doctorId),
      appointments: this.getTodayAppointmentCount(doctorId, todayStr),
      reports: this.getPendingReportCount(doctorId)
    }).pipe(
      take(1), // Take only one result to avoid memory leaks
      map(results => {
        const stats: DashboardStats = {
          totalPatients: results.patients,
          criticalPatients: results.criticalPatients,
          todayAppointments: results.appointments,
          pendingReports: results.reports
        };
        console.log('Dashboard stats fetched:', stats);
        return stats;
      }),
      catchError(error => {
        console.error('Error getting dashboard stats:', error);
        return of(this.getFallbackStats());
      }),
      tap(() => this.loadingStats = false)
    ).subscribe(stats => {
      // Update cache
      this.statsCache = {
        data: stats,
        timestamp: Date.now()
      };
      // Update subject
      this.statsSubject.next(stats);
    });
  }
  
  private getFallbackStats(): DashboardStats {
    return {
      totalPatients: 0,
      criticalPatients: 0,
      todayAppointments: 0,
      pendingReports: 0
    };
  }

  // Get count of patients for this doctor
  private getPatientCount(doctorId: string): Observable<number> {
    console.log('Counting patients for doctor:', doctorId);
    
    if (!doctorId) {
      console.warn('No doctor ID provided for patient count');
      return of(0);
    }
    
    const patientsRef = collection(this.firestore, 'patients');
    const doctorPatientsQuery = query(
      patientsRef,
      where('doctorId', '==', doctorId)
    );

    return from(getDocs(doctorPatientsQuery)).pipe(
      map(snapshot => {
        console.log(`Found ${snapshot.size} patients`);
        return snapshot.size;
      }),
      catchError(error => {
        console.error('Error counting patients:', error);
        return of(0);
      })
    );
  }

  // Get count of critical patients based on health data
  private getCriticalPatientCount(doctorId: string): Observable<number> {
    console.log('Counting critical patients for doctor:', doctorId);
    
    if (!doctorId) {
      console.warn('No doctor ID provided for critical patient count');
      return of(0);
    }
    
    const healthDataRef = collection(this.firestore, 'health_data');
    const criticalDataQuery = query(
      healthDataRef,
      where('doctorId', '==', doctorId),
      where('isAbnormal', '==', true)
    );

    return from(getDocs(criticalDataQuery)).pipe(
      map(snapshot => {
        // Count unique patients with abnormal readings
        const uniquePatients = new Set<string>();
        snapshot.forEach(doc => {
          const data = doc.data();
          uniquePatients.add(data['patientId']);
        });
        console.log(`Found ${uniquePatients.size} critical patients`);
        return uniquePatients.size;
      }),
      catchError(error => {
        console.error('Error counting critical patients:', error);
        return of(0);
      })
    );
  }

  // Get count of today's appointments
  private getTodayAppointmentCount(doctorId: string, todayStr: string): Observable<number> {
    console.log('Counting today\'s appointments for doctor:', doctorId);
    
    if (!doctorId) {
      console.warn('No doctor ID provided for appointment count');
      return of(0);
    }
    
    const appointmentsRef = collection(this.firestore, 'appointments');
    const todayAppointmentsQuery = query(
      appointmentsRef,
      where('doctorId', '==', doctorId),
      where('date', '>=', todayStr),
      where('date', '<', todayStr + 'T23:59:59.999Z')
    );

    return from(getDocs(todayAppointmentsQuery)).pipe(
      map(snapshot => {
        console.log(`Found ${snapshot.size} appointments today`);
        return snapshot.size;
      }),
      catchError(error => {
        console.error('Error counting today\'s appointments:', error);
        return of(0);
      })
    );
  }

  // Get count of pending reports (tests)
  private getPendingReportCount(doctorId: string): Observable<number> {
    console.log('Counting pending reports for doctor:', doctorId);
    
    if (!doctorId) {
      console.warn('No doctor ID provided for pending report count');
      return of(0);
    }
    
    const prescriptionsRef = collection(this.firestore, 'prescriptions');
    const doctorPrescriptionsQuery = query(
      prescriptionsRef,
      where('doctorId', '==', doctorId)
    );

    return from(getDocs(doctorPrescriptionsQuery)).pipe(
      map(snapshot => {
        let pendingTestsCount = 0;
        snapshot.forEach(doc => {
          const data = doc.data();
          if (data['tests']) {
            pendingTestsCount += data['tests'].filter((test: any) => test.isPending).length;
          }
        });
        console.log(`Found ${pendingTestsCount} pending reports`);
        return pendingTestsCount;
      }),
      catchError(error => {
        console.error('Error counting pending reports:', error);
        return of(0);
      })
    );
  }

  /**
   * Gets today's appointments
   */
  getTodayAppointments(): Observable<any[]> {
    console.log('Getting today\'s appointments...');
    
    // If not in browser, return empty array
    if (!this.isBrowser) {
      return of([]);
    }
    
    const doctorId = this.getCurrentUserId();
    if (!doctorId) {
      console.warn('No authenticated doctor for appointments');
      return of([]);
    }
    
    // Check cache first
    if (this.appointmentsCache && Date.now() - this.appointmentsCache.timestamp < this.CACHE_DURATION) {
      console.log('Returning cached appointments');
      return of(this.appointmentsCache.data);
    }
    
    // Fetch fresh data if not loading already
    if (!this.loadingAppointments) {
      this.fetchTodayAppointments();
    }
    
    // Return the behavior subject as an observable
    return this.appointments$;
  }
  
  private fetchTodayAppointments(): void {
    // Skip if already loading or not in browser
    if (this.loadingAppointments || !this.isBrowser) return;
    
    this.loadingAppointments = true;
    const doctorId = this.getCurrentUserId();
    
    if (!doctorId) {
      console.warn('No doctor ID available for fetching appointments');
      this.loadingAppointments = false;
      this.appointmentsSubject.next([]);
      return;
    }
    
    // Get today's date in ISO format for comparison
    const today = new Date();
    today.setHours(0, 0, 0, 0);
    const todayStr = today.toISOString().split('T')[0];
    
    const appointmentsRef = collection(this.firestore, 'appointments');
    const todayAppointmentsQuery = query(
      appointmentsRef,
      where('doctorId', '==', doctorId),
      where('date', '>=', todayStr),
      where('date', '<', todayStr + 'T23:59:59.999Z'),
      orderBy('date'),
      orderBy('time')
    );
    
    from(getDocs(todayAppointmentsQuery)).pipe(
      take(1), // Take only one result to avoid memory leaks
      map(snapshot => {
        const appointments: any[] = [];
        snapshot.forEach(doc => {
          const data = doc.data();
          appointments.push({
            id: doc.id,
            name: data['patientName'],
            time: data['time'],
            status: this.capitalizeFirstLetter(data['status']),
            type: this.formatAppointmentType(data['type'])
          });
        });
        console.log('Today\'s appointments fetched:', appointments);
        return appointments;
      }),
      catchError(error => {
        console.error('Error fetching appointments:', error);
        return of([]);
      }),
      tap(() => this.loadingAppointments = false)
    ).subscribe(appointments => {
      // Update cache
      this.appointmentsCache = {
        data: appointments,
        timestamp: Date.now()
      };
      // Update subject
      this.appointmentsSubject.next(appointments);
    });
  }

  /**
   * Gets critical patients
   */
  getCriticalPatients(): Observable<any[]> {
    console.log('Getting critical patients...');
    
    // If not in browser, return empty array
    if (!this.isBrowser) {
      return of([]);
    }
    
    const doctorId = this.getCurrentUserId();
    if (!doctorId) {
      console.warn('No authenticated doctor for critical patients');
      return of([]);
    }
    
    // Check cache first
    if (this.criticalPatientsCache && Date.now() - this.criticalPatientsCache.timestamp < this.CACHE_DURATION) {
      console.log('Returning cached critical patients');
      return of(this.criticalPatientsCache.data);
    }
    
    // Fetch fresh data if not loading already
    if (!this.loadingCriticalPatients) {
      this.fetchCriticalPatients();
    }
    
    // Return the behavior subject as an observable
    return this.criticalPatients$;
  }
  
  private fetchCriticalPatients(): void {
    // Skip if already loading or not in browser
    if (this.loadingCriticalPatients || !this.isBrowser) return;
    
    this.loadingCriticalPatients = true;
    const doctorId = this.getCurrentUserId();
    
    if (!doctorId) {
      console.warn('No doctor ID available for fetching critical patients');
      this.loadingCriticalPatients = false;
      this.criticalPatientsSubject.next([]);
      return;
    }
    
    const healthDataRef = collection(this.firestore, 'health_data');
    const criticalDataQuery = query(
      healthDataRef,
      where('doctorId', '==', doctorId),
      where('isAbnormal', '==', true),
      orderBy('timestamp', 'desc')
    );
    
    from(getDocs(criticalDataQuery)).pipe(
      take(1), // Take only one result to avoid memory leaks
      switchMap(snapshot => {
        // Group by patient and get the most recent abnormal reading for each
        const patientHealthData = new Map<string, any>();
        snapshot.forEach(doc => {
          const data = doc.data();
          const patientId = data['patientId'];
          
          if (!patientHealthData.has(patientId) || 
              new Date(data['timestamp']) > new Date(patientHealthData.get(patientId).timestamp)) {
            patientHealthData.set(patientId, {
              patientId,
              dataType: data['dataType'],
              value: data['value'],
              unit: data['unit'],
              timestamp: data['timestamp']
            });
          }
        });
        
        // Fetch patient details for each critical patient
        if (patientHealthData.size === 0) {
          return of([]);
        }
        
        const patientPromises = Array.from(patientHealthData.entries()).map(([patientId, healthData]) => {
          return this.getPatientDetails(patientId).pipe(
            take(1),
            map(patient => {
              if (!patient) return null;
              
              return {
                id: patientId,
                name: patient.fullName,
                issue: this.getIssueFromDataType(healthData.dataType),
                lastReading: `${healthData.value}${healthData.unit ? ' ' + healthData.unit : ''}`,
                lastChecked: this.getTimeAgo(healthData.timestamp)
              };
            })
          );
        });
        
        return forkJoin(patientPromises);
      }),
      map(patients => patients.filter(p => p !== null) as any[]),
      catchError(error => {
        console.error('Error fetching critical patients:', error);
        return of([]);
      }),
      tap(() => this.loadingCriticalPatients = false)
    ).subscribe(patients => {
      // Update cache
      this.criticalPatientsCache = {
        data: patients,
        timestamp: Date.now()
      };
      // Update subject
      this.criticalPatientsSubject.next(patients);
    });
  }

  /**
   * Gets most critical alert (most recent abnormal reading)
   */
  getMostCriticalAlert(): Observable<any | null> {
    console.log('Getting most critical alert...');
    
    // If not in browser, return null
    if (!this.isBrowser) {
      return of(null);
    }
    
    const doctorId = this.getCurrentUserId();
    if (!doctorId) {
      console.warn('No authenticated doctor for critical alert');
      return of(null);
    }
    
    // Check cache first
    if (this.criticalAlertCache && Date.now() - this.criticalAlertCache.timestamp < this.CACHE_DURATION) {
      console.log('Returning cached critical alert');
      return of(this.criticalAlertCache.data);
    }
    
    // Fetch fresh data if not loading already
    if (!this.loadingCriticalAlert) {
      this.fetchMostCriticalAlert();
    }
    
    // Return the behavior subject as an observable
    return this.criticalAlert$;
  }
  
  private fetchMostCriticalAlert(): void {
    // Skip if already loading or not in browser
    if (this.loadingCriticalAlert || !this.isBrowser) return;
    
    this.loadingCriticalAlert = true;
    const doctorId = this.getCurrentUserId();
    
    if (!doctorId) {
      console.warn('No doctor ID available for fetching critical alert');
      this.loadingCriticalAlert = false;
      this.criticalAlertSubject.next(null);
      return;
    }
    
    const healthDataRef = collection(this.firestore, 'health_data');
    const mostCriticalQuery = query(
      healthDataRef,
      where('doctorId', '==', doctorId),
      where('isAbnormal', '==', true),
      orderBy('timestamp', 'desc'),
      limit(1)
    );
    
    from(getDocs(mostCriticalQuery)).pipe(
      take(1), // Take only one result to avoid memory leaks
      switchMap(snapshot => {
        if (snapshot.empty) {
          return of(null);
        }
        
        const alertData = snapshot.docs[0].data();
        const patientId = alertData['patientId'];
        
        return this.getPatientDetails(patientId).pipe(
          take(1),
          map(patient => {
            if (!patient) return null;
            
            const messageData = {
              patientId,
              patientName: patient.fullName,
              issue: this.getIssueFromDataType(alertData['dataType']),
              value: `${alertData['value']}${alertData['unit'] ? ' ' + alertData['unit'] : ''}`,
              timestamp: alertData['timestamp']
            };
            
            return {
              title: 'Critical Patient Alert',
              message: `Patient ${patient.fullName}'s ${messageData.issue.toLowerCase()} is abnormally ${this.getAbnormalityDescription(alertData['dataType'])} (${messageData.value}). Immediate attention required.`,
              data: messageData
            };
          })
        );
      }),
      catchError(error => {
        console.error('Error fetching most critical alert:', error);
        return of(null);
      }),
      tap(() => this.loadingCriticalAlert = false)
    ).subscribe(alert => {
      // Update cache
      this.criticalAlertCache = {
        data: alert,
        timestamp: Date.now()
      };
      // Update subject
      this.criticalAlertSubject.next(alert);
    });
  }

  // Helper method to get abnormality description
  private getAbnormalityDescription(dataType: string): string {
    switch (dataType) {
      case 'blood_pressure': return 'high';
      case 'oxygen_saturation': return 'low';
      case 'heart_rate': return 'high';
      case 'temperature': return 'high';
      default: return 'abnormal';
    }
  }

  // Get patient details by ID
  private getPatientDetails(patientId: string): Observable<any | null> {
    if (!this.isBrowser || !patientId) {
      return of(null);
    }
    
    const patientDocRef = doc(this.firestore, 'patients', patientId);
    
    return from(getDoc(patientDocRef)).pipe(
      take(1), // Take only one result to avoid memory leaks
      map(docSnap => {
        if (!docSnap.exists()) {
          console.log(`Patient with ID ${patientId} not found`);
          return null;
        }
        return docSnap.data();
      }),
      catchError(error => {
        console.error('Error fetching patient details:', error);
        return of(null);
      })
    );
  }

  // Helper method to format the issue from data type
  private getIssueFromDataType(dataType: string): string {
    switch (dataType) {
      case 'blood_pressure': return 'Blood Pressure';
      case 'oxygen_saturation': return 'Oxygen Level';
      case 'heart_rate': return 'Heart Rate';
      case 'temperature': return 'Temperature';
      default: return dataType.replace(/_/g, ' ')
                             .split(' ')
                             .map(word => this.capitalizeFirstLetter(word))
                             .join(' ');
    }
  }

  // Helper method to format time ago
  private getTimeAgo(timestamp: string): string {
    const now = new Date();
    const time = new Date(timestamp);
    const diffMs = now.getTime() - time.getTime();
    const diffMins = Math.floor(diffMs / 60000);
    
    if (diffMins < 60) {
      return `${diffMins} min ago`;
    } else if (diffMins < 1440) {
      return `${Math.floor(diffMins / 60)} hour${Math.floor(diffMins / 60) > 1 ? 's' : ''} ago`;
    } else {
      return `${Math.floor(diffMins / 1440)} day${Math.floor(diffMins / 1440) > 1 ? 's' : ''} ago`;
    }
  }

  // Helper method to capitalize first letter
  private capitalizeFirstLetter(str: string): string {
    return str.charAt(0).toUpperCase() + str.slice(1);
  }

  // Helper method to format appointment type
  private formatAppointmentType(type: string): string {
    if (!type) return '';
    return type.split('-').map(word => 
      this.capitalizeFirstLetter(word)
    ).join('-');
  }
}