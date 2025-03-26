import { NgModule } from '@angular/core';
import { RouterModule, Routes } from '@angular/router';

const routes: Routes = [
  {
    path: '',
    loadComponent: () => import('./components/prescription-list/prescription-list.component').then(m => m.PrescriptionListComponent)
  },

  {
    path: 'new/:patientId',
    loadComponent: () => import('./components/prescription-form/prescription-form.component').then(m => m.PrescriptionFormComponent)
  },

  {
    path: 'edit/:prescriptionId',
    loadComponent: () => import('./components/prescription-form/prescription-form.component').then(m => m.PrescriptionFormComponent)
  },

  {
    path: 'view/:prescriptionId',
    loadComponent: () => import('./components/prescription-view/prescription-view.component').then(m => m.PrescriptionViewComponent)
  },
  {
    path: 'print/:prescriptionId',
    loadComponent: () => import('./components/prescription-print/prescription-print.component').then(m => m.PrescriptionPrintComponent)
  },
  {
    path: 'templates',
    loadComponent: () => import('./components/template-settings/template-settings.component').then(m => m.TemplateSettingsComponent)
  },

];

@NgModule({
  imports: [RouterModule.forChild(routes)],
  exports: [RouterModule]
})
export class PrescriptionRoutingModule { }