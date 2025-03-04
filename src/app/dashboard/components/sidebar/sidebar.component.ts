import { Component, EventEmitter, Input, Output } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouterModule } from '@angular/router';

@Component({
  selector: 'app-sidebar',
  standalone: true,
  imports: [
    CommonModule,
    RouterModule
  ],
  templateUrl: './sidebar.component.html',
  styleUrl: './sidebar.component.css'
})
export class SidebarComponent {
  @Input() collapsed: boolean = false;
  @Output() toggle = new EventEmitter<void>();
  
  menuItems = [
    { label: 'Dashboard', icon: 'fa-solid fa-chart-line', link: '/dashboard', active: true },
    { label: 'Patients', icon: 'fa-solid fa-users', link: '/patients', active: false },
    { label: 'Prescriptions', icon: 'fa-solid fa-prescription-bottle-medical', link: '/dashboard/prescriptions', active: false },
    { label: 'Appointments', icon: 'fa-solid fa-calendar-check', link: '/dashboard/appointments', active: false },
    { label: 'Health Data', icon: 'fa-solid fa-chart-simple', link: '/dashboard/health-data', active: false },
    { label: 'Diet Plans', icon: 'fa-solid fa-apple-whole', link: '/dashboard/diet-plans', active: false },
    { label: 'Community', icon: 'fa-solid fa-comments', link: '/dashboard/community', active: false }
  ];
  
  footerItems = [
    { label: 'Settings', icon: 'fa-solid fa-gear', link: '/dashboard/settings' },
    { label: 'Logout', icon: 'fa-solid fa-right-from-bracket', link: '/auth/login' }
  ];
  
  toggleSidebar() {
    this.toggle.emit();
  }
}