import { Component, Input, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';

@Component({
  selector: 'app-patient-insights',
  standalone: true,
  imports: [CommonModule],
  templateUrl: './patient-insights.component.html',
  styleUrl: './patient-insights.component.css'
})
export class PatientInsightsComponent implements OnInit {
  @Input() patient: any;
  @Input() healthData: any;
  
  // Added property for average sleep hours
  averageSleepHours: string = '0.0';
  
  // Mock predictions and insights
  predictions = {
    riskScore: 68,
    preeclampsia: {
      risk: 'Medium',
      probability: 35,
      factors: [
        'Previous history of hypertension',
        'Elevated blood pressure readings',
        'Family history of preeclampsia'
      ]
    },
    gestationalDiabetes: {
      risk: 'High',
      probability: 72,
      factors: [
        'Current blood glucose levels',
        'Previous diagnosis of gestational diabetes',
        'BMI above recommended range'
      ]
    },
    pretermBirth: {
      risk: 'Low',
      probability: 12,
      factors: [
        'No previous preterm births',
        'Regular prenatal care',
        'Normal cervical length'
      ]
    }
  };
  
  // Mock nutrition insights
  nutritionInsights = {
    deficiencies: [
      {
        nutrient: 'Iron',
        status: 'Low',
        recommendation: 'Increase intake of iron-rich foods like spinach, beans, and red meat'
      },
      {
        nutrient: 'Calcium',
        status: 'Moderate',
        recommendation: 'Maintain current intake of dairy products and calcium-rich foods'
      },
      {
        nutrient: 'Folic Acid',
        status: 'Optimal',
        recommendation: 'Continue current supplementation'
      }
    ],
    dietRecommendations: [
      'Reduce sodium intake to help manage blood pressure',
      'Increase protein consumption for optimal fetal development',
      'Include more fiber-rich foods to manage blood glucose levels',
      'Stay hydrated with at least 2-3 liters of water daily'
    ]
  };
  
  // Mock activity insights
  activityInsights = {
    currentLevel: 'Moderate',
    recommendations: [
      'Gentle walking for 20-30 minutes daily',
      'Prenatal yoga twice a week',
      'Swimming or water aerobics for low-impact exercise',
      'Avoid standing for long periods'
    ],
    restrictions: [
      'Avoid high-impact activities',
      'No heavy lifting'
    ]
  };
  
  // Mock sleep pattern
  sleepPatterns = [
    { day: 'Monday', hours: 6.5, quality: 'Poor', issues: ['Frequent waking'] },
    { day: 'Tuesday', hours: 7.2, quality: 'Fair', issues: ['Back pain'] },
    { day: 'Wednesday', hours: 7.8, quality: 'Good', issues: [] },
    { day: 'Thursday', hours: 6.8, quality: 'Fair', issues: ['Bathroom visits'] },
    { day: 'Friday', hours: 7.5, quality: 'Good', issues: [] },
    { day: 'Saturday', hours: 8.2, quality: 'Excellent', issues: [] },
    { day: 'Sunday', hours: 7.0, quality: 'Fair', issues: ['Back pain'] }
  ];
  
  ngOnInit(): void {
    // Calculate average sleep hours
    this.calculateAverageSleepHours();
  }
  
  // Method to calculate average sleep hours
  calculateAverageSleepHours(): void {
    if (this.sleepPatterns && this.sleepPatterns.length > 0) {
      const totalHours = this.sleepPatterns.reduce((total, day) => total + day.hours, 0);
      this.averageSleepHours = (totalHours / this.sleepPatterns.length).toFixed(1);
    } else {
      this.averageSleepHours = '0.0';
    }
  }
  
  getRiskColor(risk: string): string {
    switch(risk.toLowerCase()) {
      case 'low':
        return '#22c55e';
      case 'medium':
        return '#f59e0b';
      case 'high':
        return '#ef4444';
      default:
        return '#6b7280';
    }
  }
  
  getNutrientStatusColor(status: string): string {
    switch(status.toLowerCase()) {
      case 'low':
        return '#ef4444';
      case 'moderate':
        return '#f59e0b';
      case 'optimal':
        return '#22c55e';
      default:
        return '#6b7280';
    }
  }
  
  getSleepQualityColor(quality: string): string {
    switch(quality.toLowerCase()) {
      case 'poor':
        return '#ef4444';
      case 'fair':
        return '#f59e0b';
      case 'good':
        return '#22c55e';
      case 'excellent':
        return '#0ea5e9';
      default:
        return '#6b7280';
    }
  }
}