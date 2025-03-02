import { Component, Input } from '@angular/core';
import { CommonModule } from '@angular/common';

@Component({
  selector: 'app-header',
  standalone: true,
  imports: [CommonModule],
  templateUrl: './header.component.html',
  styleUrl: './header.component.css'
})
export class HeaderComponent {
  @Input() title: string = 'Dashboard';
  @Input() notificationCount: number = 0;
  @Input() doctorName: string = 'Doctor';
  @Input() doctorInitial: string = 'D';
}