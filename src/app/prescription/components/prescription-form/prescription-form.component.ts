
import { Component, OnInit, OnDestroy } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormBuilder, FormGroup, FormArray, Validators, ReactiveFormsModule, FormsModule } from '@angular/forms';
import { ActivatedRoute, Router, RouterModule } from '@angular/router';
import { Observable, Subscription, forkJoin } from 'rxjs';
import { map, switchMap, tap } from 'rxjs/operators';
import { PrescriptionService } from '../../services/prescription.service';
import { SidebarComponent } from '../../../dashboard/components/sidebar/sidebar.component';
import { HeaderComponent } from '../../../dashboard/components/header/header.component';
import { AlertComponent } from '../../../shared/components/alert/alert.component';
import { ButtonComponent } from '../../../shared/components/button/button.component';
import { MedicationItemComponent } from '../medication-item/medication-item.component';
import { PrescriptionTemplate } from '../../../models/prescription-template.model';
import { Medication, Test, Prescription, QuickOptions } from '../../../models/prescription.model';
import { PrescriptionTemplateService } from '../../services/prescription-template.service';
import { TestItemComponent } from '../test-item/test-item.component';
import { AuthService } from '../../../auth/services/auth.service';
import { Doctor } from '../../../models/auth.model';

@Component({
  selector: 'app-prescription-form',
  standalone: true,
  imports: [
    CommonModule,
    ReactiveFormsModule,
    RouterModule,
    FormsModule,
    SidebarComponent,
    HeaderComponent,
    AlertComponent,
    ButtonComponent,
    MedicationItemComponent,
    TestItemComponent
  ],
  templateUrl: './prescription-form.component.html',
  styleUrl: './prescription-form.component.css'
})
export class PrescriptionFormComponent implements OnInit, OnDestroy {
  prescriptionForm: FormGroup;
  patientId: string = '';
  prescriptionId: string = '';
  isEditing: boolean = false;
  isLoading: boolean = true;
  isSaving: boolean = false;
  errorMessage: string = '';
  successMessage: string = '';
  currentDoctorId!: string;

  patientInfo: any = null;
  template: PrescriptionTemplate | null = null;
  sidebarCollapsed: boolean = false;

  quickOptions: QuickOptions = {
    complaints: [],
    diagnoses: [],
    advice: []
  };

  commonMedications: Partial<Medication>[] = [];
  commonTests: Partial<Test>[] = [];

  private subscriptions = new Subscription();

  constructor(
    private fb: FormBuilder,
    private route: ActivatedRoute,
    private router: Router,
    private prescriptionService: PrescriptionService,
    private templateService: PrescriptionTemplateService,
    private authService: AuthService
  ) {
    this.prescriptionForm = this.createPrescriptionForm();
  }

  ngOnInit(): void {
    this.loadData();
   
  }

  ngOnDestroy(): void {
    this.subscriptions.unsubscribe();
  }

  toggleSidebar(): void {
    this.sidebarCollapsed = !this.sidebarCollapsed;
  }

  createPrescriptionForm(): FormGroup {
    return this.fb.group({
      date: [new Date().toISOString().substring(0, 10), Validators.required], // Format date as YYYY-MM-DD for input[type=date]
      chiefComplaints: ['', Validators.required],
      clinicalFindings: [''],
      diagnosis: this.fb.array([
        this.fb.control('', Validators.required)
      ]),
      medications: this.fb.array([
        this.createMedicationGroup()
      ]),
      tests: this.fb.array([
        this.createTestGroup()
      ]),
      advice: [''],
      nextVisit: [null],
      vitalSigns: this.fb.group({
        bloodPressure: [''],
        heartRate: [null],
        oxygenLevel: [null],
        temperature: [null],
        weight: [null],
        fetalHeartRate: [null],
        fundalHeight: [null],
        gestationalAge: [null]
      })
    });
  }

  createMedicationGroup(): FormGroup {
    return this.fb.group({
      name: ['', Validators.required],
      dosage: ['', Validators.required],
      frequency: ['1+0+0+0', Validators.required],
      duration: ['', Validators.required],
      instructions: ['']
    });
  }

