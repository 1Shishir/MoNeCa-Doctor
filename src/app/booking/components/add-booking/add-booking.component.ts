import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormBuilder, FormGroup, Validators, ReactiveFormsModule, FormsModule } from '@angular/forms';
import { Router, RouterModule } from '@angular/router';

import { AppointmentType } from '../../../models/booking.model';
import { HeaderComponent } from '../../../dashboard/components/header/header.component';
import { SidebarComponent } from '../../../dashboard/components/sidebar/sidebar.component';

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
export class AddBookingComponent implements OnInit {
  sidebarCollapsed = false;
  bookingForm: FormGroup;
  availableSlots: { time: string, serialNumber: number }[] = [];
  todayDate: string;
  showPatientSearchResults = false;
  showSuccessMessage = false;
  isSubmitting = false;
  
  // Mock patient search results
  searchResults = [
    {
      id: 1,
      name: 'Fatima Akter',
      phone: '+8801712345678',
      profile: 'assets/images/patients/patient1.jpg',
      pregnancyWeek: 32
    },
    {
      id: 2,
      name: 'Rabeya Khatun',
      phone: '+8801712345679',
      profile: 'assets/images/patients/patient2.jpg',
      pregnancyWeek: 28
    },
    {
      id: 3,
      name: 'Nasrin Sultana',
      phone: '+8801712345680',
      profile: 'assets/images/patients/patient3.jpg',
      pregnancyWeek: 20
    }
  ];
  
  selectedPatient: any = null;
  searchTerm: string = '';
  
  appointmentTypes: { value: AppointmentType, label: string }[] = [
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
    private router: Router
  ) {
    // Get today's date in YYYY-MM-DD format
    this.todayDate = new Date().toISOString().split('T')[0];
    
    this.bookingForm = this.fb.group({
      patientId: ['', Validators.required],
      patientName: ['', Validators.required],
      patientPhone: ['', Validators.required],
      date: [this.todayDate, Validators.required],
      timeSlot: ['', Validators.required],
      type: ['regular-checkup', Validators.required],
      notes: [''],
      serialNumber: ['', Validators.required]
    });
    
    // Generate available time slots from 9 AM to 5 PM with 30-minute intervals
    this.generateAvailableSlots();
  }
  
  ngOnInit(): void {
    // Listen for date changes to regenerate available slots
    this.bookingForm.get('date')?.valueChanges.subscribe(date => {
      this.generateAvailableSlots();
    });
  }
  
  toggleSidebar(): void {
    this.sidebarCollapsed = !this.sidebarCollapsed;
  }
  
  generateAvailableSlots(): void {
    // In a real app, you would fetch this from a service based on doctor's schedule
    // For demo purposes, we'll generate slots from 9 AM to 5 PM with 30-minute intervals
    const slots = [];
    let serialNumber = 1;
    
    for (let hour = 9; hour < 17; hour++) {
      for (let minute of [0, 30]) {
        const timeString = `${hour.toString().padStart(2, '0')}:${minute.toString().padStart(2, '0')}`;
        slots.push({ time: timeString, serialNumber: serialNumber++ });
      }
    }
    
    this.availableSlots = slots;
  }
  
  searchPatients(): void {
    // In a real app, you would call a service to search patients
    this.showPatientSearchResults = true;
    
    // For demo purposes, we'll filter our mock data
    // Normally you would call a backend API for this
    if (this.searchTerm) {
      this.searchResults = this.searchResults.filter(patient => 
        patient.name.toLowerCase().includes(this.searchTerm.toLowerCase()) ||
        patient.phone.includes(this.searchTerm)
      );
    }
  }
  
  selectPatient(patient: any): void {
    this.selectedPatient = patient;
    this.showPatientSearchResults = false;
    
    // Update form values
    this.bookingForm.patchValue({
      patientId: patient.id,
      patientName: patient.name,
      patientPhone: patient.phone
    });
    
    // Focus on the next field (date)
    setTimeout(() => {
      document.getElementById('date')?.focus();
    }, 100);
  }
  
  clearPatientSelection(): void {
    this.selectedPatient = null;
    this.bookingForm.patchValue({
      patientId: '',
      patientName: '',
      patientPhone: ''
    });
  }
  
  updateSerialNumber(event: Event): void {
    const timeSlot = (event.target as HTMLSelectElement).value;
    const slot = this.availableSlots.find(s => s.time === timeSlot);
    
    if (slot) {
      this.bookingForm.patchValue({
        serialNumber: slot.serialNumber
      });
    }
  }
  
  onSubmit(): void {
    if (this.bookingForm.valid) {
      this.isSubmitting = true;
      
      // In a real app, you would call a service to save the booking
      console.log('Booking form submitted:', this.bookingForm.value);
      
      // Simulate API call
      setTimeout(() => {
        this.isSubmitting = false;
        this.showSuccessMessage = true;
        
        // Reset form after 3 seconds and redirect
        setTimeout(() => {
          this.router.navigate(['/bookings']);
        }, 3000);
      }, 1500);
    } else {
      // Mark all fields as touched to display validation errors
      this.markFormGroupTouched(this.bookingForm);
    }
  }
  
  markFormGroupTouched(formGroup: FormGroup): void {
    Object.values(formGroup.controls).forEach(control => {
      control.markAsTouched();
    });
  }
  
  getFormattedTime(time: string): string {
    // Convert 24-hour format to 12-hour format with AM/PM
    const [hours, minutes] = time.split(':').map(Number);
    const period = hours >= 12 ? 'PM' : 'AM';
    const formattedHours = hours % 12 || 12;
    return `${formattedHours}:${String(minutes).padStart(2, '0')} ${period}`;
  }
  
  // Form control getters for easier access in template
  get patientIdControl() { return this.bookingForm.get('patientId'); }
  get dateControl() { return this.bookingForm.get('date'); }
  get timeSlotControl() { return this.bookingForm.get('timeSlot'); }
  get typeControl() { return this.bookingForm.get('type'); }
  get serialNumberControl() { return this.bookingForm.get('serialNumber'); }
}