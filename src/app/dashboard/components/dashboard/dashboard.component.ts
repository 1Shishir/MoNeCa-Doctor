
// import { Component, OnInit, OnDestroy } from '@angular/core';
// import { CommonModule } from '@angular/common';
// import { Router } from '@angular/router';
// import { Subscription } from 'rxjs';

// // Import components
// import { SidebarComponent } from '../sidebar/sidebar.component';
// import { HeaderComponent } from '../header/header.component';
// import { AlertComponent } from '../alert/alert.component';
// import { StatCardComponent } from '../stat-card/stat-card.component';
// import { AppointmentsTableComponent } from '../appointments-table/appointments-table.component';
// import { PatientSummaryComponent } from '../patient-summary/patient-summary.component';

// // Import services and models
// import { Doctor } from '../../../models/auth.model';
// import { AuthService } from '../../../auth/services/auth.service';
// import { DashboardService } from '../../service/dashboard.service';


// @Component({
//   selector: 'app-dashboard',
//   standalone: true,
//   imports: [
//     CommonModule,
//     SidebarComponent,
//     HeaderComponent,
//     AlertComponent,
//     StatCardComponent,
//     AppointmentsTableComponent,
//     PatientSummaryComponent
//   ],
//   templateUrl: './dashboard.component.html',
//   styleUrl: './dashboard.component.css'
// })
// export class DashboardComponent implements OnInit, OnDestroy {
//   // UI state
//   sidebarCollapsed = false;
//   isLoading = {
//     stats: true,
//     appointments: true,
//     patients: true,
//     alert: true
//   };
  
//   // Doctor info
//   currentDoctor!: Doctor;
//   private dummyDoctor: Doctor = {
//     uid: 'dummy-001',
//     email: 'doctor@moneca.com',
//     fullName: 'Dr. Anonymous',
//     specialization: 'General Practice',
//     licenseNumber: 'LIC-DUMMY-001',
//     phoneNumber: '+880123456789',
//     hospital: 'MoNeCa Health Center',
//     isApproved: true,
//     createdAt: new Date(),
//     updatedAt: new Date()
//   };

//   // Dashboard data
//   stats = [
//     {
//       title: 'Total Patients',
//       value: 0,
//       icon: 'fa-solid fa-users',
//       change: '0 this week',
//       colorClass: 'primary-card'
//     },
//     {
//       title: 'Critical Patients',
//       value: 0,
//       icon: 'fa-solid fa-heart-pulse',
//       change: '0 this week',
//       colorClass: 'danger-card'
//     },
//     {
//       title: 'Today\'s Appointments',
//       value: 0,
//       icon: 'fa-solid fa-calendar-check',
//       change: '0 remaining',
//       colorClass: 'info-card'
//     },
//     {
//       title: 'Reports Pending',
//       value: 0,
//       icon: 'fa-solid fa-file-medical',
//       change: '0 urgent',
//       colorClass: 'warning-card'
//     }
//   ];

//   appointments: any[] = [];
//   patients: any[] = [];
//   criticalAlert: any = null;
  
//   // Subscriptions to manage
//   private subscriptions: Subscription[] = [];

//   constructor(
//     private router: Router,
//     private authService: AuthService,
//     private dashboardService: DashboardService
//   ) {}

//   ngOnInit(): void {
//     // Get current doctor info
//     this.currentDoctor = this.authService.getCurrentDoctor() || this.dummyDoctor;
    
//     // Load dashboard data from Firestore
//     this.loadDashboardStats();
//     this.loadTodayAppointments();
//     this.loadCriticalPatients();
//     this.loadCriticalAlert();
//   }

//   ngOnDestroy(): void {
//     // Clean up subscriptions to prevent memory leaks
//     this.subscriptions.forEach(sub => sub.unsubscribe());
//   }

//   toggleSidebar(): void {
//     this.sidebarCollapsed = !this.sidebarCollapsed;
//   }