  createTestGroup(): FormGroup {
    return this.fb.group({
      name: ['', Validators.required],
      description: [''],
      isPending: [true]
    });
  }

  get diagnosisArray(): FormArray {
    return this.prescriptionForm.get('diagnosis') as FormArray;
  }

  get medicationsArray(): FormArray {
    return this.prescriptionForm.get('medications') as FormArray;
  }

  get testsArray(): FormArray {
    return this.prescriptionForm.get('tests') as FormArray;
  }

  get vitalSignsGroup(): FormGroup {
    return this.prescriptionForm.get('vitalSigns') as FormGroup;
  }

  loadData(): void {
    this.isLoading = true;

    const quickDataSub = forkJoin({
      quickOptions: this.prescriptionService.getQuickTextOptions(),
      medications: this.prescriptionService.getCommonMedications(),
      tests: this.prescriptionService.getCommonTests(),
      template: this.templateService.getDefaultTemplate('current-doctor-id')
    }).subscribe({
      next: (data) => {
        this.quickOptions = isQuickOptions(data.quickOptions) 
          ? data.quickOptions 
          : { complaints: [], diagnoses: [], advice: [] };
  
        this.commonMedications = data.medications || [];
        this.commonTests = data.tests || [];
        this.template = data.template || null;
  
        this.loadRouteData();
      },
      error: (error) => {
        console.error('Error loading quick data:', error);
        this.errorMessage = 'Failed to load prescription options.';
        this.isLoading = false;
      }
    });

    this.subscriptions.add(quickDataSub);
  }

  loadRouteData(): void {
    const routeSub = this.route.paramMap.pipe(
      switchMap(params => {
        const prescriptionId = params.get('prescriptionId');
        const patientId = params.get('patientId');

        if (prescriptionId) {
          this.prescriptionId = prescriptionId;
          this.isEditing = true;
          return this.prescriptionService.getPrescription(prescriptionId).pipe(
            tap(prescription => {
              this.patientId = prescription.patientId;
              return this.prescriptionService.getPatientInfo(prescription.patientId);
            })
          );
        } else if (patientId) {
          this.patientId = patientId;
          this.isEditing = false;
          return this.prescriptionService.getPatientInfo(patientId);
        } else {
          throw new Error('Missing prescription ID or patient ID');
        }
      })
    ).subscribe({
      next: (data) => {
        if (this.isEditing) {
          const prescription = data as Prescription;
          this.patientInfo = null;
          this.populateForm(prescription);
          this.currentDoctorId=prescription.doctorId;
          console.log("zz"+prescription.doctorId)
          this.prescriptionService.getPatientInfo(prescription.patientId).subscribe({
            next: (patient) => {
              this.patientInfo = this.formatPatientInfo(patient);
              this.isLoading = false;
            },
            error: (error) => {
              console.error('Error loading patient info:', error);
              this.errorMessage = 'Failed to load patient information.';
              this.isLoading = false;
            }
          });
        } else {
          this.patientInfo = this.formatPatientInfo(data);
          this.isLoading = false;
        }
      },
      error: (error) => {
        console.error('Error loading prescription data:', error);
        this.errorMessage = 'Failed to load prescription data.';
        this.isLoading = false;
      }
    });

    this.subscriptions.add(routeSub);
  }
  
  // New method to ensure patient info is properly formatted
  formatPatientInfo(patient: any): any {
    if (!patient) return null;

    // console.log("fpif"+JSON.stringify(this.getDoctorId(),null,2));
    
    // Format dates and add missing properties if needed
    return {
      id: patient.id || 'N/A',
      fullName: patient.personalInfo?.fullName || patient.fullName || 'Unknown Patient',
      age: patient.personalInfo?.age || patient.age || 'N/A',
      phoneNumber: patient.personalInfo?.phoneNumber || patient.phoneNumber || 'N/A',
      bloodType: patient.personalInfo?.bloodType || patient.bloodType || 'N/A',
      bmi: patient.personalInfo?.bmi || patient.bmi || 'N/A',
      pregnancyInfo: patient.pregnancyInfo ? {
        weeks: patient.pregnancyInfo.weeks || 'N/A',
        // Parse EDD if it's a string, otherwise keep as Date object
        edd: typeof patient.pregnancyInfo.edd === 'string' ? 
          new Date(patient.pregnancyInfo.edd) : 
          patient.pregnancyInfo.edd || null
      } : null
    };
  }

