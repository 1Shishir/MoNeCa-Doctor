import { Component, ElementRef, Input, OnChanges, OnDestroy, OnInit, SimpleChanges, ViewChild } from '@angular/core';
import { CommonModule } from '@angular/common';
import { Chart, ChartConfiguration, ChartType } from 'chart.js/auto';

@Component({
  selector: 'app-health-chart',
  standalone: true,
  imports: [CommonModule],
  template: '<div class="chart-container"><canvas #chartCanvas></canvas></div>',
  styles: [`
    .chart-container {
      position: relative;
      height: 400px;
      width: 100%;
    }
  `]
})
export class HealthChartComponent implements OnInit, OnChanges, OnDestroy {
  @ViewChild('chartCanvas', { static: true }) canvas!: ElementRef<HTMLCanvasElement>;
  @Input() timeframe: 'day' | 'week' | 'month' | 'year' = 'week';
  @Input() metric: 'heartRate' | 'bloodPressure' | 'oxygenLevel' | 'temperature' | 'all' = 'all';
  
  private chart: Chart | null = null;
  private data: any[] = [];

  ngOnInit() {
    this.generateData();
    this.createChart();
  }

  ngOnChanges(changes: SimpleChanges) {
    if ((changes['timeframe'] && !changes['timeframe'].firstChange) || 
        (changes['metric'] && !changes['metric'].firstChange)) {
      this.generateData();
      this.updateChart();
    }
  }

  ngOnDestroy() {
    if (this.chart) {
      this.chart.destroy();
    }
  }

  private generateData() {
    if (this.timeframe === 'day') {
      this.data = this.generateDailyData();
    } else if (this.timeframe === 'week') {
      this.data = this.generateWeeklyData();
    } else if (this.timeframe === 'month') {
      this.data = this.generateMonthlyData();
    } else {
      this.data = this.generateYearlyData();
    }

    // Apply smoothing for more natural data
    this.smoothData();
  }

  private createChart() {
    const ctx = this.canvas.nativeElement.getContext('2d');
    if (!ctx) return;

    const config = this.getChartConfig();
    this.chart = new Chart(ctx, config);
  }

  private updateChart() {
    if (!this.chart) return;
    
    const config = this.getChartConfig();
    
    this.chart.data = config.data;
    // this.chart.options = config.options;
    this.chart.update();
  }

  private getChartConfig(): ChartConfiguration {
    const labels = this.data.map(d => d.label);
    const datasets = this.createDatasets();

    return {
      type: 'line' as ChartType,
      data: {
        labels: labels,
        datasets: datasets
      },
      options: {
        responsive: true,
        maintainAspectRatio: false,
        interaction: {
          mode: 'index',
          intersect: false,
        },
        plugins: {
          tooltip: {
            enabled: true,
            backgroundColor: 'rgba(255, 255, 255, 0.9)',
            titleColor: '#333',
            bodyColor: '#666',
            borderColor: '#ddd',
            borderWidth: 1,
            cornerRadius: 6,
            padding: 12,
            boxPadding: 6,
            usePointStyle: true,
            callbacks: {
              label: (context) => {
                let label = context.dataset.label || '';
                if (label) {
                  label += ': ';
                }
                if (context.parsed.y !== null) {
                  let value = context.parsed.y;
                  if (context.dataset.label?.includes('Temperature')) {
                    label += value.toFixed(1) + '°C';
                  } else if (context.dataset.label?.includes('Oxygen')) {
                    label += value.toFixed(0) + '%';
                  } else if (context.dataset.label?.includes('Heart Rate')) {
                    label += value.toFixed(0) + ' bpm';
                  } else {
                    label += value.toFixed(0) + ' mmHg';
                  }
                }
                return label;
              }
            }
          },
          legend: {
            position: 'top',
            labels: {
              usePointStyle: true,
              padding: 20,
              font: {
                family: "'Segoe UI', Tahoma, Geneva, Verdana, sans-serif",
                size: 12
              }
            }
          },
          title: {
            display: true,
            text: this.getChartTitle(),
            font: {
              family: "'Segoe UI', Tahoma, Geneva, Verdana, sans-serif",
              size: 16,
              weight: 'bold'
            },
            padding: {
              top: 10,
              bottom: 30
            }
          }
        },
        scales: {
          x: {
            grid: {
              display: true,
              color: 'rgba(0, 0, 0, 0.05)'
            },
            ticks: {
              font: {
                family: "'Segoe UI', Tahoma, Geneva, Verdana, sans-serif"
              }
            }
          },
          y: {
            grid: {
              display: true,
              color: 'rgba(0, 0, 0, 0.05)'
            },
            ticks: {
              font: {
                family: "'Segoe UI', Tahoma, Geneva, Verdana, sans-serif"
              }
            },
            ...this.getYAxisOptions()
          }
        },
        elements: {
          line: {
            tension: 0.4 // Smoother curves
          },
          point: {
            radius: 4,
            hoverRadius: 6,
            hitRadius: 8
          }
        },
        animation: {
          duration: 1000,
          easing: 'easeOutQuart'
        }
      }
    };
  }

