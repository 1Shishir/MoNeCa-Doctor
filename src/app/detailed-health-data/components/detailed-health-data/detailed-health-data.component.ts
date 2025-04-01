// import { Component, OnInit } from '@angular/core';
// import { CommonModule } from '@angular/common';
// import { FormsModule } from '@angular/forms';
// import { ActivatedRoute, Router } from '@angular/router';

// import { forkJoin } from 'rxjs';
// import { TimeframeType, MetricType, MetricStats, BloodPressureStats, HealthAlert } from '../../../models/patient-health-data.model';
// import { PatientHealthDataService } from '../../../patient-details/services/health-data.service';

// @Component({
//   selector: 'app-detailed-health-data',
//   standalone: true,
//   imports: [CommonModule, FormsModule],
//   templateUrl: './detailed-health-data.component.html',
//   styleUrl: './detailed-health-data.component.css'
// })
// export class DetailedHealthDataComponent implements OnInit {
//   patientId: string = '';
//   patientName: string = '';
  
//   // Time selection
//   selectedTimeframe: TimeframeType = 'week';
//   selectedDate: string = new Date().toISOString().split('T')[0];
  
//   // Date range filters
//   startDate: Date = new Date();
//   endDate: Date = new Date();
  
//   // Metric selection
//   selectedMetric: MetricType = 'all';
  
//   // Last update information
//   lastUpdate: string = new Date().toISOString();
  
//   // Data containers
//   metrics: { [key in TimeframeType]?: any[] } = {};
  
//   // Stats for each metric with default values to prevent null errors
//   heartRateStats: MetricStats = {
//     current: 0,
//     min: 0,
//     max: 0,
//     avg: 0,
//     normal: { min: 60, max: 100 }
//   };
  
//   bloodPressureStats: BloodPressureStats = {
//     current: '0/0',
//     systolicRange: { min: 0, max: 0 },
//     diastolicRange: { min: 0, max: 0 },
//     normal: {
//       systolic: { min: 90, max: 120 },
//       diastolic: { min: 60, max: 80 }
//     }
//   };
  
//   oxygenLevelStats: MetricStats = {
//     current: 0,
//     min: 0,
//     max: 0,
//     avg: 0,
//     normal: { min: 95, max: 100 }
//   };
  
//   temperatureStats: MetricStats = {
//     current: 0,
//     min: 0,
//     max: 0,
//     avg: 0,
//     normal: { min: 36.1, max: 37.2 }
//   };
  
//   // Alerts
//   alerts: HealthAlert[] = [];
  
//   isLoading: boolean = false;
//   errorMessage: string = '';
  
//   // Dummy data for fallback
//   private dummyDayData = [
//     {
//       time: '08:00 AM',
//       heartRate: 75,
//       bloodPressure: { systolic: 120, diastolic: 80 },
//       oxygenLevel: 98,
//       temperature: 36.8
//     },
//     {
//       time: '12:30 PM',
//       heartRate: 82,
//       bloodPressure: { systolic: 125, diastolic: 82 },
//       oxygenLevel: 97,
//       temperature: 37.0
//     },
//     {
//       time: '04:45 PM',
//       heartRate: 95,
//       bloodPressure: { systolic: 135, diastolic: 88 },
//       oxygenLevel: 96,
//       temperature: 37.2
//     },
//     {
//       time: '08:15 PM',
//       heartRate: 78,
//       bloodPressure: { systolic: 122, diastolic: 78 },
//       oxygenLevel: 97,
//       temperature: 36.9
//     }
//   ];
  
//   private dummyWeekData = [
//     {
//       date: '2025-03-25',
//       heartRate: { avg: 76, min: 70, max: 85 },
//       bloodPressure: {
//         systolic: { avg: 118, min: 112, max: 125 },
//         diastolic: { avg: 76, min: 70, max: 82 }
//       },
//       oxygenLevel: { avg: 98, min: 97, max: 99 },
//       temperature: { avg: 36.7, min: 36.5, max: 36.9 }
//     },
//     {
//       date: '2025-03-26',
//       heartRate: { avg: 80, min: 72, max: 88 },
//       bloodPressure: {
//         systolic: { avg: 124, min: 118, max: 130 },
//         diastolic: { avg: 80, min: 74, max: 86 }
//       },
//       oxygenLevel: { avg: 97, min: 96, max: 98 },
//       temperature: { avg: 36.9, min: 36.6, max: 37.1 }
//     },
//     {
//       date: '2025-03-27',
//       heartRate: { avg: 83, min: 75, max: 95 },
//       bloodPressure: {
//         systolic: { avg: 128, min: 120, max: 135 },
//         diastolic: { avg: 83, min: 78, max: 88 }
//       },
//       oxygenLevel: { avg: 96, min: 95, max: 97 },
//       temperature: { avg: 37.1, min: 36.8, max: 37.3 }
//     },
//     {
//       date: '2025-03-28',
//       heartRate: { avg: 78, min: 72, max: 86 },
//       bloodPressure: {
//         systolic: { avg: 122, min: 116, max: 128 },
//         diastolic: { avg: 78, min: 72, max: 84 }
//       },
//       oxygenLevel: { avg: 97, min: 96, max: 98 },
//       temperature: { avg: 36.8, min: 36.6, max: 37.0 }
//     }
//   ];
  