  populateForm(prescription: Prescription): void {
    // Clear arrays first
    while (this.diagnosisArray.length > 0) {
      this.diagnosisArray.removeAt(0);
    }

    while (this.medicationsArray.length > 0) {
      this.medicationsArray.removeAt(0);
    }

    while (this.testsArray.length > 0) {
      this.testsArray.removeAt(0);
    }

    // Format dates for HTML5 input[type=date]
    const formattedDate = prescription.date instanceof Date ? 
    prescription.date.toISOString().substring(0, 10) : 
    typeof prescription.date === 'string' ? 
      (prescription.date as string).substring(0, 10) : 
      new Date().toISOString().substring(0, 10);
    
      const formattedNextVisit = prescription.nextVisit ? 
      (prescription.nextVisit instanceof Date ? 
        prescription.nextVisit.toISOString().substring(0, 10) : 
        typeof prescription.nextVisit === 'string' ? 
          (prescription.nextVisit as string).substring(0, 10) : null) : null;

    // Patch basic form values
    this.prescriptionForm.patchValue({
      date: formattedDate,
      chiefComplaints: prescription.chiefComplaints,
      clinicalFindings: prescription.clinicalFindings,
      advice: prescription.advice,
      nextVisit: formattedNextVisit,
      vitalSigns: prescription.vitalSigns
    });

    // Add diagnoses
    prescription.diagnosis.forEach(diagnosis => {
      this.diagnosisArray.push(this.fb.control(diagnosis, Validators.required));
    });

    // Add medications
    prescription.medications.forEach(medication => {
      const medicationGroup = this.fb.group({
        id: [medication.id],
        name: [medication.name, Validators.required],
        dosage: [medication.dosage, Validators.required],
        frequency: [medication.frequency, Validators.required],
        duration: [medication.duration, Validators.required],
        instructions: [medication.instructions]
      });

      this.medicationsArray.push(medicationGroup);
    });

    // Add tests
    prescription.tests.forEach(test => {
      const testGroup = this.fb.group({
        id: [test.id],
        name: [test.name, Validators.required],
        description: [test.description],
        isPending: [test.isPending],
        result: [test.result]
      });

      this.testsArray.push(testGroup);
    });
  }

  addDiagnosis(): void {
    this.diagnosisArray.push(this.fb.control('', Validators.required));
  }

  removeDiagnosis(index: number): void {
    if (this.diagnosisArray.length > 1) {
      this.diagnosisArray.removeAt(index);
    }
  }

  addMedication(): void {
    this.medicationsArray.push(this.createMedicationGroup());
  }

  removeMedication(index: number): void {
    if (this.medicationsArray.length > 1) {
      this.medicationsArray.removeAt(index);
    }
  }

  addTest(): void {
    this.testsArray.push(this.createTestGroup());
  }

  removeTest(index: number): void {
    if (this.testsArray.length > 1) {
      this.testsArray.removeAt(index);
    }
  }

  addQuickComplaint(complaint: string): void {
    const currentValue = this.prescriptionForm.get('chiefComplaints')?.value || '';
    const separator = currentValue ? ', ' : '';
    const newValue = currentValue + separator + complaint;
    this.prescriptionForm.get('chiefComplaints')?.setValue(newValue);
  }

  addQuickDiagnosis(diagnosis: string): void {
    const emptyIndex = this.diagnosisArray.controls.findIndex(control => !control.value);
    if (emptyIndex >= 0) {
      this.diagnosisArray.at(emptyIndex).setValue(diagnosis);
    } else {
      this.diagnosisArray.push(this.fb.control(diagnosis, Validators.required));
    }
  }

  addQuickAdvice(advice: string): void {
    const currentValue = this.prescriptionForm.get('advice')?.value || '';
    const separator = currentValue ? '\n• ' : '• ';
    const newValue = currentValue + separator + advice;
    this.prescriptionForm.get('advice')?.setValue(newValue);
  }

