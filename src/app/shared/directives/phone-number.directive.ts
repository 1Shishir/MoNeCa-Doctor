import { Directive, ElementRef, HostListener } from '@angular/core';

@Directive({
  selector: '[phoneNumber]',
  standalone: true
})
export class PhoneNumberDirective {
  constructor(private el: ElementRef) {}

  @HostListener('input', ['$event'])
  onInput(event: InputEvent) {
    const input = event.target as HTMLInputElement;
    let value = input.value.replace(/\D/g, '');
    
    if (value.length > 10) {
      value = value.substr(0, 10);
    }
    
    if (value.length >= 6) {
      value = `(${value.substr(0, 3)}) ${value.substr(3, 3)}-${value.substr(6)}`;
    } else if (value.length >= 3) {
      value = `(${value.substr(0, 3)}) ${value.substr(3)}`;
    }
    
    input.value = value;
  }
}