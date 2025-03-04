import { Component, Input, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormBuilder, FormGroup, ReactiveFormsModule, Validators } from '@angular/forms';

@Component({
  selector: 'app-patient-assessment',
  standalone: true,
  imports: [CommonModule, ReactiveFormsModule],
  templateUrl: './patient-assessment.component.html',
  styleUrl: './patient-assessment.component.css'
})
export class PatientAssessmentComponent implements OnInit {
  @Input() assessments: any[] = [];
  @Input() patientId: number = 0;
  
  showAddForm = false;
  assessmentForm: FormGroup;
  
  riskLevels = ['Low', 'Medium', 'High', 'Critical'];
  
  constructor(private fb: FormBuilder) {
    this.assessmentForm = this.fb.group({
      date: [new Date().toISOString().split('T')[0], Validators.required],
      assessedBy: ['Dr. Rafiq Ahmed', Validators.required],
      findings: ['', Validators.required],
      riskLevel: ['', Validators.required],
      recommendations: ['', Validators.required]
    });
  }
  
  ngOnInit(): void {}
  
  toggleAddForm(): void {
    this.showAddForm = !this.showAddForm;
    
    if (this.showAddForm) {
      // Reset the form
      this.assessmentForm.reset({
        date: new Date().toISOString().split('T')[0],
        assessedBy: 'Dr. Rafiq Ahmed'
      });
    }
  }
  
  onSubmit(): void {
    if (this.assessmentForm.valid) {
      // In a real app, you would save this to a service
      // For now, we'll just add it to the local array
      const newAssessment = {
        id: this.assessments.length + 1,
        ...this.assessmentForm.value
      };
      
      this.assessments.unshift(newAssessment);
      this.toggleAddForm();
    } else {
      // Mark all fields as touched to display validation errors
      this.markFormGroupTouched(this.assessmentForm);
    }
  }
  
  markFormGroupTouched(formGroup: FormGroup): void {
    Object.values(formGroup.controls).forEach(control => {
      control.markAsTouched();
      
      if (control instanceof FormGroup) {
        this.markFormGroupTouched(control);
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
  
  getRiskLevelClass(riskLevel: string): string {
    switch(riskLevel.toLowerCase()) {
      case 'low':
        return 'risk-low';
      case 'medium':
        return 'risk-medium';
      case 'high':
        return 'risk-high';
      case 'critical':
        return 'risk-critical';
      default:
        return '';
    }
  }
}