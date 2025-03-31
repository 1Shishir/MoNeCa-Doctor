import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { ReactiveFormsModule } from '@angular/forms';
import { SharedModule } from '../shared/shared.module';
import { PatientDetailsRoutingModule } from './patient-details-routing.module';
import { PatientDetailsService } from './services/patient-details.service';


@NgModule({
  imports: [
    CommonModule,
    ReactiveFormsModule,
    PatientDetailsRoutingModule,
    SharedModule
  ],
  providers: [PatientDetailsService]
})
export class PatientDetailsModule { }