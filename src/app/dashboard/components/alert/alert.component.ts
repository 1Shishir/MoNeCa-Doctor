import { Component, EventEmitter, Input, Output } from '@angular/core';
import { CommonModule } from '@angular/common';

@Component({
  selector: 'app-alert',
  standalone: true,
  imports: [CommonModule],
  templateUrl: './alert.component.html',
  styleUrl: './alert.component.css'
})
export class AlertComponent {
  @Input() type: 'critical' | 'warning' | 'info' | 'success' = 'info';
  @Input() title: string = '';
  @Input() message: string = '';
  @Input() buttonText: string = '';
  @Output() buttonClick = new EventEmitter<void>();
  
  onButtonClick(): void {
    this.buttonClick.emit();
  }
}