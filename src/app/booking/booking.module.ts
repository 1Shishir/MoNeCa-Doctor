import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { ReactiveFormsModule } from '@angular/forms';

import { SharedModule } from '../shared/shared.module';
import { BookingRoutingModule } from './booking-routing.module';

@NgModule({
    imports: [
        CommonModule,
        ReactiveFormsModule,
        BookingRoutingModule,
        SharedModule
    ]
})
export class BookingModule { }