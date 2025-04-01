import { Component, Input, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { TimeframeType, MetricType, HealthDataPoint } from '../../../models/patient-health-data.model';
import { PatientHealthDataService } from '../../services/health-data.service';
import { Router } from '@angular/router';


@Component({
  selector: 'app-patient-health-data',
  standalone: true,
  imports: [CommonModule, FormsModule],
  templateUrl: './patient-health-data.component.html',
  styleUrl: './patient-health-data.component.css'
})
export class PatientHealthDataComponent implements OnInit {
  @Input() patientId: string = '';
  
  selectedTimeframe: TimeframeType = 'today';
  selectedMetric: MetricType = 'heartRate';
  
  // Date filters
  startDate: Date = new Date();
  endDate: Date = new Date();
  
  displayData: any[] = [];
  isLoading: boolean = false;
  errorMessage: string = '';
  
  constructor(private healthDataService: PatientHealthDataService,private router:Router) {
    // Set default date range (today)
    this.startDate = new Date();
    this.startDate.setHours(0, 0, 0, 0);
    
    this.endDate = new Date();
    this.endDate.setHours(23, 59, 59, 999);
  }
  
  ngOnInit(): void {
  
    this.fetchAllData();
    this.fetchTodayData();
    this.fetchHealthData();
    
  }
  
  updateTimeframe(timeframe: TimeframeType): void {
    this.selectedTimeframe = timeframe;
    this.fetchHealthData();
  }
  
  updateMetric(metric: MetricType): void {
    this.selectedMetric = metric;
  }
  
  // Date filter methods
  updateDateRange(startDate: Date, endDate: Date): void {
    this.startDate = startDate;
    this.endDate = endDate;
    this.fetchHealthData();
  }

  fetchTodayData(): void {
    if (!this.patientId) return;
    
    this.isLoading = true;
    this.errorMessage = '';
    
    this.healthDataService.getTodayHealthData(this.patientId).subscribe({
      next: (data) => {
        console.log('Fetched patient today health data:', data);
        // this.healthData = data;
        this.processHealthData(data);
        this.isLoading = false;
      },
      error: (error) => {
        console.error('Error fetching health data:', error);
        this.errorMessage = 'Unable to fetch health data. Please try again.';
        this.isLoading = false;
      }
    });
  }
  
  private processHealthData(data: HealthDataPoint[]): void {
    if (!data || data.length === 0) {
      // this.noDataAvailable = true;
      return;
    }
  
    // this.noDataAvailable = false;
    
    // Calculate statistics
    // this.heartRateReadings = data.map(d => d.heartRate);
    // this.bloodPressureReadings = data.map(d => d.bloodPressure);
    // this.oxygenLevelReadings = data.map(d => parseFloat(d.oxygenLevel));
    // this.temperatureReadings = data.map(d => parseFloat(d.temperature));
  
    // // Find min, max, average
    // this.heartRateStats = this.calculateStats(this.heartRateReadings);
    // this.bloodPressureStats = this.calculateStringStats(this.bloodPressureReadings);
    // this.oxygenLevelStats = this.calculateStats(this.oxygenLevelReadings);
    // this.temperatureStats = this.calculateStats(this.temperatureReadings);
  }
  
  private calculateStats(readings: number[]): { min: number, max: number, average: number } {
    if (readings.length === 0) return { min: 0, max: 0, average: 0 };
  
    return {
      min: Math.min(...readings),
      max: Math.max(...readings),
      average: readings.reduce((a, b) => a + b, 0) / readings.length
    };
  }
  
  private calculateStringStats(readings: string[]): { min: string, max: string, average: string } {
    if (readings.length === 0) return { min: 'N/A', max: 'N/A', average: 'N/A' };
  
    // For blood pressure, we might want to split and calculate differently
    const parsedReadings = readings.map(bp => {
      const [systolic, diastolic] = bp.split('/').map(Number);
      return { systolic, diastolic };
    });
  
    return {
      min: `${Math.min(...parsedReadings.map(r => r.systolic))}/${Math.min(...parsedReadings.map(r => r.diastolic))}`,
      max: `${Math.max(...parsedReadings.map(r => r.systolic))}/${Math.max(...parsedReadings.map(r => r.diastolic))}`,
      average: `${(parsedReadings.reduce((a, b) => a + b.systolic, 0) / parsedReadings.length).toFixed(0)}/${(parsedReadings.reduce((a, b) => a + b.diastolic, 0) / parsedReadings.length).toFixed(0)}`
    };
  }

fetchAllData(): void {
  console.log("kk")
  if (!this.patientId) return;
  
  this.isLoading = true;
  this.errorMessage = '';
console.log("kk")
  this.healthDataService.getPatientHealthData(this.patientId).subscribe({
    next: (data) => {
      console.log('Fetched patient health data:', data);
      
      // Log specific parts of the data structure
      if (data) {
        console.log('Last update:', data.lastUpdate);
        console.log('Stats:', data.stats);
        console.log('Alerts:', data.alerts?.length || 0, 'alerts found');
        console.log('Today\'s readings:', data.aggregates?.today?.length || 0, 'readings found');
        
        // Log raw data information
        if (data.data) {
          console.log('Raw data timestamps:', Object.keys(data.data));
          console.log('Sample reading:', Object.values(data.data)[0]);
        }
      }
      
      this.isLoading = false;
    },
    error: (error) => {
      console.error('Error fetching health data:', error);
      this.errorMessage = 'Failed to load health data';
      this.isLoading = false;
    }
  });
}

  
  fetchHealthData(): void {
   
    if (!this.patientId) return;
    
    this.isLoading = true;
    this.errorMessage = '';
    console.log("data fetched"+this.patientId+
      this.selectedTimeframe+
      this.startDate+
      this.endDate)

    this.healthDataService.getHealthDataByTimeframe(
      this.patientId, 
      this.selectedTimeframe,
      this.startDate,
      this.endDate
    ).subscribe({
      next: (data) => {
        if (data && data.length > 0) {
          console.log(`Fetched ${this.selectedTimeframe} data:`, data);
          this.displayData = this.healthDataService.formatDataForDisplay(this.selectedTimeframe, data);
        } else {
          this.displayData = [];
          this.errorMessage = 'No health data available for this timeframe';
        }
        this.isLoading = false;
      },
      error: (error) => {
        console.error('Error fetching health data:', error);
        this.errorMessage = 'Failed to load health data';
        this.isLoading = false;
        this.displayData = [];
      }
    });
  }
  
  getMetricLabel(): string {
    switch(this.selectedMetric) {
      case 'heartRate':
        return 'Heart Rate (bpm)';
      case 'bloodPressure':
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
      case 'day':
        return 'Hour';
      case 'week':
        return 'Date';
      case 'month':
        return 'Week';
      case 'year':
        return 'Month';
      default:
        return '';
    }
  }
  
// Add these methods to your PatientHealthDataComponent class

formatDateTime(isoString: string): string {
  console.log("output is"+JSON.stringify(isoString))
  if (!isoString) return 'N/A';
  
  try {
    const date = new Date(isoString);
    
    if (this.selectedTimeframe === 'today') {
      // For today view, show only time
      return date.toLocaleTimeString([], {hour: '2-digit', minute:'2-digit'});
    } else {
      // For week/month view, show date
      return date.toLocaleDateString([], {month: 'short', day: 'numeric'});
    }
  } catch {
    return isoString;
  }
}

isAbnormalReading(metric: string, value: any): boolean {
  if (!value) return false;
  
  switch(metric) {
    case 'heartRate':
      return value < 60 || value > 100;
    case 'bp':
    case 'bloodPressure':
      if (typeof value !== 'string') return false;
      const [systolic, diastolic] = value.split('/').map(Number);
      return systolic > 140 || diastolic > 90 || systolic < 90 || diastolic < 60;
    case 'oxygenLevel':
      return parseFloat(value) < 95;
    case 'temperature':
      return parseFloat(value) > 37.5 || parseFloat(value) < 36;
    default:
      return false;
  }
}
seeAllButton(){
  this.router.navigate(['/detailed-health-data']);
}
}



// import { Component, Input, OnInit } from '@angular/core';
// import { CommonModule } from '@angular/common';
// import { FormsModule } from '@angular/forms';
// import { TimeframeType, MetricType } from '../../../models/patient-health-data.model';
// import { PatientHealthDataService } from '../../services/health-data.service';

// @Component({
//   selector: 'app-patient-health-data',
//   standalone: true,
//   imports: [CommonModule, FormsModule],
//   templateUrl: './patient-health-data.component.html',
//   styleUrl: './patient-health-data.component.css'
// })
// export class PatientHealthDataComponent implements OnInit {
//   @Input() patientId: string = '0';
  
//   selectedTimeframe: TimeframeType = 'today';
//   selectedMetric: MetricType = 'heartRate';
  
//   displayData: any[] = [];
//   isLoading: boolean = false;
//   errorMessage: string = '';
  
//   constructor(private healthDataService: PatientHealthDataService) {}
  
//   ngOnInit(): void {
//     this.fetchHealthData();
//   }
  
//   updateTimeframe(timeframe: TimeframeType): void {
//     this.selectedTimeframe = timeframe;
//     this.fetchHealthData();
//   }
  
//   updateMetric(metric: MetricType): void {
//     this.selectedMetric = metric;
//   }
  
//   fetchHealthData(): void {
//     if (!this.patientId) return;
    
//     this.isLoading = true;
//     this.errorMessage = '';
    
//     this.healthDataService.getHealthDataByTimeframe(this.patientId, this.selectedTimeframe)
//       .subscribe({
//         next: (data) => {
//           console.log("output is"+JSON.stringify(data))
//           if (data && data.length > 0) {
//             this.displayData = this.healthDataService.formatDataForDisplay(this.selectedTimeframe, data);
//           } else {
//             this.displayData = [];
//             this.errorMessage = 'No health data available for this timeframe';
//           }
//           this.isLoading = false;
//         },
//         error: (error) => {
//           console.error('Error fetching health data:', error);
//           this.errorMessage = 'Failed to load health data';
//           this.isLoading = false;
//           this.displayData = [];
//         }
//       });
//   }
  
//   getMetricLabel(): string {
//     switch(this.selectedMetric) {
//       case 'heartRate':
//         return 'Heart Rate (bpm)';
//       case 'bloodPressure':
//       case 'bp':
//         return 'Blood Pressure';
//       case 'oxygenLevel':
//         return 'Oxygen Level';
//       case 'temperature':
//         return 'Temperature';
//       default:
//         return '';
//     }
//   }
  
//   getTimePeriodLabel(): string {
//     switch(this.selectedTimeframe) {
//       case 'today':
//         return 'Time';
//       case 'day':
//         return 'Hour';
//       case 'week':
//         return 'Date';
//       case 'month':
//         return 'Week';
//       case 'year':
//         return 'Month';
//       default:
//         return '';
//     }
//   }
  
//   formatDate(dateString: string): string {
//     if (!dateString) return '';
    
//     const date = new Date(dateString);
    
//     if (isNaN(date.getTime())) return dateString;
    
//     return date.toLocaleDateString('en-US', {
//       month: 'short',
//       day: 'numeric'
//     });
//   }
  
//   isAbnormalReading(metric: string, value: any): boolean {
//     return this.healthDataService.isAbnormalReading(metric, value);
//   }
// }


//lagecy
// import { Component, Input, OnInit } from '@angular/core';
// import { CommonModule } from '@angular/common';
// import { FormsModule } from '@angular/forms';
// import { PatientDetailsService } from '../../services/patient-details.service';

// @Component({
//   selector: 'app-patient-health-data',
//   standalone: true,
//   imports: [CommonModule, FormsModule],
//   templateUrl: './patient-health-data.component.html',
//   styleUrl: './patient-health-data.component.css'
// })
// export class PatientHealthDataComponent implements OnInit {
//   @Input() patientId: string = '0';
//   // healthData: PatientHealthData | null = null;
//   // activeAlerts: HealthAlert[] = [];

//   constructor(
//     private patientDetailsService: PatientDetailsService,
//   ) {}
  
  
//   selectedTimeframe: 'today' | 'week' | 'month' = 'today';
//   selectedMetric: 'heartRate' | 'bp' | 'oxygenLevel' | 'temperature' = 'heartRate';
  
//   // Sample weekly and monthly data
//   weeklyData = [
//     { date: '2025-02-24', heartRate: 82, bp: '125/82', oxygenLevel: '97%', temperature: '37.1°C' },
//     { date: '2025-02-25', heartRate: 84, bp: '128/84', oxygenLevel: '96%', temperature: '37.2°C' },
//     { date: '2025-02-26', heartRate: 78, bp: '122/80', oxygenLevel: '97%', temperature: '36.9°C' },
//     { date: '2025-02-27', heartRate: 76, bp: '120/78', oxygenLevel: '98%', temperature: '36.8°C' },
//     { date: '2025-02-28', heartRate: 80, bp: '125/82', oxygenLevel: '97%', temperature: '37.0°C' },
//     { date: '2025-03-01', heartRate: 82, bp: '128/84', oxygenLevel: '96%', temperature: '37.1°C' },
//     { date: '2025-03-02', heartRate: 80, bp: '126/82', oxygenLevel: '97%', temperature: '37.0°C' }
//   ];
  
//   monthlyData = [
//     { week: 'Feb 3-9', heartRate: 78, bp: '120/80', oxygenLevel: '98%', temperature: '36.9°C' },
//     { week: 'Feb 10-16', heartRate: 80, bp: '122/82', oxygenLevel: '97%', temperature: '37.0°C' },
//     { week: 'Feb 17-23', heartRate: 82, bp: '125/83', oxygenLevel: '97%', temperature: '37.1°C' },
//     { week: 'Feb 24-Mar 2', heartRate: 80, bp: '124/82', oxygenLevel: '97%', temperature: '37.0°C' }
//   ];
  
//   displayData: any[] = [];
  
//   ngOnInit(): void {
//     const currentPatientId = this.patientDetailsService.getPatientId();
//     if (currentPatientId) {
//       this.patientId = currentPatientId;
//       const startDate = new Date('2025-03-01');
//     const endDate = new Date('2025-03-31');

   
//     }
    

 
//   }
  

//   updateTimeframe(timeframe: 'today' | 'week' | 'month'): void {
//     this.selectedTimeframe = timeframe;
//     // this.updateDisplayData();
//   }
  
//   updateMetric(metric: 'heartRate' | 'bp' | 'oxygenLevel' | 'temperature'): void {
//     this.selectedMetric = metric;
//   }

  
//   getMetricLabel(): string {
//     switch(this.selectedMetric) {
//       case 'heartRate':
//         return 'Heart Rate (bpm)';
//       case 'bp':
//         return 'Blood Pressure';
//       case 'oxygenLevel':
//         return 'Oxygen Level';
//       case 'temperature':
//         return 'Temperature';
//       default:
//         return '';
//     }
//   }
  
//   getTimePeriodLabel(): string {
//     switch(this.selectedTimeframe) {
//       case 'today':
//         return 'Time';
//       case 'week':
//         return 'Date';
//       case 'month':
//         return 'Week';
//       default:
//         return '';
//     }
//   }
  
//   formatDate(dateString: string): string {
//     if (!dateString) return '';
    
//     const date = new Date(dateString);
    
//     if (isNaN(date.getTime())) return dateString;
    
//     return date.toLocaleDateString('en-US', {
//       month: 'short',
//       day: 'numeric'
//     });
//   }
  
//   isAbnormalReading(metric: string, value: any): boolean {
//     switch(metric) {
//       case 'heartRate':
//         return parseInt(value) > 90;
//       case 'bp':
//         const systolic = parseInt(value.split('/')[0]);
//         return systolic > 130;
//       case 'oxygenLevel':
//         return parseInt(value) < 95;
//       case 'temperature':
//         return parseFloat(value) > 37.5;
//       default:
//         return false;
//     }
//   }
// }