//   private dummyStats = {
//     heartRate: {
//       current: 78,
//       min: 68,
//       max: 95,
//       avg: 82,
//       normal: { min: 60, max: 100 }
//     },
    
//     bloodPressure: {
//       current: '122/78',
//       systolicRange: { min: 112, max: 135 },
//       diastolicRange: { min: 70, max: 88 },
//       normal: {
//         systolic: { min: 90, max: 120 },
//         diastolic: { min: 60, max: 80 }
//       }
//     },
    
//     oxygenLevel: {
//       current: 97,
//       min: 95,
//       max: 99,
//       avg: 97,
//       normal: { min: 95, max: 100 }
//     },
    
//     temperature: {
//       current: 36.9,
//       min: 36.5,
//       max: 37.3,
//       avg: 36.9,
//       normal: { min: 36.1, max: 37.2 }
//     }
//   };
  
//   private dummyAlerts = [
//     {
//       id: 'alert1',
//       metric: 'heartRate',
//       status: 'Warning',
//       message: 'Heart rate elevated to 95 bpm at 16:45',
//       timestamp: '2025-03-01T16:45:00',
//       severity: 'medium',
//       acknowledged: false
//     },
//     {
//       id: 'alert2',
//       metric: 'bloodPressure',
//       status: 'Warning',
//       message: 'Blood pressure elevated to 135/88 mmHg at 16:45',
//       timestamp: '2025-03-01T16:45:00',
//       severity: 'medium',
//       acknowledged: false
//     }
//   ];
  
//   constructor(
//     private route: ActivatedRoute,
//     private router: Router,
//     private healthDataService: PatientHealthDataService
//   ) {
//     // Set default date range (last 7 days)
//     this.endDate = new Date();
//     this.endDate.setHours(23, 59, 59, 999);
    
//     this.startDate = new Date();
//     this.startDate.setDate(this.endDate.getDate() - 7);
//     this.startDate.setHours(0, 0, 0, 0);
//   }
  
//   ngOnInit(): void {
//     console.log('DetailedHealthDataComponent initialized');
//     this.patientId = '8801776613630'; // Adding the 88 prefix to match Firebase data structure
//     console.log('Using hardcoded patient ID:', this.patientId);
//     this.loadPatientData();
//   }
  
//   loadPatientData(): void {
//     if (!this.patientId) {
//       this.errorMessage = 'Patient ID is required';
//       console.error('Patient ID is missing');
//       return;
//     }
    
//     console.log('Loading patient data for ID:', this.patientId);
//     console.log('Date range:', this.startDate, 'to', this.endDate);
    
//     this.isLoading = true;
//     this.errorMessage = '';
    
//     // Fetch all necessary data in parallel
//     forkJoin({
//       patientData: this.healthDataService.getPatientHealthData(this.patientId),
//       daily: this.healthDataService.getHealthDataByTimeframe(this.patientId, 'day', this.startDate, this.endDate),
//       weekly: this.healthDataService.getHealthDataByTimeframe(this.patientId, 'week', this.startDate, this.endDate),
//       monthly: this.healthDataService.getHealthDataByTimeframe(this.patientId, 'month', this.startDate, this.endDate),
//       yearly: this.healthDataService.getHealthDataByTimeframe(this.patientId, 'year', this.startDate, this.endDate),
//       stats: this.healthDataService.getHealthStats(this.patientId),
//       alerts: this.healthDataService.getHealthAlerts(this.patientId)
//     }).subscribe({
//       next: (results) => {
//         console.log('Data received from service:', results);
        
//         // Process patient data
//         if (results.patientData) {
//           this.patientName = 'Fatima Akter';
          
//           // Set last update time if available
//           if (results.patientData.lastUpdate) {
//             this.lastUpdate = results.patientData.lastUpdate;
//           }
//         }
        
//         // Process timeframe data
//         console.log('Processing timeframe data');
        
//         // Format daily data - convert timestamp to time property
//         const dayData = results.daily.map(item => ({
//           time: new Date(item.timestamp).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
//           heartRate: item.heartRate,
//           bloodPressure: typeof item.bloodPressure === 'string' ? 
//             { systolic: parseInt(item.bloodPressure.split('/')[0]), diastolic: parseInt(item.bloodPressure.split('/')[1]) } : 
//             item.bloodPressure,
//           oxygenLevel: typeof item.oxygenLevel === 'string' ? 
//             parseInt(item.oxygenLevel.replace('%', '')) : item.oxygenLevel,
//           temperature: typeof item.temperature === 'string' ? 
//             parseFloat(item.temperature.replace('°C', '')) : item.temperature
//         }));
        
//         // Format weekly data with proper structure
//         const weekData = results.weekly.map(item => {
//           // Extract systolic and diastolic from bloodPressure string
//           let systolic = 0, diastolic = 0;
//           if (typeof item.bloodPressure === 'string') {
//             const parts = item.bloodPressure.split('/');
//             if (parts.length === 2) {
//               systolic = parseInt(parts[0], 10);
//               diastolic = parseInt(parts[1], 10);
//             }
//           }
          
//           // Extract numeric values
//           const heartRate = typeof item.heartRate === 'number' ? item.heartRate : parseInt(String(item.heartRate));
//           const oxygen = parseInt(String(item.oxygenLevel).replace('%', ''));
//           const temp = parseFloat(String(item.temperature).replace('°C', ''));
          
