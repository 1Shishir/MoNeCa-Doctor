import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouterModule } from '@angular/router';
import { FormsModule } from '@angular/forms';

import { PrescriptionService } from '../../services/prescription.service';


import { SidebarComponent } from '../../../dashboard/components/sidebar/sidebar.component';
import { HeaderComponent } from '../../../dashboard/components/header/header.component';
import { AlertComponent } from '../../../shared/components/alert/alert.component';
import { ButtonComponent } from '../../../shared/components/button/button.component';
import { Prescription } from '../../../models/prescription.model';

@Component({
  selector: 'app-prescription-list',
  standalone: true,
  imports: [
    CommonModule,
    RouterModule,
    FormsModule,
    SidebarComponent,
    HeaderComponent,
    AlertComponent,
    ButtonComponent
  ],
 templateUrl: './prescription-list.component.html',
  styleUrl: './prescription-list.component.css'
})
export class PrescriptionListComponent implements OnInit {
  prescriptions: Prescription[] = [];
  filteredPrescriptions: Prescription[] = [];
  isLoading: boolean = true;
  errorMessage: string = '';
  sidebarCollapsed: boolean = false;
  
  
  searchTerm: string = '';
  patientFilter: string = '';
  dateRange: { start: Date | null, end: Date | null } = { start: null, end: null };
  
  constructor(private prescriptionService: PrescriptionService) {}

  ngOnInit(): void {
    this.loadPrescriptions();
  }

  toggleSidebar(): void {
    this.sidebarCollapsed = !this.sidebarCollapsed;
  }

  loadPrescriptions(): void {
    this.isLoading = true;
    
    
    
    
    
    const doctorId = 'current-doctor-id';
    
    
    setTimeout(() => {
      
      this.prescriptions = this.generateMockPrescriptions();
      this.applyFilters();
      this.isLoading = false;
    }, 1000);
    
    
   
  }

  applyFilters(): void {
    let filtered = [...this.prescriptions];
    
    
    if (this.searchTerm.trim()) {
      const term = this.searchTerm.toLowerCase().trim();
      filtered = filtered.filter(prescription => 
        prescription.id.toLowerCase().includes(term) || 
        this.getPatientName(prescription.patientId).toLowerCase().includes(term)
      );
    }
    
    
    if (this.patientFilter) {
      filtered = filtered.filter(prescription => 
        prescription.patientId === this.patientFilter
      );
    }
    
    
    if (this.dateRange.start) {
      filtered = filtered.filter(prescription => 
        prescription.date >= this.dateRange.start!
      );
    }
    
    if (this.dateRange.end) {
      const endDate = new Date(this.dateRange.end);
      endDate.setHours(23, 59, 59, 999); 
      
      filtered = filtered.filter(prescription => 
        prescription.date <= endDate
      );
    }
    
    this.filteredPrescriptions = filtered;
  }

  resetFilters(): void {
    this.searchTerm = '';
    this.patientFilter = '';
    this.dateRange = { start: null, end: null };
    this.applyFilters();
  }
  
  deletePrescription(prescriptionId: string): void {
    if (confirm('Are you sure you want to delete this prescription?')) {
      this.prescriptionService.deletePrescription(prescriptionId).subscribe({
        next: () => {
          this.prescriptions = this.prescriptions.filter(p => p.id !== prescriptionId);
          this.applyFilters();
        },
        error: (error) => {
          console.error('Error deleting prescription:', error);
          this.errorMessage = 'Failed to delete prescription.';
        }
      });
    }
  }
  
  
  
  getPatientName(patientId: string): string {
    
    const patientNames: { [key: string]: string } = {
      'patient1': 'Fatima Akter',
      'patient2': 'Rabeya Khatun',
      'patient3': 'Nasrin Sultana',
      'patient4': 'Taslima Begum',
      'patient5': 'Ayesha Khan',
      'patient6': 'Sadia Islam'
    };
    
    return patientNames[patientId] || 'Unknown Patient';
  }
  
  getDiagnosesList(diagnoses: string[]): string {
    return diagnoses.join(', ');
  }
  