//   // Load dashboard statistics
//   private loadDashboardStats(): void {
//     const sub = this.dashboardService.getDashboardStats().subscribe(
//       stats => {
//         this.stats = [
//           {
//             title: 'Total Patients',
//             value: stats.totalPatients,
//             icon: 'fa-solid fa-users',
//             change: `${stats.totalPatients} total`,
//             colorClass: 'primary-card'
//           },
//           {
//             title: 'Critical Patients',
//             value: stats.criticalPatients,
//             icon: 'fa-solid fa-heart-pulse',
//             change: `${stats.criticalPatients} need attention`,
//             colorClass: 'danger-card'
//           },
//           {
//             title: 'Today\'s Appointments',
//             value: stats.todayAppointments,
//             icon: 'fa-solid fa-calendar-check',
//             change: `${stats.todayAppointments} scheduled`,
//             colorClass: 'info-card'
//           },
//           {
//             title: 'Reports Pending',
//             value: stats.pendingReports,
//             icon: 'fa-solid fa-file-medical',
//             change: `${stats.pendingReports} tests pending`,
//             colorClass: 'warning-card'
//           }
//         ];
//         this.isLoading.stats = false;
//       },
//       error => {
//         console.error('Error loading dashboard stats:', error);
//         this.isLoading.stats = false;
//       }
//     );
//     this.subscriptions.push(sub);
//   }

//   // Load today's appointments
//   private loadTodayAppointments(): void {
//     const sub = this.dashboardService.getTodayAppointments().subscribe(
//       appointments => {
//         this.appointments = appointments;
//         this.isLoading.appointments = false;
//       },
//       error => {
//         console.error('Error loading appointments:', error);
//         this.isLoading.appointments = false;
//       }
//     );
//     this.subscriptions.push(sub);
//   }

//   // Load critical patients
//   private loadCriticalPatients(): void {
//     const sub = this.dashboardService.getCriticalPatients().subscribe(
//       patients => {
//         this.patients = patients;
//         this.isLoading.patients = false;
//       },
//       error => {
//         console.error('Error loading critical patients:', error);
//         this.isLoading.patients = false;
//       }
//     );
//     this.subscriptions.push(sub);
//   }

//   // Load critical alert
//   private loadCriticalAlert(): void {
//     const sub = this.dashboardService.getMostCriticalAlert().subscribe(
//       alert => {
//         this.criticalAlert = alert;
//         this.isLoading.alert = false;
//       },
//       error => {
//         console.error('Error loading critical alert:', error);
//         this.isLoading.alert = false;
//       }
//     );
//     this.subscriptions.push(sub);
//   }

//   // Action handlers
//   onAlertButtonClick(): void {
//     if (this.criticalAlert) {
//       this.router.navigate(['/patient-details', this.criticalAlert.patientId]);
//     }
//   }

//   onAddAppointment(): void {
//     this.router.navigate(['/booking/add']);
//   }

//   onStartAppointment(appointment: any): void {
//     this.router.navigate(['/booking/details', appointment.id]);
//   }

//   onRescheduleAppointment(appointment: any): void {
//     this.router.navigate(['/booking/reschedule', appointment.id]);
//   }

//   onViewAllPatients(): void {
//     this.router.navigate(['/patients']);
//   }

//   onViewPatient(patient: any): void {
//     this.router.navigate(['/patient-details', patient.id]);
//   }

//   onContactPatient(patient: any): void {
//     // Handle contacting patient - could be implemented with a messaging system
//     console.log('Contact patient:', patient);
//   }

//   onViewData(patient: any): void {
//     this.router.navigate(['/detailed-health-data', patient.id]);
//   }
// }