//           return {
//             date: new Date(item.timestamp).toISOString().split('T')[0],
//             heartRate: {
//               avg: heartRate,
//               min: Math.max(heartRate - 5, 50),
//               max: heartRate + 5
//             },
//             bloodPressure: {
//               systolic: {
//                 avg: systolic,
//                 min: Math.max(systolic - 5, 90),
//                 max: systolic + 5
//               },
//               diastolic: {
//                 avg: diastolic,
//                 min: Math.max(diastolic - 5, 60),
//                 max: diastolic + 5
//               }
//             },
//             oxygenLevel: {
//               avg: oxygen,
//               min: Math.max(oxygen - 1, 90),
//               max: Math.min(oxygen + 1, 100)
//             },
//             temperature: {
//               avg: temp,
//               min: Math.max(temp - 0.3, 35.5),
//               max: Math.min(temp + 0.3, 38.0)
//             }
//           };
//         });
        
//         console.log('Day data formatted:', dayData);
//         console.log('Week data formatted:', weekData);
        
//         this.metrics = {
//           day: dayData,
//           week: weekData,
//           month: [], // Not formatting these for now
//           year: []
//         };
        
//         // Process statistics
//         if (results.stats) {
//           if (results.stats.heartRate) {
//             this.heartRateStats = results.stats.heartRate;
//           }
          
//           if (results.stats.bloodPressure) {
//             this.bloodPressureStats = results.stats.bloodPressure;
//           }
          
//           if (results.stats.oxygenLevel) {
//             this.oxygenLevelStats = results.stats.oxygenLevel;
//           }
          
//           if (results.stats.temperature) {
//             this.temperatureStats = results.stats.temperature;
//           }
//         }
        
//         // Process alerts
//         this.alerts = results.alerts || [];
        
//         this.isLoading = false;
//         console.log('Component data ready:', {
//           metrics: this.metrics,
//           heartRateStats: this.heartRateStats,
//           bloodPressureStats: this.bloodPressureStats,
//           oxygenLevelStats: this.oxygenLevelStats,
//           temperatureStats: this.temperatureStats,
//           alerts: this.alerts
//         });
//       },
//       error: (error) => {
//         console.error('Error loading patient health data:', error);
//         console.error('Stack trace:', error?.stack);
        
//         // Use dummy data instead of showing error
//         console.log('Using dummy data as fallback');
        
//         // Set dummy metrics
//         this.metrics = {
//           day: this.dummyDayData,
//           week: this.dummyWeekData,
//           month: [],
//           year: []
//         };
        
//         // Set dummy stats
//         this.heartRateStats = this.dummyStats.heartRate;
//         this.bloodPressureStats = this.dummyStats.bloodPressure;
//         this.oxygenLevelStats = this.dummyStats.oxygenLevel;
//         this.temperatureStats = this.dummyStats.temperature;
        
//         // Set dummy alerts
//         // this.alerts = this.dummyAlerts;
        
//         // Set patient data
//         this.patientName = 'Fatima Akter (Demo)';
//         this.lastUpdate = new Date().toISOString();
        
//         // Clear loading state
//         this.isLoading = false;
//       }
//     });
//   }
  
//   // Navigation methods
//   navigateBack(): void {
//     this.router.navigate(['/patients', this.patientId]);
//   }
  
//   // Methods for changing timeframe/metric
//   changeTimeframe(timeframe: TimeframeType): void {
//     this.selectedTimeframe = timeframe;
//   }
  
//   changeMetric(metric: MetricType): void {
//     this.selectedMetric = metric;
//   }
  
//   // Date filter methods
//   updateDateRange(startDate: Date, endDate: Date): void {
//     this.startDate = startDate;
//     this.endDate = endDate;
//     this.loadPatientData();
//   }
  
//   // Set date range to today
//   setTodayRange(): void {
//     const today = new Date();
//     this.startDate = new Date(today.getFullYear(), today.getMonth(), today.getDate(), 0, 0, 0, 0);
//     this.endDate = new Date(today.getFullYear(), today.getMonth(), today.getDate(), 23, 59, 59, 999);
//     this.loadPatientData();
//   }
  
//   // Set date range to last week
//   setWeekRange(): void {
//     this.endDate = new Date();
//     this.endDate.setHours(23, 59, 59, 999);
    
//     this.startDate = new Date();
//     this.startDate.setDate(this.endDate.getDate() - 7);
//     this.startDate.setHours(0, 0, 0, 0);
    
//     this.loadPatientData();
//   }
  
//   // Set date range to last month
//   setMonthRange(): void {
//     this.endDate = new Date();
//     this.endDate.setHours(23, 59, 59, 999);
    
//     this.startDate = new Date();
//     this.startDate.setMonth(this.endDate.getMonth() - 1);
//     this.startDate.setHours(0, 0, 0, 0);
    
//     this.loadPatientData();
//   }
  
//   // Modified to accept string timestamps instead of Date objects
//   formatDate(timestamp: string): string {
//     if (!timestamp) return '';
    
//     try {
//       const date = new Date(timestamp);
      
//       if (isNaN(date.getTime())) return timestamp;
      
//       return date.toLocaleString('en-US', {
//         month: 'short',
//         day: 'numeric',
//         hour: 'numeric',
//         minute: 'numeric',
//         hour12: true
//       });
//     } catch (error) {
//       return timestamp;
//     }
//   }
  
