


import { Injectable } from '@angular/core';
import { Firestore, collection, doc, getDoc, getDocs, setDoc, updateDoc, deleteField, query, where, orderBy, limit, DocumentSnapshot, DocumentData } from '@angular/fire/firestore';
import { Observable, from, of, throwError, BehaviorSubject, forkJoin } from 'rxjs';
import { map, catchError, switchMap, tap, take } from 'rxjs/operators';
import { AuthService } from '../../auth/services/auth.service';
import { Booking, BookingStats, DoctorSchedule, BookingFilters, BookingStatus, StatusChange, DayOfWeek, BookingTimeSlot } from '../../models/booking.model';


@Injectable({
  providedIn: 'root'
})
export class BookingService {
  private bookingsCache = new BehaviorSubject<Booking[]>([]);
  private statsCache = new BehaviorSubject<BookingStats | null>(null);
  private scheduleCache = new BehaviorSubject<DoctorSchedule[]>([]);
  
  // Observable streams from the cache
  public bookings$ = this.bookingsCache.asObservable();
  public stats$ = this.statsCache.asObservable();
  public schedule$ = this.scheduleCache.asObservable();
  
  // Loading states
  private isLoadingBookings = false;
  private isLoadingSchedule = false;

  constructor(
    private firestore: Firestore,
    private authService: AuthService
  ) {}


  
  /**
   * Get the current doctor ID
   */
  private getCurrentDoctorId(): string {
    const currentDoctor = this.authService.getCurrentDoctor();
    
    if (!currentDoctor?.uuid) {
      console.warn('No authenticated doctor found');
      return '';
    }
    return currentDoctor.uuid;
  }

  /**
   * Refresh all booking data
   */
  refreshAllData(): void {
    
    this.loadAllAppointments();
    this.loadBookingStats();
    this.loadDoctorSchedule();
  }

  /**
   * Load all appointments for the current doctor
   */
  loadAllAppointments(): void {
   
    if (this.isLoadingBookings) return;
    
    const doctorId = this.getCurrentDoctorId();
    
    if (!doctorId) return;
    
    this.isLoadingBookings = true;
    
    const appointmentsRef = doc(this.firestore, 'appointment-list', doctorId);
   
    from(getDoc(appointmentsRef)).pipe(
      map(docSnapshot => {
        if (!docSnapshot.exists()) {
          return [];
        }
       
        const data = docSnapshot.data() as Record<string, any>;
        const appointments: Booking[] = [];
        
        Object.keys(data).forEach(appointmentKey => {
          const appointmentData = data[appointmentKey];
          
          // Convert the appointment to our interface
          const booking: Booking = {
            id: appointmentData.id || appointmentKey,
            patientId: appointmentData.patientId,
            patientName: appointmentData.patientName,
            patientPhone: appointmentData.patientPhone,
            patientProfile: appointmentData.patientProfile,
            doctorId: appointmentData.doctorId,
            doctorName: appointmentData.doctorName,
            date: appointmentData.date,
            time: appointmentData.time,
            serialNumber: appointmentData.serialNumber,
            status: appointmentData.status,
            type: appointmentData.type,
            notes: appointmentData.notes,
            createdAt: appointmentData.createdAt,
            updatedAt: appointmentData.updatedAt,
            updatedBy: appointmentData.updatedBy,
            statusHistory: appointmentData.statusHistory,
            pregnancyWeek: appointmentData.pregnancyWeek
          };
         
          appointments.push(booking);
        });
        
        return appointments;
      }),
      tap(appointments => {
        // Update the cache
        
        this.bookingsCache.next(appointments);
        this.isLoadingBookings = false;
      }),
      catchError(error => {
        console.error('Error loading appointments:', error);
        this.isLoadingBookings = false;
        return of([]);
      })
    ).subscribe();
  }

