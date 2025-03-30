import { Component, Inject, OnInit, PLATFORM_ID } from '@angular/core';
import { CommonModule, isPlatformBrowser } from '@angular/common';
import { FormBuilder, FormGroup, Validators, ReactiveFormsModule, FormArray } from '@angular/forms';
import { Router, RouterModule } from '@angular/router';
import { PatientService } from '../../services/patient.service';
import { Criticality } from '../../model/patient.model';
import { AuthService } from '../../../auth/services/auth.service';
import { Doctor } from '../../../models/auth.model';
@Component({
  selector: 'app-add-patient',
  standalone: true,
  imports: [CommonModule, ReactiveFormsModule, RouterModule],
  templateUrl: './add-patient.component.html',
  styleUrl: './add-patient.component.css',
  providers: [PatientService]
})
export class AddPatientComponent implements OnInit {
  patientForm: FormGroup;
  currentStep = 1;
  totalSteps = 4;
  showSuccessMessage = false;
  sendingLink = false;
  linkSent = false;
  registrationLink = '';

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

  // Lists for dropdown selections
  bloodTypes = ['A+', 'A-', 'B+', 'B-', 'AB+', 'AB-', 'O+', 'O-'];
  trimesters = [1, 2, 3];
  doctors: Doctor[] = [];
  loading = false;


  constructor(
    private fb: FormBuilder,
    private patientService: PatientService,
    private router: Router,
    private authService: AuthService,
    @Inject(PLATFORM_ID) private platformId: Object


  ) {
    this.patientForm = this.createForm();
  }

  ngOnInit(): void {

    this.addAllergy();
    this.addMedicalCondition();
    this.addCurrentMedication();



    this.setupBmiCalculation();

    this.setupEmailValidation();

    this.loadCurrentDoctor();
  }

  // Creates the form with all fields and validators
  private createForm(): FormGroup {
    return this.fb.group({
      // Personal Information
      personalInfo: this.fb.group({
        fullName: ['', [Validators.required, Validators.minLength(3)]],
        age: ['', [Validators.required, Validators.min(12), Validators.max(60)]],
        phoneNumber: ['', [Validators.required, Validators.pattern(/^(\+?880|0)?1[3456789][0-9]{8}$/)]],
        address: ['', Validators.required],
        bloodType: ['', Validators.required],
        height: ['', Validators.required],
        weight: ['', Validators.required],
        bmi: [{ value: '', disabled: true }],
        emergencyContact: this.fb.group({
          name: ['', Validators.required],
          relation: ['', Validators.required],
          phone: ['', [Validators.required, Validators.pattern(/^(\+?880|0)?1[3456789][0-9]{8}$/)]]
        })
      }),

      // Medical Information
      medicalInfo: this.fb.group({
        allergies: this.fb.array([]),
        medicalConditions: this.fb.array([]),
        previousSurgeries: this.fb.array([]),
        currentMedications: this.fb.array([])
      }),

      // Pregnancy Information
      pregnancyInfo: this.fb.group({
        weeks: ['', [Validators.required, Validators.min(1), Validators.max(42)]],
        gravida: ['', [Validators.required, Validators.min(1)]],
        para: ['', [Validators.required, Validators.min(0)]],
        trimester: ['', Validators.required],
        edd: ['', Validators.required], // Expected Delivery Date
        previousDeliveries: this.fb.array([])
      }),

      // Health Worker Assignment
      assignmentInfo: this.fb.group({
        assignedDoctor: ['', Validators.required],
        assignedHealthWorker: ['', Validators.required],
        initialNotes: [''],
        riskLevel: ['medium', Validators.required]
      }),

      // Account Setup Option
      accountSetup: this.fb.group({
        createAccount: [false],
        email: ['', [Validators.email]]
      })
    });
  }

  // Load doctors without blocking the UI
  private loadCurrentDoctor(): void {
    if (isPlatformBrowser(this.platformId)) {
      this.authService.currentDoctor$.subscribe(doctor => {
        if (doctor) {
          this.currentDoctor = doctor;
          console.log("Real doctor data loaded:", doctor.fullName);


          this.doctors = [this.currentDoctor];


          this.assignmentInfo.get('assignedDoctor')?.setValue(this.currentDoctor.uuid);
        } else {
          this.currentDoctor = this.dummyDoctor;
          console.log("Using dummy doctor");


          this.doctors = [this.dummyDoctor];

          this.assignmentInfo.get('assignedDoctor')?.setValue(this.dummyDoctor.uuid);
        }
      });
    } else {
      this.currentDoctor = this.dummyDoctor;
      this.doctors = [this.dummyDoctor];
      this.assignmentInfo.get('assignedDoctor')?.setValue(this.dummyDoctor.uuid);
    }
  }