//   // Get CSS class for severity
//   getSeverityClass(severity: string): string {
//     switch (severity?.toLowerCase()) {
//       case 'high':
//         return 'severity-high';
//       case 'medium':
//         return 'severity-medium';
//       case 'low':
//         return 'severity-low';
//       default:
//         return '';
//     }
//   }
  
//   isAbnormalReading(metric: string, value: any): boolean {
//     if (value === undefined || value === null) return false;
    
//     return this.healthDataService.isAbnormalReading(metric, value);
//   }
// }


// import { Component, OnInit } from '@angular/core';
// import { CommonModule } from '@angular/common';
// import { FormsModule } from '@angular/forms';
// import { ActivatedRoute, Router } from '@angular/router';

// import { forkJoin } from 'rxjs';
// import { TimeframeType, MetricType, MetricStats, BloodPressureStats, HealthAlert } from '../../../models/patient-health-data.model';
// import { PatientHealthDataService } from '../../../patient-details/services/health-data.service';
// import { HeaderComponent } from '../../../dashboard/components/header/header.component';
// import { SidebarComponent } from '../../../dashboard/components/sidebar/sidebar.component';
// import { AlertComponent } from '../../../shared/components/alert/alert.component';

// @Component({
//   selector: 'app-detailed-health-data',
//   standalone: true,
//   imports: [CommonModule, FormsModule,  CommonModule,
//       SidebarComponent,
//       HeaderComponent,
//       AlertComponent],
//   templateUrl: './detailed-health-data.component.html',
//   styleUrl: './detailed-health-data.component.css'
// })
// export class DetailedHealthDataComponent implements OnInit {
//   patientId: string = '';
//   patientName: string = '';
//   sidebarCollapsed = false;
//   // Time selection
//   selectedTimeframe: TimeframeType = 'week';
//   selectedDate: string = new Date().toISOString().split('T')[0];
  
//   // Date range filters
//   startDate: Date = new Date();
//   endDate: Date = new Date();
  
//   // Metric selection
//   selectedMetric: MetricType = 'all';
  
//   // Last update information
//   lastUpdate: string = new Date().toISOString();
  
//   // Data containers
//   metrics: { [key in TimeframeType]?: any[] } = {};
  
//   // Stats for each metric with default values to prevent null errors
//   heartRateStats: MetricStats = {
//     current: 0,
//     min: 0,
//     max: 0,
//     avg: 0,
//     normal: { min: 60, max: 100 }
//   };
  
//   bloodPressureStats: BloodPressureStats = {
//     current: '0/0',
//     systolicRange: { min: 0, max: 0 },
//     diastolicRange: { min: 0, max: 0 },
//     normal: {
//       systolic: { min: 90, max: 120 },
//       diastolic: { min: 60, max: 80 }
//     }
//   };
  
//   oxygenLevelStats: MetricStats = {
//     current: 0,
//     min: 0,
//     max: 0,
//     avg: 0,
//     normal: { min: 95, max: 100 }
//   };
  
//   temperatureStats: MetricStats = {
//     current: 0,
//     min: 0,
//     max: 0,
//     avg: 0,
//     normal: { min: 36.1, max: 37.2 }
//   };
  
//   // Alerts
//   alerts: HealthAlert[] = [];
  
//   isLoading: boolean = false;
//   errorMessage: string = '';
  
//   constructor(
//     private route: ActivatedRoute,
//     private router: Router,
//     private healthDataService: PatientHealthDataService
//   ) {
//     // Set default date range (last 7 days)
//     this.endDate = new Date();
//     this.endDate.setHours(23, 59, 59, 999);
    
//     this.startDate = new Date();
//     this.startDate.setDate(this.endDate.getDate() - 7);
//     this.startDate.setHours(0, 0, 0, 0);
//   }
  
//   ngOnInit(): void {
//     console.log('DetailedHealthDataComponent initialized');
//     this.patientId = '8801776613630'; // Adding the 88 prefix to match Firebase data structure
//     console.log('Using hardcoded patient ID:', this.patientId);
//     this.loadPatientData();
//   }
  
//   loadPatientData(): void {
//     if (!this.patientId) {
//       this.errorMessage = 'Patient ID is required';
//       console.error('Patient ID is missing');
//       return;
//     }
    
//     console.log('Loading patient data for ID:', this.patientId);
//     console.log('Date range:', this.startDate, 'to', this.endDate);
    
//     this.isLoading = true;
//     this.errorMessage = '';
    
//     // Fetch all necessary data in parallel
//     forkJoin({
//       patientData: this.healthDataService.getPatientHealthData(this.patientId),
//       daily: this.healthDataService.getHealthDataByTimeframe(this.patientId, 'day', this.startDate, this.endDate),
//       weekly: this.healthDataService.getHealthDataByTimeframe(this.patientId, 'week', this.startDate, this.endDate),
//       monthly: this.healthDataService.getHealthDataByTimeframe(this.patientId, 'month', this.startDate, this.endDate),
//       yearly: this.healthDataService.getHealthDataByTimeframe(this.patientId, 'year', this.startDate, this.endDate),
//       stats: this.healthDataService.getHealthStats(this.patientId),
//       alerts: this.healthDataService.getHealthAlerts(this.patientId)
//     }).subscribe({
//       next: (results) => {
//         console.log('Data received from service:', results);
//         // Process patient data
//         if (results.patientData) {
//           // Extract patient name if available (customize based on your data structure)
//           this.patientName =  'Fatima Akter';
          
