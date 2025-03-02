import { Component, EventEmitter, Input, Output } from '@angular/core';
import { CommonModule } from '@angular/common';

@Component({
  selector: 'app-patient-summary',
  standalone: true,
  imports: [CommonModule],
  templateUrl: './patient-summary.component.html',
  styleUrl: './patient-summary.component.css'
})
export class PatientSummaryComponent {
  @Input() title: string = 'Patient Summary';
  @Input() patients: any[] = [];
  @Output() viewAll = new EventEmitter<void>();
  @Output() viewPatient = new EventEmitter<any>();
  @Output() contactPatient = new EventEmitter<any>();
  @Output() viewData = new EventEmitter<any>();
  
  onViewAll(): void {
    this.viewAll.emit();
  }
  
  onViewPatient(patient: any): void {
    this.viewPatient.emit(patient);
  }
  
  onContactPatient(patient: any): void {
    this.contactPatient.emit(patient);
  }
  
  onViewData(patient: any): void {
    this.viewData.emit(patient);
  }
}