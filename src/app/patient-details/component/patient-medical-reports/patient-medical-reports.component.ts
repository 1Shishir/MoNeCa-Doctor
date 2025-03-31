import { Component, Input, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormBuilder, FormGroup, ReactiveFormsModule, Validators } from '@angular/forms';

@Component({
  selector: 'app-patient-medical-reports',
  standalone: true,
  imports: [CommonModule, ReactiveFormsModule],
  templateUrl: './patient-medical-reports.component.html',
  styleUrl: './patient-medical-reports.component.css'
})
export class PatientMedicalReportsComponent implements OnInit {
  @Input() medicalReports: any[] = [];
  @Input() patientId: string = '0';
  
  showAddForm = false;
  reportForm: FormGroup;
  
  reportTypes = [
    'Blood Test',
    'Ultrasound',
    'Urine Analysis',
    'Glucose Test',
    'Hemoglobin Test',
    'Blood Pressure Log',
    'Other'
  ];
  
  constructor(private fb: FormBuilder) {
    this.reportForm = this.fb.group({
      date: [new Date().toISOString().split('T')[0], Validators.required],
      type: ['', Validators.required],
      summary: ['', Validators.required],
      details: [''],
      provider: ['', Validators.required],
      fileUpload: ['']
    });
  }
  
  ngOnInit(): void {}
  
  toggleAddForm(): void {
    this.showAddForm = !this.showAddForm;
    
    if (this.showAddForm) {
      // Reset the form
      this.reportForm.reset({
        date: new Date().toISOString().split('T')[0]
      });
    }
  }
  
  onSubmit(): void {
    if (this.reportForm.valid) {
      // In a real app, you would upload the file and save the report
      // For now, we'll just add it to the local array
      const newReport = {
        id: this.medicalReports.length + 1,
        ...this.reportForm.value,
        fileUrl: 'assets/reports/sample_report.pdf' // Mock file URL
      };
      
      this.medicalReports.unshift(newReport);
      this.toggleAddForm();
    } else {
      // Mark all fields as touched to display validation errors
      this.markFormGroupTouched(this.reportForm);
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
  
  getReportIcon(reportType: string): string {
    switch(reportType.toLowerCase()) {
      case 'blood test':
        return 'fa-solid fa-vial';
      case 'ultrasound':
        return 'fa-solid fa-wave-square';
      case 'urine analysis':
        return 'fa-solid fa-flask';
      case 'glucose test':
        return 'fa-solid fa-droplet';
      case 'hemoglobin test':
        return 'fa-solid fa-vial-circle-check';
      case 'blood pressure log':
        return 'fa-solid fa-heart-pulse';
      default:
        return 'fa-solid fa-file-medical';
    }
  }
}