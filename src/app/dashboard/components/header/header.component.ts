// import { Component, Input } from '@angular/core';
// import { CommonModule } from '@angular/common';
// import { Router } from '@angular/router';
// import { Location } from '@angular/common'; // Import Location for back navigation
// import { AuthService } from '../../../auth/services/auth.service';

// @Component({
//   selector: 'app-header',
//   standalone: true,
//   imports: [CommonModule],
//   templateUrl: './header.component.html',
//   styleUrl: './header.component.css'
// })
// export class HeaderComponent {
//   @Input({ required: true }) title!: string; // Make title required
//   @Input() notificationCount: number = 0;
//   @Input() doctorName: string = 'Doctor';
//   @Input() doctorInitial: string = 'D';
//   @Input() showBackButton: boolean = false; // New optional back button input

//   constructor(
//     private router: Router,
//     private authService: AuthService,
//     private location: Location // Inject Location service
//   ) {}

//   logout(): void {
//     this.authService.logout().subscribe(() => {
//       this.router.navigate(['/auth/login']);
//     });
//   }

//   goBack(): void {
//     this.location.back(); // Use Location service to navigate back
//   }
// }

import { Component, Input, OnInit, Inject, PLATFORM_ID } from '@angular/core';
import { CommonModule, isPlatformBrowser, Location } from '@angular/common';
import { Router } from '@angular/router';

import { Doctor } from '../../../models/auth.model';
import { AuthService } from '../../../auth/services/auth.service';

@Component({
  selector: 'app-header',
  standalone: true,
  imports: [CommonModule],
  templateUrl: './header.component.html',
  styleUrl: './header.component.css'
})
export class HeaderComponent implements OnInit {
  @Input({ required: true }) title!: string;
  @Input() notificationCount: number = 0;
  @Input() showBackButton: boolean = false;
  
  currentDoctor: Doctor | null = null;
  dummyDoctor = {
    fullName: 'Doctor',
    uuid: '',
    email: '',
    specialization: '',
    licenseNumber: '',
    phoneNumber: '',
    createdAt: new Date(),
    updatedAt: new Date()
  };

  constructor(
    private router: Router,
    private authService: AuthService,
    private location: Location,
    @Inject(PLATFORM_ID) private platformId: Object
  ) {}

  ngOnInit(): void {
    if (isPlatformBrowser(this.platformId)) {
      this.authService.currentDoctor$.subscribe(doctor => {
        if (doctor) {
          this.currentDoctor = doctor;
          console.log("Real doctor data loaded:", doctor.fullName);
        } else {
          this.currentDoctor = this.dummyDoctor;
          console.log("Using dummy doctor");
        }
      });
    } else {
      this.currentDoctor = this.dummyDoctor;
    }
  }

  get doctorName(): string {
    return this.currentDoctor?.fullName || 'Doctor';
  }

  get doctorInitial(): string {
    return this.currentDoctor?.fullName?.charAt(0) || 'D';
  }

  logout(): void {
    this.authService.logout().subscribe({
      next: () => {
        this.router.navigate(['/auth/login']);
      },
      error: (error) => {
        console.error('Logout error:', error);
      }
    });
  }

  goBack(): void {
    this.location.back();
  }
}