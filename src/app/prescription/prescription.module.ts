import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { ReactiveFormsModule, FormsModule } from '@angular/forms';
import { RouterModule } from '@angular/router';
import { SharedModule } from '../shared/shared.module';
import { PrescriptionViewComponent } from './components/prescription-view/prescription-view.component';
import { PrescriptionPrintComponent } from './components/prescription-print/prescription-print.component';
import { MedicationItemComponent } from './components/medication-item/medication-item.component';
import { PrescriptionHistoryComponent } from './components/prescription-history/prescription-history.component';
import { TemplateSettingsComponent } from './components/template-settings/template-settings.component';
import { PrescriptionListComponent } from './components/prescription-list/prescription-list.component';
import { PrescriptionFormComponent } from './components/prescription-form/prescription-form.component';
import { TestItemComponent } from './components/test-item/test-item.component';
import { PrescriptionRoutingModule } from './prescription-routing.module';

@NgModule({
  imports: [
    CommonModule,
    ReactiveFormsModule,
    FormsModule,
    RouterModule,
    PrescriptionRoutingModule,
    SharedModule,
    PrescriptionListComponent,
    PrescriptionFormComponent,
    PrescriptionViewComponent,
    PrescriptionPrintComponent,
    MedicationItemComponent,
    TestItemComponent,
    PrescriptionHistoryComponent,
    TemplateSettingsComponent
  ]
})
export class PrescriptionModule { }