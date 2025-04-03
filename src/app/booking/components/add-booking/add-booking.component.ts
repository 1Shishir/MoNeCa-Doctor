// import { Component, OnInit, OnDestroy } from '@angular/core';
// import { CommonModule } from '@angular/common';
// import { FormsModule } from '@angular/forms';
// import { FormBuilder, FormGroup, Validators, ReactiveFormsModule } from '@angular/forms';
// import { Router, RouterModule } from '@angular/router';

// import { Subscription } from 'rxjs';
// import { debounceTime, distinctUntilChanged } from 'rxjs/operators';

// import { AppointmentType, BookingTimeSlot, BookingStatus } from '../../../models/booking.model';
// import { HeaderComponent } from '../../../dashboard/components/header/header.component';
// import { SidebarComponent } from '../../../dashboard/components/sidebar/sidebar.component';
// import { BookingService } from '../../service/booking.service';
// import { AuthService } from '../../../auth/services/auth.service';

// @Component({
//   selector: 'app-add-booking',
//   standalone: true,
//   imports: [
//     CommonModule,
//     FormsModule,
//     ReactiveFormsModule,
//     RouterModule,
//     SidebarComponent,
//     HeaderComponent
//   ],
//   templateUrl: './add-booking.component.html',
//   styleUrl: './add-booking.component.css'
// })
// export class AddBookingComponent implements OnInit, OnDestroy {
//   // Sidebar state
//   sidebarCollapsed = false;

//   // Form and validation
//   bookingForm: FormGroup;
//   todayDate: string;

//   // Search and patient selection
//   searchTerm = '';
//   searchResults: Array<{
//     id: string, 
//     name: string, 
//     phone: string, 
//     profile?: string, 
//     pregnancyWeek: number
//   }> = [];
//   showPatientSearchResults = false;
//   selectedPatient: {
//     id: string, 
//     name: string, 
//     phone: string, 
//     profile?: string, 
//     pregnancyWeek: number
//   } | null = null;

//   // Booking-related properties
//   availableSlots: Array<{ time: string, serialNumber: number }> = [];
  
//   // State management
//   isSubmitting = false;
//   showSuccessMessage = false;

//   // Subscriptions
//   private subscriptions: Subscription[] = [];

//   // Constant appointment types
//   readonly appointmentTypes: Array<{ value: AppointmentType, label: string }> = [
//     { value: 'regular-checkup', label: 'Regular Checkup' },
//     { value: 'follow-up', label: 'Follow-up' },
//     { value: 'ultrasound', label: 'Ultrasound' },
//     { value: 'emergency', label: 'Emergency' },
//     { value: 'vaccination', label: 'Vaccination' },
//     { value: 'lab-report', label: 'Lab Report Review' },
//     { value: 'other', label: 'Other' }
//   ];

//   constructor(
//     private fb: FormBuilder,
//     private router: Router,
//     private authService: AuthService,
//     private bookingService: BookingService
//   ) {
//     // Set today's date
//     this.todayDate = new Date().toISOString().split('T')[0];
    
//     // Initialize form
//     this.bookingForm = this.fb.group({
//       patientId: ['', Validators.required],
//       patientName: ['', Validators.required],
//       patientPhone: ['', Validators.required],
//       patientProfile: [''],
//       pregnancyWeek: [null],
//       date: [this.todayDate, Validators.required],
//       timeSlot: ['', Validators.required],
//       type: ['regular-checkup', Validators.required],
//       notes: [''],
//       serialNumber: ['', Validators.required]
//     });
//   }

//   ngOnInit(): void {
//     // Subscribe to date changes to update available slots
//     const dateSubscription = this.bookingForm.get('date')?.valueChanges
//       .pipe(
//         debounceTime(300),
//         distinctUntilChanged()
//       )
//       .subscribe(date => {
//         if (date) {
//           this.loadAvailableSlots(date);
//         }
//       });
    
//     if (dateSubscription) {
//       this.subscriptions.push(dateSubscription);
//     }

//     // Initial load of available slots for today
//     this.loadAvailableSlots(this.todayDate);
//   }

//   ngOnDestroy(): void {
//     // Clean up subscriptions
//     this.subscriptions.forEach(sub => sub.unsubscribe());
//   }

//   // Sidebar toggle
//   toggleSidebar(): void {
//     this.sidebarCollapsed = !this.sidebarCollapsed;
//   }

