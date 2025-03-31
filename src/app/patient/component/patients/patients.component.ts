// import { Component, OnInit } from '@angular/core';
// import { CommonModule } from '@angular/common';
// import { FormsModule, ReactiveFormsModule } from '@angular/forms';


// import { StatCardComponent } from '../stat-card/stat-card.component';

// import { SidebarComponent } from '../../../dashboard/components/sidebar/sidebar.component';
// import { HeaderComponent } from '../../../dashboard/components/header/header.component';
// import { PatientSearchComponent } from '../patient-search/patient-search.component';
// import { PatientCardComponent } from '../patient-card/patient-card.component';
// import { AlertComponent } from '../../../shared/components/alert/alert.component';
// import { Doctor } from '../../../models/auth.model';
// import { AuthService } from '../../../auth/services/auth.service';
// import { Router, RouterModule } from '@angular/router';


// @Component({
//   selector: 'app-patients',
//   standalone: true,
//   imports: [
//     CommonModule,
//     FormsModule,
//     ReactiveFormsModule,
//     SidebarComponent,
//     HeaderComponent,
//     PatientCardComponent,
//     PatientSearchComponent,
//     StatCardComponent,

//   ],
//   templateUrl: './patients.component.html',
//   styleUrl: './patients.component.css'
// })
// export class PatientsComponent implements OnInit {
//   currentDoctor!: Doctor;
//   private dummyDoctor: Doctor = {
//     uuid: 'dummy-001',
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
//   sidebarCollapsed = false;
//   patientStats = [
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
//       change: '-1 since yesterday',
//       colorClass: 'danger-card'
//     },
//     {
//       title: 'High Risk',
//       value: 15,
//       icon: 'fa-solid fa-triangle-exclamation',
//       change: '+2 this week',
//       colorClass: 'warning-card'
//     },
//     {
//       title: 'Regular Checkups',
//       value: 42,
//       icon: 'fa-solid fa-calendar-check',
//       change: '92% on schedule',
//       colorClass: 'info-card'
//     }
//   ];

//   // Sample patients data
//   patients = [
//     {
//       id: 1,
//       name: 'Fatima Akter',
//       age: 28,
//       weeks: 32,
//       criticality: 'critical',
//       vitalStatus: {
//         bp: '150/95',
//         heartRate: '92',
//         oxygenLevel: '95%',
//         temperature: '37.5°C'
//       },
//       lastCheckup: '2025-02-25',
//       nextAppointment: '2025-03-05',
//       healthWorker: 'Nasreen Ahmed',
//       profile: 'assets/images/patients/patient1.jpg'
//     },
//     {
//       id: 2,
//       name: 'Rabeya Khatun',
//       age: 24,
//       weeks: 28,
//       criticality: 'high',
//       vitalStatus: {
//         bp: '135/85',
//         heartRate: '88',
//         oxygenLevel: '96%',
//         temperature: '37.2°C'
//       },
//       lastCheckup: '2025-02-20',
//       nextAppointment: '2025-03-07',
//       healthWorker: 'Tahmina Islam',
//       profile: 'assets/images/patients/patient2.jpg'
//     },
//     {
//       id: 3,
//       name: 'Nasrin Sultana',
//       age: 30,
//       weeks: 20,
//       criticality: 'medium',
//       vitalStatus: {
//         bp: '120/80',
//         heartRate: '76',
//         oxygenLevel: '98%',
//         temperature: '36.8°C'
//       },
//       lastCheckup: '2025-02-22',
//       nextAppointment: '2025-03-10',
//       healthWorker: 'Mahmuda Begum',
//       profile: 'assets/images/patients/patient3.jpg'
//     },
//     {
//       id: 4,
//       name: 'Taslima Begum',
//       age: 22,
//       weeks: 16,
//       criticality: 'low',
//       vitalStatus: {
//         bp: '110/75',
//         heartRate: '72',
//         oxygenLevel: '99%',
//         temperature: '36.5°C'
//       },
//       lastCheckup: '2025-02-18',
//       nextAppointment: '2025-03-12',
//       healthWorker: 'Farida Yesmin',
//       profile: 'assets/images/patients/patient4.jpg'
//     },
//     {
//       id: 5,
//       name: 'Ayesha Khan',
//       age: 32,
//       weeks: 36,
//       criticality: 'high',
//       vitalStatus: {
//         bp: '140/90',
//         heartRate: '90',
//         oxygenLevel: '95%',
//         temperature: '37.4°C'
//       },
//       lastCheckup: '2025-02-26',
//       nextAppointment: '2025-03-04',
//       healthWorker: 'Shahana Akhter',
//       profile: 'assets/images/patients/patient5.jpg'
//     },
//     {
//       id: 6,
//       name: 'Sadia Islam',
//       age: 26,
//       weeks: 12,
//       criticality: 'low',
//       vitalStatus: {
//         bp: '115/75',
//         heartRate: '70',
//         oxygenLevel: '99%',
//         temperature: '36.6°C'
//       },
//       lastCheckup: '2025-02-15',
//       nextAppointment: '2025-03-15',
//       healthWorker: 'Najma Begum',
//       profile: 'assets/images/patients/patient6.jpg'
//     }
//   ];

