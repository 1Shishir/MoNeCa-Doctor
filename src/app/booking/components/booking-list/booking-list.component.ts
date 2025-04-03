import { Component, OnInit, OnDestroy, ChangeDetectorRef, AfterViewInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule, ReactiveFormsModule, FormBuilder, FormGroup } from '@angular/forms';
import { Router, RouterModule } from '@angular/router';
import { HeaderComponent } from '../../../dashboard/components/header/header.component';
import { SidebarComponent } from '../../../dashboard/components/sidebar/sidebar.component';
import { BookingStatus, AppointmentType, Booking, BookingFilters } from '../../../models/booking.model';

import { Subscription } from 'rxjs';
import { BookingService } from '../../service/booking.service';

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
export class BookingListComponent implements OnInit, OnDestroy, AfterViewInit {
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
  
  // Bookings data
  allBookings: Booking[] = [];
  filteredBookings: Booking[] = [];
  displayedBookings: Booking[] = [];
  
  // Subscriptions for cleanup
  private bookingSubscription: Subscription | null = null;
  
  // Debug flag - make this visible in the template
  debug = true;
  
  constructor(
    private fb: FormBuilder,
    private bookingService: BookingService,
    private cdr: ChangeDetectorRef,
    private router:Router,
  ) {
    console.log('[INIT] BookingListComponent constructor called');
    
    const today = new Date();
    const oneMonthAgo = new Date();
    oneMonthAgo.setMonth(today.getMonth() - 1);
    const startDate = new Date('2023-01-01');
    
    this.filterForm = this.fb.group({
      startDate: [startDate.toISOString().split('T')[0]],
      // startDate: [oneMonthAgo.toISOString().split('T')[0]],
      endDate: [today.toISOString().split('T')[0]],
      status: [''],
      type: [''],
      searchTerm: ['']
    });
    
    // Initialize with mock data immediately for faster UI rendering
    this.createMockBookings();
    this.filteredBookings = [...this.allBookings];
    this.totalItems = this.filteredBookings.length;
    this.updateDisplayedBookings();
  }
  
  ngOnInit(): void {
    console.log('[INIT] BookingListComponent ngOnInit called');
    
    // Load bookings from service
    try {
      this.bookingService.refreshAllData();
      console.log('[INIT] Called refreshAllData() on bookingService');
    } catch (error) {
      console.error('[ERROR] Error refreshing data:', error);
    }
   
    // Subscribe to booking data
    try {
      this.bookingSubscription = this.bookingService.bookings$.subscribe(bookings => {
        console.log('[DATA] Received bookings from service:', bookings);
        
        if (bookings && bookings.length > 0) {
          console.log('[DATA] Using bookings from service');
          this.allBookings = bookings;
        } else {
          console.log('[DATA] No bookings received from service, using mock data');
          this.createMockBookings();
        }
        
        this.applyFilters();
        this.cdr.detectChanges(); // Force update the view
      });
    } catch (error) {
      console.error('[ERROR] Error subscribing to bookings:', error);
      this.createMockBookings();
      this.applyFilters();
    }
    
    // Listen for filter changes
    this.filterForm.valueChanges.subscribe(values => {
      console.log('[FILTER] Filter values changed:', values);
      this.currentPage = 1; // Reset to first page when filters change
      this.applyFilters();
    });
  }
  
  ngAfterViewInit(): void {
    console.log('[LIFECYCLE] BookingListComponent ngAfterViewInit called');
    
    // Force update the view with a slight delay to ensure it's fully rendered
    setTimeout(() => {
      this.applyFilters();
      this.cdr.detectChanges();
      console.log('[RENDER] Forced view update after initialization');
    }, 0);
  }
  
  ngOnDestroy(): void {
    console.log('[LIFECYCLE] BookingListComponent ngOnDestroy called');
    // Clean up subscription
    if (this.bookingSubscription) {
      this.bookingSubscription.unsubscribe();
    }
  }
  
