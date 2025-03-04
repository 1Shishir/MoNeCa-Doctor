import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { ReactiveFormsModule } from '@angular/forms';
import { SharedModule } from '../shared/shared.module';
import { PatientRoutingModule } from './patient-routing.module';

@NgModule({
  imports: [
    CommonModule,
    ReactiveFormsModule,
    PatientRoutingModule,
    SharedModule
  ]
})
export class PatientModule { }