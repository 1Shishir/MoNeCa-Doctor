import { Component, OnInit } from '@angular/core';
import { FormBuilder, FormGroup, ReactiveFormsModule, Validators } from '@angular/forms';
import { Router, RouterLink, ActivatedRoute } from '@angular/router';
import { AuthService } from '../../services/auth.service';
import { CommonModule } from '@angular/common';

@Component({
  selector: 'app-login',
  standalone: true,
  imports: [
    CommonModule,
    ReactiveFormsModule,
    RouterLink
  ],
  templateUrl: './login.component.html',
  styleUrl: './login.component.css'
})
export class LoginComponent implements OnInit {
  loginForm: FormGroup;
  isLoading = false;
  errorMessage = '';
  redirectUrl: string | null = null;

  constructor(
    private fb: FormBuilder,
    private authService: AuthService,
    private router: Router,
    private route: ActivatedRoute
  ) {
    this.loginForm = this.fb.group({
      email: ['', [Validators.required, Validators.email]],
      password: ['', [Validators.required, Validators.minLength(6)]],
      rememberMe: [false]
    });
  }

  ngOnInit(): void {
    // Check if we should redirect the user
    this.route.queryParams.subscribe(params => {
      this.redirectUrl = params['redirectUrl'] || '/dashboard';
    });
    
    // If already authenticated, redirect
    if (this.authService.isAuthenticated()) {
      this.router.navigateByUrl(this.redirectUrl || '/dashboard');
    }
  }

  onSubmit(): void {
    if (this.loginForm.valid) {
      this.isLoading = true;
      this.errorMessage = '';
      
      const { email, password } = this.loginForm.value;
      
      this.authService.login(email, password).subscribe({
        next: (doctorData) => {
          // Navigation to the intended URL or dashboard
          this.router.navigateByUrl(this.redirectUrl || '/dashboard');
        },
        error: (error) => {
          this.isLoading = false;
          this.errorMessage = this.getErrorMessage(error.code);
        }
      });
    }
  }

  private getErrorMessage(errorCode: string): string {
    switch (errorCode) {
      case 'auth/user-not-found':
        return 'No account found with this email.';
      case 'auth/wrong-password':
        return 'Invalid password.';
      case 'auth/user-disabled':
        return 'This account has been disabled.';
      default:
        return 'An error occurred during login.';
    }
  }
}

// import { Component, OnInit } from '@angular/core';
// import { FormBuilder, FormGroup, ReactiveFormsModule, Validators } from '@angular/forms';
// import { Router, RouterLink } from '@angular/router';
// import { AuthService } from '../../services/auth.service';
// import { CommonModule } from '@angular/common';

// @Component({
//   selector: 'app-login',
//   standalone: true,
//   imports: [
//     CommonModule,
//     ReactiveFormsModule,
//     RouterLink,
    
//   ],
//   templateUrl: './login.component.html',
//   styleUrl: './login.component.css'
// })
// export class LoginComponent implements OnInit {
//   loginForm: FormGroup;
//   isLoading = false;
//   errorMessage = '';

//   constructor(
//     private fb: FormBuilder,
//     private authService: AuthService,
//     private router: Router
//   ) {
//     this.loginForm = this.fb.group({
//       email: ['', [Validators.required, Validators.email]],
//       password: ['', [Validators.required, Validators.minLength(6)]]
//     });
//   }

//   ngOnInit(): void {}

//   onSubmit(): void {
//     if (this.loginForm.valid) {
//       this.isLoading = true;
//       this.errorMessage = '';
      
//       const { email, password } = this.loginForm.value;
      
//       this.authService.login(email, password).subscribe({
//         next: () => {
//           this.router.navigate(['/dashboard']);
//         },
//         error: (error) => {
//           this.isLoading = false;
//           this.errorMessage = this.getErrorMessage(error.code);
//         }
//       });
//     }
//   }

//   private getErrorMessage(errorCode: string): string {
//     switch (errorCode) {
//       case 'auth/user-not-found':
//         return 'No account found with this email.';
//       case 'auth/wrong-password':
//         return 'Invalid password.';
//       case 'auth/user-disabled':
//         return 'This account has been disabled.';
//       default:
//         return 'An error occurred during login.';
//     }
//   }
// }