//   // Load available time slots for the selected date
//   loadAvailableSlots(date: string): void {
//     this.bookingService.getAvailableTimeSlots(date)
//       .subscribe({
//         next: (timeSlots: BookingTimeSlot[]) => {
//           // Convert to format expected by the template
//           this.availableSlots = timeSlots.map((slot, index) => ({
//             time: slot.startTime,
//             serialNumber: slot.id || index + 1
//           }));
//         },
//         error: (err) => {
//           console.error('Error loading available slots:', err);
//           // Fallback to generated slots if API fails
//           this.generateFallbackSlots();
//         }
//       });
//   }

//   // Generate fallback slots in case the API call fails
//   generateFallbackSlots(): void {
//     const slots = [];
//     let serialNumber = 1;
    
//     for (let hour = 9; hour < 17; hour++) {
//       for (let minute of [0, 30]) {
//         const timeString = `${hour.toString().padStart(2, '0')}:${minute.toString().padStart(2, '0')}`;
//         slots.push({ time: timeString, serialNumber: serialNumber++ });
//       }
//     }
    
//     this.availableSlots = slots;
//   }

//   // Patient search functionality
//   searchPatients(): void {
//     if (!this.searchTerm || this.searchTerm.length < 2) {
//       this.searchResults = [];
//       this.showPatientSearchResults = false;
//       return;
//     }

//     this.bookingService.searchPatients(this.searchTerm)
//       .subscribe({
//         next: (results) => {
//           this.searchResults = results.map(patient => ({
//             id: patient.id,
//             name: patient.name,
//             phone: patient.phone,
//             profile: patient.profile,
//             pregnancyWeek: patient.pregnancyWeek || 0
//           }));
//           this.showPatientSearchResults = true;
//         },
//         error: (err) => {
//           console.error('Patient search error:', err);
//           this.searchResults = [];
//           this.showPatientSearchResults = false;
//         }
//       });
//   }

//   // Select a patient from search results
//   selectPatient(patient: {
//     id: string, 
//     name: string, 
//     phone: string, 
//     profile?: string, 
//     pregnancyWeek: number
//   }): void {
//     this.selectedPatient = patient;
//     this.showPatientSearchResults = false;
    
//     this.bookingForm.patchValue({
//       patientId: patient.id,
//       patientName: patient.name,
//       patientPhone: patient.phone,
//       patientProfile: patient.profile || '',
//       pregnancyWeek: patient.pregnancyWeek
//     });
//   }

//   // Clear patient selection
//   clearPatientSelection(): void {
//     this.selectedPatient = null;
//     this.searchTerm = ''; // Reset search term
//     this.bookingForm.patchValue({
//       patientId: '',
//       patientName: '',
//       patientPhone: '',
//       patientProfile: '',
//       pregnancyWeek: null
//     });
//   }

//   // Update serial number based on selected time slot
//   updateSerialNumber(event: Event): void {
//     const timeSlot = (event.target as HTMLSelectElement).value;
//     const slot = this.availableSlots.find(s => s.time === timeSlot);
    
//     if (slot) {
//       this.bookingForm.patchValue({
//         serialNumber: slot.serialNumber
//       });
//     }
//   }

//   // Format time to 12-hour format for display
//   getFormattedTime(time: string): string {
//     const [hours, minutes] = time.split(':').map(Number);
//     const period = hours >= 12 ? 'PM' : 'AM';
//     const formattedHours = hours % 12 || 12;
//     return `${formattedHours}:${String(minutes).padStart(2, '0')} ${period}`;
//   }

//   // Form submission
//   onSubmit(): void {
//     if (this.bookingForm.valid) {
//       this.isSubmitting = true;
      
//       const formValues = this.bookingForm.value;
//       const currentDoctor = this.authService.getCurrentDoctor();

//       // Create the appointment data object
//       const appointmentData = {
//         patientId: formValues.patientId,
//         patientName: formValues.patientName,
//         patientPhone: formValues.patientPhone,
//         patientProfile: formValues.patientProfile || '',
//         doctorId: currentDoctor?.uuid || '',
//         doctorName: currentDoctor?.fullName || '',
//         date: formValues.date,
//         time: formValues.timeSlot,
//         serialNumber: parseInt(formValues.serialNumber, 10),
//         status: 'scheduled' as BookingStatus, // Type assertion for status
//         type: formValues.type,
//         notes: formValues.notes || '',
//         statusHistory: [{
//           status: 'scheduled' as BookingStatus,
//           changedAt: new Date().toISOString(),
//           changedBy: currentDoctor?.uuid || ''
//         }],
//         pregnancyWeek: formValues.pregnancyWeek
//       };

//       // Use the booking service to create the appointment
//       this.bookingService.createAppointment(appointmentData)
//         .subscribe({
//           next: (appointmentId) => {
//             console.log('Appointment created with ID:', appointmentId);
//             this.isSubmitting = false;
//             this.showSuccessMessage = true;
            
