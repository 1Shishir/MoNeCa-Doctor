import { Component, Input, Output, EventEmitter } from '@angular/core';
import { CommonModule } from '@angular/common';
import { Medication } from '../../../models/prescription.model';


@Component({
  selector: 'app-medication-item',
  standalone: true,
  imports: [CommonModule],
  templateUrl: './medication-item.component.html',
  styleUrl: './medication-item.component.css'
})
export class MedicationItemComponent {
  @Input() medication!: Medication;
  @Input() showDelete: boolean = true;
  @Output() delete = new EventEmitter<void>();

  getFrequencyValues(): string[] {
    return this.medication.frequency.split('+');
  }

  onDelete(): void {
    this.delete.emit();
  }
}
