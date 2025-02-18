import { Component, Input } from '@angular/core';

@Component({
  selector: 'app-loading-spinner',
  template: `
    <div class="spinner-container" [ngStyle]="{'width.px': size, 'height.px': size}">
      <div class="spinner" [ngStyle]="{'border-width.px': strokeWidth}"></div>
    </div>
  `,
  styles: [`
    .spinner-container {
      display: inline-block;
      position: relative;
    }
    .spinner {
      border-radius: 50%;
      border: 2px solid #f3f3f3;
      border-top: 2px solid #3498db;
      width: 100%;
      height: 100%;
      animation: spin 1s linear infinite;
    }
    @keyframes spin {
      0% { transform: rotate(0deg); }
      100% { transform: rotate(360deg); }
    }
  `]
})
export class LoadingSpinnerComponent {
  @Input() size: number = 40;
  @Input() strokeWidth: number = 2;
}
