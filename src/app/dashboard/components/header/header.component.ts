import { Component, Input } from '@angular/core';
import { CommonModule } from '@angular/common';
import { Router } from '@angular/router';
import { Location } from '@angular/common'; // Import Location for back navigation
import { AuthService } from '../../../auth/services/auth.service';

@Component({
  selector: 'app-header',
  standalone: true,
  imports: [CommonModule],
  templateUrl: './header.component.html',
  styleUrl: './header.component.css'
})
export class HeaderComponent {
  @Input({ required: true }) title!: string; // Make title required
  @Input() notificationCount: number = 0;
  @Input() doctorName: string = 'Doctor';
  @Input() doctorInitial: string = 'D';
  @Input() showBackButton: boolean = false; // New optional back button input

  constructor(
    private router: Router,
    private authService: AuthService,
    private location: Location // Inject Location service
  ) {}

  logout(): void {
    this.authService.logout().subscribe(() => {
      this.router.navigate(['/auth/login']);
    });
  }

  goBack(): void {
    this.location.back(); // Use Location service to navigate back
  }
}

// import { Component, Input } from '@angular/core';
// import { CommonModule } from '@angular/common';
// import { Router } from '@angular/router';
// import { AuthService } from '../../../auth/services/auth.service';


// @Component({
//   selector: 'app-header',
//   standalone: true,
//   imports: [CommonModule],
//   templateUrl: './header.component.html',
//   styleUrl: './header.component.css'
// })
// export class HeaderComponent {
//   @Input() title: string = 'Dashboard';
//   @Input() notificationCount: number = 0;
//   @Input() doctorName: string = 'Doctor';
//   @Input() doctorInitial: string = 'D';

//   constructor(
//     private router: Router,
//     private authService: AuthService
//   ) {}

//   navigateToProfile(): void {
//     this.router.navigate(['/profile']);
//   }

//   navigateToSettings(): void {
//     this.router.navigate(['/settings']);
//   }

//   logout(): void {
//     this.authService.logout().subscribe({
//       next: () => {
//         this.router.navigate(['/auth/login']);
//       },
//       error: (error: any) => {
//         console.error('Logout error:', error);
//       }
//     });
//   }
// }