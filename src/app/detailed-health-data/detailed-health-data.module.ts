import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { ReactiveFormsModule } from '@angular/forms';
import { SharedModule } from '../shared/shared.module';
import { DetailedHealthDataRoutingModule } from './detailed-health-data-routing.module';



@NgModule({
  imports: [
    CommonModule,
    ReactiveFormsModule,
    DetailedHealthDataRoutingModule,
    SharedModule
  ]
})
export class DetailedHealthDataModule { }
