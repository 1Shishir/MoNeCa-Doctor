import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule, ReactiveFormsModule } from '@angular/forms';
import { RouterModule } from '@angular/router';
import { Booking, BookingStats } from '../../../models/booking.model';

import { BookingListComponent } from '../booking-list/booking-list.component';
import { HeaderComponent } from '../../../dashboard/components/header/header.component';
import { SidebarComponent } from '../../../dashboard/components/sidebar/sidebar.component';

@Component({
  selector: 'app-booking-dashboard',
  standalone: true,
  imports: [
    CommonModule,
    FormsModule,
    ReactiveFormsModule,
    RouterModule,
    SidebarComponent,
    HeaderComponent
  ],
  templateUrl: './booking-dashboard.component.html',
  styleUrl: './booking-dashboard.component.css'
})
export class BookingDashboardComponent implements OnInit {
  sidebarCollapsed = false;
  selectedDate: string = new Date().toISOString().split('T')[0];
  nextAvailableSlot: string = '';
  
  // Mock data for today's bookings
  todaysBookings: Booking[] = [
    {
      id: 1,
      patientId: 1,
      patientName: 'Fatima Akter',
      patientPhone: '+8801712345678',
      patientProfile: 'assets/images/patients/patient1.jpg',
      doctorId: 'DR001',
      doctorName: 'Dr. Rafiq Ahmed',
      date: new Date().toISOString().split('T')[0],
      time: '09:30',
      serialNumber: 1,
      status: 'confirmed',
      type: 'regular-checkup',
      notes: 'Regular pregnancy checkup at 32 weeks',
      createdAt: new Date(Date.now() - 86400000).toISOString(),
      updatedAt: new Date().toISOString(),
      pregnancyWeek: 32
    },
    {
      id: 2,
      patientId: 2,
      patientName: 'Rabeya Khatun',
      patientPhone: '+8801712345679',
      patientProfile: 'assets/images/patients/patient2.jpg',
      doctorId: 'DR001',
      doctorName: 'Dr. Rafiq Ahmed',
      date: new Date().toISOString().split('T')[0],
      time: '10:00',
      serialNumber: 2,
      status: 'completed',
      type: 'ultrasound',
      notes: 'Ultrasound scheduled for 28 weeks',
      createdAt: new Date(Date.now() - 172800000).toISOString(),
      updatedAt: new Date().toISOString(),
      pregnancyWeek: 28
    },
    {
      id: 3,
      patientId: 3,
      patientName: 'Nasrin Sultana',
      patientPhone: '+8801712345680',
      patientProfile: 'assets/images/patients/patient3.jpg',
      doctorId: 'DR001',
      doctorName: 'Dr. Rafiq Ahmed',
      date: new Date().toISOString().split('T')[0],
      time: '10:30',
      serialNumber: 3,
      status: 'scheduled',
      type: 'follow-up',
      notes: 'Follow-up for blood pressure monitoring',
      createdAt: new Date(Date.now() - 259200000).toISOString(),
      updatedAt: new Date().toISOString(),
      pregnancyWeek: 20
    },
    {
      id: 4,
      patientId: 5,
      patientName: 'Ayesha Khan',
      patientPhone: '+8801712345681',
      patientProfile: 'assets/images/patients/patient5.jpg',
      doctorId: 'DR001',
      doctorName: 'Dr. Rafiq Ahmed',
      date: new Date().toISOString().split('T')[0],
      time: '11:00',
      serialNumber: 4,
      status: 'cancelled',
      type: 'regular-checkup',
      notes: 'Regular checkup at 36 weeks',
      createdAt: new Date(Date.now() - 345600000).toISOString(),
      updatedAt: new Date().toISOString(),
      pregnancyWeek: 36
    },
    {
      id: 5,
      patientId: 4,
      patientName: 'Taslima Begum',
      patientPhone: '+8801712345682',
      patientProfile: 'assets/images/patients/patient4.jpg',
      doctorId: 'DR001',
      doctorName: 'Dr. Rafiq Ahmed',
      date: new Date().toISOString().split('T')[0],
      time: '11:30',
      serialNumber: 5,
      status: 'absent',
      type: 'vaccination',
      notes: 'Scheduled for vaccination',
      createdAt: new Date(Date.now() - 432000000).toISOString(),
      updatedAt: new Date().toISOString(),
      pregnancyWeek: 16
    }
  ];
  
  // Mock booking stats
  bookingStats: BookingStats = {
    today: {
      total: 5,
      completed: 1,
      scheduled: 1,
      cancelled: 1,
      absent: 1
    },
    weekly: {
      total: 23,
      byDay: [
        { day: 'Monday', count: 4 },
        { day: 'Tuesday', count: 5 },
        { day: 'Wednesday', count: 5 },
        { day: 'Thursday', count: 4 },
        { day: 'Friday', count: 3 },
        { day: 'Saturday', count: 2 },
        { day: 'Sunday', count: 0 }
      ]
    }
  };
  
  constructor() {}
  
  ngOnInit(): void {
    this.calculateNextAvailableSlot();
  }
  
  toggleSidebar(): void {
    this.sidebarCollapsed = !this.sidebarCollapsed;
  }
  
  calculateNextAvailableSlot(): void {
    // In a real application, this would come from a service
    // For demo purposes, we'll set it to the next half hour from now
    const now = new Date();
    const hour = now.getHours();
    const minutes = now.getMinutes() >= 30 ? 0 : 30;
    const nextHour = minutes === 0 ? hour + 1 : hour;
    
    this.nextAvailableSlot = `${String(nextHour).padStart(2, '0')}:${String(minutes).padStart(2, '0')}`;
  }
  
  changeDate(event: Event): void {
    this.selectedDate = (event.target as HTMLInputElement).value;
    // In a real app, you would fetch bookings for the selected date
    console.log(`Fetching bookings for: ${this.selectedDate}`);
  }
  
  updateBookingStatus(bookingId: number, newStatus: 'completed' | 'cancelled' | 'absent'): void {
    // Find and update the booking status
    const booking = this.todaysBookings.find(b => b.id === bookingId);
    if (booking) {
      booking.status = newStatus;
      booking.updatedAt = new Date().toISOString();
      
      // In a real app, you would call a service to update the booking
      console.log(`Updated booking ${bookingId} status to ${newStatus}`);
    }
  }
  
  getStatusClass(status: string): string {
    switch (status) {
      case 'scheduled':
        return 'status-scheduled';
      case 'confirmed':
        return 'status-confirmed';
      case 'completed':
        return 'status-completed';
      case 'cancelled':
        return 'status-cancelled';
      case 'absent':
        return 'status-absent';
      case 'rescheduled':
        return 'status-rescheduled';
      default:
        return '';
    }
  }
  
  getStatusCount(status: 'scheduled' | 'confirmed' | 'completed' | 'cancelled' | 'absent'): number {
    return this.todaysBookings.filter(booking => booking.status === status).length;
  }
  
  getCanceledPercent(): number {
    const totalBookings = this.bookingStats.today.total;
    if (totalBookings === 0) return 0;
    return (this.bookingStats.today.cancelled / totalBookings) * 100;
  }
  
  getFormattedTime(time: string): string {
    // Convert 24-hour format to 12-hour format with AM/PM
    const [hours, minutes] = time.split(':').map(Number);
    const period = hours >= 12 ? 'PM' : 'AM';
    const formattedHours = hours % 12 || 12;
    return `${formattedHours}:${String(minutes).padStart(2, '0')} ${period}`;
  }
}