  private createMockBookings(): void {
    console.log('[MOCK] Creating mock booking data');
    
    // Create mock bookings
    this.allBookings = [
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
        patientId: "4",
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
        patientId: "5",
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
    
    console.log(`[MOCK] Created ${this.allBookings.length} mock bookings`);
  }
  
  applyFilters(): void {
    console.log('[FILTER] Applying filters to bookings data');
    console.log('[FILTER] Current filter values:', this.filterForm.value);
    console.log('[FILTER] Total bookings before filtering:', this.allBookings.length);
   
    const filters: BookingFilters = this.filterForm.value;
    
    try {
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
      
      console.log('[FILTER] Filtered bookings count:', this.filteredBookings.length);
      
      // Sort filtered bookings
      this.sortBookings();
      
      // Update total items and paginate
      this.totalItems = this.filteredBookings.length;
      this.updateDisplayedBookings();
      
      // Force change detection
      this.cdr.detectChanges();
    } catch (error) {
      console.error('[ERROR] Error applying filters:', error);
    }
  }
  
  sortBy(field: string): void {
    console.log(`[SORT] Sorting by ${field} in ${this.sortDirection === 'asc' ? 'descending' : 'ascending'} order`);
    
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
    this.cdr.detectChanges();
  }
  
  sortBookings(): void {
    console.log(`[SORT] Sorting bookings by ${this.sortField} in ${this.sortDirection} order`);
    
    try {
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
    } catch (error) {
      console.error('[ERROR] Error sorting bookings:', error);
    }
  }
  
  updateDisplayedBookings(): void {
    try {
      const startIndex = (this.currentPage - 1) * this.itemsPerPage;
      const endIndex = startIndex + this.itemsPerPage;
      this.displayedBookings = this.filteredBookings.slice(startIndex, endIndex);
      
      console.log(`[PAGINATION] Displaying ${this.displayedBookings.length} bookings (page ${this.currentPage} of ${this.totalPages})`);
      if (this.displayedBookings.length > 0) {
        console.log('[PAGINATION] First displayed booking:', this.displayedBookings[0]);
      } else {
        console.log('[PAGINATION] No bookings to display');
      }
    } catch (error) {
      console.error('[ERROR] Error updating displayed bookings:', error);
      this.displayedBookings = [];
    }
  }
  
  updateBookingStatus(bookingId: string, newStatus: BookingStatus): void {
    console.log(`[ACTION] Attempting to update booking ${bookingId} status to ${newStatus}`);
    
    try {
      // Use the booking service to update status
      this.bookingService.updateAppointmentStatus(bookingId, newStatus).subscribe({
        next: () => {
          console.log(`[ACTION] Successfully updated booking ${bookingId} status to ${newStatus}`);
          
          // Find and update the booking in allBookings
          const booking = this.allBookings.find(b => b.id === bookingId);
          if (booking) {
            booking.status = newStatus;
            booking.updatedAt = new Date().toISOString();
            console.log('[ACTION] Updated booking locally:', booking);
            
            // Re-apply filters to update the displayed list
            this.applyFilters();
            this.cdr.detectChanges();
          } else {
            console.error(`[ERROR] Could not find booking with ID ${bookingId}`);
          }
        },
        error: (error) => {
          console.error(`[ERROR] Error updating booking status:`, error);
          
          // Update locally anyway for better UX
          const booking = this.allBookings.find(b => b.id === bookingId);
          if (booking) {
            booking.status = newStatus;
            booking.updatedAt = new Date().toISOString();
            
            // Re-apply filters to update the displayed list
            this.applyFilters();
            this.cdr.detectChanges();
          }
        }
      });
    } catch (error) {
      console.error('[ERROR] Exception when updating booking status:', error);
      
      // Update locally anyway for better UX
      const booking = this.allBookings.find(b => b.id === bookingId);
      if (booking) {
        booking.status = newStatus;
        booking.updatedAt = new Date().toISOString();
        this.applyFilters();
        this.cdr.detectChanges();
      }
    }
  }
  
  clearFilters(): void {
    console.log('[FILTER] Clearing all filters');
    
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
    
    // Form value changes will trigger applyFilters()
  }
  
  changePage(page: number): void {
    console.log(`[PAGINATION] Changing to page ${page}`);
    this.currentPage = page;
    this.updateDisplayedBookings();
    this.cdr.detectChanges();
  }
  
  onItemsPerPageChange(): void {
    console.log(`[PAGINATION] Changed items per page to ${this.itemsPerPage}`);
    this.currentPage = 1; // Reset to first page
    this.updateDisplayedBookings();
    this.cdr.detectChanges();
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
    console.log(`[UI] Sidebar ${this.sidebarCollapsed ? 'collapsed' : 'expanded'}`);
  }
  
  getFormattedTime(time: string): string {
    if (!time) return 'N/A';
    
    // Convert 24-hour format to 12-hour format with AM/PM
    try {
      const [hours, minutes] = time.split(':').map(Number);
      const period = hours >= 12 ? 'PM' : 'AM';
      const formattedHours = hours % 12 || 12;
      return `${formattedHours}:${String(minutes).padStart(2, '0')} ${period}`;
    } catch (error) {
      console.error('[ERROR] Error formatting time:', error);
      return time; // Return original if there's an error
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
  
onDashboardclick(){
  this.router.navigate(['/booking']);
}

onNewBtnclick(){
  this.router.navigate(['/booking/add']);
}

  getFormattedDate(dateString: string): string {
    if (!dateString) return 'N/A';
    
    try {
      const date = new Date(dateString);
      return date.toLocaleDateString('en-US', {
        weekday: 'short',
        month: 'short',
        day: 'numeric',
        year: 'numeric'
      });
    } catch (error) {
      console.error('[ERROR] Error formatting date:', error);
      return dateString; // Return original if there's an error
    }
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