  getFormattedDate(date: Date): string {
    return date.toLocaleDateString('en-US', {
      day: 'numeric',
      month: 'short',
      year: 'numeric'
    });
  }
  
  
  private generateMockPrescriptions(): Prescription[] {
    return [
      {
        id: 'presc1',
        patientId: 'patient1',
        doctorId: 'current-doctor-id',
        date: new Date('2025-02-25'),
        chiefComplaints: 'Headache, Swelling in feet',
        clinicalFindings: 'BP elevated, Mild edema in ankles',
        diagnosis: ['Pregnancy-induced hypertension'],
        medications: [
          {
            id: 'med1',
            name: 'Methyldopa 250mg',
            dosage: '1 tablet',
            frequency: '1+0+1+0',
            duration: '15 days',
            instructions: 'Take after meals'
          }
        ],
        tests: [
          {
            id: 'test1',
            name: 'Blood Pressure Monitoring',
            description: 'Monitor BP twice daily',
            isPending: true
          }
        ],
        advice: 'Reduce salt intake, Rest frequently, Avoid standing for long periods',
        nextVisit: new Date('2025-03-10'),
        vitalSigns: {
          bloodPressure: '150/95',
          heartRate: 92,
          oxygenLevel: 95,
          temperature: 37.5,
          weight: 68,
          fetalHeartRate: 145
        },
        createdAt: new Date('2025-02-25'),
        updatedAt: new Date('2025-02-25')
      },
      {
        id: 'presc2',
        patientId: 'patient2',
        doctorId: 'current-doctor-id',
        date: new Date('2025-02-20'),
        chiefComplaints: 'Nausea, Fatigue',
        clinicalFindings: 'Pale conjunctiva, Fatigue on mild exertion',
        diagnosis: ['Anemia in pregnancy'],
        medications: [
          {
            id: 'med2',
            name: 'Iron Supplement',
            dosage: '1 tablet',
            frequency: '1+0+0+0',
            duration: '30 days',
            instructions: 'Take after breakfast with orange juice'
          },
          {
            id: 'med3',
            name: 'Folic Acid 5mg',
            dosage: '1 tablet',
            frequency: '1+0+0+0',
            duration: '30 days',
            instructions: 'Take with iron supplement'
          }
        ],
        tests: [
          {
            id: 'test2',
            name: 'Complete Blood Count',
            description: 'Check hemoglobin and iron levels',
            isPending: false,
            result: {
              id: 'result1',
              testId: 'test2',
              notes: 'Hemoglobin: 9.8 g/dL, Ferritin: 12 ng/mL',
              uploadedAt: new Date('2025-02-28')
            }
          }
        ],
        advice: 'Diet rich in iron (spinach, red meat, beans), Take supplements regularly',
        nextVisit: new Date('2025-03-15'),
        vitalSigns: {
          bloodPressure: '110/70',
          heartRate: 88,
          oxygenLevel: 96,
          temperature: 36.8,
          weight: 62,
          fetalHeartRate: 140
        },
        createdAt: new Date('2025-02-20'),
        updatedAt: new Date('2025-02-28')
      },
      {
        id: 'presc3',
        patientId: 'patient3',
        doctorId: 'current-doctor-id',
        date: new Date('2025-02-15'),
        chiefComplaints: 'Frequent urination, Burning sensation',
        clinicalFindings: 'Lower abdominal tenderness',
        diagnosis: ['Urinary tract infection'],
        medications: [
          {
            id: 'med4',
            name: 'Nitrofurantoin 100mg',
            dosage: '1 capsule',
            frequency: '1+0+1+0',
            duration: '7 days',
            instructions: 'Take with food'
          }
        ],
        tests: [
          {
            id: 'test3',
            name: 'Urine Analysis',
            description: 'Check for bacteria and white blood cells',
            isPending: false,
            result: {
              id: 'result2',
              testId: 'test3',
              fileUrl: 'https:', 
              fileType: 'application/pdf', 
              notes: 'Positive for bacteria, WBC elevated',
              uploadedAt: new Date('2025-02-17')
            }
          }
        ],
        advice: 'Drink plenty of water, Avoid caffeine, Complete full course of antibiotics',
        nextVisit: new Date('2025-02-22'),
        vitalSigns: {
          bloodPressure: '115/75',
          heartRate: 84,
          oxygenLevel: 98,
          temperature: 37.2,
          weight: 58,
          fetalHeartRate: 142
        },
        createdAt: new Date('2025-02-15'),
        updatedAt: new Date('2025-02-17')
      }
    ];
  }
}