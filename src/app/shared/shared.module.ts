import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouterModule } from '@angular/router';
import { ReactiveFormsModule, FormsModule } from '@angular/forms';


import { LoadingSpinnerComponent } from './components/loading-spinner/loading-spinner.component';
import { AlertComponent } from './components/alert/alert.component';
import { ButtonComponent } from './components/button/button.component';
import { InputFieldComponent } from './components/input-field/input-field.component';
import { TruncatePipe } from './pipes/truncate.pipe';
import { SafeHtmlPipe } from './pipes/safe-html.pipe';
import { ClickOutsideDirective } from './directives/click-outside.directive';
import { PhoneNumberDirective } from './directives/phone-number.directive';

@NgModule({
  imports: [
    CommonModule,
    RouterModule,
    ReactiveFormsModule,
    FormsModule,
    
    LoadingSpinnerComponent,
    AlertComponent,
    ButtonComponent,
    InputFieldComponent,
    TruncatePipe,
    SafeHtmlPipe,
    ClickOutsideDirective,
    PhoneNumberDirective
  ],
  exports: [
    CommonModule,
    RouterModule,
    ReactiveFormsModule,
    FormsModule,
    
    LoadingSpinnerComponent,
    AlertComponent,
    ButtonComponent,
    InputFieldComponent,
    TruncatePipe,
    SafeHtmlPipe,
    ClickOutsideDirective,
    PhoneNumberDirective
  ]
})
export class SharedModule { }