import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { Router } from '@angular/router';
import { SidebarComponent } from '../sidebar/sidebar.component';
import { HeaderComponent } from '../header/header.component';
import { AlertComponent } from '../alert/alert.component';
import { StatCardComponent } from '../stat-card/stat-card.component';
import { AppointmentsTableComponent } from '../appointments-table/appointments-table.component';
import { PatientSummaryComponent } from '../patient-summary/patient-summary.component';
import { Doctor } from '../../../models/auth.model';
import { AuthService } from '../../../auth/services/auth.service';

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
    uid: 'dummy-001',
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

  constructor(private router: Router,
    private authService: AuthService
  ) { }

  ngOnInit(): void {
    this.currentDoctor = this.authService.getCurrentDoctor() || this.dummyDoctor;
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

// import { Component, OnInit } from '@angular/core';
// import { CommonModule } from '@angular/common';
// import { Router } from '@angular/router';
// import { SidebarComponent } from '../sidebar/sidebar.component';
// import { HeaderComponent } from '../header/header.component';
// import { AlertComponent } from '../alert/alert.component';
// import { StatCardComponent } from '../stat-card/stat-card.component';
// import { AppointmentsTableComponent } from '../appointments-table/appointments-table.component';
// import { PatientSummaryComponent } from '../patient-summary/patient-summary.component';

// @Component({
//   selector: 'app-dashboard',
//   standalone: true,
//   imports: [
//     CommonModule,
//     SidebarComponent,
//     HeaderComponent,
//     AlertComponent,
//     StatCardComponent,
//     AppointmentsTableComponent,
//     PatientSummaryComponent
//   ],
//   templateUrl: './dashboard.component.html',
//   styleUrl: './dashboard.component.css'
// })
// export class DashboardComponent implements OnInit {
//   sidebarCollapsed = false;

//   stats = [
//     {
//       title: 'Total Patients',
//       value: 64,
//       icon: 'fa-solid fa-users',
//       change: '+3 this week',
//       colorClass: 'primary-card'
//     },
//     {
//       title: 'Critical Patients',
//       value: 7,
//       icon: 'fa-solid fa-heart-pulse',
//       change: '-2 this week',
//       colorClass: 'danger-card'
//     },
//     {
//       title: 'Today\'s Appointments',
//       value: 12,
//       icon: 'fa-solid fa-calendar-check',
//       change: '4 remaining',
//       colorClass: 'info-card'
//     },
//     {
//       title: 'Reports Pending',
//       value: 8,
//       icon: 'fa-solid fa-file-medical',
//       change: '3 urgent',
//       colorClass: 'warning-card'
//     }
//   ];

//   appointments = [
//     { id: 1, name: 'Amina Begum', time: '14:30', status: 'Confirmed', type: 'Check-up' },
//     { id: 2, name: 'Fatima Rahman', time: '15:15', status: 'Pending', type: 'Follow-up' },
//     { id: 3, name: 'Nasreen Khan', time: '16:00', status: 'Confirmed', type: 'Vaccination' },
//     { id: 4, name: 'Tahmina Ahmed', time: '17:30', status: 'Confirmed', type: 'Ultrasound' }
//   ];

//   patients = [
//     { id: 1, name: 'Rabeya Akter', issue: 'High BP', lastReading: '150/95', lastChecked: '30 min ago' },
//     { id: 2, name: 'Sadia Jahan', issue: 'Low O₂', lastReading: '92%', lastChecked: '15 min ago' },
//     { id: 3, name: 'Nusrat Islam', issue: 'Irregular HR', lastReading: '115 bpm', lastChecked: '5 min ago' },
//     { id: 4, name: 'Fatima Ali', issue: 'Fever', lastReading: '39.5°C', lastChecked: '45 min ago' }
//   ];

//   constructor(private router: Router) { }

//   ngOnInit(): void { }

//   toggleSidebar(): void {
//     this.sidebarCollapsed = !this.sidebarCollapsed;
//   }

//   onAlertButtonClick(): void {
//     this.router.navigate(['/patients/3']); 
//   }

//   onAddAppointment(): void {
//     this.router.navigate(['/booking/new']);
//   }

//   onStartAppointment(appointment: any): void {
//     this.router.navigate([`/booking/${appointment.id}`]);
//   }

//   onRescheduleAppointment(appointment: any): void {
//     this.router.navigate([`/booking/${appointment.id}/reschedule`]);
//   }

//   onViewAllAppointments(): void {
//     this.router.navigate(['/booking']);
//   }

//   onViewAllPatients(): void {
//     this.router.navigate(['/patients']);
//   }

//   onViewPatient(patient: any): void {
//     this.router.navigate([`/patients/${patient.id}`]);
//   }

//   onContactPatient(patient: any): void {
//     this.router.navigate([`/patients/${patient.id}/contact`]);
//   }

//   onViewData(patient: any): void {
//     this.router.navigate([`/detailed-health-data/${patient.id}`]);
//   }
// }