  addCommonMedication(medication: Partial<Medication>): void {
    const medicationGroup = this.fb.group({
      name: [medication.name, Validators.required],
      dosage: [medication.dosage, Validators.required],
      frequency: [medication.frequency, Validators.required],
      duration: [medication.duration, Validators.required],
      instructions: [medication.instructions]
    });

    this.medicationsArray.push(medicationGroup);
  }
  
  updateFrequency(index: number): void {
    const medicationGroup = this.medicationsArray.at(index);
    if (!medicationGroup) return;
    
    const morning = medicationGroup.get('frequency')!.value.split('+')[0] || '0';
    const noon = medicationGroup.get('frequency')!.value.split('+')[1] || '0';
    const evening = medicationGroup.get('frequency')!.value.split('+')[2] || '0';
    const night = medicationGroup.get('frequency')!.value.split('+')[3] || '0';
    
    const frequency = `${morning}+${noon}+${evening}+${night}`;
    medicationGroup.get('frequency')!.setValue(frequency);
  }

  addCommonTest(test: Partial<Test>): void {
    const testGroup = this.fb.group({
      name: [test.name, Validators.required],
      description: [test.description],
      isPending: [true]
    });

    this.testsArray.push(testGroup);
  }

  getCurrentDoctor(){
    console.log("abb"+JSON.stringify(this.patientInfo,null,2));
    this.authService.currentDoctor$.subscribe(doctor => {
      if (doctor) {
        this.currentDoctorId = doctor.uuid;
        console.log("Real doctor data loaded:", doctor.fullName);
      } 
    });
}

 

  savePrescription(): void {
    if (this.prescriptionForm.invalid) {
      this.markFormGroupTouched(this.prescriptionForm);
      return;
    }

    this.isSaving = true;
    this.errorMessage = '';
    this.successMessage = '';

    const formValues = this.prescriptionForm.getRawValue();
    this.getCurrentDoctor();
    // Convert date strings to Date objects
    const date = formValues.date ? new Date(formValues.date) : new Date();
    const nextVisit = formValues.nextVisit ? new Date(formValues.nextVisit) : null;

    const prescriptionData: Omit<Prescription, 'id' | 'createdAt' | 'updatedAt'> = {
      patientId: this.patientId,
      doctorId: this.currentDoctorId,
      date: date,
      chiefComplaints: formValues.chiefComplaints,
      clinicalFindings: formValues.clinicalFindings,
      diagnosis: formValues.diagnosis,
      medications: formValues.medications,
      tests: formValues.tests,
      advice: formValues.advice,
      nextVisit: nextVisit,
      vitalSigns: formValues.vitalSigns
    };

    if (this.isEditing) {
      this.prescriptionService.updatePrescription(this.prescriptionId, prescriptionData).subscribe({
        next: () => {
          this.isSaving = false;
          this.successMessage = 'Prescription updated successfully.';
          setTimeout(() => {
            this.router.navigate(['/prescription/view', this.prescriptionId]);
          }, 1500);
        },
        error: (error) => {
          console.error('Error updating prescription:', error);
          this.errorMessage = 'Failed to update prescription.';
          this.isSaving = false;
        }
      });
    } else {
      this.prescriptionService.createPrescription(prescriptionData).subscribe({
        next: (prescriptionId) => {
          this.isSaving = false;
          this.successMessage = 'Prescription created successfully.';
          setTimeout(() => {
            this.router.navigate(['/prescription/view', prescriptionId]);
          }, 1500);
        },
        error: (error) => {
          console.error('Error creating prescription:', error);
          this.errorMessage = 'Failed to create prescription.';
          this.isSaving = false;
        }
      });
    }
  }

  printPrescription(): void {
    if (this.isEditing) {
      this.router.navigate(['/prescription/print', this.prescriptionId]);
    } else {
      this.savePrescription();
    }
  }

  cancelEdit(): void {
    if (this.isEditing) {
      this.router.navigate(['/prescription/view', this.prescriptionId]);
    } else {
      this.router.navigate(['/patients']);
    }
  }