//           // Set last update time if available
//           if (results.patientData.lastUpdate) {
//             this.lastUpdate = results.patientData.lastUpdate;
//           }
//         }
        
//         // Process timeframe data
//         console.log('Processing timeframe data');
//         const dayData = this.healthDataService.formatDataForDisplay('day', results.daily) || [];
//         const weekData = this.healthDataService.formatDataForDisplay('week', results.weekly) || [];
//         const monthData = this.healthDataService.formatDataForDisplay('month', results.monthly) || [];
//         const yearData = results.yearly || [];
        
//         console.log('Day data:', dayData);
//         console.log('Week data:', weekData);
//         console.log('Month data:', monthData);
//         console.log('Year data:', yearData);
        
//         this.metrics = {
//           day: dayData,
//           week: weekData,
//           month: monthData,
//           year: yearData
//         };
        
//         // Process statistics
//         if (results.stats) {
//           if (results.stats.heartRate) {
//             this.heartRateStats = {
//               ...this.heartRateStats,
//               ...results.stats.heartRate
//             };
//           }
          
//           if (results.stats.bloodPressure) {
//             this.bloodPressureStats = {
//               ...this.bloodPressureStats,
//               ...results.stats.bloodPressure
//             };
//           }
          
//           if (results.stats.oxygenLevel) {
//             this.oxygenLevelStats = {
//               ...this.oxygenLevelStats,
//               ...results.stats.oxygenLevel
//             };
//           }
          
//           if (results.stats.temperature) {
//             this.temperatureStats = {
//               ...this.temperatureStats,
//               ...results.stats.temperature
//             };
//           }
//         }
        
//         // If no stats are available, extract from latest readings
//         if (results.patientData && results.patientData.data) {
//           const timestamps = Object.keys(results.patientData.data).sort();
//           if (timestamps.length > 0) {
//             const latestData = results.patientData.data[timestamps[timestamps.length - 1]];
            
//             // Update current values if available
//             if (latestData.heartRate) {
//               this.heartRateStats.current = latestData.heartRate.value;
//             }
            
//             if (latestData.bloodPressure) {
//               this.bloodPressureStats.current = `${latestData.bloodPressure.systolic}/${latestData.bloodPressure.diastolic}`;
//             }
            
//             if (latestData.oxygenLevel) {
//               this.oxygenLevelStats.current = latestData.oxygenLevel.value;
//             }
            
//             if (latestData.temperature) {
//               this.temperatureStats.current = latestData.temperature.value;
//             }
//           }
//         }
        
//         // Process alerts
//         this.alerts = results.alerts || [];
        
//         this.isLoading = false;
//         console.log('Component data ready:', {
//           metrics: this.metrics,
//           heartRateStats: this.heartRateStats,
//           bloodPressureStats: this.bloodPressureStats,
//           oxygenLevelStats: this.oxygenLevelStats,
//           temperatureStats: this.temperatureStats,
//           alerts: this.alerts
//         });
//       },
//       error: (error) => {
//         console.error('Error loading patient health data:', error);
//         console.error('Stack trace:', error?.stack);
//         this.errorMessage = 'Failed to load health data. Please try again later.';
//         this.isLoading = false;
//       }
//     });
//   }
  
//   // Navigation methods
//   navigateBack(): void {
//     this.router.navigate(['/patients', this.patientId]);
//   }
  
//   // Methods for changing timeframe/metric
//   changeTimeframe(timeframe: TimeframeType): void {
//     this.selectedTimeframe = timeframe;
//   }
  
//   changeMetric(metric: MetricType): void {
//     this.selectedMetric = metric;
//   }
  
//   // Date filter methods
//   updateDateRange(startDate: Date, endDate: Date): void {
//     this.startDate = startDate;
//     this.endDate = endDate;
//     this.loadPatientData();
//   }
  
//   // Set date range to today
//   setTodayRange(): void {
//     const today = new Date();
//     this.startDate = new Date(today.getFullYear(), today.getMonth(), today.getDate(), 0, 0, 0, 0);
//     this.endDate = new Date(today.getFullYear(), today.getMonth(), today.getDate(), 23, 59, 59, 999);
//     this.loadPatientData();
//   }
  
//   // Set date range to last week
//   setWeekRange(): void {
//     this.endDate = new Date();
//     this.endDate.setHours(23, 59, 59, 999);
    
//     this.startDate = new Date();
//     this.startDate.setDate(this.endDate.getDate() - 7);
//     this.startDate.setHours(0, 0, 0, 0);
    
//     this.loadPatientData();
//   }
  
//   // Set date range to last month
//   setMonthRange(): void {
//     this.endDate = new Date();
//     this.endDate.setHours(23, 59, 59, 999);
    
//     this.startDate = new Date();
//     this.startDate.setMonth(this.endDate.getMonth() - 1);
//     this.startDate.setHours(0, 0, 0, 0);
    
//     this.loadPatientData();
//   }
  
//   // Modified to accept string timestamps instead of Date objects
//   formatDate(timestamp: string): string {
//     if (!timestamp) return '';
    
//     try {
//       const date = new Date(timestamp);
      
//       if (isNaN(date.getTime())) return timestamp;
      