//   // Filter options
//   filterOptions = {
//     criticality: 'all',
//     healthWorker: 'all',
//     searchTerm: ''
//   };

//   filteredPatients = [...this.patients];

//   constructor( private authService: AuthService, private router:Router) { }

//   ngOnInit(): void {

//     this.applyFilters();
//     this.currentDoctor = this.authService.getCurrentDoctor() || this.dummyDoctor;
//   }

//   toggleSidebar(): void {
//     this.sidebarCollapsed = !this.sidebarCollapsed;
//   }
//   onAddPatient(): void {
//     this.router.navigate(['/patients/add']);
//   }
//   updateFilters(filters: any): void {
//     this.filterOptions = { ...this.filterOptions, ...filters };
//     this.applyFilters();
//   }
  
//   applyFilters(): void {
//     this.filteredPatients = this.patients.filter(patient => {
//       // Apply criticality filter
//       if (this.filterOptions.criticality !== 'all' &&
//         patient.criticality !== this.filterOptions.criticality) {
//         return false;
//       }

//       // Apply health worker filter
//       if (this.filterOptions.healthWorker !== 'all' &&
//         patient.healthWorker !== this.filterOptions.healthWorker) {
//         return false;
//       }

//       // Apply search term filter
//       if (this.filterOptions.searchTerm &&
//         !patient.name.toLowerCase().includes(this.filterOptions.searchTerm.toLowerCase())) {
//         return false;
//       }

//       return true;
//     });
//   }
// }


import { Component, OnInit, OnDestroy } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule, ReactiveFormsModule } from '@angular/forms';
import { StatCardComponent } from '../stat-card/stat-card.component';
import { SidebarComponent } from '../../../dashboard/components/sidebar/sidebar.component';
import { HeaderComponent } from '../../../dashboard/components/header/header.component';
import { PatientSearchComponent } from '../patient-search/patient-search.component';
import { PatientCardComponent } from '../patient-card/patient-card.component';
import { Doctor } from '../../../models/auth.model';
import { AuthService } from '../../../auth/services/auth.service';
import { Router, RouterModule } from '@angular/router';
import { PatientService } from '../../services/patient.service';
import { Patient, Criticality } from '../../model/patient.model';
import { Subscription } from 'rxjs';
import { PatientDetailsService } from '../../../patient-details/services/patient-details.service';

@Component({
  selector: 'app-patients',
  standalone: true,
  imports: [
    CommonModule,
    FormsModule,
    ReactiveFormsModule,
    SidebarComponent,
    HeaderComponent,
    PatientCardComponent,
    PatientSearchComponent,
    StatCardComponent,
  ],
  templateUrl: './patients.component.html',
  styleUrl: './patients.component.css'
})
export class PatientsComponent implements OnInit, OnDestroy {
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
  sidebarCollapsed = false;
  patientStats = [
    {
      title: 'Total Patients',
      value: 0,
      icon: 'fa-solid fa-users',
      change: '0 this week',
      colorClass: 'primary-card'
    },
    {
      title: 'Critical Patients',
      value: 0,
      icon: 'fa-solid fa-heart-pulse',
      change: '0 since yesterday',
      colorClass: 'danger-card'
    },
    {
      title: 'High Risk',
      value: 0,
      icon: 'fa-solid fa-triangle-exclamation',
      change: '0 this week',
      colorClass: 'warning-card'
    },
    {
      title: 'Regular Checkups',
      value: 0,
      icon: 'fa-solid fa-calendar-check',
      change: '0% on schedule',
      colorClass: 'info-card'
    }
  ];

  patients: Patient[] = [];
  filteredPatients: Patient[] = [];
  lastIndex = -1;
  pageSize = 10;
  isLoading = false;
  hasMorePatients = true;
  totalPatients = 0;
  private subscription: Subscription = new Subscription();

  // Health workers extracted from patient data
  healthWorkers: string[] = [];

  // Filter options
  filterOptions = {
    criticality: 'all',
    healthWorker: 'all',
    searchTerm: ''
  };