  markFormGroupTouched(formGroup: FormGroup): void {
    Object.values(formGroup.controls).forEach(control => {
      control.markAsTouched();

      if (control instanceof FormGroup) {
        this.markFormGroupTouched(control);
      }

      if (control instanceof FormArray) {
        for (let i = 0; i < control.length; i++) {
          const arrayControl = control.at(i);
          if (arrayControl instanceof FormGroup) {
            this.markFormGroupTouched(arrayControl);
          } else {
            arrayControl.markAsTouched();
          }
        }
      }
    });
  }

 
  
  // Helper method to format dates for display
  formatDate(date: Date | string | null): string {
    if (!date) return 'N/A';
    
    const dateObj = typeof date === 'string' ? new Date(date) : date;
    return dateObj.toLocaleDateString('en-US', {
      day: 'numeric',
      month: 'short',
      year: 'numeric'
    });
  }
}
 
export function isQuickOptions(obj: any): obj is QuickOptions {
  return (
    obj &&
    Array.isArray(obj.complaints) &&
    Array.isArray(obj.diagnoses) &&
    Array.isArray(obj.advice)
  );
}


// import { Component, OnInit, OnDestroy } from '@angular/core';
// import { CommonModule } from '@angular/common';
// import { FormBuilder, FormGroup, FormArray, Validators, ReactiveFormsModule, FormsModule } from '@angular/forms';
// import { ActivatedRoute, Router, RouterModule } from '@angular/router';
// import { Subscription, forkJoin } from 'rxjs';
// import { switchMap, tap } from 'rxjs/operators';
// import { PrescriptionService } from '../../services/prescription.service';
// import { SidebarComponent } from '../../../dashboard/components/sidebar/sidebar.component';
// import { HeaderComponent } from '../../../dashboard/components/header/header.component';
// import { AlertComponent } from '../../../shared/components/alert/alert.component';
// import { ButtonComponent } from '../../../shared/components/button/button.component';
// import { MedicationItemComponent } from '../medication-item/medication-item.component';
// import { PrescriptionTemplate } from '../../../models/prescription-template.model';
// import { Medication, Test, Prescription, QuickOptions } from '../../../models/prescription.model';
// import { PrescriptionTemplateService } from '../../services/prescription-template.service';
// import { TestItemComponent } from '../test-item/test-item.component';


// @Component({
//   selector: 'app-prescription-form',
//   standalone: true,
//   imports: [
//     CommonModule,
//     ReactiveFormsModule,
//     RouterModule,
//     FormsModule,
//     SidebarComponent,
//     HeaderComponent,
//     AlertComponent,
//     ButtonComponent,
//     MedicationItemComponent,
//     TestItemComponent
//   ],
//   templateUrl: './prescription-form.component.html',
//   styleUrl: './prescription-form.component.css'
// })
// export class PrescriptionFormComponent implements OnInit, OnDestroy {
//   prescriptionForm: FormGroup;
//   patientId: string = '';
//   prescriptionId: string = '';
//   isEditing: boolean = false;
//   isLoading: boolean = true;
//   isSaving: boolean = false;
//   errorMessage: string = '';
//   successMessage: string = '';

//   patientInfo: any = null;
//   template: PrescriptionTemplate | null = null;
//   sidebarCollapsed: boolean = false;

//   quickOptions: QuickOptions = {
//     complaints: [],
//     diagnoses: [],
//     advice: []
//   };

//   commonMedications: Partial<Medication>[] = [];
//   commonTests: Partial<Test>[] = [];

//   private subscriptions = new Subscription();

//   constructor(
//     private fb: FormBuilder,
//     private route: ActivatedRoute,
//     private router: Router,
//     private prescriptionService: PrescriptionService,
//     private templateService: PrescriptionTemplateService
//   ) {

//     this.prescriptionForm = this.createPrescriptionForm();
//   }

//   ngOnInit(): void {
//     this.loadData();
//   }

//   ngOnDestroy(): void {
//     this.subscriptions.unsubscribe();
//   }

//   toggleSidebar(): void {
//     this.sidebarCollapsed = !this.sidebarCollapsed;
//   }

