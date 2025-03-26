import { Component, OnInit } from '@angular/core';
import { FormBuilder, FormGroup, ReactiveFormsModule, Validators } from '@angular/forms';
import { Router, RouterLink } from '@angular/router';
import { AuthService } from '../../services/auth.service';
import { SignupData } from '../../../models/auth.model';
import { CommonModule } from '@angular/common';
import { ButtonComponent } from '../../../shared/components/button/button.component';
import { PhoneNumberDirective } from '../../../shared/directives/phone-number.directive';

@Component({
    selector: 'app-signup',
    standalone: true,
    imports: [
      CommonModule,
      ReactiveFormsModule,
      RouterLink,
      ButtonComponent,
      PhoneNumberDirective
    ],
    templateUrl: './signup.component.html',
    styleUrls: ['./signup.component.css'] 
})
export class SignupComponent implements OnInit {
  signupForm: FormGroup;
  isLoading = false;
  successMessage = '';
  errorMessage = '';
  specializations = [
    'Obstetrics and Gynecology',
    'Maternal-Fetal Medicine',
    'Family Medicine',
    'General Practice',
    'Midwifery',
    'Other'
  ];
  redirectTimer: any;

  constructor(
    private fb: FormBuilder,
    private authService: AuthService,
    private router: Router
  ) {
    this.signupForm = this.fb.group({
      email: ['', [Validators.required, Validators.email]],
      password: ['', [
        Validators.required, 
        Validators.minLength(8),
        Validators.pattern(/^(?=.*[a-z])(?=.*[A-Z])(?=.*\d)(?=.*[@$!%*?&])[A-Za-z\d@$!%*?&]{8,}$/)
      ]],
      confirmPassword: ['', [Validators.required]],
      fullName: ['', [Validators.required, Validators.minLength(3)]],
      specialization: ['', [Validators.required]],
      licenseNumber: ['', [
        Validators.required, 
        Validators.pattern(/^[A-Z0-9]{5,15}$/)
      ]],
      phoneNumber: ['', [
        Validators.required,
        Validators.pattern(/^(\+?880|0)?1[3456789][0-9]{8}$/)
      ]],
      hospital: ['', [Validators.required]],
      termsAccepted: [false, [Validators.requiredTrue]]
    }, {
      validators: this.passwordMatchValidator
    });
  }

  ngOnInit(): void {}

  ngOnDestroy(): void {
    if (this.redirectTimer) {
      clearTimeout(this.redirectTimer);
    }
  }

  private passwordMatchValidator(form: FormGroup) {
    const password = form.get('password');
    const confirmPassword = form.get('confirmPassword');

    if (password?.value !== confirmPassword?.value) {
      confirmPassword?.setErrors({ passwordMismatch: true });
    } else {
      if (confirmPassword?.hasError('passwordMismatch')) {
        const errors = {...confirmPassword.errors};
        delete errors['passwordMismatch'];
        confirmPassword.setErrors(Object.keys(errors).length ? errors : null);
      }
    }
  }

  onSubmit(): void {
    if (this.signupForm.valid) {
      this.isLoading = true;
      this.errorMessage = '';
      this.successMessage = '';

      const formData = this.signupForm.value;
      const signupData: SignupData = {
        email: formData.email,
        password: formData.password,
        fullName: formData.fullName,
        specialization: formData.specialization,
        licenseNumber: formData.licenseNumber,
        phoneNumber: formData.phoneNumber,
        hospital: formData.hospital
      };

      this.authService.signup(signupData).subscribe({
        next: () => {
          this.isLoading = false;
          this.successMessage = 'Registration successful! Redirecting to login...';
          this.signupForm.reset();
          // Redirect to login after 3 seconds
          this.redirectTimer = setTimeout(() => {
            this.router.navigate(['/auth/login']);
          }, 3000);
        },
        error: (error) => {
          this.isLoading = false;
          this.errorMessage = error.code ? this.getErrorMessage(error.code) : error.message;
          console.error('Signup error:', error);
        },
        complete: () => {
          this.isLoading = false;
        }
      });
    } else {
      this.markFormGroupTouched(this.signupForm);
    }
  }

  private markFormGroupTouched(formGroup: FormGroup) {
    Object.values(formGroup.controls).forEach(control => {
      control.markAsTouched();
      if (control instanceof FormGroup) {
        this.markFormGroupTouched(control);
      }
    });
  }

  private getErrorMessage(errorCode: string): string {
    switch (errorCode) {
      case 'auth/email-already-in-use':
        return 'An account with this email already exists.';
      case 'auth/invalid-email':
        return 'Please enter a valid email address.';
      case 'auth/operation-not-allowed':
        return 'Email/password accounts are not enabled. Please contact support.';
      case 'auth/weak-password':
        return 'Please choose a stronger password.';
      default:
        return 'An error occurred during registration. Please try again.';
    }
  }

  getPasswordStrength(): { text: string; color: string } {
    const password = this.signupForm.get('password')?.value;
    if (!password) {
      return { text: '', color: '' };
    }

    const hasLower = /[a-z]/.test(password);
    const hasUpper = /[A-Z]/.test(password);
    const hasNumber = /\d/.test(password);
    const hasSpecial = /[@$!%*?&]/.test(password);
    const length = password.length;

    const strength = [hasLower, hasUpper, hasNumber, hasSpecial].filter(Boolean).length;

    if (length < 8) {
      return { text: 'Too Short', color: '#ef4444' };
    }

    switch (strength) {
      case 4:
        return { text: 'Strong', color: '#059669' };
      case 3:
        return { text: 'Moderate', color: '#d97706' };
      default:
        return { text: 'Weak', color: '#ef4444' };
    }
  }
}