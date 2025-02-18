import { Component, Input, Output, EventEmitter } from '@angular/core';

@Component({
  selector: 'app-alert',
  template: `
    <div *ngIf="show" class="alert" [ngClass]="'alert-' + type">
      <span class="alert-message">{{ message }}</span>
      <button *ngIf="dismissible" class="close-btn" (click)="onClose()">×</button>
    </div>
  `,
  styles: [`
    .alert {
      padding: 12px 16px;
      border-radius: 4px;
      margin: 8px 0;
      display: flex;
      align-items: center;
      justify-content: space-between;
    }
    .alert-success {
      background-color: #d4edda;
      color: #155724;
      border: 1px solid #c3e6cb;
    }
    .alert-error {
      background-color: #f8d7da;
      color: #721c24;
      border: 1px solid #f5c6cb;
    }
    .alert-warning {
      background-color: #fff3cd;
      color: #856404;
      border: 1px solid #ffeeba;
    }
    .alert-info {
      background-color: #cce5ff;
      color: #004085;
      border: 1px solid #b8daff;
    }
    .close-btn {
      background: none;
      border: none;
      font-size: 20px;
      cursor: pointer;
      padding: 0 4px;
    }
  `]
})
export class AlertComponent {
  @Input() message: string = '';
  @Input() type: 'success' | 'error' | 'warning' | 'info' = 'info';
  @Input() dismissible: boolean = true;
  @Input() show: boolean = true;
  @Output() closed = new EventEmitter<void>();

  onClose() {
    this.show = false;
    this.closed.emit();
  }
}