//   createPrescriptionForm(): FormGroup {
//     return this.fb.group({
//       date: [new Date(), Validators.required],
//       chiefComplaints: ['', Validators.required],
//       clinicalFindings: [''],
//       diagnosis: this.fb.array([
//         this.fb.control('', Validators.required)
//       ]),
//       medications: this.fb.array([
//         this.createMedicationGroup()
//       ]),
//       tests: this.fb.array([
//         this.createTestGroup()
//       ]),
//       advice: [''],
//       nextVisit: [null],
//       vitalSigns: this.fb.group({
//         bloodPressure: [''],
//         heartRate: [null],
//         oxygenLevel: [null],
//         temperature: [null],
//         weight: [null],
//         fetalHeartRate: [null],
//         fundalHeight: [null],
//         gestationalAge: [null]
//       })
//     });
//   }

 

//   createMedicationGroup(): FormGroup {
//     return this.fb.group({
//       name: ['', Validators.required],
//       dosage: ['', Validators.required],
//       frequency: ['1+0+0+0', Validators.required],
//       duration: ['', Validators.required],
//       instructions: ['']
//     });
//   }

//   createTestGroup(): FormGroup {
//     return this.fb.group({
//       name: ['', Validators.required],
//       description: [''],
//       isPending: [true]
//     });
//   }

//   get diagnosisArray(): FormArray {
//     return this.prescriptionForm.get('diagnosis') as FormArray;
//   }

//   get medicationsArray(): FormArray {
//     return this.prescriptionForm.get('medications') as FormArray;
//   }

//   get testsArray(): FormArray {
//     return this.prescriptionForm.get('tests') as FormArray;
//   }

//   get vitalSignsGroup(): FormGroup {
//     return this.prescriptionForm.get('vitalSigns') as FormGroup;
//   }

//   loadData(): void {
//     this.isLoading = true;


//     const quickDataSub = forkJoin({
//       quickOptions: this.prescriptionService.getQuickTextOptions(),
//       medications: this.prescriptionService.getCommonMedications(),
//       tests: this.prescriptionService.getCommonTests(),
//       template: this.templateService.getDefaultTemplate('current-doctor-id')
//     }).subscribe({
//       next: (data) => {
    
//         this.quickOptions = isQuickOptions(data.quickOptions) 
//           ? data.quickOptions 
//           : { complaints: [], diagnoses: [], advice: [] };
  
//         this.commonMedications = data.medications || [];
//         this.commonTests = data.tests || [];
//         this.template = data.template || null;
  
//         this.loadRouteData();
//       },
//       error: (error) => {
//         console.error('Error loading quick data:', error);
//         this.errorMessage = 'Failed to load prescription options.';
//         this.isLoading = false;
//       }
//     });

//     this.subscriptions.add(quickDataSub);
//   }

//   loadRouteData(): void {
//     const routeSub = this.route.paramMap.pipe(
//       switchMap(params => {
//         const prescriptionId = params.get('prescriptionId');
//         const patientId = params.get('patientId');

//         if (prescriptionId) {

//           this.prescriptionId = prescriptionId;
//           this.isEditing = true;
//           return this.prescriptionService.getPrescription(prescriptionId).pipe(
//             tap(prescription => {
//               this.patientId = prescription.patientId;
//               return this.prescriptionService.getPatientInfo(prescription.patientId);
//             })
//           );
//         } else if (patientId) {

//           this.patientId = patientId;
//           this.isEditing = false;
//           return this.prescriptionService.getPatientInfo(patientId);
//         } else {
//           throw new Error('Missing prescription ID or patient ID');
//         }
//       })
//     ).subscribe({
//       next: (data) => {
//         if (this.isEditing) {

//           const prescription = data as Prescription;
//           this.patientInfo = null;
//           this.populateForm(prescription);

//           console.log("ptdid"+JSON.stringify(this.patientInfo,null,2));

//           this.prescriptionService.getPatientInfo(prescription.patientId).subscribe({
//             next: (patient) => {
//               this.patientInfo = patient;
//               this.isLoading = false;
//             },
//             error: (error) => {
//               console.error('Error loading patient info:', error);
//               this.errorMessage = 'Failed to load patient information.';
//               this.isLoading = false;
//             }
//           });
//         } else {