  // Set up BMI calculation
  private setupBmiCalculation(): void {
    const heightControl = this.personalInfo.get('height');
    const weightControl = this.personalInfo.get('weight');

    if (heightControl && weightControl) {
      heightControl.valueChanges.subscribe(() => this.calculateBMI());
      weightControl.valueChanges.subscribe(() => this.calculateBMI());
    }
  }

  // Set up email validation rules
  private setupEmailValidation(): void {
    const createAccountControl = this.accountSetup.get('createAccount');
    const emailControl = this.accountSetup.get('email');

    if (createAccountControl && emailControl) {
      createAccountControl.valueChanges.subscribe(value => {
        if (value) {
          emailControl.setValidators([Validators.required, Validators.email]);
        } else {
          emailControl.setValidators([Validators.email]);
        }
        emailControl.updateValueAndValidity();
      });
    }
  }

  // Form getters for easier access
  get personalInfo(): FormGroup {
    return this.patientForm.get('personalInfo') as FormGroup;
  }

  get medicalInfo(): FormGroup {
    return this.patientForm.get('medicalInfo') as FormGroup;
  }

  get pregnancyInfo(): FormGroup {
    return this.patientForm.get('pregnancyInfo') as FormGroup;
  }

  get assignmentInfo(): FormGroup {
    return this.patientForm.get('assignmentInfo') as FormGroup;
  }

  get accountSetup(): FormGroup {
    return this.patientForm.get('accountSetup') as FormGroup;
  }

  get allergies(): FormArray {
    return this.medicalInfo.get('allergies') as FormArray;
  }

  get medicalConditions(): FormArray {
    return this.medicalInfo.get('medicalConditions') as FormArray;
  }

  get previousSurgeries(): FormArray {
    return this.medicalInfo.get('previousSurgeries') as FormArray;
  }

  get currentMedications(): FormArray {
    return this.medicalInfo.get('currentMedications') as FormArray;
  }

  get previousDeliveries(): FormArray {
    return this.pregnancyInfo.get('previousDeliveries') as FormArray;
  }

  // Methods to add/remove form array items
  addAllergy(): void {
    this.allergies.push(this.fb.control('', Validators.required));
  }

  removeAllergy(index: number): void {
    this.allergies.removeAt(index);
    if (this.allergies.length === 0) {
      this.addAllergy();
    }
  }

  addMedicalCondition(): void {
    this.medicalConditions.push(this.fb.control('', Validators.required));
  }

  removeMedicalCondition(index: number): void {
    this.medicalConditions.removeAt(index);
    if (this.medicalConditions.length === 0) {
      this.addMedicalCondition();
    }
  }

  addPreviousSurgery(): void {
    this.previousSurgeries.push(
      this.fb.group({
        procedure: ['', Validators.required],
        date: ['', Validators.required],
        notes: ['']
      })
    );
  }

  removePreviousSurgery(index: number): void {
    this.previousSurgeries.removeAt(index);
  }

  addCurrentMedication(): void {
    this.currentMedications.push(
      this.fb.group({
        name: ['', Validators.required],
        dosage: ['', Validators.required],
        frequency: ['', Validators.required],
        reason: ['']
      })
    );
  }

  removeCurrentMedication(index: number): void {
    this.currentMedications.removeAt(index);
    if (this.currentMedications.length === 0) {
      this.addCurrentMedication();
    }
  }

  addPreviousDelivery(): void {
    this.previousDeliveries.push(
      this.fb.group({
        date: ['', Validators.required],
        type: ['', Validators.required],
        complications: [''],
        babyWeight: ['', Validators.required]
      })
    );
  }

  removePreviousDelivery(index: number): void {
    this.previousDeliveries.removeAt(index);
  }

  trackByDoctor(index: number, doctor: Doctor): string {
    return doctor.uuid;
  }

  // Calculate BMI when height and weight are entered
  calculateBMI(): void {
    const height = this.personalInfo.get('height')?.value;
    const weight = this.personalInfo.get('weight')?.value;

    if (height && weight) {
      // Convert height from cm to meters
      const heightInMeters = height / 100;
      const bmi = weight / (heightInMeters * heightInMeters);
      this.personalInfo.get('bmi')?.setValue(bmi.toFixed(1));
    }
  }

  // Navigation between form steps
  nextStep(): void {
    let currentFormGroup: FormGroup;

    switch (this.currentStep) {
      case 1:
        currentFormGroup = this.personalInfo;
        break;
      case 2:
        currentFormGroup = this.medicalInfo;
        break;
      case 3:
        currentFormGroup = this.pregnancyInfo;
        break;
      case 4:
        currentFormGroup = this.assignmentInfo;
        break;
      default:
        return;
    }

    if (currentFormGroup.valid) {
      this.currentStep++;
      window.scrollTo(0, 0);
    } else {
      this.markFormGroupTouched(currentFormGroup);
    }
  }