//       return date.toLocaleString('en-US', {
//         month: 'short',
//         day: 'numeric',
//         hour: 'numeric',
//         minute: 'numeric',
//         hour12: true
//       });
//     } catch (error) {
//       return timestamp;
//     }
//   }
//   toggleSidebar(): void {
//     this.sidebarCollapsed = !this.sidebarCollapsed;
//   }
//   // Get CSS class for severity
//   getSeverityClass(severity: string): string {
//     switch (severity?.toLowerCase()) {
//       case 'high':
//         return 'severity-high';
//       case 'medium':
//         return 'severity-medium';
//       case 'low':
//         return 'severity-low';
//       default:
//         return '';
//     }
//   }
  
//   isAbnormalReading(metric: string, value: any): boolean {
//     if (value === undefined || value === null) return false;
    
//     return this.healthDataService.isAbnormalReading(metric, value);
//   }
// }

// import { Component, OnInit } from '@angular/core';
// import { CommonModule } from '@angular/common';
// import { FormsModule } from '@angular/forms';
// import { ActivatedRoute, Router } from '@angular/router';

// import { forkJoin } from 'rxjs';
// import { TimeframeType, MetricType, MetricStats, BloodPressureStats, HealthAlert } from '../../../models/patient-health-data.model';
// import { PatientHealthDataService } from '../../../patient-details/services/health-data.service';

// @Component({
//   selector: 'app-detailed-health-data',
//   standalone: true,
//   imports: [CommonModule, FormsModule],
//   templateUrl: './detailed-health-data.component.html',
//   styleUrl: './detailed-health-data.component.css'
// })
// export class DetailedHealthDataComponent implements OnInit {
//   patientId: string = '';
//   patientName: string = '';
  
//   // Time selection
//   selectedTimeframe: TimeframeType = 'week';
//   selectedDate: string = new Date().toISOString().split('T')[0];
  
//   // Metric selection
//   selectedMetric: MetricType = 'all';
  
//   // Last update information
//   lastUpdate: string = new Date().toISOString();
  
//   // Data containers
//   metrics: { [key in TimeframeType]?: any[] } = {};
  
//   // Stats for each metric with default values to prevent null errors
//   heartRateStats: MetricStats = {
//     current: 0,
//     min: 0,
//     max: 0,
//     avg: 0,
//     normal: { min: 0, max: 0 }
//   };
  
//   bloodPressureStats: BloodPressureStats = {
//     current: '0/0',
//     systolicRange: { min: 0, max: 0 },
//     diastolicRange: { min: 0, max: 0 },
//     normal: {
//       systolic: { min: 0, max: 0 },
//       diastolic: { min: 0, max: 0 }
//     }
//   };
  
//   oxygenLevelStats: MetricStats = {
//     current: 0,
//     min: 0,
//     max: 0,
//     avg: 0,
//     normal: { min: 0, max: 0 }
//   };
  
//   temperatureStats: MetricStats = {
//     current: 0,
//     min: 0,
//     max: 0,
//     avg: 0,
//     normal: { min: 0, max: 0 }
//   };
  
//   // Alerts
//   alerts: HealthAlert[] = [];
  
//   isLoading: boolean = false;
//   errorMessage: string = '';
  
//   constructor(
//     private route: ActivatedRoute,
//     private router: Router,
//     private healthDataService: PatientHealthDataService
//   ) {}
  
//   ngOnInit(): void {
//     this.route.params.subscribe(params => {
//       this.patientId = params['id'];
//       this.loadPatientData();
//     });
//   }
  
//   loadPatientData(): void {
//     if (!this.patientId) return;
    
//     this.isLoading = true;
//     this.errorMessage = '';
    
//     // Fetch all necessary data in parallel
//     forkJoin({
//       today: this.healthDataService.getHealthDataByTimeframe(this.patientId, 'today'),
//       daily: this.healthDataService.getHealthDataByTimeframe(this.patientId, 'day'),
//       weekly: this.healthDataService.getHealthDataByTimeframe(this.patientId, 'week'),
//       monthly: this.healthDataService.getHealthDataByTimeframe(this.patientId, 'month'),
//       yearly: this.healthDataService.getHealthDataByTimeframe(this.patientId, 'year'),
//       stats: this.healthDataService.getHealthStats(this.patientId),
//       alerts: this.healthDataService.getHealthAlerts(this.patientId),
//       patientData: this.healthDataService.getPatientHealthData(this.patientId)
//     }).subscribe({
//       next: (results) => {
//         // Process timeframe data
//         this.metrics = {
//           day: this.healthDataService.formatDataForDisplay('day', results.daily),
//           week: this.healthDataService.formatDataForDisplay('week', results.weekly),
//           month: this.healthDataService.formatDataForDisplay('month', results.monthly),
//           year: results.yearly
//         };
        
//         // Process statistics
//         if (results.stats) {
//           if (results.stats.heartRate) {
//             this.heartRateStats = results.stats.heartRate;
//           }
          
//           if (results.stats.bloodPressure) {
//             this.bloodPressureStats = results.stats.bloodPressure;
//           }
          
//           if (results.stats.oxygenLevel) {
//             this.oxygenLevelStats = results.stats.oxygenLevel;
//           }
          
//           if (results.stats.temperature) {
//             this.temperatureStats = results.stats.temperature;
//           }
//         }
        
//         // Process alerts
//         this.alerts = results.alerts;
        
