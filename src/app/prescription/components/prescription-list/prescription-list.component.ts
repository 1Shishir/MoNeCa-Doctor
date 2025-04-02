import { Component, OnInit, OnDestroy } from '@angular/core';
import { CommonModule } from '@angular/common';
import { Router, RouterModule } from '@angular/router';
import { FormsModule } from '@angular/forms';
import { Subscription, forkJoin, of } from 'rxjs';
import { catchError, switchMap } from 'rxjs/operators';

import { PrescriptionService } from '../../services/prescription.service';
import { SidebarComponent } from '../../../dashboard/components/sidebar/sidebar.component';
import { HeaderComponent } from '../../../dashboard/components/header/header.component';
import { AlertComponent } from '../../../shared/components/alert/alert.component';
import { ButtonComponent } from '../../../shared/components/button/button.component';
import { Prescription } from '../../../models/prescription.model';
import { PatientService } from '../../../patient/services/patient.service';
import { AuthService } from '../../../auth/services/auth.service';

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
export class PrescriptionListComponent implements OnInit, OnDestroy {
  prescriptions: Prescription[] = [];
  filteredPrescriptions: Prescription[] = [];
  isLoading: boolean = true;
  errorMessage: string = '';
  sidebarCollapsed: boolean = false;
  
  searchTerm: string = '';
  dateRange: { start: string | null, end: string | null } = { start: null, end: null };
  
  // Store patient information
  patientInfoMap: Map<string, any> = new Map();
  private subscriptions = new Subscription();
  
  constructor(
    private prescriptionService: PrescriptionService,
    private patientService: PatientService,
    private authService: AuthService,
    private router: Router,

  ) {}

  ngOnInit(): void {
    this.loadPrescriptions();
    
  }
  
  ngOnDestroy(): void {
    this.subscriptions.unsubscribe();
  }

  toggleSidebar(): void {
    this.sidebarCollapsed = !this.sidebarCollapsed;
  }

  loadPrescriptions(): void {
    this.isLoading = true;
    this.errorMessage = '';
    this.prescriptions = [];
    
    // Get current doctor
    const currentDoctor = this.authService.getCurrentDoctor();
    if (!currentDoctor) {
      this.errorMessage = 'Authentication error. Please log in again.';
      this.isLoading = false;
      return;
    }
    const doctorId = currentDoctor.uuid;
    
    // Get associated patients
    this.subscriptions.add(
      this.patientService.getPatientsFromMap(100, -1).pipe(
        switchMap(result => {
          const patients = result.patients;
         
          if (patients.length === 0) {
            return of({ patients: [], prescriptions: [] });
          }
          
          // Store patient info in map
          patients.forEach(patient => {
            if (patient && patient.personalInfo && patient.id) {
              this.patientInfoMap.set(patient.id, patient.personalInfo);
            }
          });
          
          // Get prescriptions for each patient
          const patientIds = patients.map(p => p.id).filter((id): id is string => id !== undefined);
          
          // Load prescriptions for all patients
          return forkJoin(
            patientIds.map(id => 
              this.prescriptionService.getPrescriptionsByPatient(id).pipe(
                catchError(error => {
                  console.error(`Error loading prescriptions for patient ${id}:`, error);
                  return of([]);
                })
              )
            )
          ).pipe(
            switchMap(prescriptionArrays => {
              // Flatten all prescription arrays into one
              
              const allPrescriptions = prescriptionArrays.flat();
              return of({ patients, prescriptions: allPrescriptions });
            })
          );
        })
      ).subscribe({
        next: (data) => {
          this.prescriptions = data.prescriptions;
          console.log("abc",JSON.stringify(data.prescriptions,null,2));
          console.log("abc",JSON.stringify(this.prescriptions.filter(p => p.doctorId === doctorId),null,2));
          // Filter for current doctor
          if (doctorId) {
            this.prescriptions = this.prescriptions.filter(p => p.doctorId === doctorId);
          }
          
          // Sort by date (newest first)
          this.prescriptions.sort((a, b) => b.date.getTime() - a.date.getTime());
          
          // Apply initial filters
          this.applyFilters();
          this.isLoading = false;
        },
        error: (error) => {
          console.error('Error loading data:', error);
          this.errorMessage = 'Failed to load prescriptions. Please try again later.';
          this.isLoading = false;
        }
      })
    );
  }

  applyFilters(): void {
    let filtered = [...this.prescriptions];
    
    // Apply search term filter
    if (this.searchTerm.trim()) {
      const term = this.searchTerm.toLowerCase().trim();
      filtered = filtered.filter(prescription => {
        if (!prescription) return false;
        
        const id = prescription.id ? prescription.id.toLowerCase() : '';
        const patientName = prescription.patientId ? this.getPatientName(prescription.patientId).toLowerCase() : '';
        const diagnosisMatches = prescription.diagnosis && Array.isArray(prescription.diagnosis) && 
          prescription.diagnosis.some(d => d && typeof d === 'string' && d.toLowerCase().includes(term));
        
        return id.includes(term) || patientName.includes(term) || diagnosisMatches;
      });
    }
    
    // Apply start date filter
    if (this.dateRange.start) {
      const startDate = new Date(this.dateRange.start);
      filtered = filtered.filter(prescription => 
        prescription.date >= startDate
      );
    }
    
    // Apply end date filter
    if (this.dateRange.end) {
      const endDate = new Date(this.dateRange.end);
      endDate.setHours(23, 59, 59, 999); // Include the entire day
      
      filtered = filtered.filter(prescription => 
        prescription.date <= endDate
      );
    }
    
    this.filteredPrescriptions = filtered;
  }

  resetFilters(): void {
    this.searchTerm = '';
    this.dateRange = { start: null, end: null };
    this.applyFilters();
  }
  
  deletePrescription(prescriptionId: string): void {
    if (confirm('Are you sure you want to delete this prescription? This action cannot be undone.')) {
      this.isLoading = true;
      this.errorMessage = '';
      
      this.subscriptions.add(
        this.prescriptionService.deletePrescription(prescriptionId).subscribe({
          next: () => {
            // Remove the deleted prescription from our arrays
            this.prescriptions = this.prescriptions.filter(p => p.id !== prescriptionId);
            this.filteredPrescriptions = this.filteredPrescriptions.filter(p => p.id !== prescriptionId);
            this.isLoading = false;
          },
          error: (error) => {
            console.error('Error deleting prescription:', error);
            this.errorMessage = 'Failed to delete prescription. Please try again.';
            this.isLoading = false;
          }
        })
      );
    }
  }
  
  getPatientName(patientId: string): string {
    if (!patientId) {
      return 'Unknown Patient';
    }
    const patientInfo = this.patientInfoMap.get(patientId);
    return patientInfo ? patientInfo['fullName'] : 'Unknown Patient';
  }
  
  getDiagnosesList(diagnoses: string[]): string {
    if (!diagnoses || !Array.isArray(diagnoses)) {
      return '';
    }
    return diagnoses.join(', ');
  }
  
  getFormattedDate(date: Date): string {
    if (!date) return 'Not specified';
    
    return date.toLocaleDateString('en-US', {
      day: 'numeric',
      month: 'short',
      year: 'numeric'
    });
  }
  // viewPrescription(prescriptionId: string): void {
  //   console.log("pid is"+JSON.stringify(this.prescriptions,null,2))
  //   this.router.navigate(['/prescriptions/view', prescriptionId]);
  // }
  viewPrescription(prescriptionId: string): void {
    this.router.navigate(['/prescription/view', prescriptionId]);
}
}