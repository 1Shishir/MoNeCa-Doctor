import { NgModule } from '@angular/core';
import { RouterModule, Routes } from '@angular/router';

const routes: Routes = [
  { 
    path: '', 
    loadComponent: () => import('./components/booking-dashboard/booking-dashboard.component').then(m => m.BookingDashboardComponent)
  },
  { 
    path: 'add', 
    loadComponent: () => import('./components/add-booking/add-booking.component').then(m => m.AddBookingComponent)
  },
  { 
    path: 'schedule', 
    loadComponent: () => import('./components/schedule-config/schedule-config.component').then(m => m.ScheduleConfigComponent)
  },
  { 
    path: 'list', 
    loadComponent: () => import('./components/booking-list/booking-list.component').then(m => m.BookingListComponent)
  }
];

@NgModule({
  imports: [RouterModule.forChild(routes)],
  exports: [RouterModule]
})
export class BookingRoutingModule { }