import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormBuilder, FormGroup, Validators, ReactiveFormsModule, FormArray } from '@angular/forms';
import { RouterModule } from '@angular/router';

@Component({
  selector: 'app-add-patient',
  standalone: true,
  imports: [CommonModule, ReactiveFormsModule, RouterModule],
  templateUrl: './add-patient.component.html',
  styleUrl: './add-patient.component.css'
})
export class AddPatientComponent implements OnInit {
  patientForm: FormGroup;
  currentStep = 1;
  totalSteps = 4;
  showSuccessMessage = false;
  sendingLink = false;
  linkSent = false;
  registrationLink = '';
  
  // Lists for dropdown selections
  bloodTypes = ['A+', 'A-', 'B+', 'B-', 'AB+', 'AB-', 'O+', 'O-'];
  trimesters = [1, 2, 3];
  
  constructor(private fb: FormBuilder) {
    this.patientForm = this.fb.group({
      // Personal Information
      personalInfo: this.fb.group({
        fullName: ['', [Validators.required, Validators.minLength(3)]],
        age: ['', [Validators.required, Validators.min(12), Validators.max(60)]],
        phoneNumber: ['', [Validators.required, Validators.pattern(/^(\+?880|0)?1[3456789][0-9]{8}$/)]],
        address: ['', Validators.required],
        bloodType: ['', Validators.required],
        height: ['', Validators.required],
        weight: ['', Validators.required],
        bmi: [{value: '', disabled: true}],
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
  
  ngOnInit(): void {
    // Add default empty values for array fields
    this.addAllergy();
    this.addMedicalCondition();
    this.addCurrentMedication();
    
    // Set up BMI calculation when height or weight changes
    const heightControl = this.personalInfo.get('height');
    const weightControl = this.personalInfo.get('weight');
    const bmiControl = this.personalInfo.get('bmi');
    
    if (heightControl && weightControl && bmiControl) {
      heightControl.valueChanges.subscribe(() => this.calculateBMI());
      weightControl.valueChanges.subscribe(() => this.calculateBMI());
    }
    
    // Add email validator when createAccount is true
    this.accountSetup.get('createAccount')?.valueChanges.subscribe(value => {
      const emailControl = this.accountSetup.get('email');
      if (emailControl) {
        if (value) {
          emailControl.setValidators([Validators.required, Validators.email]);
        } else {
          emailControl.setValidators([Validators.email]);
        }
        emailControl.updateValueAndValidity();
      }
    });
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
      // Form is valid, proceed with submission
      const formValue = this.patientForm.getRawValue(); // getRawValue to include disabled fields
      console.log('Form Submitted:', formValue);
      
      // In a real application, you would send this data to your backend
      // For demonstration, we'll just show a success message
      
      if (formValue.accountSetup.createAccount && formValue.accountSetup.email) {
        // If creating an account, generate a signup link
        this.sendSignupLink(formValue.accountSetup.email);
      } else {
        // Just save the patient without creating an account
        this.showSuccessMessage = true;
        setTimeout(() => {
          // Reset the form and go back to step 1 after showing success message
          this.patientForm.reset();
          this.currentStep = 1;
          this.showSuccessMessage = false;
        }, 5000);
      }
    } else {
      // Form is invalid, mark all fields as touched to display errors
      this.markFormGroupTouched(this.patientForm);
    }
  }
  
  // Send signup link to patient's email
  sendSignupLink(email: string): void {
    this.sendingLink = true;
    
    // In a real application, you would call your backend API to generate a signup link
    // For demonstration, we'll simulate this with a timeout
    setTimeout(() => {
      this.sendingLink = false;
      this.linkSent = true;
      
      // Create a mock registration link
      const token = Math.random().toString(36).substring(2, 15);
      this.registrationLink = `https://moneca.example.com/patient-signup/${token}`;
      
      // In a real application, this link would be sent to the patient's email
      console.log(`Registration link for ${email}: ${this.registrationLink}`);
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

