import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { SidebarComponent } from '../sidebar/sidebar.component';
import { HeaderComponent } from '../header/header.component';
import { AlertComponent } from '../alert/alert.component';
import { StatCardComponent } from '../stat-card/stat-card.component';
import { AppointmentsTableComponent } from '../appointments-table/appointments-table.component';


import { PatientSummaryComponent } from '../patient-summary/patient-summary.component';

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


  constructor() { }

  ngOnInit(): void { }

  toggleSidebar(): void {
    this.sidebarCollapsed = !this.sidebarCollapsed;
  }
}