  /**
   * Get appointments with optional filtering
   */
  getAppointments(filters?: BookingFilters): Observable<Booking[]> {
    return this.bookings$.pipe(
      map(appointments => {
        if (!filters) return appointments;
        
        return appointments.filter(appointment => {
          // Date range filter
          if (filters.startDate && appointment.date < filters.startDate) return false;
          if (filters.endDate && appointment.date > filters.endDate) return false;
          
          // Status filter
          if (filters.status && appointment.status !== filters.status) return false;
          
          // Type filter
          if (filters.type && appointment.type !== filters.type) return false;
          
          // Search term filter (patient name or phone)
          if (filters.searchTerm) {
            const searchTerm = filters.searchTerm.toLowerCase();
            const patientNameMatch = appointment.patientName.toLowerCase().includes(searchTerm);
            const patientPhoneMatch = appointment.patientPhone.includes(searchTerm);
            const serialMatch = appointment.serialNumber.toString() === searchTerm;
            
            if (!patientNameMatch && !patientPhoneMatch && !serialMatch) return false;
          }
          
          return true;
        });
      })
    );
  }

  /**
   * Get appointments for today
   */
  getTodayAppointments(): Observable<Booking[]> {
    const today = new Date().toISOString().split('T')[0]; // Get YYYY-MM-DD
    return this.getAppointments({ startDate: today, endDate: today });
  }

  /**
   * Get a specific appointment by ID
   */
  getAppointment(appointmentId: string | number): Observable<Booking | null> {
    return this.bookings$.pipe(
      map(appointments => {
        return appointments.find(appointment => 
          appointment.id === appointmentId || appointment.id.toString() === appointmentId.toString()
        ) || null;
      })
    );
  }

  /**
   * Create a new appointment
   */

  //lagecy
  // createAppointment(appointment: Omit<Booking, 'id' | 'createdAt' | 'updatedAt'>): Observable<number | string> {
  //   const doctorId = this.getCurrentDoctorId();
  //   if (!doctorId) {
  //     return throwError(() => new Error('No authenticated doctor found'));
  //   }
    
  //   const now = new Date();
  //   // Generate a unique ID for the appointment
  //   const appointmentId = `${appointment.date}T${appointment.time}:00Z`;
    
  //   const appointmentWithDates = {
  //     ...appointment,
  //     id: appointmentId,
  //     doctorId,
  //     createdAt: now.toISOString(),
  //     updatedAt: now.toISOString()
  //   };
    
  //   const appointmentRef = doc(this.firestore, 'appointment-list', doctorId);
    
  //   return from(getDoc(appointmentRef)).pipe(
  //     switchMap(docSnapshot => {
  //       // Create or update the appointment data
  //       if (!docSnapshot.exists()) {
  //         return from(setDoc(appointmentRef, {
  //           [appointmentId]: appointmentWithDates
  //         }));
  //       } else {
  //         return from(updateDoc(appointmentRef, {
  //           [appointmentId]: appointmentWithDates
  //         }));
  //       }
  //     }),
  //     map(() => {
  //       // Add to the local cache
  //       const currentAppointments = this.bookingsCache.getValue();
  //       this.bookingsCache.next([...currentAppointments, appointmentWithDates as Booking]);
        
  //       return appointmentId;
  //     }),
  //     catchError(error => {
  //       console.error('Error creating appointment:', error);
  //       return throwError(() => error);
  //     })
  //   );
  // }

