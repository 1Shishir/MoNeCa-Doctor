import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule, ReactiveFormsModule, FormBuilder, FormGroup, FormArray, UntypedFormArray } from '@angular/forms';
import { RouterModule } from '@angular/router';
import { BookingTimeSlot, DayOfWeek, DoctorSchedule } from '../../../models/booking.model';
import { HeaderComponent } from '../../../dashboard/components/header/header.component';
import { SidebarComponent } from '../../../dashboard/components/sidebar/sidebar.component';


@Component({
  selector: 'app-schedule-config',
  standalone: true,
  imports: [
    CommonModule,
    FormsModule,
    ReactiveFormsModule,
    RouterModule,
    SidebarComponent,
    HeaderComponent
  ],
  templateUrl: './schedule-config.component.html',
  styleUrl: './schedule-config.component.css'
})
export class ScheduleConfigComponent implements OnInit {
  sidebarCollapsed = false;
  scheduleForm: FormGroup;
  isSaving = false;
  showSuccessMessage = false;

  days: { value: DayOfWeek, label: string }[] = [
    { value: 'sunday', label: 'Sunday' },
    { value: 'monday', label: 'Monday' },
    { value: 'tuesday', label: 'Tuesday' },
    { value: 'wednesday', label: 'Wednesday' },
    { value: 'thursday', label: 'Thursday' },
    { value: 'friday', label: 'Friday' },
    { value: 'saturday', label: 'Saturday' }
  ];

  // Mock schedule data for a doctor
  doctorSchedule: DoctorSchedule[] = [
    {
      id: 1,
      doctorId: 'DR001',
      day: 'sunday',
      isWorkingDay: false,
      timeSlots: []
    },
    {
      id: 2,
      doctorId: 'DR001',
      day: 'monday',
      isWorkingDay: true,
      timeSlots: [
        { id: 1, startTime: '09:00', endTime: '12:00', maxPatients: 10, isAvailable: true },
        { id: 2, startTime: '14:00', endTime: '17:00', maxPatients: 8, isAvailable: true }
      ]
    },
    {
      id: 3,
      doctorId: 'DR001',
      day: 'tuesday',
      isWorkingDay: true,
      timeSlots: [
        { id: 3, startTime: '09:00', endTime: '12:00', maxPatients: 10, isAvailable: true },
        { id: 4, startTime: '14:00', endTime: '17:00', maxPatients: 8, isAvailable: true }
      ]
    },
    {
      id: 4,
      doctorId: 'DR001',
      day: 'wednesday',
      isWorkingDay: true,
      timeSlots: [
        { id: 5, startTime: '09:00', endTime: '12:00', maxPatients: 10, isAvailable: true },
        { id: 6, startTime: '14:00', endTime: '17:00', maxPatients: 8, isAvailable: true }
      ]
    },
    {
      id: 5,
      doctorId: 'DR001',
      day: 'thursday',
      isWorkingDay: true,
      timeSlots: [
        { id: 7, startTime: '09:00', endTime: '12:00', maxPatients: 10, isAvailable: true },
        { id: 8, startTime: '14:00', endTime: '17:00', maxPatients: 8, isAvailable: true }
      ]
    },
    {
      id: 6,
      doctorId: 'DR001',
      day: 'friday',
      isWorkingDay: true,
      timeSlots: [
        { id: 9, startTime: '09:00', endTime: '13:00', maxPatients: 10, isAvailable: true }
      ]
    },
    {
      id: 7,
      doctorId: 'DR001',
      day: 'saturday',
      isWorkingDay: false,
      timeSlots: []
    }
  ];

  constructor(private fb: FormBuilder) {
    this.scheduleForm = this.fb.group({
      days: this.fb.array([])
    });
  }

  ngOnInit(): void {
    this.initScheduleForm();
  }

  initScheduleForm(): void {
    const daysArray = this.scheduleForm.get('days') as FormArray;

    // Clear existing form array
    while (daysArray.length) {
      daysArray.removeAt(0);
    }

    // Add each day's schedule to the form
    this.doctorSchedule.forEach(daySchedule => {
      const timeSlotsArray = this.fb.array([]);

      // Add existing time slots
      // Add existing time slots
      daySchedule.timeSlots.forEach(slot => {
        // Use the non-generic version of push to avoid type checking issues
        (timeSlotsArray as UntypedFormArray).push(this.createTimeSlotGroup(slot));
      });

      // Create form group for this day
      const dayGroup = this.fb.group({
        id: [daySchedule.id],
        day: [daySchedule.day],
        dayLabel: [this.getDayLabel(daySchedule.day)],
        isWorkingDay: [daySchedule.isWorkingDay],
        timeSlots: timeSlotsArray
      });

      daysArray.push(dayGroup);
    });
  }

  createTimeSlotGroup(slot?: BookingTimeSlot): FormGroup {
    return this.fb.group({
      id: [slot?.id || 0],
      startTime: [slot?.startTime || '09:00'],
      endTime: [slot?.endTime || '17:00'],
      maxPatients: [slot?.maxPatients || 10],
      isAvailable: [slot?.isAvailable !== undefined ? slot.isAvailable : true]
    });
  }

  getDayLabel(day: DayOfWeek): string {
    const foundDay = this.days.find(d => d.value === day);
    return foundDay ? foundDay.label : day;
  }

  get daysArray(): FormArray {
    return this.scheduleForm.get('days') as FormArray;
  }

  getTimeSlotsArray(dayIndex: number): FormArray {
    return (this.daysArray.at(dayIndex) as FormGroup).get('timeSlots') as FormArray;
  }

  addTimeSlot(dayIndex: number): void {
    const timeSlotsArray = this.getTimeSlotsArray(dayIndex);
    timeSlotsArray.push(this.createTimeSlotGroup());
  }

  removeTimeSlot(dayIndex: number, slotIndex: number): void {
    const timeSlotsArray = this.getTimeSlotsArray(dayIndex);
    timeSlotsArray.removeAt(slotIndex);
  }

  toggleWorkingDay(dayIndex: number): void {
    const dayGroup = this.daysArray.at(dayIndex) as FormGroup;
    const isWorkingDay = !dayGroup.get('isWorkingDay')?.value;

    dayGroup.patchValue({ isWorkingDay });

    // If toggled to working day and no time slots, add a default one
    const timeSlotsArray = this.getTimeSlotsArray(dayIndex);
    if (isWorkingDay && timeSlotsArray.length === 0) {
      this.addTimeSlot(dayIndex);
    }
  }

  onSubmit(): void {
    if (this.scheduleForm.valid) {
      this.isSaving = true;

      // In a real application, you would send this data to your backend
      console.log('Schedule Configuration:', this.scheduleForm.value);

      // Simulate API call delay
      setTimeout(() => {
        this.isSaving = false;
        this.showSuccessMessage = true;

        // Hide success message after 3 seconds
        setTimeout(() => {
          this.showSuccessMessage = false;
        }, 3000);
      }, 1500);
    }
  }

  toggleSidebar(): void {
    this.sidebarCollapsed = !this.sidebarCollapsed;
  }

  formatTime(time: string): string {
    // Convert 24-hour format to 12-hour format with AM/PM
    if (!time) return '';

    const [hours, minutes] = time.split(':').map(Number);
    const period = hours >= 12 ? 'PM' : 'AM';
    const formattedHours = hours % 12 || 12;
    return `${formattedHours}:${String(minutes).padStart(2, '0')} ${period}`;
  }
}