//           this.patientInfo = data;
//           this.isLoading = false;
//         }
//       },
//       error: (error) => {
//         console.error('Error loading prescription data:', error);
//         this.errorMessage = 'Failed to load prescription data.';
//         this.isLoading = false;
//       }
//     });

//     this.subscriptions.add(routeSub);
//   }

//   populateForm(prescription: Prescription): void {

//     while (this.diagnosisArray.length > 0) {
//       this.diagnosisArray.removeAt(0);
//     }

//     while (this.medicationsArray.length > 0) {
//       this.medicationsArray.removeAt(0);
//     }

//     while (this.testsArray.length > 0) {
//       this.testsArray.removeAt(0);
//     }


//     this.prescriptionForm.patchValue({
//       date: prescription.date,
//       chiefComplaints: prescription.chiefComplaints,
//       clinicalFindings: prescription.clinicalFindings,
//       advice: prescription.advice,
//       nextVisit: prescription.nextVisit,
//       vitalSigns: prescription.vitalSigns
//     });


//     prescription.diagnosis.forEach(diagnosis => {
//       this.diagnosisArray.push(this.fb.control(diagnosis, Validators.required));
//     });


//     prescription.medications.forEach(medication => {
//       const medicationGroup = this.fb.group({
//         id: [medication.id],
//         name: [medication.name, Validators.required],
//         dosage: [medication.dosage, Validators.required],
//         frequency: [medication.frequency, Validators.required],
//         duration: [medication.duration, Validators.required],
//         instructions: [medication.instructions]
//       });

//       this.medicationsArray.push(medicationGroup);
//     });


//     prescription.tests.forEach(test => {
//       const testGroup = this.fb.group({
//         id: [test.id],
//         name: [test.name, Validators.required],
//         description: [test.description],
//         isPending: [test.isPending],
//         result: [test.result]
//       });

//       this.testsArray.push(testGroup);
//     });
//   }

//   addDiagnosis(): void {
//     this.diagnosisArray.push(this.fb.control('', Validators.required));
//   }

//   removeDiagnosis(index: number): void {
//     if (this.diagnosisArray.length > 1) {
//       this.diagnosisArray.removeAt(index);
//     }
//   }

//   addMedication(): void {
//     this.medicationsArray.push(this.createMedicationGroup());
//   }

//   removeMedication(index: number): void {
//     if (this.medicationsArray.length > 1) {
//       this.medicationsArray.removeAt(index);
//     }
//   }

//   addTest(): void {
//     this.testsArray.push(this.createTestGroup());
//   }

//   removeTest(index: number): void {
//     if (this.testsArray.length > 1) {
//       this.testsArray.removeAt(index);
//     }
//   }

//   addQuickComplaint(complaint: string): void {
//     const currentValue = this.prescriptionForm.get('chiefComplaints')?.value || '';
//     const separator = currentValue ? ', ' : '';
//     const newValue = currentValue + separator + complaint;
//     this.prescriptionForm.get('chiefComplaints')?.setValue(newValue);
//   }

//   addQuickDiagnosis(diagnosis: string): void {

//     const emptyIndex = this.diagnosisArray.controls.findIndex(control => !control.value);
//     if (emptyIndex >= 0) {
//       this.diagnosisArray.at(emptyIndex).setValue(diagnosis);
//     } else {
//       this.diagnosisArray.push(this.fb.control(diagnosis, Validators.required));
//     }
//   }

//   addQuickAdvice(advice: string): void {
//     const currentValue = this.prescriptionForm.get('advice')?.value || '';
//     const separator = currentValue ? '\n• ' : '• ';
//     const newValue = currentValue + separator + advice;
//     this.prescriptionForm.get('advice')?.setValue(newValue);
//   }

//   addCommonMedication(medication: Partial<Medication>): void {
//     const medicationGroup = this.fb.group({
//       name: [medication.name, Validators.required],
//       dosage: [medication.dosage, Validators.required],
//       frequency: [medication.frequency, Validators.required],
//       duration: [medication.duration, Validators.required],
//       instructions: [medication.instructions]
//     });

