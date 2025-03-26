import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule, ReactiveFormsModule, FormBuilder, FormGroup } from '@angular/forms';
import { RouterModule } from '@angular/router';
import { HeaderComponent } from '../../../dashboard/components/header/header.component';
import { SidebarComponent } from '../../../dashboard/components/sidebar/sidebar.component';
import { BookingStatus, AppointmentType, Booking, BookingFilters } from '../../../models/booking.model';

@Component({
  selector: 'app-booking-list',
  standalone: true,
  imports: [
    CommonModule,
    FormsModule,
    ReactiveFormsModule,
    RouterModule,
    SidebarComponent,
    HeaderComponent
  ],
  templateUrl: './booking-list.component.html',
  styleUrl: './booking-list.component.css'
})
export class BookingListComponent implements OnInit {
  sidebarCollapsed = false;
  filterForm: FormGroup;
  
  // Pagination
  currentPage = 1;
  itemsPerPage = 10;
  totalItems = 0;
  
  // Sort
  sortField = 'date';
  sortDirection = 'desc';
  
  // Filters data
  statusOptions: { value: BookingStatus, label: string }[] = [
    { value: 'scheduled', label: 'Scheduled' },
    { value: 'confirmed', label: 'Confirmed' },
    { value: 'completed', label: 'Completed' },
    { value: 'cancelled', label: 'Cancelled' },
    { value: 'absent', label: 'Absent' },
    { value: 'rescheduled', label: 'Rescheduled' }
  ];
  
  typeOptions: { value: AppointmentType, label: string }[] = [
    { value: 'regular-checkup', label: 'Regular Checkup' },
    { value: 'follow-up', label: 'Follow-up' },
    { value: 'ultrasound', label: 'Ultrasound' },
    { value: 'emergency', label: 'Emergency' },
    { value: 'vaccination', label: 'Vaccination' },
    { value: 'lab-report', label: 'Lab Report Review' },
    { value: 'other', label: 'Other' }
  ];
  
