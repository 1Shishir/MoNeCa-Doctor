import { NgModule } from '@angular/core';
import { provideStorage } from '@angular/fire/storage';
import { RouterModule, Routes } from '@angular/router';
import { getStorage } from 'firebase/storage';
import { PrescriptionViewComponent } from './components/prescription-view/prescription-view.component';

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

  // {
  //   path: 'view/:prescriptionId',
  //   loadComponent: () => import('./components/prescription-view/prescription-view.component').then(m => m.PrescriptionViewComponent)
  // },
  {
    path: 'view/:prescriptionId',
    component: PrescriptionViewComponent
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