// import { NgModule } from '@angular/core';
// import { CommonModule } from '@angular/common';
// import { ReactiveFormsModule } from '@angular/forms';
// import { DashboardRoutingModule } from './dashboard-routing.module';
// import { SharedModule } from '../shared/shared.module';

// @NgModule({
//   imports: [
//     CommonModule,
//     ReactiveFormsModule,
//     DashboardRoutingModule,
//     SharedModule
//   ]
// })
// export class DashboardModule { }



import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { ReactiveFormsModule } from '@angular/forms';

import { DashboardRoutingModule } from './dashboard-routing.module';
import { SharedModule } from '../shared/shared.module';
import { DashboardService } from './service/dashboard.service';

@NgModule({
  imports: [
    CommonModule,
    ReactiveFormsModule,
    DashboardRoutingModule,
    SharedModule
  ],
  providers: [
    DashboardService
  ]
})
export class DashboardModule { }