//         // Set last update time
//         if (results.patientData && results.patientData.lastUpdate) {
//           this.lastUpdate = results.patientData.lastUpdate;
//         }
        
//         this.isLoading = false;
//       },
//       error: (error) => {
//         console.error('Error loading patient health data:', error);
//         this.errorMessage = 'Failed to load health data';
//         this.isLoading = false;
//       }
//     });
    
//     // In a real app, fetch patient name from a user/patient service
//     // For now we'll use mock data
//     this.patientName = 'Fatima Akter';
//   }
  
//   // Navigation methods
//   navigateBack(): void {
//     this.router.navigate(['/patients', this.patientId]);
//   }
  
//   // Methods for changing timeframe/metric
//   changeTimeframe(timeframe: TimeframeType): void {
//     this.selectedTimeframe = timeframe;
//   }
  
//   changeMetric(metric: MetricType): void {
//     this.selectedMetric = metric;
//   }
  
//   // Modified to accept string timestamps instead of Date objects
//   formatDate(timestamp: string): string {
//     if (!timestamp) return '';
    
//     const date = new Date(timestamp);
    
//     if (isNaN(date.getTime())) return timestamp;
    
//     return date.toLocaleString('en-US', {
//       month: 'short',
//       day: 'numeric',
//       hour: 'numeric',
//       minute: 'numeric',
//       hour12: true
//     });
//   }
  
//   // Get CSS class for severity
//   getSeverityClass(severity: string): string {
//     switch(severity) {
//       case 'high':
//         return 'severity-high';
//       case 'medium':
//         return 'severity-medium';
//       case 'low':
//         return 'severity-low';
//       default:
//         return '';
//     }
//   }
  
//   isAbnormalReading(metric: string, value: any): boolean {
//     return this.healthDataService.isAbnormalReading(metric, value);
//   }
// }

//lagecy
import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { ActivatedRoute, Router } from '@angular/router';
import { SidebarComponent } from '../../../dashboard/components/sidebar/sidebar.component';
import { HeaderComponent } from '../../../dashboard/components/header/header.component';
import { HealthChartComponent } from '../health-chart/health-chart.component';

@Component({
  selector: 'app-detailed-health-data',
  standalone: true,
  imports: [
    CommonModule, 
    FormsModule, 
    SidebarComponent,
    HeaderComponent,
    HealthChartComponent
  ],
  templateUrl: './detailed-health-data.component.html',
  styleUrl: './detailed-health-data.component.css'
})
export class DetailedHealthDataComponent implements OnInit {
  patientId: number = 0;
  patientName: string = '';
  sidebarCollapsed: boolean = false;
  // Time selection
  selectedTimeframe: 'day' | 'week' | 'month' | 'year' = 'week';
  selectedDate: string = new Date().toISOString().split('T')[0];
  
  // Metric selection
  selectedMetric: 'heartRate' | 'bloodPressure' | 'oxygenLevel' | 'temperature' | 'all' = 'all';
  
  // Last update information
  lastUpdate: Date = new Date();
  
  // Mock health data - in a real app, this would come from a service
  metrics = {
    day: this.generateDailyData(),
    week: this.generateWeeklyData(),
    month: this.generateMonthlyData(),
    year: this.generateYearlyData()
  };
  
  // Stats for each metric
  heartRateStats = {
    current: 76,
    min: 68,
    max: 96,
    avg: 82,
    normal: {
      min: 60,
      max: 100
    }
  };
  
  bloodPressureStats = {
    current: '124/82',
    systolicRange: {
      min: 110,
      max: 135
    },
    diastolicRange: {
      min: 70,
      max: 85
    },
    normal: {
      systolic: {
        min: 90,
        max: 120
      },
      diastolic: {
        min: 60,
        max: 80
      }
    }
  };
  
  oxygenLevelStats = {
    current: 97,
    min: 95,
    max: 99,
    avg: 97.5,
    normal: {
      min: 95,
      max: 100
    }
  };
  
  temperatureStats = {
    current: 37.1,
    min: 36.5,
    max: 37.5,
    avg: 36.9,
    normal: {
      min: 36.5,
      max: 37.5
    }
  };
  
  // Generate alerts based on data
  alerts = [
    {
      metric: 'Blood Pressure',
      status: 'Warning',
      message: 'Systolic pressure exceeded 130 mmHg at 2:30 PM on March 1',
      date: new Date(2025, 2, 1, 14, 30),
      severity: 'medium'
    },
    {
      metric: 'Heart Rate',
      status: 'Alert',
      message: 'Heart rate spiked to 115 bpm at 10:45 AM on March 2',
      date: new Date(2025, 2, 2, 10, 45),
      severity: 'high'
    },
    {
      metric: 'Temperature',
      status: 'Normal',
      message: 'Temperature has been stable for the past week',
      date: new Date(2025, 2, 3, 8, 15),
      severity: 'low'
    }
  ];
  
  constructor(
    private route: ActivatedRoute,
    private router: Router
  ) {}
  
  ngOnInit(): void {
    this.route.params.subscribe(params => {
      this.patientId = +params['id']; // Convert to number
      // In a real app, fetch patient data from a service
      this.patientName = 'Fatima Akter'; // Mock data
    });
  }
  
  // Navigation methods
  navigateBack(): void {
    this.router.navigate(['/patients', this.patientId]);
  }
  
