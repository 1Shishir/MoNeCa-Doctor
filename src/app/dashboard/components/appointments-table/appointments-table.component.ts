import { Component, EventEmitter, Input, Output } from '@angular/core';
import { CommonModule } from '@angular/common';

@Component({
  selector: 'app-appointments-table',
  standalone: true,
  imports: [CommonModule],
  templateUrl: './appointments-table.component.html',
  styleUrl: './appointments-table.component.css'
})
export class AppointmentsTableComponent {
  @Input() title: string = "Today's Appointments";
  @Input() appointments: any[] = [];
  @Output() addAppointment = new EventEmitter<void>();
  @Output() startAppointment = new EventEmitter<any>();
  @Output() rescheduleAppointment = new EventEmitter<any>();
  @Output() viewAll = new EventEmitter<void>();
  
  onAddAppointment(): void {
    this.addAppointment.emit();
  }
  
  onStartAppointment(appointment: any): void {
    this.startAppointment.emit(appointment);
  }
  
  onRescheduleAppointment(appointment: any): void {
    this.rescheduleAppointment.emit(appointment);
  }
  
  onViewAll(): void {
    this.viewAll.emit();
  }
}