  createAppointment(appointment: Omit<Booking, 'id' | 'createdAt' | 'updatedAt'>): Observable<number | string> {
    const doctorId = this.getCurrentDoctorId();
    if (!doctorId) {
      return throwError(() => new Error('No authenticated doctor found'));
    }
    
    const now = new Date();
    // Generate a unique ID for the appointment
    const appointmentId = `${appointment.date}T${appointment.time}:00Z`;
    
    const appointmentWithDates = {
      ...appointment,
      id: appointmentId,
      doctorId,
      createdAt: now.toISOString(),
      updatedAt: now.toISOString()
    };
    
    const appointmentRef = doc(this.firestore, 'appointment-list', doctorId);
    const bookingMapRef = doc(this.firestore, 'booking-map', appointment.patientId);
    
    return from(getDoc(appointmentRef)).pipe(
      switchMap((docSnapshot: DocumentSnapshot<DocumentData>) => {
        // First, update the appointment list
        const appointmentUpdatePromise = docSnapshot.exists() 
          ? updateDoc(appointmentRef, { [appointmentId]: appointmentWithDates })
          : setDoc(appointmentRef, { [appointmentId]: appointmentWithDates });
        
        // Then, create/update the booking map
        const bookingMapPromise = setDoc(bookingMapRef, 
          { [appointmentId]: {
            doctorId,
            status: appointmentWithDates.status,
            date: appointmentWithDates.date,
            type: appointmentWithDates.type
          }}, 
          { merge: true }
        );
        
        // Wait for both operations to complete
        return from(Promise.all([appointmentUpdatePromise, bookingMapPromise]));
      }),
      map(() => {
        // Add to the local cache
        const currentAppointments = this.bookingsCache.getValue();
        this.bookingsCache.next([...currentAppointments, appointmentWithDates as Booking]);
        
        return appointmentId;
      }),
      catchError(error => {
        console.error('Error creating appointment:', error);
        return throwError(() => error);
      })
    );
  }

  /**
   * Update an appointment
   */
  updateAppointment(appointmentId: string, updates: Partial<Booking>): Observable<void> {
    const doctorId = this.getCurrentDoctorId();
    if (!doctorId) {
      return throwError(() => new Error('No authenticated doctor found'));
    }
    
    const appointmentRef = doc(this.firestore, 'appointment-list', doctorId);
    
    return this.getAppointment(appointmentId).pipe(
      take(1),
      switchMap(existingAppointment => {
        if (!existingAppointment) {
          return throwError(() => new Error('Appointment not found'));
        }
        
        const updatedAppointment = {
          ...existingAppointment,
          ...updates,
          updatedAt: new Date().toISOString()
        };
        
        return from(updateDoc(appointmentRef, {
          [appointmentId]: updatedAppointment
        })).pipe(
          tap(() => {
            // Update the local cache
            const currentAppointments = this.bookingsCache.getValue();
            const updatedAppointments = currentAppointments.map(appointment => 
              appointment.id === appointmentId ? updatedAppointment : appointment
            );
            this.bookingsCache.next(updatedAppointments);
          })
        );
      }),
      catchError(error => {
        console.error('Error updating appointment:', error);
        return throwError(() => error);
      })
    );
  }

  /**
   * Update an appointment's status
   */
  updateAppointmentStatus(appointmentId: string, newStatus: BookingStatus): Observable<void> {
    const doctorId = this.getCurrentDoctorId();
    if (!doctorId) {
      return throwError(() => new Error('No authenticated doctor found'));
    }
    
    // Create a status change record
    const statusChange: StatusChange = {
      status: newStatus,
      changedAt: new Date().toISOString(),
      changedBy: doctorId
    };
    
    return this.getAppointment(appointmentId).pipe(
      take(1),
      switchMap(existingAppointment => {
        if (!existingAppointment) {
          return throwError(() => new Error('Appointment not found'));
        }
        
        // Add to status history
        const statusHistory = existingAppointment.statusHistory || [];
        statusHistory.push(statusChange);
        
        // Return the main update operation
        return this.updateAppointment(appointmentId, {
          status: newStatus,
          statusHistory
        });
      })
    );
  }

  /**
   * Delete an appointment
   */
  deleteAppointment(appointmentId: string): Observable<void> {
    const doctorId = this.getCurrentDoctorId();
    if (!doctorId) {
      return throwError(() => new Error('No authenticated doctor found'));
    }
    
    const appointmentRef = doc(this.firestore, 'appointment-list', doctorId);
    
    // Create an update object that deletes the field
    const updateData: Record<string, any> = {};
    updateData[appointmentId] = deleteField();
    
    return from(updateDoc(appointmentRef, updateData)).pipe(
      tap(() => {
        // Update the local cache
        const currentAppointments = this.bookingsCache.getValue();
        const updatedAppointments = currentAppointments.filter(
          appointment => appointment.id !== appointmentId
        );
        this.bookingsCache.next(updatedAppointments);
      }),
      catchError(error => {
        console.error('Error deleting appointment:', error);
        return throwError(() => error);
      })
    );
  }

