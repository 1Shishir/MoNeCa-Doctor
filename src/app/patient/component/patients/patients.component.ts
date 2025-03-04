import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule, ReactiveFormsModule } from '@angular/forms';


import { StatCardComponent } from '../stat-card/stat-card.component';

import { SidebarComponent } from '../../../dashboard/components/sidebar/sidebar.component';
import { HeaderComponent } from '../../../dashboard/components/header/header.component';
import { PatientSearchComponent } from '../patient-search/patient-search.component';
import { PatientCardComponent } from '../patient-card/patient-card.component';
import { AlertComponent } from '../../../shared/components/alert/alert.component';

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
export class PatientsComponent implements OnInit {
  sidebarCollapsed = false;

  // Patient statistics
  patientStats = [
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
      change: '-1 since yesterday',
      colorClass: 'danger-card'
    },
    {
      title: 'High Risk',
      value: 15,
      icon: 'fa-solid fa-triangle-exclamation',
      change: '+2 this week',
      colorClass: 'warning-card'
    },
    {
      title: 'Regular Checkups',
      value: 42,
      icon: 'fa-solid fa-calendar-check',
      change: '92% on schedule',
      colorClass: 'info-card'
    }
  ];

  // Sample patients data
  patients = [
    {
      id: 1,
      name: 'Fatima Akter',
      age: 28,
      weeks: 32,
      criticality: 'critical',
      vitalStatus: {
        bp: '150/95',
        heartRate: '92',
        oxygenLevel: '95%',
        temperature: '37.5°C'
      },
      lastCheckup: '2025-02-25',
      nextAppointment: '2025-03-05',
      healthWorker: 'Nasreen Ahmed',
      profile: 'assets/images/patients/patient1.jpg'
    },
    {
      id: 2,
      name: 'Rabeya Khatun',
      age: 24,
      weeks: 28,
      criticality: 'high',
      vitalStatus: {
        bp: '135/85',
        heartRate: '88',
        oxygenLevel: '96%',
        temperature: '37.2°C'
      },
      lastCheckup: '2025-02-20',
      nextAppointment: '2025-03-07',
      healthWorker: 'Tahmina Islam',
      profile: 'assets/images/patients/patient2.jpg'
    },
    {
      id: 3,
      name: 'Nasrin Sultana',
      age: 30,
      weeks: 20,
      criticality: 'medium',
      vitalStatus: {
        bp: '120/80',
        heartRate: '76',
        oxygenLevel: '98%',
        temperature: '36.8°C'
      },
      lastCheckup: '2025-02-22',
      nextAppointment: '2025-03-10',
      healthWorker: 'Mahmuda Begum',
      profile: 'assets/images/patients/patient3.jpg'
    },
    {
      id: 4,
      name: 'Taslima Begum',
      age: 22,
      weeks: 16,
      criticality: 'low',
      vitalStatus: {
        bp: '110/75',
        heartRate: '72',
        oxygenLevel: '99%',
        temperature: '36.5°C'
      },
      lastCheckup: '2025-02-18',
      nextAppointment: '2025-03-12',
      healthWorker: 'Farida Yesmin',
      profile: 'assets/images/patients/patient4.jpg'
    },
    {
      id: 5,
      name: 'Ayesha Khan',
      age: 32,
      weeks: 36,
      criticality: 'high',
      vitalStatus: {
        bp: '140/90',
        heartRate: '90',
        oxygenLevel: '95%',
        temperature: '37.4°C'
      },
      lastCheckup: '2025-02-26',
      nextAppointment: '2025-03-04',
      healthWorker: 'Shahana Akhter',
      profile: 'assets/images/patients/patient5.jpg'
    },
    {
      id: 6,
      name: 'Sadia Islam',
      age: 26,
      weeks: 12,
      criticality: 'low',
      vitalStatus: {
        bp: '115/75',
        heartRate: '70',
        oxygenLevel: '99%',
        temperature: '36.6°C'
      },
      lastCheckup: '2025-02-15',
      nextAppointment: '2025-03-15',
      healthWorker: 'Najma Begum',
      profile: 'assets/images/patients/patient6.jpg'
    }
  ];

  // Filter options
  filterOptions = {
    criticality: 'all',
    healthWorker: 'all',
    searchTerm: ''
  };

  filteredPatients = [...this.patients];

  constructor() { }

  ngOnInit(): void {
    this.applyFilters();
  }

  toggleSidebar(): void {
    this.sidebarCollapsed = !this.sidebarCollapsed;
  }

  updateFilters(filters: any): void {
    this.filterOptions = { ...this.filterOptions, ...filters };
    this.applyFilters();
  }

  applyFilters(): void {
    this.filteredPatients = this.patients.filter(patient => {
      // Apply criticality filter
      if (this.filterOptions.criticality !== 'all' &&
        patient.criticality !== this.filterOptions.criticality) {
        return false;
      }

      // Apply health worker filter
      if (this.filterOptions.healthWorker !== 'all' &&
        patient.healthWorker !== this.filterOptions.healthWorker) {
        return false;
      }

      // Apply search term filter
      if (this.filterOptions.searchTerm &&
        !patient.name.toLowerCase().includes(this.filterOptions.searchTerm.toLowerCase())) {
        return false;
      }

      return true;
    });
  }
}