import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormBuilder, FormGroup, ReactiveFormsModule, Validators } from '@angular/forms';
import { ActivatedRoute, Router } from '@angular/router';

@Component({
  selector: 'app-patient-signup',
  standalone: true,
  imports: [CommonModule, ReactiveFormsModule],
  templateUrl: './patient-signup.component.html',
  styleUrl: './patient-signup.component.css'
})
export class PatientSignupComponent implements OnInit {
  signupForm: FormGroup;
  token: string = '';
  isSubmitting: boolean = false;
  isSuccess: boolean = false;
  isError: boolean = false;
  errorMessage: string = '';
  
  // Mock patient data
  patientDetails = {
    name: 'Fatima Akter',
    email: 'fatima.akter@example.com',
    phoneNumber: '+8801712345678'
  };
  
  constructor(
    private fb: FormBuilder,
    private route: ActivatedRoute,
    private router: Router
  ) {
    this.signupForm = this.fb.group({
      password: ['', [
        Validators.required,
        Validators.minLength(8),
        Validators.pattern(/^(?=.*[a-z])(?=.*[A-Z])(?=.*\d)(?=.*[@$!%*?&])[A-Za-z\d@$!%*?&]{8,}$/)
      ]],
      confirmPassword: ['', Validators.required]
    }, { validators: this.passwordMatchValidator });
  }
  
  ngOnInit(): void {
    this.route.params.subscribe(params => {
      this.token = params['token'];
      
      // In a real application, you would validate the token
      // and fetch the patient details from your backend
      if (!this.token) {
        this.isError = true;
        this.errorMessage = 'Invalid or expired registration link. Please contact your healthcare provider.';
      }
    });
  }
  

// Helper methods for template
hasUpperCase(): boolean {
  const password = this.signupForm.get('password')?.value || '';
  return /[A-Z]/.test(password);
}

hasLowerCase(): boolean {
  const password = this.signupForm.get('password')?.value || '';
  return /[a-z]/.test(password);
}

hasNumber(): boolean {
  const password = this.signupForm.get('password')?.value || '';
  return /\d/.test(password);
}

hasSpecialChar(): boolean {
  const password = this.signupForm.get('password')?.value || '';
  return /[@$!%*?&]/.test(password);
}

hasMinLength(): boolean {
  const password = this.signupForm.get('password')?.value || '';
  return password.length >= 8;
}

  passwordMatchValidator(form: FormGroup) {
    const password = form.get('password');
    const confirmPassword = form.get('confirmPassword');
    
    if (password?.value !== confirmPassword?.value) {
      confirmPassword?.setErrors({ passwordMismatch: true });
    } else {
      if (confirmPassword?.hasError('passwordMismatch')) {
        const errors = { ...confirmPassword.errors };
        delete errors['passwordMismatch'];
        confirmPassword.setErrors(Object.keys(errors).length ? errors : null);
      }
    }
    
    return null;
  }
  
  onSubmit(): void {
    if (this.signupForm.valid) {
      this.isSubmitting = true;
      
      // In a real application, you would send the password to your backend
      // along with the token to create the patient account
      
      // Simulate an API call
      setTimeout(() => {
        this.isSubmitting = false;
        this.isSuccess = true;
        
        // Redirect to login page after 3 seconds
        setTimeout(() => {
          window.location.href = 'https://moneca-patient.example.com/login';
        }, 3000);
      }, 2000);
    } else {
      this.markFormGroupTouched(this.signupForm);
    }
  }
  
  markFormGroupTouched(formGroup: FormGroup): void {
    Object.values(formGroup.controls).forEach(control => {
      control.markAsTouched();
    });
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
        return { text: 'Strong', color: '#10b981' };
      case 3:
        return { text: 'Moderate', color: '#f59e0b' };
      default:
        return { text: 'Weak', color: '#ef4444' };
    }
  }
}