  /**
   * Load booking statistics
   */
  loadBookingStats(): void {
    this.getAppointments().pipe(
      take(1),
      map(appointments => this.calculateBookingStats(appointments)),
      tap(stats => this.statsCache.next(stats)),
      catchError(error => {
        console.error('Error calculating booking stats:', error);
        return of(null);
      })
    ).subscribe();
  }

  /**
   * Get current booking statistics
   */
  getBookingStats(): Observable<BookingStats> {
    // If no stats in cache, calculate them
    if (!this.statsCache.getValue()) {
      this.loadBookingStats();
    }
    
    return this.stats$.pipe(
      map(stats => {
        if (!stats) {
          // Return default stats if none available
          return this.getDefaultStats();
        }
        return stats;
      })
    );
  }

  /**
   * Calculate booking statistics from appointments
   */
  private calculateBookingStats(appointments: Booking[]): BookingStats {
    const today = new Date().toISOString().split('T')[0];
    const todayAppointments = appointments.filter(appointment => appointment.date === today);
    
    // Weekly stats
    const weeklyStats = this.calculateWeeklyStats(appointments);
    
    return {
      today: {
        total: todayAppointments.length,
        completed: todayAppointments.filter(a => a.status === 'completed').length,
        scheduled: todayAppointments.filter(a => a.status === 'scheduled').length,
        cancelled: todayAppointments.filter(a => a.status === 'cancelled').length,
        absent: todayAppointments.filter(a => a.status === 'absent').length
      },
      weekly: weeklyStats
    };
  }

  /**
   * Calculate weekly appointment statistics
   */
  private calculateWeeklyStats(appointments: Booking[]): { total: number, byDay: { day: string, count: number }[] } {
    // Get dates for the current week (Sunday to Saturday)
    const today = new Date();
    const currentDay = today.getDay(); // 0 = Sunday, 6 = Saturday
    
    const startOfWeek = new Date(today);
    startOfWeek.setDate(today.getDate() - currentDay);
    
    const endOfWeek = new Date(startOfWeek);
    endOfWeek.setDate(startOfWeek.getDate() + 6);
    
    // Format dates for comparison
    const startDate = startOfWeek.toISOString().split('T')[0];
    const endDate = endOfWeek.toISOString().split('T')[0];
    
    // Filter appointments in this week
    const weeklyAppointments = appointments.filter(appointment => {
      return appointment.date >= startDate && appointment.date <= endDate;
    });
    
    // Initialize counts for each day
    const dayNames = ['Sunday', 'Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday', 'Saturday'];
    const byDay = dayNames.map(day => ({ day, count: 0 }));
    
    // Count appointments for each day
    weeklyAppointments.forEach(appointment => {
      const appointmentDate = new Date(appointment.date);
      const dayOfWeek = appointmentDate.getDay();
      byDay[dayOfWeek].count++;
    });
    
    return {
      total: weeklyAppointments.length,
      byDay
    };
  }

  /**
   * Get default statistics (for new doctors or error cases)
   */
  private getDefaultStats(): BookingStats {
    return {
      today: {
        total: 0,
        completed: 0,
        scheduled: 0,
        cancelled: 0,
        absent: 0
      },
      weekly: {
        total: 0,
        byDay: [
          { day: 'Sunday', count: 0 },
          { day: 'Monday', count: 0 },
          { day: 'Tuesday', count: 0 },
          { day: 'Wednesday', count: 0 },
          { day: 'Thursday', count: 0 },
          { day: 'Friday', count: 0 },
          { day: 'Saturday', count: 0 }
        ]
      }
    };
  }

