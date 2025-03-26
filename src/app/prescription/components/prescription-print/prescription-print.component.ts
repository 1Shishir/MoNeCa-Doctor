import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouterModule, ActivatedRoute, Router } from '@angular/router';

import { PrescriptionService } from '../../services/prescription.service';
import { PrescriptionTemplate } from '../../../models/prescription-template.model';
import { Prescription } from '../../../models/prescription.model';
import { PrescriptionTemplateService } from '../../services/prescription-template.service';

@Component({
  selector: 'app-prescription-print',
  standalone: true,
  imports: [CommonModule, RouterModule],
  templateUrl: './prescription-print.component.html',
  styleUrl: './prescription-print.component.css'
})
export class PrescriptionPrintComponent implements OnInit {
  prescriptionId: string = '';
  prescription: Prescription | null = null;
  patientInfo: any = null;
  doctorInfo: any = null;
  template: PrescriptionTemplate | null = null;
  isLoading: boolean = true;
  errorMessage: string = '';
  
  constructor(
    private route: ActivatedRoute,
    private router: Router,
    private prescriptionService: PrescriptionService,
    private templateService: PrescriptionTemplateService
  ) {}

  ngOnInit(): void {
    this.route.paramMap.subscribe(params => {
      const id = params.get('prescriptionId');
      if (id) {
        this.prescriptionId = id;
        this.loadData();
      } else {
        this.errorMessage = 'Prescription ID not provided.';
        this.isLoading = false;
      }
    });
  }

  loadData(): void {
    this.isLoading = true;
    
    
    this.prescriptionService.getPrescription(this.prescriptionId).subscribe({
      next: (prescription) => {
        this.prescription = prescription;
        
        
        Promise.all([
          this.loadTemplate(prescription.doctorId),
          this.loadPatientInfo(prescription.patientId),
          this.loadDoctorInfo(prescription.doctorId)
        ]).then(() => {
          this.isLoading = false;
          
          
          setTimeout(() => {
            this.printPrescription();
          }, 500);
        }).catch(error => {
          console.error('Error loading data:', error);
          this.errorMessage = 'Failed to load prescription data.';
          this.isLoading = false;
        });
      },
      error: (error) => {
        console.error('Error loading prescription:', error);
        this.errorMessage = 'Failed to load prescription.';
        this.isLoading = false;
      }
    });
  }

  loadTemplate(doctorId: string): Promise<void> {
    return new Promise((resolve, reject) => {
      this.templateService.getDefaultTemplate(doctorId).subscribe({
        next: (template) => {
          this.template = template;
          resolve();
        },
        error: (error) => {
          console.error('Error loading template:', error);
          
          resolve();
        }
      });
    });
  }

  loadPatientInfo(patientId: string): Promise<void> {
    return new Promise((resolve, reject) => {
      this.prescriptionService.getPatientInfo(patientId).subscribe({
        next: (patient) => {
          this.patientInfo = patient;
          resolve();
        },
        error: (error) => {
          console.error('Error loading patient info:', error);
          reject(error);
        }
      });
    });
  }

  loadDoctorInfo(doctorId: string): Promise<void> {
    
    return new Promise((resolve) => {
      
      this.doctorInfo = {
        id: doctorId,
        name: 'Dr. Rafiq Ahmed',
        specialization: 'Obstetrics and Gynecology',
        licenseNumber: 'BMDC-123456',
        hospitalName: 'MoNeCa Maternal Health Center',
        hospitalAddress: 'Dhaka Medical College Road, Dhaka-1000, Bangladesh',
        hospitalPhone: '+880 1712345678'
      };
      resolve();
    });
  }

  printPrescription(): void {
    window.print();
  }

  goBack(): void {
    this.router.navigate(['/prescriptions/view', this.prescriptionId]);
  }
  
  getFormattedDate(date: Date | null): string {
    if (!date) return 'Not specified';
    
    return date.toLocaleDateString('en-US', {
      day: 'numeric',
      month: 'short',
      year: 'numeric'
    });
  }
  
  getFrequencyText(frequency: string): string {
    const parts = frequency.split('+');
    
    const times = [];
    if (parts[0] !== '0') times.push(`${parts[0]} in the morning`);
    if (parts[1] !== '0') times.push(`${parts[1]} at noon`);
    if (parts[2] !== '0') times.push(`${parts[2]} in the evening`);
    if (parts[3] !== '0') times.push(`${parts[3]} at night`);
    
    return times.join(', ');
  }
}