import { Component, EventEmitter, Input, Output } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouterModule } from '@angular/router';

@Component({
  selector: 'app-patient-card',
  standalone: true,
  imports: [
    CommonModule,
    RouterModule
  ],
  templateUrl: './patient-card.component.html',
  styleUrl: './patient-card.component.css'
})
export class PatientCardComponent {
  @Input() patient: any;
   @Output() patientClick = new EventEmitter<any>();

  onPatientCardClick() {
     console.log("patient properties:", JSON.stringify(this.patient, null, 2)); 
    this.patientClick.emit(this.patient?.id); 
  }

  getCriticalityClass(): string {
    switch(this.patient.criticality) {
      case 'critical':
        return 'criticality-critical';
      case 'high':
        return 'criticality-high';
      case 'medium':
        return 'criticality-medium';
      case 'low':
        return 'criticality-low';
      default:
        return '';
    }
  }
  
  getCriticalityLabel(): string {
    switch(this.patient.criticality) {
      case 'critical':
        return 'Critical';
      case 'high':
        return 'High Risk';
      case 'medium':
        return 'Medium Risk';
      case 'low':
        return 'Low Risk';
      default:
        return '';
    }
  }
  
  getFormattedDate(dateString: string): string {
    const date = new Date(dateString);
    return date.toLocaleDateString('en-US', { 
      month: 'short', 
      day: 'numeric',
      year: 'numeric'
    });
  }
}
