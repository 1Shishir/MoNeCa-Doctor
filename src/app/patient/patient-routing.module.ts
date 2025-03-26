import { NgModule } from '@angular/core';
import { RouterModule, Routes } from '@angular/router';

const routes: Routes = [
  { 
    path: '', 
    loadComponent: () => import('./component/patients/patients.component').then(m => m.PatientsComponent)
  },

  {
    path: 'add',
    loadComponent: () => import('./component/add-patient/add-patient.component').then(m => m.AddPatientComponent)
  },

];

@NgModule({
  imports: [RouterModule.forChild(routes)],
  exports: [RouterModule]
})
export class PatientRoutingModule { }