  private createDatasets() {
    const datasets: any[] = [];

    // Define dataset configs
    const configs = {
      heartRate: {
        label: 'Heart Rate (bpm)',
        borderColor: 'rgb(255, 82, 82)',
        backgroundColor: 'rgba(255, 82, 82, 0.1)',
        borderWidth: 2,
        fill: true
      },
      systolic: {
        label: 'Systolic (mmHg)',
        borderColor: 'rgb(103, 58, 183)',
        backgroundColor: 'rgba(103, 58, 183, 0.1)',
        borderWidth: 2,
        fill: true
      },
      diastolic: {
        label: 'Diastolic (mmHg)',
        borderColor: 'rgb(156, 39, 176)',
        backgroundColor: 'rgba(156, 39, 176, 0.05)',
        borderWidth: 2,
        fill: true,
        borderDash: [5, 5]
      },
      oxygenLevel: {
        label: 'Oxygen Level (%)',
        borderColor: 'rgb(0, 188, 212)',
        backgroundColor: 'rgba(0, 188, 212, 0.1)',
        borderWidth: 2,
        fill: true
      },
      temperature: {
        label: 'Temperature (°C)',
        borderColor: 'rgb(76, 175, 80)',
        backgroundColor: 'rgba(76, 175, 80, 0.1)',
        borderWidth: 2,
        fill: true
      }
    };

    // Add reference lines for normal ranges
    const addReferenceLine = (key: string, value: number, label: string, color: string) => {
      return {
        label: label,
        data: Array(this.data.length).fill(value),
        borderColor: color,
        borderWidth: 1.5,
        borderDash: [5, 5],
        pointRadius: 0,
        fill: false,
        tension: 0
      };
    };

    if (this.metric === 'heartRate' || this.metric === 'all') {
      datasets.push({
        ...configs.heartRate,
        data: this.data.map(d => d.heartRate)
      });
      
      if (this.metric === 'heartRate') {
        datasets.push(addReferenceLine('maxHeartRate', 100, 'Max Normal', 'rgba(255, 82, 82, 0.5)'));
        datasets.push(addReferenceLine('minHeartRate', 60, 'Min Normal', 'rgba(255, 82, 82, 0.5)'));
      }
    }

    if (this.metric === 'bloodPressure' || this.metric === 'all') {
      datasets.push({
        ...configs.systolic,
        data: this.data.map(d => d.systolic)
      });
      
      datasets.push({
        ...configs.diastolic,
        data: this.data.map(d => d.diastolic)
      });
      
      if (this.metric === 'bloodPressure') {
        datasets.push(addReferenceLine('maxSystolic', 120, 'Max Normal Systolic', 'rgba(103, 58, 183, 0.5)'));
        datasets.push(addReferenceLine('maxDiastolic', 80, 'Max Normal Diastolic', 'rgba(156, 39, 176, 0.5)'));
      }
    }

    if (this.metric === 'oxygenLevel' || this.metric === 'all') {
      datasets.push({
        ...configs.oxygenLevel,
        data: this.data.map(d => d.oxygenLevel)
      });
      
      if (this.metric === 'oxygenLevel') {
        datasets.push(addReferenceLine('minOxygen', 95, 'Min Normal', 'rgba(0, 188, 212, 0.5)'));
      }
    }

    if (this.metric === 'temperature' || this.metric === 'all') {
      datasets.push({
        ...configs.temperature,
        data: this.data.map(d => d.temperature)
      });
      
      if (this.metric === 'temperature') {
        datasets.push(addReferenceLine('maxTemp', 37.5, 'Max Normal', 'rgba(76, 175, 80, 0.5)'));
        datasets.push(addReferenceLine('minTemp', 36.5, 'Min Normal', 'rgba(76, 175, 80, 0.5)'));
      }
    }

    return datasets;
  }

