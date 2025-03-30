

import { Component, Inject, OnInit, PLATFORM_ID } from '@angular/core';
import { CommonModule, isPlatformBrowser } from '@angular/common';
import { Router } from '@angular/router';
import { SidebarComponent } from '../sidebar/sidebar.component';
import { HeaderComponent } from '../header/header.component';
import { AlertComponent } from '../alert/alert.component';
import { StatCardComponent } from '../stat-card/stat-card.component';
import { AppointmentsTableComponent } from '../appointments-table/appointments-table.component';
import { PatientSummaryComponent } from '../patient-summary/patient-summary.component';
import { AuthService } from '../../../auth/services/auth.service';
import { Doctor } from '../../../models/auth.model';

@Component({
  selector: 'app-dashboard',
  standalone: true,
  imports: [
    CommonModule,
    SidebarComponent,
    HeaderComponent,
    AlertComponent,
    StatCardComponent,
    AppointmentsTableComponent,
    PatientSummaryComponent
  ],
  templateUrl: './dashboard.component.html',
  styleUrl: './dashboard.component.css'
})
export class DashboardComponent implements OnInit {
  sidebarCollapsed = false;
  currentDoctor!: Doctor;
  private dummyDoctor: Doctor = {
    uuid: 'dummy-001',
    email: 'doctor@moneca.com',
    fullName: 'Dr. Anonymous',
    specialization: 'General Practice',
    licenseNumber: 'LIC-DUMMY-001',
    phoneNumber: '+880123456789',
    hospital: 'MoNeCa Health Center',
    isApproved: true,
    createdAt: new Date(),
    updatedAt: new Date()
  };
  stats = [
    {
      title: 'Total Patients',
      value: 64,
      icon: 'fa-solid fa-users',
      change: '+3 this week',
      colorClass: 'primary-card'
    },
    {
      title: 'Critical Patients',
      value: 7,
      icon: 'fa-solid fa-heart-pulse',
      change: '-2 this week',
      colorClass: 'danger-card'
    },
    {
      title: 'Today\'s Appointments',
      value: 12,
      icon: 'fa-solid fa-calendar-check',
      change: '4 remaining',
      colorClass: 'info-card'
    },
    {
      title: 'Reports Pending',
      value: 8,
      icon: 'fa-solid fa-file-medical',
      change: '3 urgent',
      colorClass: 'warning-card'
    }
  ];

  appointments = [
    { id: 1, name: 'Amina Begum', time: '14:30', status: 'Confirmed', type: 'Check-up' },
    { id: 2, name: 'Fatima Rahman', time: '15:15', status: 'Pending', type: 'Follow-up' },
    { id: 3, name: 'Nasreen Khan', time: '16:00', status: 'Confirmed', type: 'Vaccination' },
    { id: 4, name: 'Tahmina Ahmed', time: '17:30', status: 'Confirmed', type: 'Ultrasound' }
  ];

  patients = [
    { id: 1, name: 'Rabeya Akter', issue: 'High BP', lastReading: '150/95', lastChecked: '30 min ago' },
    { id: 2, name: 'Sadia Jahan', issue: 'Low O₂', lastReading: '92%', lastChecked: '15 min ago' },
    { id: 3, name: 'Nusrat Islam', issue: 'Irregular HR', lastReading: '115 bpm', lastChecked: '5 min ago' },
    { id: 4, name: 'Fatima Ali', issue: 'Fever', lastReading: '39.5°C', lastChecked: '45 min ago' }
  ];

  constructor(
    private router: Router,
    private authService: AuthService,
    @Inject(PLATFORM_ID) private platformId: Object
  ) { }

  ngOnInit(): void {
   
      if (isPlatformBrowser(this.platformId)) {
        // Subscribe to the auth state observable instead of using getCurrentDoctor()
        this.authService.currentDoctor$.subscribe(doctor => {
          if (doctor) {
            this.currentDoctor = doctor;
            console.log("Real doctor data loaded:", doctor.fullName);
          } else {
            this.currentDoctor = this.dummyDoctor;
            console.log("Using dummy doctor");
          }
        });
      } else {
        this.currentDoctor = this.dummyDoctor;
      }
   }

  toggleSidebar(): void {
    this.sidebarCollapsed = !this.sidebarCollapsed;
  }

  // Add missing methods that are referenced in the template
  onAlertButtonClick(): void {
    // Handle alert button click
    console.log('Alert button clicked');
    // Add your implementation here
  }

  onAddAppointment(): void {
    // Handle add appointment
    console.log('Add appointment clicked');
    this.router.navigate(['/booking/add']);
  }

  onStartAppointment(appointment: any): void {
    // Handle start appointment
    console.log('Start appointment:', appointment);
    this.router.navigate(['/booking/details', appointment.id]);
  }

  onRescheduleAppointment(appointment: any): void {
    // Handle reschedule appointment
    console.log('Reschedule appointment:', appointment);
    this.router.navigate(['/booking/reschedule', appointment.id]);
  }

  onViewAllPatients(): void {
    // Handle view all patients
    console.log('View all patients clicked');
    this.router.navigate(['/patients']);
  }

  onViewPatient(patient: any): void {
    // Handle view patient
    console.log('View patient:', patient);
    this.router.navigate(['/patient-details', patient.id]);
  }

  onContactPatient(patient: any): void {
    // Handle contact patient
    console.log('Contact patient:', patient);
    // Add your implementation for contacting patients
  }

  onViewData(patient: any): void {
    // Handle view data
    console.log('View data:', patient);
    this.router.navigate(['/detailed-health-data', patient.id]);
  }
}