//             // Refresh booking data in the service
//             this.bookingService.refreshAllData();
            
//             // Redirect after showing success message
//             setTimeout(() => {
//               this.router.navigate(['/bookings']);
//             }, 3000);
//           },
//           error: (error) => {
//             console.error('Error creating appointment:', error);
//             this.isSubmitting = false;
//             // You could add error handling UI here
//           }
//         });
//     } else {
//       // Mark all fields as touched to display validation errors
//       this.markFormGroupTouched(this.bookingForm);
//     }
//   }

//   // Mark all form controls as touched to show validation errors
//   private markFormGroupTouched(formGroup: FormGroup): void {
//     Object.values(formGroup.controls).forEach(control => {
//       control.markAsTouched();
      
//       if (control instanceof FormGroup) {
//         this.markFormGroupTouched(control);
//       }
//     });
//   }

  

//   // Getters for easy form control access in template
//   get patientIdControl() { return this.bookingForm.get('patientId'); }
//   get dateControl() { return this.bookingForm.get('date'); }
//   get timeSlotControl() { return this.bookingForm.get('timeSlot'); }
//   get typeControl() { return this.bookingForm.get('type'); }
//   get serialNumberControl() { return this.bookingForm.get('serialNumber'); }
// }


import { Component, OnInit, OnDestroy } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { FormBuilder, FormGroup, Validators, ReactiveFormsModule } from '@angular/forms';
import { Router, RouterModule } from '@angular/router';

import { Subscription } from 'rxjs';
import { debounceTime, distinctUntilChanged, tap } from 'rxjs/operators';

import { AppointmentType, BookingTimeSlot, BookingStatus } from '../../../models/booking.model';
import { HeaderComponent } from '../../../dashboard/components/header/header.component';
import { SidebarComponent } from '../../../dashboard/components/sidebar/sidebar.component';
import { BookingService } from '../../service/booking.service';
import { AuthService } from '../../../auth/services/auth.service';

@Component({
  selector: 'app-add-booking',
  standalone: true,
  imports: [
    CommonModule,
    FormsModule,
    ReactiveFormsModule,
    RouterModule,
    SidebarComponent,
    HeaderComponent
  ],
  templateUrl: './add-booking.component.html',
  styleUrl: './add-booking.component.css'
})
export class AddBookingComponent implements OnInit, OnDestroy {
  // Sidebar state
  sidebarCollapsed = false;

  // Form and validation
  bookingForm: FormGroup;
  todayDate: string;

  // Search and patient selection
  searchTerm = '';
  searchResults: Array<{
    id: string, 
    name: string, 
    phone: string, 
    profile?: string, 
    pregnancyWeek: number
  }> = [];
  showPatientSearchResults = false;
  selectedPatient: {
    id: string, 
    name: string, 
    phone: string, 
    profile?: string, 
    pregnancyWeek: number
  } | null = null;

  // Booking-related properties
  availableSlots: Array<{ time: string, serialNumber: number }> = [];
  
  // State management
  isSubmitting = false;
  showSuccessMessage = false;

  // Subscriptions
  private subscriptions: Subscription[] = [];

  // Constant appointment types
  readonly appointmentTypes: Array<{ value: AppointmentType, label: string }> = [
    { value: 'regular-checkup', label: 'Regular Checkup' },
    { value: 'follow-up', label: 'Follow-up' },
    { value: 'ultrasound', label: 'Ultrasound' },
    { value: 'emergency', label: 'Emergency' },
    { value: 'vaccination', label: 'Vaccination' },
    { value: 'lab-report', label: 'Lab Report Review' },
    { value: 'other', label: 'Other' }
  ];

  constructor(
    private fb: FormBuilder,
    private router: Router,
    private authService: AuthService,
    private bookingService: BookingService
  ) {
    // Set today's date
    this.todayDate = new Date().toISOString().split('T')[0];
    
    // Initialize form
    this.bookingForm = this.fb.group({
      patientId: ['', Validators.required],
      patientName: ['', Validators.required],
      patientPhone: ['', Validators.required],
      patientProfile: [''],
      pregnancyWeek: [null],
      date: [this.todayDate, Validators.required],
      timeSlot: ['', Validators.required],
      type: ['regular-checkup', Validators.required],
      notes: [''],
      serialNumber: ['', Validators.required]
    });
  }