  // Methods for changing timeframe/metric
  changeTimeframe(timeframe: 'day' | 'week' | 'month' | 'year'): void {
    this.selectedTimeframe = timeframe;
  }
  
  changeMetric(metric: 'heartRate' | 'bloodPressure' | 'oxygenLevel' | 'temperature' | 'all'): void {
    this.selectedMetric = metric;
  }
  
  // Helper methods for formatting
  formatDate(date: Date): string {
    return date.toLocaleString('en-US', {
      month: 'short',
      day: 'numeric',
      hour: 'numeric',
      minute: 'numeric',
      hour12: true
    });
  }
  toggleSidebar(): void {
    this.sidebarCollapsed = !this.sidebarCollapsed;
  }
  
  // Get CSS class for severity
  getSeverityClass(severity: string): string {
    switch(severity) {
      case 'high':
        return 'severity-high';
      case 'medium':
        return 'severity-medium';
      case 'low':
        return 'severity-low';
      default:
        return '';
    }
  }
  
  // Methods to generate mock data
  private generateDailyData() {
    const hours = [];
    const now = new Date();
    
    for (let i = 0; i < 24; i++) {
      const hour = new Date(now);
      hour.setHours(i, 0, 0, 0);
      
      hours.push({
        time: hour,
        heartRate: this.randomIntBetween(70, 95),
        bloodPressure: {
          systolic: this.randomIntBetween(110, 135),
          diastolic: this.randomIntBetween(70, 85)
        },
        oxygenLevel: this.randomIntBetween(95, 99),
        temperature: this.randomFloatBetween(36.5, 37.5)
      });
    }
    
    return hours;
  }
  
  private generateWeeklyData() {
    const days = [];
    const today = new Date();
    
    for (let i = 6; i >= 0; i--) {
      const day = new Date(today);
      day.setDate(today.getDate() - i);
      
      days.push({
        date: day,
        heartRate: {
          avg: this.randomIntBetween(75, 85),
          min: this.randomIntBetween(65, 75),
          max: this.randomIntBetween(90, 110)
        },
        bloodPressure: {
          systolic: {
            avg: this.randomIntBetween(115, 130),
            min: this.randomIntBetween(110, 115),
            max: this.randomIntBetween(130, 140)
          },
          diastolic: {
            avg: this.randomIntBetween(75, 80),
            min: this.randomIntBetween(70, 75),
            max: this.randomIntBetween(80, 90)
          }
        },
        oxygenLevel: {
          avg: this.randomIntBetween(96, 98),
          min: this.randomIntBetween(95, 96),
          max: this.randomIntBetween(98, 99)
        },
        temperature: {
          avg: this.randomFloatBetween(36.7, 37.0),
          min: this.randomFloatBetween(36.5, 36.7),
          max: this.randomFloatBetween(37.0, 37.3)
        }
      });
    }
    
    return days;
  }
  
  private generateMonthlyData() {
    const weeks = [];
    const today = new Date();
    
    for (let i = 3; i >= 0; i--) {
      const weekStart = new Date(today);
      weekStart.setDate(today.getDate() - (i * 7));
      
      const weekEnd = new Date(weekStart);
      weekEnd.setDate(weekStart.getDate() + 6);
      
      weeks.push({
        startDate: weekStart,
        endDate: weekEnd,
        label: `Week ${4-i}`,
        heartRate: {
          avg: this.randomIntBetween(75, 85),
          trend: this.randomIntBetween(-5, 5)
        },
        bloodPressure: {
          systolic: {
            avg: this.randomIntBetween(115, 130),
            trend: this.randomIntBetween(-5, 5)
          },
          diastolic: {
            avg: this.randomIntBetween(75, 80),
            trend: this.randomIntBetween(-3, 3)
          }
        },
        oxygenLevel: {
          avg: this.randomIntBetween(96, 98),
          trend: this.randomFloatBetween(-1, 1)
        },
        temperature: {
          avg: this.randomFloatBetween(36.7, 37.0),
          trend: this.randomFloatBetween(-0.3, 0.3)
        }
      });
    }
    
    return weeks;
  }
  
  private generateYearlyData() {
    const months = [];
    const today = new Date();
    
    for (let i = 11; i >= 0; i--) {
      const month = new Date(today.getFullYear(), today.getMonth() - i, 1);
      
      months.push({
        month: month,
        label: month.toLocaleString('en-US', { month: 'short' }),
        heartRate: {
          avg: this.randomIntBetween(75, 85),
          trend: this.randomIntBetween(-8, 8)
        },
        bloodPressure: {
          systolic: {
            avg: this.randomIntBetween(115, 130),
            trend: this.randomIntBetween(-10, 10)
          },
          diastolic: {
            avg: this.randomIntBetween(75, 80),
            trend: this.randomIntBetween(-5, 5)
          }
        },
        oxygenLevel: {
          avg: this.randomIntBetween(96, 98),
          trend: this.randomFloatBetween(-1.5, 1.5)
        },
        temperature: {
          avg: this.randomFloatBetween(36.7, 37.0),
          trend: this.randomFloatBetween(-0.5, 0.5)
        }
      });
    }
    
    return months;
  }
  
  private randomIntBetween(min: number, max: number): number {
    return Math.floor(Math.random() * (max - min + 1) + min);
  }
  
  private randomFloatBetween(min: number, max: number): number {
    return parseFloat((Math.random() * (max - min) + min).toFixed(1));
  }
}