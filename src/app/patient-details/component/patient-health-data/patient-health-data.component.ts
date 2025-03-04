import { Component, Input, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';

@Component({
  selector: 'app-patient-health-data',
  standalone: true,
  imports: [CommonModule, FormsModule],
  templateUrl: './patient-health-data.component.html',
  styleUrl: './patient-health-data.component.css'
})
export class PatientHealthDataComponent implements OnInit {
  @Input() healthData: any;
  @Input() patientId: number = 0;
  
  selectedTimeframe: 'today' | 'week' | 'month' = 'today';
  selectedMetric: 'heartRate' | 'bp' | 'oxygenLevel' | 'temperature' = 'heartRate';
  
  // Sample weekly and monthly data
  weeklyData = [
    { date: '2025-02-24', heartRate: 82, bp: '125/82', oxygenLevel: '97%', temperature: '37.1°C' },
    { date: '2025-02-25', heartRate: 84, bp: '128/84', oxygenLevel: '96%', temperature: '37.2°C' },
    { date: '2025-02-26', heartRate: 78, bp: '122/80', oxygenLevel: '97%', temperature: '36.9°C' },
    { date: '2025-02-27', heartRate: 76, bp: '120/78', oxygenLevel: '98%', temperature: '36.8°C' },
    { date: '2025-02-28', heartRate: 80, bp: '125/82', oxygenLevel: '97%', temperature: '37.0°C' },
    { date: '2025-03-01', heartRate: 82, bp: '128/84', oxygenLevel: '96%', temperature: '37.1°C' },
    { date: '2025-03-02', heartRate: 80, bp: '126/82', oxygenLevel: '97%', temperature: '37.0°C' }
  ];
  
  monthlyData = [
    { week: 'Feb 3-9', heartRate: 78, bp: '120/80', oxygenLevel: '98%', temperature: '36.9°C' },
    { week: 'Feb 10-16', heartRate: 80, bp: '122/82', oxygenLevel: '97%', temperature: '37.0°C' },
    { week: 'Feb 17-23', heartRate: 82, bp: '125/83', oxygenLevel: '97%', temperature: '37.1°C' },
    { week: 'Feb 24-Mar 2', heartRate: 80, bp: '124/82', oxygenLevel: '97%', temperature: '37.0°C' }
  ];
  
  displayData: any[] = [];
  
  ngOnInit(): void {
    this.updateDisplayData();
  }
  
  updateTimeframe(timeframe: 'today' | 'week' | 'month'): void {
    this.selectedTimeframe = timeframe;
    this.updateDisplayData();
  }
  
  updateMetric(metric: 'heartRate' | 'bp' | 'oxygenLevel' | 'temperature'): void {
    this.selectedMetric = metric;
  }
  
  updateDisplayData(): void {
    switch(this.selectedTimeframe) {
      case 'today':
        this.displayData = this.healthData.today;
        break;
      case 'week':
        this.displayData = this.weeklyData;
        break;
      case 'month':
        this.displayData = this.monthlyData;
        break;
    }
  }
  
  getMetricLabel(): string {
    switch(this.selectedMetric) {
      case 'heartRate':
        return 'Heart Rate (bpm)';
      case 'bp':
        return 'Blood Pressure';
      case 'oxygenLevel':
        return 'Oxygen Level';
      case 'temperature':
        return 'Temperature';
      default:
        return '';
    }
  }
  
  getTimePeriodLabel(): string {
    switch(this.selectedTimeframe) {
      case 'today':
        return 'Time';
      case 'week':
        return 'Date';
      case 'month':
        return 'Week';
      default:
        return '';
    }
  }
  
  formatDate(dateString: string): string {
    if (!dateString) return '';
    
    const date = new Date(dateString);
    
    if (isNaN(date.getTime())) return dateString;
    
    return date.toLocaleDateString('en-US', {
      month: 'short',
      day: 'numeric'
    });
  }
  
  isAbnormalReading(metric: string, value: any): boolean {
    switch(metric) {
      case 'heartRate':
        return parseInt(value) > 90;
      case 'bp':
        const systolic = parseInt(value.split('/')[0]);
        return systolic > 130;
      case 'oxygenLevel':
        return parseInt(value) < 95;
      case 'temperature':
        return parseFloat(value) > 37.5;
      default:
        return false;
    }
  }
}