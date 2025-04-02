import { Component, OnInit, OnDestroy } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouterModule, ActivatedRoute, Router } from '@angular/router';
import { FormBuilder, FormGroup, ReactiveFormsModule, Validators } from '@angular/forms';
import { Subscription } from 'rxjs';
import { switchMap } from 'rxjs/operators';

import { PrescriptionService } from '../../services/prescription.service';
import { SidebarComponent } from '../../../dashboard/components/sidebar/sidebar.component';
import { HeaderComponent } from '../../../dashboard/components/header/header.component';
import { AlertComponent } from '../../../shared/components/alert/alert.component';
import { ButtonComponent } from '../../../shared/components/button/button.component';
import { MedicationItemComponent } from '../medication-item/medication-item.component';
import { TestItemComponent } from '../test-item/test-item.component';
import { PrescriptionHistoryComponent } from '../prescription-history/prescription-history.component';
import { Prescription, Test } from '../../../models/prescription.model';
import { PatientService } from '../../../patient/services/patient.service';

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
export class PrescriptionViewComponent implements OnInit, OnDestroy {
  prescriptionId: string = '8801776613630';
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
  private subscriptions = new Subscription();

  constructor(
    private route: ActivatedRoute,
    private router: Router,
    private prescriptionService: PrescriptionService,
    private patientService: PatientService,
    private fb: FormBuilder
  ) {
    this.uploadForm = this.fb.group({
      notes: ['', Validators.required],
      file: [null, Validators.required]
    });
  }

  ngOnInit(): void {
    this.subscriptions.add(
      this.route.paramMap.subscribe(params => {
        const id = params.get('prescriptionId');
        console.log("pres_id"+id)
        if (id) {
          this.prescriptionId = id;
          this.loadPrescription();
        } else {
          this.errorMessage = 'Prescription ID not provided.';
          this.isLoading = false;
        }
      })
    );
  }

  ngOnDestroy(): void {
    this.subscriptions.unsubscribe();
  }

  toggleSidebar(): void {
    this.sidebarCollapsed = !this.sidebarCollapsed;
  }

  loadPrescription(): void {
    this.isLoading = true;
    this.errorMessage = '';
    
    this.subscriptions.add(
      this.prescriptionService.getPrescription(this.prescriptionId).pipe(
        switchMap(prescription => {
          this.prescription = prescription;
          
          // Get patient ID from the prescription
          const patientId = prescription.patientId;
          
          // Load patient information from PatientService
          return this.patientService.getPatient(patientId);
        })
      ).subscribe({
        next: (patient) => {
          if (patient) {
            this.patientInfo = {
              id: patient.id,
              fullName: patient.personalInfo?.fullName || 'Unknown Patient',
              age: patient.personalInfo?.age || 'N/A',
              phoneNumber: patient.personalInfo?.phoneNumber || 'N/A',
              bloodType: patient.personalInfo?.bloodType || 'N/A',
              bmi: patient.personalInfo?.bmi || 'N/A',
              pregnancyInfo: patient.pregnancyInfo || null
            };
          } else {
            // Fallback to PrescriptionService method if PatientService fails
            this.subscriptions.add(
              this.prescriptionService.getPatientInfo(this.prescription?.patientId || '').subscribe({
                next: (info) => {
                  this.patientInfo = info || { fullName: 'Unknown Patient' };
                },
                error: (error) => {
                  console.error('Error loading patient info from PrescriptionService:', error);
                  this.patientInfo = { fullName: 'Unknown Patient' };
                }
              })
            );
          }
          this.isLoading = false;
        },
        error: (error) => {
          console.error('Error loading patient:', error);
          
          // Fallback to PrescriptionService method
          if (this.prescription) {
            this.subscriptions.add(
              this.prescriptionService.getPatientInfo(this.prescription.patientId).subscribe({
                next: (info) => {
                  this.patientInfo = info || { fullName: 'Unknown Patient' };
                },
                error: (infoError) => {
                  console.error('Error loading patient info from PrescriptionService:', infoError);
                  this.patientInfo = { fullName: 'Unknown Patient' };
                },
                complete: () => {
                  this.isLoading = false;
                }
              })
            );
          } else {
            this.errorMessage = 'Failed to load prescription and patient data.';
            this.isLoading = false;
          }
        }
      })
    );
  }