  ngOnInit(): void {
    // Subscribe to date changes to update available slots
    const dateSubscription = this.bookingForm.get('date')?.valueChanges
      .pipe(
        debounceTime(300),
        distinctUntilChanged(),
        tap(date => console.log('Date changed to:', date))
      )
      .subscribe(date => {
        if (date) {
          // Reset time and serial when date changes
          this.bookingForm.get('timeSlot')?.setValue('');
          this.bookingForm.get('serialNumber')?.setValue(null);
          this.loadAvailableSlots(date);
        }
      });
    
    if (dateSubscription) {
      this.subscriptions.push(dateSubscription);
    }

    // Initial load of available slots for today
    console.log('Initial load of time slots for today:', this.todayDate);
    this.loadAvailableSlots(this.todayDate);
  }

  ngOnDestroy(): void {
    // Clean up subscriptions
    this.subscriptions.forEach(sub => sub.unsubscribe());
  }

  // Sidebar toggle
  toggleSidebar(): void {
    this.sidebarCollapsed = !this.sidebarCollapsed;
  }

  // Load available time slots for the selected date
  // In add-booking.component.ts
loadAvailableSlots(date: string): void {
  console.log('Loading time slots for date:', date);
  
  if (!date) {
    console.log('No date selected, skipping time slot load');
    return;
  }
  
  this.bookingService.getAvailableTimeSlots(date)
    .pipe(
      tap(timeSlots => console.log('Raw available slots from service:', timeSlots))
    )
    .subscribe({
      next: (timeSlots: BookingTimeSlot[]) => {
        console.log('Processing slots in component:', timeSlots);
        
        // If no time slots returned, use fallback slots
        if (!timeSlots || timeSlots.length === 0) {
          console.log('No time slots returned, using fallback slots');
          this.generateFallbackSlots();
          return;
        }
        
        // Convert to format expected by the template
        this.availableSlots = timeSlots.map((slot, index) => ({
          time: slot.startTime,
          serialNumber: slot.id || index + 1
        }));
        
        console.log('Final available slots for UI:', this.availableSlots);
        
        // Check if currently selected time is still available
        const currentTime = this.bookingForm.get('timeSlot')?.value;
        if (currentTime && !this.availableSlots.some(slot => slot.time === currentTime)) {
          console.log('Selected time is no longer available, resetting');
          this.bookingForm.get('timeSlot')?.setValue('');
          this.bookingForm.get('serialNumber')?.setValue(null);
        }
      },
      error: (err) => {
        console.error('Error loading available slots:', err);
        // Fallback to generated slots if API fails
        this.generateFallbackSlots();
      }
    });
}
  // Generate fallback slots in case the API call fails
  generateFallbackSlots(): void {
    console.log('Generating fallback time slots');
    const slots = [];
    let serialNumber = 1;
    
    for (let hour = 9; hour < 17; hour++) {
      for (let minute of [0, 30]) {
        const timeString = `${hour.toString().padStart(2, '0')}:${minute.toString().padStart(2, '0')}`;
        slots.push({ time: timeString, serialNumber: serialNumber++ });
      }
    }
    
    this.availableSlots = slots;
    console.log('Generated fallback slots:', this.availableSlots);
  }

  // Patient search functionality
  searchPatients(): void {
    console.log('Searching for patients with term:', this.searchTerm);
    
    if (!this.searchTerm || this.searchTerm.length < 2) {
      console.log('Search term too short, skipping search');
      this.searchResults = [];
      this.showPatientSearchResults = false;
      return;
    }

    this.bookingService.searchPatients(this.searchTerm)
      .subscribe({
        next: (results) => {
          console.log('Patient search results:', results);
          this.searchResults = results.map(patient => ({
            id: patient.id,
            name: patient.name,
            phone: patient.phone,
            profile: patient.profile,
            pregnancyWeek: patient.pregnancyWeek || 0
          }));
          this.showPatientSearchResults = true;
        },
        error: (err) => {
          console.error('Patient search error:', err);
          this.searchResults = [];
          this.showPatientSearchResults = false;
        }
      });
  }

  // Select a patient from search results
  selectPatient(patient: {
    id: string, 
    name: string, 
    phone: string, 
    profile?: string, 
    pregnancyWeek: number
  }): void {
    console.log('Selecting patient:', patient);
    this.selectedPatient = patient;
    this.showPatientSearchResults = false;
    
    this.bookingForm.patchValue({
      patientId: patient.id,
      patientName: patient.name,
      patientPhone: patient.phone,
      patientProfile: patient.profile || '',
      pregnancyWeek: patient.pregnancyWeek
    });
    
    console.log('Updated form values after patient selection:', this.bookingForm.value);
  }