  // Mock bookings data
  allBookings: Booking[] = [
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
    },
    // Add 5 more bookings for tomorrow
    {
      id: 6,
      patientId: 1,
      patientName: 'Fatima Akter',
      patientPhone: '+8801712345678',
      patientProfile: 'assets/images/patients/patient1.jpg',
      doctorId: 'DR001',
      doctorName: 'Dr. Rafiq Ahmed',
      date: this.getTomorrowDate(),
      time: '09:30',
      serialNumber: 1,
      status: 'confirmed',
      type: 'follow-up',
      notes: 'Follow-up checkup',
      createdAt: new Date(Date.now() - 518400000).toISOString(),
      updatedAt: new Date().toISOString(),
      pregnancyWeek: 33
    },
    {
      id: 7,
      patientId: 3,
      patientName: 'Nasrin Sultana',
      patientPhone: '+8801712345680',
      patientProfile: 'assets/images/patients/patient3.jpg',
      doctorId: 'DR001',
      doctorName: 'Dr. Rafiq Ahmed',
      date: this.getTomorrowDate(),
      time: '10:00',
      serialNumber: 2,
      status: 'confirmed',
      type: 'ultrasound',
      notes: 'Ultrasound scan',
      createdAt: new Date(Date.now() - 604800000).toISOString(),
      updatedAt: new Date().toISOString(),
      pregnancyWeek: 21
    },
    // Add past appointments
    {
      id: 8,
      patientId: 2,
      patientName: 'Rabeya Khatun',
      patientPhone: '+8801712345679',
      patientProfile: 'assets/images/patients/patient2.jpg',
      doctorId: 'DR001',
      doctorName: 'Dr. Rafiq Ahmed',
      date: this.getLastWeekDate(7),
      time: '10:30',
      serialNumber: 3,
      status: 'completed',
      type: 'regular-checkup',
      notes: 'Regular checkup at 27 weeks',
      createdAt: new Date(Date.now() - 1209600000).toISOString(),
      updatedAt: new Date().toISOString(),
      pregnancyWeek: 27
    },
    {
      id: 9,
      patientId: 5,
      patientName: 'Ayesha Khan',
      patientPhone: '+8801712345681',
      patientProfile: 'assets/images/patients/patient5.jpg',
      doctorId: 'DR001',
      doctorName: 'Dr. Rafiq Ahmed',
      date: this.getLastWeekDate(10),
      time: '11:00',
      serialNumber: 4,
      status: 'completed',
      type: 'lab-report',
      notes: 'Lab report review',
      createdAt: new Date(Date.now() - 1382400000).toISOString(),
      updatedAt: new Date().toISOString(),
      pregnancyWeek: 35
    },
    {
      id: 10,
      patientId: 4,
      patientName: 'Taslima Begum',
      patientPhone: '+8801712345682',
      patientProfile: 'assets/images/patients/patient4.jpg',
      doctorId: 'DR001',
      doctorName: 'Dr. Rafiq Ahmed',
      date: this.getLastWeekDate(14),
      time: '14:30',
      serialNumber: 7,
      status: 'rescheduled',
      type: 'emergency',
      notes: 'Emergency situation - blood pressure',
      createdAt: new Date(Date.now() - 1728000000).toISOString(),
      updatedAt: new Date().toISOString(),
      pregnancyWeek: 15
    }
  ];
  
  // Filtered bookings
  filteredBookings: Booking[] = [];
  displayedBookings: Booking[] = [];
  
  constructor(private fb: FormBuilder) {
    const today = new Date();
    const oneMonthAgo = new Date();
    oneMonthAgo.setMonth(today.getMonth() - 1);
    
    this.filterForm = this.fb.group({
      startDate: [oneMonthAgo.toISOString().split('T')[0]],
      endDate: [today.toISOString().split('T')[0]],
      status: [''],
      type: [''],
      searchTerm: ['']
    });
  }
  
  ngOnInit(): void {
    this.applyFilters();
    
    // Listen for filter changes
    this.filterForm.valueChanges.subscribe(() => {
      this.currentPage = 1; // Reset to first page when filters change
      this.applyFilters();
    });
  }
  
  applyFilters(): void {
    const filters: BookingFilters = this.filterForm.value;
    
    // Filter bookings based on form values
    this.filteredBookings = this.allBookings.filter(booking => {
      // Date range filter
      const bookingDate = new Date(booking.date);
      const startDate = filters.startDate ? new Date(filters.startDate) : null;
      const endDate = filters.endDate ? new Date(filters.endDate) : null;
      
      if (startDate && bookingDate < startDate) return false;
      if (endDate) {
        // Set end date to end of day
        endDate.setHours(23, 59, 59);
        if (bookingDate > endDate) return false;
      }
      
      // Status filter
      if (filters.status && booking.status !== filters.status) return false;
      
      // Type filter
      if (filters.type && booking.type !== filters.type) return false;
      
      // Search term filter
      if (filters.searchTerm) {
        const searchTerm = filters.searchTerm.toLowerCase();
        const patientNameMatch = booking.patientName.toLowerCase().includes(searchTerm);
        const patientPhoneMatch = booking.patientPhone.includes(searchTerm);
        const serialMatch = booking.serialNumber.toString() === searchTerm;
        
        if (!patientNameMatch && !patientPhoneMatch && !serialMatch) return false;
      }
      
      return true;
    });
    
    // Sort filtered bookings
    this.sortBookings();
    
    // Update total items and paginate
    this.totalItems = this.filteredBookings.length;
    this.updateDisplayedBookings();
  }
  
  sortBy(field: string): void {
    if (this.sortField === field) {
      // Toggle sort direction if clicking the same field
      this.sortDirection = this.sortDirection === 'asc' ? 'desc' : 'asc';
    } else {
      // Set new field and default to ascending
      this.sortField = field;
      this.sortDirection = 'asc';
    }
    
    this.sortBookings();
    this.updateDisplayedBookings();
  }
  
  sortBookings(): void {
    this.filteredBookings.sort((a, b) => {
      let comparison = 0;
      
      if (this.sortField === 'date') {
        // First compare by date
        const dateA = new Date(a.date);
        const dateB = new Date(b.date);
        comparison = dateA.getTime() - dateB.getTime();
        
        // If same date, compare by time
        if (comparison === 0) {
          const timeA = a.time.split(':').map(Number);
          const timeB = b.time.split(':').map(Number);
          comparison = (timeA[0] * 60 + timeA[1]) - (timeB[0] * 60 + timeB[1]);
        }
      } else if (this.sortField === 'patientName') {
        comparison = a.patientName.localeCompare(b.patientName);
      } else if (this.sortField === 'serialNumber') {
        comparison = a.serialNumber - b.serialNumber;
      }
      
      // Reverse for descending order
      return this.sortDirection === 'desc' ? -comparison : comparison;
    });
  }
  
  updateDisplayedBookings(): void {
    const startIndex = (this.currentPage - 1) * this.itemsPerPage;
    const endIndex = startIndex + this.itemsPerPage;
    this.displayedBookings = this.filteredBookings.slice(startIndex, endIndex);
  }
  
  updateBookingStatus(bookingId: number, newStatus: BookingStatus): void {
    // Find and update the booking status
    const booking = this.allBookings.find(b => b.id === bookingId);
    if (booking) {
      booking.status = newStatus;
      booking.updatedAt = new Date().toISOString();
      
      // In a real app, you would call a service to update the booking
      console.log(`Updated booking ${bookingId} status to ${newStatus}`);
      
      // Re-apply filters to update the displayed list
      this.applyFilters();
    }
  }
  
  clearFilters(): void {
    const today = new Date();
    const oneMonthAgo = new Date();
    oneMonthAgo.setMonth(today.getMonth() - 1);
    
    this.filterForm.patchValue({
      startDate: oneMonthAgo.toISOString().split('T')[0],
      endDate: today.toISOString().split('T')[0],
      status: '',
      type: '',
      searchTerm: ''
    });
  }
  
  changePage(page: number): void {
    this.currentPage = page;
    this.updateDisplayedBookings();
  }
  
  onItemsPerPageChange(): void {
    this.currentPage = 1; // Reset to first page
    this.updateDisplayedBookings();
  }
  
  get totalPages(): number {
    return Math.ceil(this.totalItems / this.itemsPerPage);
  }
  
  getPaginationRange(): number[] {
    // Show up to 5 page numbers, centered around current page when possible
    const totalPageCount = this.totalPages;
    
    if (totalPageCount <= 5) {
      // If 5 or fewer pages, show all
      return Array.from({ length: totalPageCount }, (_, i) => i + 1);
    }
    
    // More than 5 pages, need to limit display
    if (this.currentPage <= 3) {
      // Current page is near start
      return [1, 2, 3, 4, 5];
    } else if (this.currentPage >= totalPageCount - 2) {
      // Current page is near end
      return [
        totalPageCount - 4,
        totalPageCount - 3,
        totalPageCount - 2,
        totalPageCount - 1,
        totalPageCount
      ];
    } else {
      // Current page is in middle
      return [
        this.currentPage - 2,
        this.currentPage - 1,
        this.currentPage,
        this.currentPage + 1,
        this.currentPage + 2
      ];
    }
  }
  
  toggleSidebar(): void {
    this.sidebarCollapsed = !this.sidebarCollapsed;
  }
  
  getFormattedTime(time: string): string {
    // Convert 24-hour format to 12-hour format with AM/PM
    const [hours, minutes] = time.split(':').map(Number);
    const period = hours >= 12 ? 'PM' : 'AM';
    const formattedHours = hours % 12 || 12;
    return `${formattedHours}:${String(minutes).padStart(2, '0')} ${period}`;
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
  
  getFormattedDate(dateString: string): string {
    const date = new Date(dateString);
    return date.toLocaleDateString('en-US', {
      weekday: 'short',
      month: 'short',
      day: 'numeric',
      year: 'numeric'
    });
  }
  
  getTomorrowDate(): string {
    const tomorrow = new Date();
    tomorrow.setDate(tomorrow.getDate() + 1);
    return tomorrow.toISOString().split('T')[0];
  }
  
  getLastWeekDate(daysAgo: number): string {
    const pastDate = new Date();
    pastDate.setDate(pastDate.getDate() - daysAgo);
    return pastDate.toISOString().split('T')[0];
  }
}