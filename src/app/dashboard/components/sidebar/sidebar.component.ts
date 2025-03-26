import { Component, EventEmitter, Input, Output, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouterModule, Router, NavigationEnd } from '@angular/router';
import { filter } from 'rxjs/operators';
import { AuthService } from '../../../auth/services/auth.service';

@Component({
  selector: 'app-sidebar',
  standalone: true,
  imports: [
    CommonModule,
    RouterModule
  ],
  templateUrl: './sidebar.component.html',
  styleUrls: ['./sidebar.component.css']
})
export class SidebarComponent implements OnInit {
  @Input() collapsed: boolean = false;
  @Output() toggle = new EventEmitter<void>();
  
  menuItems = [
    { label: 'Dashboard', icon: 'fa-solid fa-chart-line', link: '/dashboard', active: false },
    { label: 'Patients', icon: 'fa-solid fa-users', link: '/patients', active: false },
    { label: 'Prescriptions', icon: 'fa-solid fa-prescription-bottle-medical', link: '/prescription', active: false },
    { label: 'Appointments', icon: 'fa-solid fa-calendar-check', link: '/booking', active: false },
    { label: 'Health Data', icon: 'fa-solid fa-chart-simple', link: '/detailed-health-data', active: false },
    { label: 'Diet Plans', icon: 'fa-solid fa-apple-whole', link: '/dashboard/diet-plans', active: false },
    { label: 'Community', icon: 'fa-solid fa-comments', link: '/dashboard/community', active: false }
  ];
  
  // footerItems = [
  //   { label: 'Settings', icon: 'fa-solid fa-gear', link: '/dashboard/settings' }
  // ];
  
  constructor(
    private router: Router,
    private authService: AuthService
  ) {}
  
  ngOnInit(): void {
    // Set initial active state based on current URL
    this.setActiveItemByUrl(this.router.url);
    
    // Listen to route changes to update active state
    this.router.events.pipe(
      filter(event => event instanceof NavigationEnd)
    ).subscribe((event: any) => {
      this.setActiveItemByUrl(event.url);
    });
  }
  
  setActiveItemByUrl(url: string): void {
    // Reset all items to inactive
    this.menuItems.forEach(item => item.active = false);
    
    // Find and set the active item based on URL
    for (const item of this.menuItems) {
      // Check if the current URL starts with this item's link
      // This handles child routes as well
      if (url.startsWith(item.link)) {
        item.active = true;
        break;
      }
    }
  }
  
  toggleSidebar(): void {
    this.toggle.emit();
  }
  
  logout(): void {
    this.authService.logout().subscribe();
  }
}