//     this.medicationsArray.push(medicationGroup);
//   }
//   updateFrequency(index: number): void {
//     const medicationGroup = this.medicationsArray.at(index);
//     if (!medicationGroup) return;
    
//     const morning = medicationGroup.get('frequency')!.value.split('+')[0] || '0';
//     const noon = medicationGroup.get('frequency')!.value.split('+')[1] || '0';
//     const evening = medicationGroup.get('frequency')!.value.split('+')[2] || '0';
//     const night = medicationGroup.get('frequency')!.value.split('+')[3] || '0';
    
//     const frequency = `${morning}+${noon}+${evening}+${night}`;
//     medicationGroup.get('frequency')!.setValue(frequency);
//   }

//   addCommonTest(test: Partial<Test>): void {
//     const testGroup = this.fb.group({
//       name: [test.name, Validators.required],
//       description: [test.description],
//       isPending: [true]
//     });

//     this.testsArray.push(testGroup);
//   }

//   savePrescription(): void {
//     if (this.prescriptionForm.invalid) {
//       this.markFormGroupTouched(this.prescriptionForm);
//       return;
//     }

//     this.isSaving = true;
//     this.errorMessage = '';
//     this.successMessage = '';

//     const formValues = this.prescriptionForm.getRawValue();


//     const prescriptionData: Omit<Prescription, 'id' | 'createdAt' | 'updatedAt'> = {
//       patientId: this.patientId,
//       doctorId: 'current-doctor-id',
//       date: formValues.date,
//       chiefComplaints: formValues.chiefComplaints,
//       clinicalFindings: formValues.clinicalFindings,
//       diagnosis: formValues.diagnosis,
//       medications: formValues.medications,
//       tests: formValues.tests,
//       advice: formValues.advice,
//       nextVisit: formValues.nextVisit,
//       vitalSigns: formValues.vitalSigns
//     };

//     if (this.isEditing) {

//       this.prescriptionService.updatePrescription(this.prescriptionId, prescriptionData).subscribe({
//         next: () => {
//           this.isSaving = false;
//           this.successMessage = 'Prescription updated successfully.';
//           setTimeout(() => {
//             this.router.navigate(['/prescription/view', this.prescriptionId]);
//           }, 1500);
//         },
//         error: (error) => {
//           console.error('Error updating prescription:', error);
//           this.errorMessage = 'Failed to update prescription.';
//           this.isSaving = false;
//         }
//       });
//     } else {

//       this.prescriptionService.createPrescription(prescriptionData).subscribe({
//         next: (prescriptionId) => {
//           this.isSaving = false;
//           this.successMessage = 'Prescription created successfully.';
//           setTimeout(() => {
//             this.router.navigate(['/prescription/view', prescriptionId]);
//           }, 1500);
//         },
//         error: (error) => {
//           console.error('Error creating prescription:', error);
//           this.errorMessage = 'Failed to create prescription.';
//           this.isSaving = false;
//         }
//       });
//     }
//   }

//   printPrescription(): void {
//     if (this.isEditing) {
//       this.router.navigate(['/prescription/print', this.prescriptionId]);
//     } else {
//       this.savePrescription();

//     }
//   }

//   cancelEdit(): void {
//     if (this.isEditing) {
//       this.router.navigate(['/prescription/view', this.prescriptionId]);
//     } else {
//       this.router.navigate(['/patients']);
//     }
//   }

  

//   markFormGroupTouched(formGroup: FormGroup): void {
//     Object.values(formGroup.controls).forEach(control => {
//       control.markAsTouched();

//       if (control instanceof FormGroup) {
//         this.markFormGroupTouched(control);
//       }

//       if (control instanceof FormArray) {
//         for (let i = 0; i < control.length; i++) {
//           const arrayControl = control.at(i);
//           if (arrayControl instanceof FormGroup) {
//             this.markFormGroupTouched(arrayControl);
//           } else {
//             arrayControl.markAsTouched();
//           }
//         }
//       }
//     });
//   }
// }

// export function isQuickOptions(obj: any): obj is QuickOptions {
//   return (
//     obj &&
//     Array.isArray(obj.complaints) &&
//     Array.isArray(obj.diagnoses) &&
//     Array.isArray(obj.advice)
//   );
// }