  editPrescription(): void {
    this.router.navigate(['/prescription/edit', this.prescriptionId]);
  }

  printPrescription(): void {
    // Store the current prescription data in a service or localStorage
    // before navigating to the print view
    this.router.navigate(['/prescription/print', this.prescriptionId]);
  }

  deletePrescription(): void {
    if (confirm('Are you sure you want to delete this prescription? This action cannot be undone.')) {
      this.isLoading = true;
      this.errorMessage = '';
      console.log("delid"+this.prescriptionId)
      this.subscriptions.add(
        this.prescriptionService.deletePrescription(this.prescriptionId).subscribe({
          next: () => {
            this.isLoading = false;
            this.router.navigate(['/prescription'], { 
              queryParams: { deleted: 'success' } 
            });
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

  openUploadModal(test: Test): void {
    // this.selectedTest = test;
    // this.uploadForm.reset();
    // this.uploadError = '';
    // this.uploadSuccess = false;
    // this.showUploadModal = true;
  }

  closeUploadModal(): void {
    this.showUploadModal = false;
    this.selectedTest = null;
  }

  onFileSelected(event: Event): void {
    const element = event.target as HTMLInputElement;
    if (element.files && element.files.length > 0) {
      const file = element.files[0];
      
      // Validate file size (max 5MB)
      if (file.size > 5 * 1024 * 1024) {
        this.uploadError = 'File size exceeds 5MB limit.';
        return;
      }
      
      // Validate file type
      const validTypes = ['application/pdf', 'image/jpeg', 'image/png', 'image/gif', 'application/msword', 'application/vnd.openxmlformats-officedocument.wordprocessingml.document'];
      if (!validTypes.includes(file.type)) {
        this.uploadError = 'Invalid file type. Please upload PDF, Image, or Document file.';
        return;
      }
      
      this.uploadForm.patchValue({ file });
      this.uploadError = '';
    }
  }

  uploadTestResult(): void {
    if (this.uploadForm.invalid) {
      if (!this.uploadForm.get('file')?.value) {
        this.uploadError = 'Please select a file to upload.';
      } else if (!this.uploadForm.get('notes')?.value) {
        this.uploadError = 'Please add notes about the test result.';
      }
      return;
    }
    
    if (!this.selectedTest) {
      this.uploadError = 'No test selected.';
      return;
    }
    
    this.uploadingResult = true;
    this.uploadError = '';
    
    const formData = this.uploadForm.value;
    
    this.subscriptions.add(
      this.prescriptionService.addTestResult(
        this.selectedTest.id, 
        formData.file,
        formData.notes
      ).subscribe({
        next: (result) => {
          this.uploadingResult = false;
          this.uploadSuccess = true;
          
          // Update the prescription data with the new test result
          if (this.prescription) {
            const testIndex = this.prescription.tests.findIndex(t => t.id === this.selectedTest?.id);
            if (testIndex > -1) {
              this.prescription.tests[testIndex].isPending = false;
              this.prescription.tests[testIndex].result = result;
              
              // Update the prescription in Firestore
              this.subscriptions.add(
                this.prescriptionService.updatePrescription(this.prescriptionId, {
                  tests: this.prescription.tests
                }).subscribe({
                  error: (error) => {
                    console.error('Error updating prescription with test result:', error);
                  }
                })
              );
            }
          }
          
          // Close modal after a short delay
          setTimeout(() => {
            this.closeUploadModal();
          }, 2000);
        },
        error: (error) => {
          console.error('Error uploading test result:', error);
          this.uploadError = 'Failed to upload test result. Please try again.';
          this.uploadingResult = false;
        }
      })
    );
  }

  getDiagnosesList(diagnoses: string[]): string {
    if (!diagnoses || !Array.isArray(diagnoses)) {
      return '';
    }
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