  /**
   * Load doctor's schedule
   */
  loadDoctorSchedule(): void {
    console.log('Loading doctor schedule...');
    if (this.isLoadingSchedule) {
      console.log('Already loading schedule, skipping');
      return;
    }
    
    const doctorId = this.getCurrentDoctorId();
    console.log('Doctor ID for schedule:', doctorId);
    
    if (!doctorId) {
      console.log('No doctor ID found, skipping schedule load');
      return;
    }
    
    this.isLoadingSchedule = true;
    
    // Get the entire doctor_schedules document
    const scheduleRef = doc(this.firestore, 'doctor_schedules');
    console.log('Fetching schedule from Firestore path:', 'doctor_schedules');
    
    from(getDoc(scheduleRef)).pipe(
      map(docSnapshot => {
        console.log('Schedule doc exists:', docSnapshot.exists());
        
        if (!docSnapshot.exists()) {
          console.log('No schedule found, using default');
          return this.getDefaultSchedule(doctorId);
        }
        
        const data = docSnapshot.data();
        console.log('Raw schedule data:', data);
        
        // Access the specific doctor's schedule using the doctorId
        const doctorData = data[doctorId];
        console.log('Doctor specific schedule data:', doctorData);
        
        if (!doctorData) {
          console.log('No schedule for this doctor, using default');
          return this.getDefaultSchedule(doctorId);
        }
        
        const schedule: DoctorSchedule[] = [];
        
        // Convert data to our interface
        const days: DayOfWeek[] = ['sunday', 'monday', 'tuesday', 'wednesday', 'thursday', 'friday', 'saturday'];
        
        days.forEach((day, index) => {
          const dayData = doctorData[day] || {};
          console.log(`Processing ${day} schedule:`, dayData);
          
          schedule.push({
            id: dayData.id || index + 1,
            doctorId,
            day,
            isWorkingDay: dayData.isWorkingDay !== undefined ? dayData.isWorkingDay : (day !== 'friday' && day !== 'saturday'),
            timeSlots: Array.isArray(dayData.timeSlots) ? dayData.timeSlots : []
          });
        });
        
        console.log('Processed schedule data:', schedule);
        return schedule;
      }),
      tap(schedule => {
        console.log('Updating schedule cache with:', schedule);
        this.scheduleCache.next(schedule);
        this.isLoadingSchedule = false;
      }),
      catchError(error => {
        console.error('Error loading doctor schedule:', error);
        this.isLoadingSchedule = false;
        const defaultSchedule = this.getDefaultSchedule(doctorId);
        console.log('Using default schedule due to error:', defaultSchedule);
        this.scheduleCache.next(defaultSchedule);
        return of(defaultSchedule);
      })
    ).subscribe();
  }
  
  getAvailableTimeSlots(date: string): Observable<BookingTimeSlot[]> {
    console.log('Getting available time slots for date:', date);
    const dateObj = new Date(date);
    const dayOfWeek = dateObj.getDay(); // 0 = Sunday, 6 = Saturday
    const days: DayOfWeek[] = ['sunday', 'monday', 'tuesday', 'wednesday', 'thursday', 'friday', 'saturday'];
    const day = days[dayOfWeek];
    console.log('Day of week:', day);
    
    return forkJoin({
      schedule: this.getScheduleForDay(day).pipe(
        tap(scheduleData => console.log('Schedule for', day, ':', scheduleData)),
        take(1)
      ),
      appointments: this.getAppointments({ startDate: date, endDate: date }).pipe(
        tap(appointmentsData => console.log('Appointments for', date, ':', appointmentsData)),
        take(1)
      )
    }).pipe(
      map(({ schedule, appointments }) => {
        console.log('Processing schedule:', schedule, 'and appointments:', appointments);
        
        if (!schedule || !schedule.isWorkingDay) {
          console.log('No schedule or not a working day');
          return [];
        }
        
        // Copy the time slots
        const availableSlots = [...schedule.timeSlots];
        console.log('Initial available slots:', availableSlots);
        
        // Mark slots as unavailable if they're already booked
        availableSlots.forEach(slot => {
          const slotStartTime = slot.startTime;
          const isBooked = appointments.some(a => a.time === slotStartTime);
          
          if (isBooked) {
            console.log(`Slot ${slotStartTime} is already booked`);
            slot.isAvailable = false;
          }
        });
        
        // Filter to only available slots
        const filteredSlots = availableSlots.filter(slot => slot.isAvailable);
        console.log('Final available slots:', filteredSlots);
        return filteredSlots;
      })
    );
  }

