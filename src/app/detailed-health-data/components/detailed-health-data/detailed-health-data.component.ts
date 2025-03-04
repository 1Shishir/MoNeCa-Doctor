import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { ActivatedRoute, Router } from '@angular/router';

@Component({
  selector: 'app-detailed-health-data',
  standalone: true,
  imports: [CommonModule, FormsModule],
  templateUrl: './detailed-health-data.component.html',
  styleUrl: './detailed-health-data.component.css'
})
export class DetailedHealthDataComponent implements OnInit {
  patientId: number = 0;
  patientName: string = '';
  
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