  // Clear patient selection
  clearPatientSelection(): void {
    console.log('Clearing patient selection');
    this.selectedPatient = null;
    this.searchTerm = ''; // Reset search term
    this.bookingForm.patchValue({
      patientId: '',
      patientName: '',
      patientPhone: '',
      patientProfile: '',
      pregnancyWeek: null
    });
  }

  // Update serial number based on selected time slot
  updateSerialNumber(event: Event): void {
    const selectedTime = (event.target as HTMLSelectElement).value;
    console.log('Time slot changed to:', selectedTime);
    
    if (!selectedTime) {
      console.log('No time selected, clearing serial number');
      this.bookingForm.get('serialNumber')?.setValue(null);
      return;
    }
    
    const selectedSlot = this.availableSlots.find(slot => slot.time === selectedTime);
    console.log('Selected slot details:', selectedSlot);
    
    if (selectedSlot) {
      console.log('Setting serial number to:', selectedSlot.serialNumber);
      this.bookingForm.patchValue({
        serialNumber: selectedSlot.serialNumber
      });
    }
  }

  // Format time to 12-hour format for display
  getFormattedTime(time: string): string {
    const [hours, minutes] = time.split(':').map(Number);
    const period = hours >= 12 ? 'PM' : 'AM';
    const formattedHours = hours % 12 || 12;
    return `${formattedHours}:${String(minutes).padStart(2, '0')} ${period}`;
  }

  // Form submission
  onSubmit(): void {
    console.log('Submitting booking form with values:', this.bookingForm.value);
    
    if (this.bookingForm.valid) {
      console.log('Form is valid, proceeding with submission');
      this.isSubmitting = true;
      
      const formValues = this.bookingForm.value;
      const currentDoctor = this.authService.getCurrentDoctor();
      console.log('Current doctor:', currentDoctor);

      // Create the appointment data object
      const appointmentData = {
        patientId: formValues.patientId,
        patientName: formValues.patientName,
        patientPhone: formValues.patientPhone,
        patientProfile: formValues.patientProfile || '',
        doctorId: currentDoctor?.uuid || '',
        doctorName: currentDoctor?.fullName || '',
        date: formValues.date,
        time: formValues.timeSlot,
        serialNumber: parseInt(formValues.serialNumber, 10),
        status: 'scheduled' as BookingStatus, // Type assertion for status
        type: formValues.type,
        notes: formValues.notes || '',
        statusHistory: [{
          status: 'scheduled' as BookingStatus,
          changedAt: new Date().toISOString(),
          changedBy: currentDoctor?.uuid || ''
        }],
        pregnancyWeek: formValues.pregnancyWeek
      };
      
      console.log('Appointment data to be submitted:', appointmentData);

      // Use the booking service to create the appointment
      this.bookingService.createAppointment(appointmentData)
        .subscribe({
          next: (appointmentId) => {
            console.log('Appointment created successfully with ID:', appointmentId);
            this.isSubmitting = false;
            this.showSuccessMessage = true;
            
            // Refresh booking data in the service
            this.bookingService.refreshAllData();
            
            // Redirect after showing success message
            setTimeout(() => {
              console.log('Redirecting to bookings page');
              this.router.navigate(['/bookings']);
            }, 3000);
          },
          error: (error) => {
            console.error('Error creating appointment:', error);
            this.isSubmitting = false;
            // You could add error handling UI here
          }
        });
    } else {
      console.log('Form is invalid, marking fields as touched');
      // Mark all fields as touched to display validation errors
      this.markFormGroupTouched(this.bookingForm);
      console.log('Form errors:', this.getFormValidationErrors());
    }
  }

  // Get detailed form validation errors for debugging
  private getFormValidationErrors() {
    const errors: any = {};
    Object.keys(this.bookingForm.controls).forEach(key => {
      const control = this.bookingForm.get(key);
      if (control && control.errors) {
        errors[key] = control.errors;
      }
    });
    return errors;
  }

  // Mark all form controls as touched to show validation errors
  private markFormGroupTouched(formGroup: FormGroup): void {
    Object.values(formGroup.controls).forEach(control => {
      control.markAsTouched();
      
      if (control instanceof FormGroup) {
        this.markFormGroupTouched(control);
      }
    });
  }

  // Getters for easy form control access in template
  get patientIdControl() { return this.bookingForm.get('patientId'); }
  get dateControl() { return this.bookingForm.get('date'); }
  get timeSlotControl() { return this.bookingForm.get('timeSlot'); }
  get typeControl() { return this.bookingForm.get('type'); }
  get serialNumberControl() { return this.bookingForm.get('serialNumber'); }
}