  /**
   * Get doctor's schedule
   */
  getDoctorSchedule(): Observable<DoctorSchedule[]> {
    // If no schedule in cache, load it
    if (this.scheduleCache.getValue().length === 0) {
      this.loadDoctorSchedule();
    }
    
    return this.schedule$;
  }

  /**
   * Get schedule for a specific day
   */
  getScheduleForDay(day: DayOfWeek): Observable<DoctorSchedule | null> {
    return this.getDoctorSchedule().pipe(
      map(schedule => schedule.find(s => s.day === day) || null)
    );
  }

  /**
   * Save doctor's schedule
   */
  saveSchedule(schedule: DoctorSchedule[]): Observable<void> {
    const doctorId = this.getCurrentDoctorId();
    if (!doctorId) {
      return throwError(() => new Error('No authenticated doctor found'));
    }
    
    const scheduleRef = doc(this.firestore, 'doctor_schedules');
    
    // First get the existing document
    return from(getDoc(scheduleRef)).pipe(
      switchMap(docSnapshot => {
        // Convert array to object with day as key
        const scheduleData: Record<string, any> = {};
        schedule.forEach(daySchedule => {
          scheduleData[daySchedule.day] = {
            id: daySchedule.id,
            isWorkingDay: daySchedule.isWorkingDay,
            timeSlots: daySchedule.timeSlots
          };
        });
        
        // If document exists, update just this doctor's data
        if (docSnapshot.exists()) {
          return from(updateDoc(scheduleRef, {
            [doctorId]: scheduleData
          }));
        } else {
          // Create a new document with this doctor's data
          return from(setDoc(scheduleRef, {
            [doctorId]: scheduleData
          }));
        }
      }),
      tap(() => {
        // Update the local cache
        this.scheduleCache.next(schedule);
      }),
      catchError(error => {
        console.error('Error saving doctor schedule:', error);
        return throwError(() => error);
      })
    );
  }

  /**
   * Get available time slots for a specific date
   */
  // getAvailableTimeSlots(date: string): Observable<BookingTimeSlot[]> {
  //   const dateObj = new Date(date);
  //   const dayOfWeek = dateObj.getDay(); // 0 = Sunday, 6 = Saturday
  //   const days: DayOfWeek[] = ['sunday', 'monday', 'tuesday', 'wednesday', 'thursday', 'friday', 'saturday'];
  //   const day = days[dayOfWeek];
    
  //   return forkJoin({
  //     schedule: this.getScheduleForDay(day).pipe(take(1)),
  //     appointments: this.getAppointments({ startDate: date, endDate: date }).pipe(take(1))
  //   }).pipe(
  //     map(({ schedule, appointments }) => {
  //       if (!schedule || !schedule.isWorkingDay) {
  //         return [];
  //       }
        
  //       // Copy the time slots
  //       const availableSlots = [...schedule.timeSlots];
        
  //       // Mark slots as unavailable if they're already booked
  //       availableSlots.forEach(slot => {
  //         const slotStartTime = slot.startTime;
  //         const isBooked = appointments.some(a => a.time === slotStartTime);
          
  //         if (isBooked) {
  //           slot.isAvailable = false;
  //         }
  //       });
        
  //       // Filter to only available slots
  //       return availableSlots.filter(slot => slot.isAvailable);
  //     })
  //   );
  // }