  previousStep(): void {
    if (this.currentStep > 1) {
      this.currentStep--;
      window.scrollTo(0, 0);
    }
  }

  // Mark all fields as touched to display validation errors
  markFormGroupTouched(formGroup: FormGroup): void {
    Object.values(formGroup.controls).forEach(control => {
      control.markAsTouched();

      if (control instanceof FormGroup) {
        this.markFormGroupTouched(control);
      }

      if (control instanceof FormArray) {
        control.controls.forEach(groupControl => {
          if (groupControl instanceof FormGroup) {
            this.markFormGroupTouched(groupControl);
          } else {
            groupControl.markAsTouched();
          }
        });
      }
    });
  }

  // Submit the form
  onSubmit(): void {
    if (this.patientForm.valid) {
      try {
        const formValue = this.patientForm.getRawValue();

        // Map form data
        const patientData = {
          personalInfo: formValue.personalInfo,
          medicalInfo: formValue.medicalInfo,
          pregnancyInfo: formValue.pregnancyInfo,
          assignmentInfo: formValue.assignmentInfo,
          criticality: this.mapRiskLevelToCriticality(formValue.assignmentInfo.riskLevel),
          vitalStatus: {
            bp: '',
            heartRate: '',
            oxygenLevel: '',
            temperature: ''
          },
          lastCheckup: '',
          nextAppointment: '',
          healthWorker: formValue.assignmentInfo.assignedHealthWorker || '',
          createdBy: formValue.assignmentInfo.assignedDoctor
        };

        this.sendingLink = true;

        this.patientService.addPatient(patientData).subscribe({
          next: (patientId) => {
            this.sendingLink = false;
            this.showSuccessMessage = true;

            setTimeout(() => {
              this.resetForm();
              this.router.navigate(['/patients']);
            }, 3000);
          },
          error: (error) => {
            console.error('ERROR:', error);
            this.sendingLink = false;
            alert(`Failed to add patient: ${error.message}`);
          }
        });
      } catch (err) {
        console.error('Exception:', err);
        this.sendingLink = false;
      }
    } else {
      this.markFormGroupTouched(this.patientForm);
    }
  }

  private mapRiskLevelToCriticality(riskLevel: string): Criticality {
    switch (riskLevel) {
      case 'low': return 'low';
      case 'medium': return 'medium';
      case 'high': return 'high';
      case 'critical': return 'critical';
      default: return 'medium';
    }
  }

  // Send signup link to patient's email
  sendSignupLink(email: string): void {
    this.sendingLink = true;
    setTimeout(() => {
      this.sendingLink = false;
      this.linkSent = true;

      // Create a mock registration link
      const token = Math.random().toString(36).substring(2, 15);
      this.registrationLink = `https://moneca.example.com/patient-signup/${token}`;
    }, 2000);
  }

  // Reset form and state
  resetForm(): void {
    this.patientForm.reset();
    this.currentStep = 1;
    this.showSuccessMessage = false;
    this.linkSent = false;
    this.registrationLink = '';

    // Re-add default empty values
    this.addAllergy();
    this.addMedicalCondition();
    this.addCurrentMedication();
  }

  // Check if a form control is invalid and touched
  isInvalid(formGroup: FormGroup, controlName: string): boolean {
    const control = formGroup.get(controlName);
    return control !== null && control.invalid && control.touched;
  }

  // Helper method specifically for emergency contact fields
  isEmergencyContactInvalid(fieldName: string): boolean {
    const emergencyContactGroup = this.personalInfo.get('emergencyContact');
    if (emergencyContactGroup) {
      const control = emergencyContactGroup.get(fieldName);
      return !!control && control.invalid && control.touched;
    }
    return false;
  }

  copyToClipboard(text: string, event: Event): void {
    const button = event.target as HTMLButtonElement;
    const originalText = button.innerHTML;

    navigator.clipboard.writeText(text)
      .then(() => {
        button.innerHTML = '<i class="fa-solid fa-check"></i> Copied!';
        setTimeout(() => {
          button.innerHTML = originalText;
        }, 2000);
      })
      .catch(err => {
        console.error('Could not copy text: ', err);
      });
  }

  // Helper method for emergency contact field errors
  getEmergencyContactError(fieldName: string): any {
    const emergencyContactGroup = this.personalInfo.get('emergencyContact');
    if (emergencyContactGroup) {
      const control = emergencyContactGroup.get(fieldName);
      return control?.errors;
    }
    return null;
  }
}