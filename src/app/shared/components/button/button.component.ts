import { Component, Input, Output, EventEmitter } from '@angular/core';

@Component({
  selector: 'app-button',
  template: `
    <button
      [type]="type"
      [disabled]="disabled || loading"
      [ngClass]="['btn', 'btn-' + variant, size]"
      (click)="onClick($event)">
      <app-loading-spinner *ngIf="loading" [size]="16"></app-loading-spinner>
      <ng-content *ngIf="!loading"></ng-content>
    </button>
  `,
  styles: [`
    .btn {
      display: inline-flex;
      align-items: center;
      justify-content: center;
      border-radius: 4px;
      font-weight: 500;
      cursor: pointer;
      transition: all 0.2s;
    }
    .btn:disabled {
      opacity: 0.7;
      cursor: not-allowed;
    }
    .btn-primary {
      background-color: #4f46e5;
      color: white;
      border: none;
    }
    .btn-primary:hover:not(:disabled) {
      background-color: #4338ca;
    }
    .btn-secondary {
      background-color: #6b7280;
      color: white;
      border: none;
    }
    .btn-secondary:hover:not(:disabled) {
      background-color: #4b5563;
    }
    .small {
      padding: 6px 12px;
      font-size: 14px;
    }
    .medium {
      padding: 8px 16px;
      font-size: 16px;
    }
    .large {
      padding: 12px 24px;
      font-size: 18px;
    }
  `]
})
export class ButtonComponent {
  @Input() type: 'button' | 'submit' | 'reset' = 'button';
  @Input() variant: 'primary' | 'secondary' = 'primary';
  @Input() size: 'small' | 'medium' | 'large' = 'medium';
  @Input() disabled: boolean = false;
  @Input() loading: boolean = false;
  @Output() btnClick = new EventEmitter<MouseEvent>();

  onClick(event: MouseEvent) {
    this.btnClick.emit(event);
  }
}