import { NgModule } from '@angular/core';
import { RouterModule, Routes } from '@angular/router';

// Import routes will load standalone components
const routes: Routes = [
  { 
    path: 'login', 
    loadComponent: () => import('./components/login/login.component').then(m => m.LoginComponent)
  },
  { 
    path: 'signup', 
    loadComponent: () => import('./components/signup/signup.component').then(m => m.SignupComponent)
  },
  { 
    path: 'forgot-password', 
    loadComponent: () => import('./components/forgot-password/forgot-password.component').then(m => m.ForgotPasswordComponent)
  },
  { 
    path: '', 
    redirectTo: 'login', 
    pathMatch: 'full' 
  }
];

@NgModule({
  imports: [RouterModule.forChild(routes)],
  exports: [RouterModule]
})
export class AuthRoutingModule { }