import { ChangeDetectorRef, Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormBuilder, FormGroup, FormsModule, ReactiveFormsModule } from '@angular/forms';
import { Router, RouterModule } from '@angular/router';
import { Booking, BookingStats } from '../../../models/booking.model';

import { BookingListComponent } from '../booking-list/booking-list.component';
import { HeaderComponent } from '../../../dashboard/components/header/header.component';
import { SidebarComponent } from '../../../dashboard/components/sidebar/sidebar.component';
import { BookingService } from '../../service/booking.service';

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

    // Booking related properties
    allBookings: Booking[] = [];
    filteredBookings: Booking[] = [];
    displayedBookings: Booking[] = [];
    
    // Pagination
    currentPage = 1;
    itemsPerPage = 10;
    totalItems = 0;
  

  
  
  // Mock data for today's bookings
  todaysBookings: Booking[] = [
    {
      id: "1",
      patientId: "1",
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
      id: "2",
      patientId: "2",
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
      id: "3",
      patientId: "3",
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
      id: "4",
      patientId: "5",
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
      id: "5",
      patientId: "4",
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
  
  constructor(
    
    private fb: FormBuilder,
    private bookingService: BookingService,
    private cdr: ChangeDetectorRef,
    private router: Router

  ) {}
  
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
  
  updateBookingStatus(bookingId: string, newStatus: 'completed' | 'cancelled' | 'absent'): void {
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
  onNewBtnClick() {
        this.router.navigate(['/booking/add']);
      }
    
      viewAllClick(){
        this.router.navigate(['/booking/list']);
      }
    
      scheduleClicked(){
        this.router.navigate(['/booking/schedule']);
      }
}


// import { Component, OnInit, OnDestroy } from '@angular/core';
// import { Router } from '@angular/router';
// import { Subscription, combineLatest } from 'rxjs';
// import { map, take } from 'rxjs/operators';
// import { Booking, BookingStats, BookingStatus } from '../../../models/booking.model';
// import { BookingService } from '../../service/booking.service';


// @Component({
//   selector: 'app-booking-dashboard',
//   templateUrl: './booking-dashboard.component.html',
//   styleUrl: './booking-dashboard.component.scss'
// })
// export class BookingDashboardComponent implements OnInit, OnDestroy {
//   // Sidebar state
//   sidebarCollapsed = false;
  
//   // Date selection
//   selectedDate: string = new Date().toISOString().split('T')[0];
  
//   // Booking data
//   todaysBookings: Booking[] = [];
//   bookingStats: BookingStats = {
//     today: { total: 0, completed: 0, scheduled: 0, cancelled: 0, absent: 0 },
//     weekly: { 
//       total: 0, 
//       byDay: [
//         { day: 'Sunday', count: 0 },
//         { day: 'Monday', count: 0 },
//         { day: 'Tuesday', count: 0 },
//         { day: 'Wednesday', count: 0 },
//         { day: 'Thursday', count: 0 },
//         { day: 'Friday', count: 0 },
//         { day: 'Saturday', count: 0 }
//       ]
//     }
//   };
//   nextAvailableSlot: string | null = null;
  
//   // Subscriptions for cleanup
//   private subscriptions: Subscription[] = [];

//   constructor(
//     private bookingService: BookingService,
//     private router: Router,
//   ) {}

//   ngOnInit(): void {
//     // Initial data load
//     this.bookingService.refreshAllData();
    
//     // Subscribe to bookings for today
//     const bookingsSub = this.bookingService.getTodayAppointments()
//       .subscribe(bookings => {
//         this.todaysBookings = this.sortBookingsByTime(bookings);
//         this.updateStatCounts();
//       });
    
//     // Subscribe to booking stats
//     const statsSub = this.bookingService.getBookingStats()
//       .subscribe(stats => {
//         this.bookingStats = stats;
//       });
    
//     // Get next available slot
//     this.loadNextAvailableSlot();
    
//     // Add subscriptions for cleanup
//     this.subscriptions.push(bookingsSub, statsSub);
//   }

//   ngOnDestroy(): void {
//     // Clean up subscriptions
//     this.subscriptions.forEach(sub => sub.unsubscribe());
//   }

//   /**
//    * Toggle sidebar collapsed state
//    */
//   toggleSidebar(): void {
//     this.sidebarCollapsed = !this.sidebarCollapsed;
//   }

//   /**
//    * Change selected date and reload data
//    */
//   changeDate(event: Event): void {
//     const input = event.target as HTMLInputElement;
//     this.selectedDate = input.value;
    
//     // Load appointments for the selected date
//     this.bookingService.getAppointments({
//       startDate: this.selectedDate,
//       endDate: this.selectedDate
//     }).pipe(take(1)).subscribe(bookings => {
//       this.todaysBookings = this.sortBookingsByTime(bookings);
//     });
//   }

//   /**
//    * Format time for display
//    */
//   getFormattedTime(time: string | null): string {
//     if (!time) return 'No slots available';
//     return this.formatTime(time);
//   }

//   /**
//    * Get CSS class based on booking status
//    */
//   getStatusClass(status: BookingStatus): string {
//     return status.toLowerCase();
//   }

//   /**
//    * Get count of bookings with a specific status
//    */
//   getStatusCount(status: BookingStatus): number {
//     return this.todaysBookings.filter(booking => booking.status === status).length;
//   }

//   /**
//    * Sort bookings by time
//    */
//   private sortBookingsByTime(bookings: Booking[]): Booking[] {
//     return [...bookings].sort((a, b) => {
//       if (a.time < b.time) return -1;
//       if (a.time > b.time) return 1;
//       return 0;
//     });
//   }

//   /**
//    * Update appointment status
//    */
//   updateBookingStatus(bookingId: string, newStatus: BookingStatus): void {
//     this.bookingService.updateAppointmentStatus(bookingId, newStatus)
//       .pipe(take(1))
//       .subscribe({
//         next: () => {
//           // Update the local booking status
//           const booking = this.todaysBookings.find(b => b.id === bookingId);
//           if (booking) {
//             booking.status = newStatus;
//             this.updateStatCounts();
//           }
//         },
//         error: (error) => {
//           console.error('Error updating booking status:', error);
//           // Show notification to user (using your app's notification system)
//         }
//       });
//   }

//   /**
//    * Update stat counts based on bookings
//    */
//   private updateStatCounts(): void {
//     // Calculate stats for today's bookings
//     const completed = this.todaysBookings.filter(b => b.status === 'completed').length;
//     const scheduled = this.todaysBookings.filter(b => b.status === 'scheduled').length;
//     const confirmed = this.todaysBookings.filter(b => b.status === 'confirmed').length;
//     const cancelled = this.todaysBookings.filter(b => b.status === 'cancelled').length;
//     const absent = this.todaysBookings.filter(b => b.status === 'absent').length;
    
//     // Update today's stats (we'll keep the weekly stats as they come from the service)
//     this.bookingStats = {
//       ...this.bookingStats,
//       today: {
//         total: this.todaysBookings.length,
//         completed,
//         scheduled: scheduled + confirmed, // Combined for UI display
//         cancelled,
//         absent
//       }
//     };
//   }

//   /**
//    * Load the next available appointment slot
//    */
//   loadNextAvailableSlot(): void {
//     this.bookingService.getNextAvailableSlot()
//       .pipe(take(1))
//       .subscribe(result => {
//         this.nextAvailableSlot = result ? result.slot.startTime : null;
//       });
//   }


//   formatTime(time: string): string {
//     const [hours, minutes] = time.split(':').map(Number);
//     const period = hours >= 12 ? 'PM' : 'AM';
//     const formattedHours = hours % 12 || 12;
//     return `${formattedHours}:${String(minutes).padStart(2, '0')} ${period}`;
//   }
//   onNewBtnClick(): void {
//     this.router.navigate(['/bookings/add']);
//   }
//   scheduleClicked(): void {
//     this.router.navigate(['/bookings/schedule']);
//   }
//   viewAllClick(): void {
//     this.router.navigate(['/bookings/list']);
//   }
// }
