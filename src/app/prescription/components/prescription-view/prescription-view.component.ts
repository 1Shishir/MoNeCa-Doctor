import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouterModule, ActivatedRoute, Router } from '@angular/router';
import { FormBuilder, FormGroup, ReactiveFormsModule } from '@angular/forms';

import { PrescriptionService } from '../../services/prescription.service';


import { SidebarComponent } from '../../../dashboard/components/sidebar/sidebar.component';
import { HeaderComponent } from '../../../dashboard/components/header/header.component';
import { AlertComponent } from '../../../shared/components/alert/alert.component';
import { ButtonComponent } from '../../../shared/components/button/button.component';
import { MedicationItemComponent } from '../medication-item/medication-item.component';
import { TestItemComponent } from '../test-item/test-item.component';
import { PrescriptionHistoryComponent } from '../prescription-history/prescription-history.component';
import { Prescription, Test } from '../../../models/prescription.model';

@Component({
  selector: 'app-prescription-view',
  standalone: true,
  imports: [
    CommonModule,
    RouterModule,
    ReactiveFormsModule,
    SidebarComponent,
    HeaderComponent,
    AlertComponent,
    ButtonComponent,
    MedicationItemComponent,
    TestItemComponent,
    PrescriptionHistoryComponent
  ],
  templateUrl: './prescription-view.component.html',
  styleUrl: './prescription-view.component.css'
})
export class PrescriptionViewComponent implements OnInit {
  prescriptionId: string = '';
  prescription: Prescription | null = null;
  patientInfo: any = null;
  isLoading: boolean = true;
  errorMessage: string = '';
  sidebarCollapsed: boolean = false;
  showUploadModal: boolean = false;
  selectedTest: Test | null = null;
  uploadForm: FormGroup;
  uploadingResult: boolean = false;
  uploadSuccess: boolean = false;
  uploadError: string = '';

  constructor(
    private route: ActivatedRoute,
    private router: Router,
    private prescriptionService: PrescriptionService,
    private fb: FormBuilder
  ) {
    this.uploadForm = this.fb.group({
      notes: [''],
      file: [null]
    });
  }

  ngOnInit(): void {
    this.route.paramMap.subscribe(params => {
      const id = params.get('prescriptionId');
      if (id) {
        this.prescriptionId = id;
        this.loadPrescription();
      } else {
        this.errorMessage = 'Prescription ID not provided.';
        this.isLoading = false;
      }
    });
  }

  toggleSidebar(): void {
    this.sidebarCollapsed = !this.sidebarCollapsed;
  }

  loadPrescription(): void {
    this.isLoading = true;
    
    this.prescriptionService.getPrescription(this.prescriptionId).subscribe({
      next: (prescription) => {
        this.prescription = prescription;
        
        
        this.prescriptionService.getPatientInfo(prescription.patientId).subscribe({
          next: (patient) => {
            this.patientInfo = patient;
            this.isLoading = false;
          },
          error: (error) => {
            console.error('Error loading patient info:', error);
            this.errorMessage = 'Failed to load patient information.';
            this.isLoading = false;
          }
        });
      },
      error: (error) => {
        console.error('Error loading prescription:', error);
        this.errorMessage = 'Failed to load prescription.';
        this.isLoading = false;
      }
    });
  }

  editPrescription(): void {
    this.router.navigate(['/prescriptions/edit', this.prescriptionId]);
  }

  printPrescription(): void {
    this.router.navigate(['/prescriptions/print', this.prescriptionId]);
  }

  deletePrescription(): void {
    if (confirm('Are you sure you want to delete this prescription?')) {
      this.prescriptionService.deletePrescription(this.prescriptionId).subscribe({
        next: () => {
          this.router.navigate(['/prescriptions']);
        },
        error: (error) => {
          console.error('Error deleting prescription:', error);
          this.errorMessage = 'Failed to delete prescription.';
        }
      });
    }
  }

  openUploadModal(test: Test): void {
    this.selectedTest = test;
    this.uploadForm.reset();
    this.uploadError = '';
    this.uploadSuccess = false;
    this.showUploadModal = true;
  }

  closeUploadModal(): void {
    this.showUploadModal = false;
    this.selectedTest = null;
  }

  onFileSelected(event: Event): void {
    const element = event.target as HTMLInputElement;
    if (element.files && element.files.length > 0) {
      const file = element.files[0];
      this.uploadForm.patchValue({ file });
    }
  }

  uploadTestResult(): void {
    if (!this.selectedTest || !this.uploadForm.get('file')?.value) {
      this.uploadError = 'Please select a file to upload.';
      return;
    }
    
    this.uploadingResult = true;
    const formData = this.uploadForm.value;
    
    this.prescriptionService.addTestResult(
      this.selectedTest.id, 
      formData.file,
      formData.notes
    ).subscribe({
      next: (result) => {
        this.uploadingResult = false;
        this.uploadSuccess = true;
        
        
        if (this.prescription) {
          const testIndex = this.prescription.tests.findIndex(t => t.id === this.selectedTest?.id);
          if (testIndex > -1) {
            this.prescription.tests[testIndex].isPending = false;
            this.prescription.tests[testIndex].result = result;
          }
        }
        
        
        setTimeout(() => {
          this.closeUploadModal();
        }, 2000);
      },
      error: (error) => {
        console.error('Error uploading test result:', error);
        this.uploadError = 'Failed to upload test result.';
        this.uploadingResult = false;
      }
    });
  }

  getDiagnosesList(diagnoses: string[]): string {
    return diagnoses.join(', ');
  }

  getFormattedDate(date: Date | null): string {
    if (!date) return 'Not specified';
    
    return date.toLocaleDateString('en-US', {
      day: 'numeric',
      month: 'short',
      year: 'numeric'
    });
  }
}