  private getYAxisOptions() {
    switch(this.metric) {
      case 'heartRate': 
        return {
          min: 50,
          max: 120,
          title: {
            display: true,
            text: 'Heart Rate (bpm)'
          }
        };
      case 'bloodPressure': 
        return {
          min: 40,
          max: 160,
          title: {
            display: true,
            text: 'Blood Pressure (mmHg)'
          }
        };
      case 'oxygenLevel': 
        return {
          min: 90,
          max: 100,
          title: {
            display: true,
            text: 'Oxygen Level (%)'
          }
        };
      case 'temperature': 
        return {
          min: 36,
          max: 38,
          title: {
            display: true,
            text: 'Temperature (°C)'
          }
        };
      default: 
        return {
          title: {
            display: true,
            text: 'Value'
          }
        };
    }
  }

  private getChartTitle() {
    const metricTitle = this.metric === 'all' ? 'All Health Metrics' : 
                   this.metric === 'heartRate' ? 'Heart Rate' : 
                   this.metric === 'bloodPressure' ? 'Blood Pressure' : 
                   this.metric === 'oxygenLevel' ? 'Oxygen Level' : 'Temperature';
                   
    const timeframeTitle = this.timeframe === 'day' ? 'Daily' : 
                      this.timeframe === 'week' ? 'Weekly' : 
                      this.timeframe === 'month' ? 'Monthly' : 'Yearly';
                      
    return `${metricTitle} - ${timeframeTitle} View`;
  }

  // Data generation functions
  private generateDailyData() {
    const hours = [];
    
    for (let i = 0; i < 24; i++) {
      hours.push({
        label: `${i}:00`,
        heartRate: this.randomIntBetween(70, 95),
        systolic: this.randomIntBetween(110, 135),
        diastolic: this.randomIntBetween(70, 85),
        oxygenLevel: this.randomIntBetween(95, 99),
        temperature: this.randomFloatBetween(36.5, 37.5)
      });
    }
    
    return hours;
  }

  private generateWeeklyData() {
    const dayNames = ['Sunday', 'Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday', 'Saturday'];
    const days = [];
    
    for (let i = 0; i < 7; i++) {
      days.push({
        label: dayNames[i],
        heartRate: this.randomIntBetween(75, 85),
        systolic: this.randomIntBetween(115, 130),
        diastolic: this.randomIntBetween(75, 80),
        oxygenLevel: this.randomIntBetween(96, 98),
        temperature: this.randomFloatBetween(36.7, 37.0)
      });
    }
    
    return days;
  }

  private generateMonthlyData() {
    const weeks = [];
    
    for (let i = 1; i <= 4; i++) {
      weeks.push({
        label: `Week ${i}`,
        heartRate: this.randomIntBetween(75, 85),
        systolic: this.randomIntBetween(115, 130),
        diastolic: this.randomIntBetween(75, 80),
        oxygenLevel: this.randomIntBetween(96, 98),
        temperature: this.randomFloatBetween(36.7, 37.0)
      });
    }
    
    return weeks;
  }

  private generateYearlyData() {
    const monthNames = ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun', 'Jul', 'Aug', 'Sep', 'Oct', 'Nov', 'Dec'];
    const months = [];
    
    for (let i = 0; i < 12; i++) {
      months.push({
        label: monthNames[i],
        heartRate: this.randomIntBetween(75, 85),
        systolic: this.randomIntBetween(115, 130),
        diastolic: this.randomIntBetween(75, 80),
        oxygenLevel: this.randomIntBetween(96, 98),
        temperature: this.randomFloatBetween(36.7, 37.0)
      });
    }
    
    return months;
  }

  private smoothData() {
    // Create a more realistic pattern with some trends
    if (this.metric === 'temperature' || this.metric === 'all') {
      let trend = this.randomFloatBetween(-0.2, 0.2);
      let current = this.randomFloatBetween(36.7, 36.9);
      
      this.data.forEach((item, i) => {
        // Add slight trend with randomness
        current += trend + this.randomFloatBetween(-0.1, 0.1);
        
        // Keep within reasonable bounds
        if (current < 36.5) current = 36.5 + this.randomFloatBetween(0, 0.2);
        if (current > 37.5) current = 37.5 - this.randomFloatBetween(0, 0.2);
        
        // Apply to item
        this.data[i].temperature = parseFloat(current.toFixed(1));
        
        // Occasionally change trend direction
        if (i % 4 === 0) {
          trend = this.randomFloatBetween(-0.2, 0.2);
        }
      });
    }
  }

  private randomIntBetween(min: number, max: number): number {
    return Math.floor(Math.random() * (max - min + 1) + min);
  }

  private randomFloatBetween(min: number, max: number): number {
    return parseFloat((Math.random() * (max - min) + min).toFixed(1));
  }
}