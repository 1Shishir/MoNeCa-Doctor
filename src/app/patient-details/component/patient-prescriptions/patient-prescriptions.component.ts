import { Component, Input, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormBuilder, FormGroup, ReactiveFormsModule, Validators, FormArray } from '@angular/forms';

@Component({
  selector: 'app-patient-prescriptions',
  standalone: true,
  imports: [CommonModule, ReactiveFormsModule],
  templateUrl: './patient-prescriptions.component.html',
  styleUrl: './patient-prescriptions.component.css'
})
export class PatientPrescriptionsComponent implements OnInit {
  @Input() prescriptions: any[] = [];
  @Input() patientId: number = 0;
  
  showAddForm = false;
  prescriptionForm: FormGroup;
  
  constructor(private fb: FormBuilder) {
    this.prescriptionForm = this.fb.group({
      date: [new Date().toISOString().split('T')[0], Validators.required],
      doctor: ['Dr. Rafiq Ahmed', Validators.required],
      medications: this.fb.array([this.createMedicationGroup()]),
      instructions: ['', Validators.required]
    });
  }
  
  ngOnInit(): void {}
  
  toggleAddForm(): void {
    this.showAddForm = !this.showAddForm;
    
    if (this.showAddForm) {
      // Reset the form
      this.prescriptionForm.reset({
        date: new Date().toISOString().split('T')[0],
        doctor: 'Dr. Rafiq Ahmed'
      });
      
      // Reset medications FormArray
      this.medications.clear();
      this.addMedication();
    }
  }
  
  createMedicationGroup(): FormGroup {
    return this.fb.group({
      name: ['', Validators.required],
      dosage: ['', Validators.required],
      frequency: ['', Validators.required],
      duration: ['', Validators.required]
    });
  }
  
  get medications(): FormArray {
    return this.prescriptionForm.get('medications') as FormArray;
  }
  
  addMedication(): void {
    this.medications.push(this.createMedicationGroup());
  }
  
  removeMedication(index: number): void {
    this.medications.removeAt(index);
  }
  
  onSubmit(): void {
    if (this.prescriptionForm.valid) {
      // In a real app, you would send this to a service
      // For now, we'll just add it to the local array
      const newPrescription = {
        id: this.prescriptions.length + 1,
        ...this.prescriptionForm.value
      };
      
      this.prescriptions.unshift(newPrescription);
      this.toggleAddForm();
    } else {
      // Mark all fields as touched to display validation errors
      this.markFormGroupTouched(this.prescriptionForm);
    }
  }
  
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
          }
        });
      }
    });
  }
  
  getFormattedDate(dateString: string): string {
    const date = new Date(dateString);
    return date.toLocaleDateString('en-US', { 
      year: 'numeric',
      month: 'long', 
      day: 'numeric'
    });
  }
}