import { getStorage, provideStorage } from '@angular/fire/storage';
import { Routes } from '@angular/router';
import { AuthGuard } from './auth/services/auth-guard.service';

export const routes: Routes = [
  {
    path: 'auth',
    loadChildren: () => import('./auth/auth.module').then(m => m.AuthModule)
  },
  {
    path: 'patient-signup',
    loadComponent: () => import('./patient-signup/patient-signup.component').then(m => m.PatientSignupComponent)
  },
  {
    path: 'dashboard',
    loadChildren: () => import('./dashboard/dashboard.module').then(m => m.DashboardModule),
    canActivate: [AuthGuard]
  },
  // Apply AuthGuard to all these routes
  {
    path: 'patients',
    loadChildren: () => import('./patient/patient.module').then(m => m.PatientModule),
    canActivate: [AuthGuard]
  },
  {
    path: 'patient-details',
    loadChildren: () => import('./patient-details/patient-details.module').then(m => m.PatientDetailsModule),
    canActivate: [AuthGuard]
  },
  {
    path: 'detailed-health-data',
    loadChildren: () => import('./detailed-health-data/detailed-health-data.module').then(m => m.DetailedHealthDataModule),
    canActivate: [AuthGuard]
  },
  {
    path: 'booking',
    loadChildren: () => import('./booking/booking.module').then(m => m.BookingModule),
    canActivate: [AuthGuard]
  },
  {
    path: 'prescription',
    loadChildren: () => import('./prescription/prescription.module').then(m => m.PrescriptionModule),
    canActivate: [AuthGuard],
    providers: [
      provideStorage(() => getStorage())
    ]
  },
  {
    path: 'admin/upload',
    loadComponent: () => import('./additional/firebase-uploader/firebase-uploader.component').then(m => m.FirebaseUploaderComponent),
    canActivate: [AuthGuard] // Optionally protect with AuthGuard
  },
  {
    path: '',
    redirectTo: '/auth/login',
    pathMatch: 'full'
  }
];
// import { getStorage, provideStorage } from '@angular/fire/storage';
// import { Routes } from '@angular/router';

// export const routes: Routes = [
//   {
//     path: 'auth',
//     loadChildren: () => import('./auth/auth.module').then(m => m.AuthModule)
//   },
//   {
//     path: 'patient-signup',
//     loadComponent: () => import('./patient-signup/patient-signup.component').then(m => m.PatientSignupComponent)
//   },

//   {
//     path: 'dashboard',
//     loadChildren: () => import('./dashboard/dashboard.module').then(m => m.DashboardModule)
//   },
//   {
//     path: 'patients',
//     loadChildren: () => import('./patient/patient.module').then(m => m.PatientModule),

//   },
//   {
//     path: 'patient-details',
//     loadChildren: () => import('./patient-details/patient-details.module').then(m => m.PatientDetailsModule)
//   },
//   {
//     path: 'detailed-health-data',
//     loadChildren: () => import('./detailed-health-data/detailed-health-data.module').then(m => m.DetailedHealthDataModule)
//   },
//   {
//     path: 'booking',
//     loadChildren: () => import('./booking/booking.module').then(m => m.BookingModule)
//   },
//   {
//     path: 'prescription',
//     loadChildren: () => import('./prescription/prescription.module').then(m => m.PrescriptionModule),
//     providers: [
//       provideStorage(() => getStorage())
//     ]
  
//   },
//   {
//     path: '',
//     redirectTo: '/auth/login',
//     pathMatch: 'full'
//   }
// ];