export interface Booking {
    id: number;
    patientId: number;
    patientName: string;
    patientPhone: string;
    patientProfile?: string;
    doctorId: string;
    doctorName: string;
    date: string; // ISO string format
    time: string; // 24-hour format (HH:MM)
    serialNumber: number;
    status: BookingStatus;
    type: AppointmentType;
    notes?: string;
    createdAt: string;
    updatedAt: string;
    updatedBy?: string;
    statusHistory?: StatusChange[];
    pregnancyWeek?: number;
  }
  
  export type BookingStatus = 'scheduled' | 'confirmed' | 'completed' | 'cancelled' | 'absent' | 'rescheduled';
  
  export type AppointmentType = 'regular-checkup' | 'follow-up' | 'ultrasound' | 'emergency' | 'vaccination' | 'lab-report' | 'other';
  
  export interface StatusChange {
    status: BookingStatus;
    changedAt: string;
    changedBy: string;
    notes?: string;
  }
  
  export interface BookingTimeSlot {
    id: number;
    startTime: string; // 24-hour format (HH:MM)
    endTime: string; // 24-hour format (HH:MM)
    maxPatients: number;
    isAvailable: boolean;
  }
  
  export interface DoctorSchedule {
    id: number;
    doctorId: string;
    day: DayOfWeek;
    isWorkingDay: boolean;
    timeSlots: BookingTimeSlot[];
  }
  
  export type DayOfWeek = 'sunday' | 'monday' | 'tuesday' | 'wednesday' | 'thursday' | 'friday' | 'saturday';
  
  export interface BookingStats {
    today: {
      total: number;
      completed: number;
      scheduled: number;
      cancelled: number;
      absent: number;
    };
    weekly: {
      total: number;
      byDay: {
        day: string;
        count: number;
      }[];
    };
  }
  
  export interface BookingFilters {
    startDate?: string;
    endDate?: string;
    status?: BookingStatus;
    type?: AppointmentType;
    searchTerm?: string;
  }