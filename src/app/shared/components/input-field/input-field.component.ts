import { Component, Input, forwardRef } from '@angular/core';
import { ControlValueAccessor, NG_VALUE_ACCESSOR } from '@angular/forms';

@Component({
  selector: 'app-input-field',
  template: `
    <div class="input-container">
      <label *ngIf="label" [for]="id" class="label">{{ label }}</label>
      <input
        [id]="id"
        [type]="type"
        [placeholder]="placeholder"
        [value]="value"
        [disabled]="disabled"
        (input)="onInput($event)"
        (blur)="onBlur()"
        class="input-field"
        [ngClass]="{'input-error': error}"
      >
      <span *ngIf="error" class="error-message">{{ error }}</span>
    </div>
  `,
  styles: [`
    .input-container {
      margin-bottom: 16px;
    }
    .label {
      display: block;
      margin-bottom: 4px;
      font-size: 14px;
      color: #374151;
    }
    .input-field {
      width: 100%;
      padding: 8px 12px;
      border: 1px solid #d1d5db;
      border-radius: 4px;
      font-size: 14px;
      transition: border-color 0.2s;
    }
    .input-field:focus {
      outline: none;
      border-color: #4f46e5;
      box-shadow: 0 0 0 3px rgba(79, 70, 229, 0.1);
    }
    .input-error {
      border-color: #ef4444;
    }
    .error-message {
      display: block;
      color: #ef4444;
      font-size: 12px;
      margin-top: 4px;
    }
  `],
  providers: [
    {
      provide: NG_VALUE_ACCESSOR,
      useExisting: forwardRef(() => InputFieldComponent),
      multi: true
    }
  ]
})
export class InputFieldComponent implements ControlValueAccessor {
  @Input() label: string = '';
  @Input() type: string = 'text';
  @Input() placeholder: string = '';
  @Input() id: string = '';
  @Input() error: string = '';
  @Input() disabled: boolean = false;

  value: string = '';
  onChange: any = () => {};
  onTouch: any = () => {};

  writeValue(value: string): void {
    this.value = value;
  }

  registerOnChange(fn: any): void {
    this.onChange = fn;
  }

  registerOnTouched(fn: any): void {
    this.onTouch = fn;
  }

  setDisabledState(isDisabled: boolean): void {
    this.disabled = isDisabled;
  }

  onInput(event: Event): void {
    const value = (event.target as HTMLInputElement).value;
    this.value = value;
    this.onChange(value);
  }

  onBlur(): void {
    this.onTouch();
  }
}