  constructor(
    private authService: AuthService,
    private patientService: PatientService,
    private patientDetailsService: PatientDetailsService,
    private router: Router
  ) {}

  ngOnInit(): void {
    this.currentDoctor = this.authService.getCurrentDoctor() || this.dummyDoctor;
    this.loadPatients();
  }

  ngOnDestroy(): void {
    this.subscription.unsubscribe();
  }

  loadPatients(): void {
    if (this.isLoading) return;
    
    this.isLoading = true;
    this.subscription.add(
      this.patientService.getPatientsFromMap(this.pageSize, this.lastIndex).subscribe({
        next: (result) => {
          this.patients = [...this.patients, ...result.patients];
          this.lastIndex = result.lastIndex;
          this.totalPatients = result.totalCount;
          this.hasMorePatients = result.patients.length === this.pageSize;
          this.updateStats();
          this.extractHealthWorkers();
          this.applyFilters();
          this.isLoading = false;
        },
        error: (err) => {
          console.error('Error loading patients:', err);
          this.isLoading = false;
        }
      })
    );
  }

  // Extract unique health workers from patient data
  extractHealthWorkers(): void {
    const workersSet = new Set<string>();
    
    this.patients.forEach(patient => {
      const workerName = patient.assignmentInfo?.assignedHealthWorker;
      if (workerName && workerName.trim() !== '') {
        workersSet.add(workerName);
      }
    });
    
    this.healthWorkers = Array.from(workersSet);
  }

  loadMorePatients(): void {
    this.loadPatients();
  }

  updateStats(): void {
    // Update total patients
    this.patientStats[0].value = this.totalPatients;
    
    // Update critical patients count
    const criticalCount = this.patients.filter(p => p.criticality === 'critical').length;
    this.patientStats[1].value = criticalCount;
    
    // Update high risk count
    const highRiskCount = this.patients.filter(p => p.criticality === 'high').length;
    this.patientStats[2].value = highRiskCount;
    
    // Update regular checkups (medium/low criticality)
    const regularCount = this.patients.filter(p => 
      p.criticality === 'medium' || p.criticality === 'low').length;
    this.patientStats[3].value = regularCount;
  }

  toggleSidebar(): void {
    this.sidebarCollapsed = !this.sidebarCollapsed;
  }

  onAddPatient(): void {
    this.router.navigate(['/patients/add']);
  }

  updateFilters(filters: any): void {
    console.log('Received new filters:', filters);
    // Store the previous filters to detect changes
    const prevFilters = {...this.filterOptions};
    this.filterOptions = {...this.filterOptions, ...filters};
    
    // Force the filter to be applied
    setTimeout(() => this.applyFilters(), 0);
  }
  
  applyFilters(): void {
    console.log('Applying filters with options:', JSON.stringify(this.filterOptions));
    
    // Start with all patients and then filter
    this.filteredPatients = this.patients.filter(patient => {
      try {
        // Debug patient data
        console.log('Filtering patient:', 
          {name: patient?.personalInfo?.fullName, 
           criticality: patient?.criticality,
           healthWorker: patient?.assignmentInfo?.assignedHealthWorker});
        
        // Criticality filter
        if (this.filterOptions.criticality !== 'all') {
          if (!patient?.criticality || patient.criticality !== this.filterOptions.criticality) {
            return false;
          }
        }
        
        // Health worker filter
        if (this.filterOptions.healthWorker !== 'all') {
          const workerName = patient?.assignmentInfo?.assignedHealthWorker || '';
          if (workerName !== this.filterOptions.healthWorker) {
            return false;
          }
        }
        
        // Search term filter
        if (this.filterOptions.searchTerm && this.filterOptions.searchTerm.trim() !== '') {
          const term = this.filterOptions.searchTerm.toLowerCase().trim();
          const name = patient?.personalInfo?.fullName?.toLowerCase() || '';
          const phone = patient?.personalInfo?.phoneNumber || '';
          
          if (!name.includes(term) && !phone.includes(term)) {
            return false;
          }
        }
        
        return true;
      } catch (err) {
        console.error('Error filtering patient:', err, patient);
        return false;
      }
    });
    
    console.log(`Filtered ${this.patients.length} patients down to ${this.filteredPatients.length}`);
  }

  viewPatientDetails(patientId: string): void {
    console.log("viewPatientDetails called with ID: " + patientId); 
    if (patientId) {
      this.patientDetailsService.setPatientId(patientId);
      this.router.navigate(['/patient-details']);
    } else {
      console.error('Invalid patient ID');
    }
  }
}