  /**
   * Get next available appointment slot (for today or future dates)
   */
  getNextAvailableSlot(): Observable<{ date: string, slot: BookingTimeSlot } | null> {
    const today = new Date();
    const todayStr = today.toISOString().split('T')[0];
    
    return this.getAvailableTimeSlots(todayStr).pipe(
      switchMap(slots => {
        // Find the next available slot today after current time
        const currentTime = `${String(today.getHours()).padStart(2, '0')}:${String(today.getMinutes()).padStart(2, '0')}`;
        
        const availableSlotsToday = slots.filter(slot => slot.startTime > currentTime);
        
        if (availableSlotsToday.length > 0) {
          // Return the earliest available slot today
          const nextSlot = availableSlotsToday.sort((a, b) => 
            a.startTime.localeCompare(b.startTime))[0];
          
          return of({
            date: todayStr,
            slot: nextSlot
          });
        }
        
        // If no slots available today, check tomorrow
        const tomorrow = new Date(today);
        tomorrow.setDate(today.getDate() + 1);
        const tomorrowStr = tomorrow.toISOString().split('T')[0];
        
        return this.getAvailableTimeSlots(tomorrowStr).pipe(
          map(tomorrowSlots => {
            if (tomorrowSlots.length > 0) {
              // Return the earliest available slot tomorrow
              const nextSlot = tomorrowSlots.sort((a, b) => 
                a.startTime.localeCompare(b.startTime))[0];
              
              return {
                date: tomorrowStr,
                slot: nextSlot
              };
            }
            
            // No slots available today or tomorrow
            return null;
          })
        );
      })
    );
  }

  /**
   * Search for patients by name or phone number
   * Note: In a real app, this would query a patients collection
   */
  searchPatients(searchTerm: string): Observable<any[]> {
    // For demo purposes, return mock data
    // In a real application, you would query the patients collection
    
    const mockPatients = [
      {
        id: '8801776613630',
        name: 'Fatima Akter',
        phone: '+8801776613630',
        profile: 'assets/images/patients/patient1.jpg',
        pregnancyWeek: 32
      },
      {
        id: '8801776613631',
        name: 'Rabeya Khatun',
        phone: '+8801776613631',
        profile: 'assets/images/patients/patient2.jpg',
        pregnancyWeek: 28
      },
      {
        id: '8801776613632',
        name: 'Nasrin Sultana',
        phone: '+8801776613632',
        profile: 'assets/images/patients/patient3.jpg',
        pregnancyWeek: 20
      },
      {
        id: '8801776613633',
        name: 'Taslima Begum',
        phone: '+8801776613633',
        profile: 'assets/images/patients/patient4.jpg',
        pregnancyWeek: 16
      },
      {
        id: '8801776613634',
        name: 'Ayesha Khan',
        phone: '+8801776613634',
        profile: 'assets/images/patients/patient5.jpg',
        pregnancyWeek: 36
      }
    ];
    
    // Filter patients based on search term
    const filteredPatients = searchTerm ? 
      mockPatients.filter(patient => 
        patient.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
        patient.phone.includes(searchTerm)
      ) : 
      mockPatients;
    
    return of(filteredPatients);
  }

  /**
   * Get default schedule for a new doctor
   */
  private getDefaultSchedule(doctorId: string): DoctorSchedule[] {
    const days: DayOfWeek[] = ['sunday', 'monday', 'tuesday', 'wednesday', 'thursday', 'friday', 'saturday'];
    
    return days.map((day, index) => ({
      id: index + 1,
      doctorId,
      day,
      isWorkingDay: day !== 'friday' && day !== 'saturday', // Assuming Friday and Saturday are off by default
      timeSlots: day !== 'friday' && day !== 'saturday' ? [
        { id: index * 2 + 1, startTime: '09:00', endTime: '13:00', maxPatients: 10, isAvailable: true },
        { id: index * 2 + 2, startTime: '14:00', endTime: '17:00', maxPatients: 8, isAvailable: true }
      ] : []
    }));
  }
}