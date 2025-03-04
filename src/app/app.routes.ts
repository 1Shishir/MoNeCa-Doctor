import { Routes } from '@angular/router';

export const routes: Routes = [
  {
    path: 'auth',
    loadChildren: () => import('./auth/auth.module').then(m => m.AuthModule)
  },
  {
    path: 'dashboard',
    loadChildren: () => import('./dashboard/dashboard.module').then(m => m.DashboardModule)
  },
  {
    path: 'patients',
    loadChildren: () => import('./patient/patient.module').then(m => m.PatientModule),

  },
  {
    path: 'patient-details',
    loadChildren: () => import('./patient-details/patient-details.module').then(m => m.PatientDetailsModule)
  },
  {
    path: 'detailed-health-data',
    loadChildren: () => import('./detailed-health-data/detailed-health-data.module').then(m => m.DetailedHealthDataModule)
  },
  {
    path: '',
    redirectTo: '/auth/login',
    pathMatch: 'full'
  }
];