import { Component, Input, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouterModule } from '@angular/router';

import { PrescriptionService } from '../../services/prescription.service';
import { Prescription } from '../../../models/prescription.model';


@Component({
  selector: 'app-prescription-history',
  standalone: true,
  imports: [CommonModule, RouterModule],
  templateUrl: './prescription-history.component.html',
  styleUrl: './prescription-history.component.css'
})
export class PrescriptionHistoryComponent implements OnInit {
  @Input() patientId: string = '';
  @Input() currentPrescriptionId: string = '';
  
  prescriptions: Prescription[] = [];
  isLoading: boolean = true;
  error: string = '';

  constructor(private prescriptionService: PrescriptionService) {}

  ngOnInit(): void {
    this.loadPrescriptions();
  }

  loadPrescriptions(): void {
    if (!this.patientId) {
      this.isLoading = false;
      this.error = 'Patient ID not provided';
      return;
    }
    
    this.prescriptionService.getPrescriptionsByPatient(this.patientId).subscribe({
      next: (prescriptions) => {
        
        this.prescriptions = prescriptions
          .filter(p => p.id !== this.currentPrescriptionId)
          .sort((a, b) => b.date.getTime() - a.date.getTime())
          .slice(0, 5); 
        
        this.isLoading = false;
      },
      error: (error) => {
        console.error('Error loading prescription history:', error);
        this.error = 'Failed to load prescription history';
        this.isLoading = false;
      }
    });
  }

  getFormattedDate(date: Date): string {
    return date.toLocaleDateString('en-US', {
      day: 'numeric',
      month: 'short',
      year: 'numeric'
    });
  }

  getDiagnosisSummary(diagnoses: string[]): string {
    if (diagnoses.length === 0) return 'No diagnosis';
    if (diagnoses.length === 1) return diagnoses[0];
    return `${diagnoses[0]} +${diagnoses.length - 1} more`;
  }
}