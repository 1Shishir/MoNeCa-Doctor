import { Injectable } from '@angular/core';
import { Firestore, collection, doc, getDoc, query, where, orderBy, limit, DocumentData } from '@angular/fire/firestore';
import { Observable, from, map, catchError, of, forkJoin } from 'rxjs';
import { PatientHealthData, HealthDataPoint, TimeframeType, DailyData, WeeklyData, MonthlyData, YearlyData, HealthAlert, MetricType } from '../../models/patient-health-data.model';


@Injectable({
  providedIn: 'root'
})
export class PatientHealthDataService {
  private readonly collectionPath = 'patient-health-data';

  constructor(private firestore: Firestore) { }

  /**
   * Get all health data for a patient
   */
  getPatientHealthData(patientId: string): Observable<PatientHealthData | null> {
    return new Observable<PatientHealthData | null>(observer => {
      try {
        const patientDocRef = doc(this.firestore, `${this.collectionPath}/${patientId}`);
        
        getDoc(patientDocRef)
          .then(docSnap => {
            if (docSnap.exists()) {
                // console.log(docSnap.data() as PatientHealthData);
              observer.next(docSnap.data() as PatientHealthData);
            } else {
              observer.next(null);
            }
            observer.complete();
          })
          .catch(error => {
            console.error('Error fetching patient health data:', error);
            observer.next(null);
            observer.complete();
          });
      } catch (error) {
        console.error('Error with Firestore operation:', error);
        observer.next(null);
        observer.complete();
      }
    });
  }

  /**
   * Get today's health data points for a patient with date filtering
   * If startDate and endDate are not provided, returns all data for today
   */
  getTodayHealthData(patientId: string): Observable<HealthDataPoint[]> {
    return this.getPatientHealthData(patientId).pipe(
      map(patientData => {
        if (!patientData || !patientData.data) return [];
        console.log("tday"+JSON.stringify(patientData,null,2));
        const today = new Date();
        const todayStart = new Date(today.getFullYear(), today.getMonth(), today.getDate());
        const todayEnd = new Date(today.getFullYear(), today.getMonth(), today.getDate(), 23, 59, 59, 999);
  
        const filteredData: HealthDataPoint[] = [];
  
        Object.keys(patientData.data).forEach(timestamp => {
          const readingDate = new Date(timestamp);
          
          if (readingDate >= todayStart && readingDate <= todayEnd) {
            const reading = patientData.data[timestamp];
            
            filteredData.push({
              timestamp: timestamp,
              heartRate: reading.heartRate?.value || 0,
              bloodPressure: `${reading.bloodPressure?.systolic || 0}/${reading.bloodPressure?.diastolic || 0}`,
              oxygenLevel: `${reading.oxygenLevel?.value || 0}%`,
              temperature: `${reading.temperature?.value || 0}°C`
            });
          }
        });
  
        return filteredData.sort((a, b) => a.timestamp.localeCompare(b.timestamp));
      })
    );
  }

  /**
   * Get health data for a specific timeframe with optional date filters
   */
  getHealthDataByTimeframe(patientId: string, timeframe: TimeframeType, startDate?: Date, endDate?: Date): Observable<any[]> {
    return this.getPatientHealthData(patientId).pipe(
      map(data => {
        if (!data || !data.data) {
          return [];
        }
  
        // If specific date range is provided, use custom aggregation
        if (startDate || endDate) {
          return this.aggregateDataForTimeframe(data.data, timeframe, startDate, endDate);
        }
  
        // Try pre-aggregated data first
        if (data.aggregates) {
          switch (timeframe) {
            case 'today':
              return data.aggregates.today || [];
            case 'day':
              return data.aggregates.daily || [];
            case 'week':
              return data.aggregates.weekly || [];
            case 'month':
              return data.aggregates.monthly || [];
            case 'year':
              return data.aggregates.yearly || [];
          }
        }
  
        // Fallback to aggregating raw data
        return this.aggregateDataForTimeframe(data.data, timeframe);
      })
    );
  }
  
  private aggregateDataForTimeframe(
    rawData: Record<string, any>, 
    timeframe: TimeframeType, 
    startDate?: Date, 
    endDate?: Date
  ): any[] {
    const filteredData: any[] = [];
    
    Object.keys(rawData).forEach(timestamp => {
      const readingDate = new Date(timestamp);
      
      // Apply date range filter if provided
      if (startDate && readingDate < startDate) return;
      if (endDate && readingDate > endDate) return;
  
      const reading = rawData[timestamp];
      const aggregatedReading = {
        timestamp,
        heartRate: reading.heartRate?.value || 0,
        bloodPressure: `${reading.bloodPressure?.systolic || 0}/${reading.bloodPressure?.diastolic || 0}`,
        oxygenLevel: `${reading.oxygenLevel?.value || 0}%`,
        temperature: `${reading.temperature?.value || 0}°C`
      };
  
      filteredData.push(aggregatedReading);
    });
  
    // Optional: Add more sophisticated aggregation logic based on timeframe
    return filteredData.sort((a, b) => a.timestamp.localeCompare(b.timestamp));
  }

  /**
   * Aggregate raw readings into the specified timeframe format
   */
//   private aggregateDataForTimeframe(data: any, timeframe: TimeframeType, startDate?: Date, endDate?: Date): any[] {
//     const start = startDate ? startDate.toISOString() : undefined;
//     const end = endDate ? endDate.toISOString() : undefined;
    
//     // Filter data by date range if specified
//     const filteredData: {[key: string]: any} = {};
//     Object.keys(data).forEach(timestamp => {
//       if ((!start || timestamp >= start) && (!end || timestamp <= end)) {
//         filteredData[timestamp] = data[timestamp];
//       }
//     });
    
    // Group and aggregate based on timeframe
//     switch(timeframe) {
//       case 'day':
//         return this.aggregateByHour(filteredData);
//       case 'week':
//         return this.aggregateByDay(filteredData);
//       case 'month':
//         return this.aggregateByWeek(filteredData);
//       case 'year':
//         return this.aggregateByMonth(filteredData);
//       default:
//         return [];
//     }
//   }
  
  /**
   * Aggregate data by hour for daily view
   */
  private aggregateByHour(data: {[key: string]: any}): DailyData[] {
    const hourlyData: {[key: string]: any} = {};
    
    // Group readings by hour
    Object.keys(data).forEach(timestamp => {
      const date = new Date(timestamp);
      const hourKey = date.toISOString().substring(0, 13) + ':00:00Z'; // Get YYYY-MM-DDTHH:00:00Z
      
      if (!hourlyData[hourKey]) {
        hourlyData[hourKey] = {
          heartRates: [],
          systolics: [],
          diastolics: [],
          oxygenLevels: [],
          temperatures: []
        };
      }
      
      const reading = data[timestamp];
      if (reading.heartRate) hourlyData[hourKey].heartRates.push(reading.heartRate.value);
      if (reading.bloodPressure) {
        hourlyData[hourKey].systolics.push(reading.bloodPressure.systolic);
        hourlyData[hourKey].diastolics.push(reading.bloodPressure.diastolic);
      }
      if (reading.oxygenLevel) hourlyData[hourKey].oxygenLevels.push(reading.oxygenLevel.value);
      if (reading.temperature) hourlyData[hourKey].temperatures.push(reading.temperature.value);
    });
    
    // Calculate averages for each hour
    return Object.keys(hourlyData).map(hourKey => {
      const values = hourlyData[hourKey];
      const heartRate = this.calculateAverage(values.heartRates);
      const systolic = this.calculateAverage(values.systolics);
      const diastolic = this.calculateAverage(values.diastolics);
      const oxygenLevel = this.calculateAverage(values.oxygenLevels);
      const temperature = this.calculateAverage(values.temperatures);
      
      return {
        time: new Date(hourKey).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
        heartRate: heartRate,
        bloodPressure: {
          systolic: systolic,
          diastolic: diastolic
        },
        oxygenLevel: oxygenLevel,
        temperature: temperature
      };
    }).sort((a, b) => a.time.localeCompare(b.time));
  }
  
  /**
   * Aggregate data by day for weekly view
   */
  private aggregateByDay(data: {[key: string]: any}): WeeklyData[] {
    const dailyData: {[key: string]: any} = {};
    
    // Group readings by day
    Object.keys(data).forEach(timestamp => {
      const date = new Date(timestamp);
      const dayKey = date.toISOString().substring(0, 10); // Get YYYY-MM-DD
      
      if (!dailyData[dayKey]) {
        dailyData[dayKey] = {
          heartRates: [],
          systolics: [],
          diastolics: [],
          oxygenLevels: [],
          temperatures: []
        };
      }
      
      const reading = data[timestamp];
      if (reading.heartRate) dailyData[dayKey].heartRates.push(reading.heartRate.value);
      if (reading.bloodPressure) {
        dailyData[dayKey].systolics.push(reading.bloodPressure.systolic);
        dailyData[dayKey].diastolics.push(reading.bloodPressure.diastolic);
      }
      if (reading.oxygenLevel) dailyData[dayKey].oxygenLevels.push(reading.oxygenLevel.value);
      if (reading.temperature) dailyData[dayKey].temperatures.push(reading.temperature.value);
    });
    
    // Calculate stats for each day
    return Object.keys(dailyData).map(dayKey => {
      const values = dailyData[dayKey];
      
      return {
        date: dayKey,
        heartRate: {
          avg: this.calculateAverage(values.heartRates),
          min: Math.min(...values.heartRates),
          max: Math.max(...values.heartRates)
        },
        bloodPressure: {
          systolic: {
            avg: this.calculateAverage(values.systolics),
            min: Math.min(...values.systolics),
            max: Math.max(...values.systolics)
          },
          diastolic: {
            avg: this.calculateAverage(values.diastolics),
            min: Math.min(...values.diastolics),
            max: Math.max(...values.diastolics)
          }
        },
        oxygenLevel: {
          avg: this.calculateAverage(values.oxygenLevels),
          min: Math.min(...values.oxygenLevels),
          max: Math.max(...values.oxygenLevels)
        },
        temperature: {
          avg: this.calculateAverage(values.temperatures),
          min: Math.min(...values.temperatures),
          max: Math.max(...values.temperatures)
        }
      };
    }).sort((a, b) => a.date.localeCompare(b.date));
  }
  
  /**
   * Aggregate data by week for monthly view
   */
  private aggregateByWeek(data: {[key: string]: any}): MonthlyData[] {
    // Helper to group dates into weekly buckets
    const getWeekNumber = (date: Date): number => {
      const firstDayOfMonth = new Date(date.getFullYear(), date.getMonth(), 1);
      return Math.floor((date.getDate() - firstDayOfMonth.getDate()) / 7) + 1;
    };
    
    const weeklyData: {[key: string]: any} = {};
    
    // Group readings by week
    Object.keys(data).forEach(timestamp => {
      const date = new Date(timestamp);
      const yearMonth = date.toISOString().substring(0, 7); // Get YYYY-MM
      const weekNum = getWeekNumber(date);
      const weekKey = `${yearMonth}-W${weekNum}`;
      
      if (!weeklyData[weekKey]) {
        weeklyData[weekKey] = {
          heartRates: [],
          systolics: [],
          diastolics: [],
          oxygenLevels: [],
          temperatures: [],
          dates: []
        };
      }
      
      weeklyData[weekKey].dates.push(date);
      
      const reading = data[timestamp];
      if (reading.heartRate) weeklyData[weekKey].heartRates.push(reading.heartRate.value);
      if (reading.bloodPressure) {
        weeklyData[weekKey].systolics.push(reading.bloodPressure.systolic);
        weeklyData[weekKey].diastolics.push(reading.bloodPressure.diastolic);
      }
      if (reading.oxygenLevel) weeklyData[weekKey].oxygenLevels.push(reading.oxygenLevel.value);
      if (reading.temperature) weeklyData[weekKey].temperatures.push(reading.temperature.value);
    });
    
    // Calculate averages for each week
    return Object.keys(weeklyData).map(weekKey => {
      const values = weeklyData[weekKey];
      const dates = values.dates.sort((a: Date, b: Date) => a.getTime() - b.getTime());
      const startDate = dates[0];
      const endDate = dates[dates.length - 1];
      
      // Format week label (e.g., "Feb 3-9")
      const weekLabel = `${startDate.toLocaleString('en-US', { month: 'short' })} ${startDate.getDate()}-${endDate.getDate()}`;
      
      return {
        week: weekLabel,
        startDate: startDate.toISOString(),
        endDate: endDate.toISOString(),
        heartRate: {
          avg: this.calculateAverage(values.heartRates),
          trend: this.calculateTrend(values.heartRates)
        },
        bloodPressure: {
          systolic: {
            avg: this.calculateAverage(values.systolics),
            trend: this.calculateTrend(values.systolics)
          },
          diastolic: {
            avg: this.calculateAverage(values.diastolics),
            trend: this.calculateTrend(values.diastolics)
          }
        },
        oxygenLevel: {
          avg: this.calculateAverage(values.oxygenLevels),
          trend: this.calculateTrend(values.oxygenLevels)
        },
        temperature: {
          avg: this.calculateAverage(values.temperatures),
          trend: this.calculateTrend(values.temperatures)
        }
      };
    }).sort((a, b) => new Date(a.startDate).getTime() - new Date(b.startDate).getTime());
  }
  
  /**
   * Aggregate data by month for yearly view
   */
  private aggregateByMonth(data: {[key: string]: any}): YearlyData[] {
    const monthlyData: {[key: string]: any} = {};
    
    // Group readings by month
    Object.keys(data).forEach(timestamp => {
      const date = new Date(timestamp);
      const monthKey = date.toISOString().substring(0, 7); // Get YYYY-MM
      
      if (!monthlyData[monthKey]) {
        monthlyData[monthKey] = {
          heartRates: [],
          systolics: [],
          diastolics: [],
          oxygenLevels: [],
          temperatures: []
        };
      }
      
      const reading = data[timestamp];
      if (reading.heartRate) monthlyData[monthKey].heartRates.push(reading.heartRate.value);
      if (reading.bloodPressure) {
        monthlyData[monthKey].systolics.push(reading.bloodPressure.systolic);
        monthlyData[monthKey].diastolics.push(reading.bloodPressure.diastolic);
      }
      if (reading.oxygenLevel) monthlyData[monthKey].oxygenLevels.push(reading.oxygenLevel.value);
      if (reading.temperature) monthlyData[monthKey].temperatures.push(reading.temperature.value);
    });
    
    // Calculate averages for each month
    return Object.keys(monthlyData).map(monthKey => {
      const values = monthlyData[monthKey];
      const date = new Date(monthKey + '-01'); // Create date from YYYY-MM-01
      
      return {
        month: date.toISOString(),
        label: date.toLocaleString('en-US', { month: 'short' }),
        heartRate: {
          avg: this.calculateAverage(values.heartRates),
          trend: this.calculateTrend(values.heartRates)
        },
        bloodPressure: {
          systolic: {
            avg: this.calculateAverage(values.systolics),
            trend: this.calculateTrend(values.systolics)
          },
          diastolic: {
            avg: this.calculateAverage(values.diastolics),
            trend: this.calculateTrend(values.diastolics)
          }
        },
        oxygenLevel: {
          avg: this.calculateAverage(values.oxygenLevels),
          trend: this.calculateTrend(values.oxygenLevels)
        },
        temperature: {
          avg: this.calculateAverage(values.temperatures),
          trend: this.calculateTrend(values.temperatures)
        }
      };
    }).sort((a, b) => a.month.localeCompare(b.month));
  }
  
  /**
   * Helper method to calculate average from an array of numbers
   */
  private calculateAverage(values: number[]): number {
    if (!values || values.length === 0) return 0;
    return Number((values.reduce((sum, value) => sum + value, 0) / values.length).toFixed(1));
  }
  
  /**
   * Helper method to calculate trend (simple change from first to last)
   */
  private calculateTrend(values: number[]): number {
    if (!values || values.length < 2) return 0;
    return Number((values[values.length - 1] - values[0]).toFixed(1));
  }

  /**
   * Get raw health data readings for a specific date range
   */
  getRawHealthData(patientId: string, startDate: Date, endDate: Date): Observable<any> {
    return this.getPatientHealthData(patientId).pipe(
      map(data => {
        if (!data || !data.data) {
          return {};
        }

        const startTimestamp = startDate.toISOString();
        const endTimestamp = endDate.toISOString();
        
        // Filter data by timestamp range
        const filteredData: {[key: string]: any} = {};
        
        Object.keys(data.data).forEach(timestamp => {
          if (timestamp >= startTimestamp && timestamp <= endTimestamp) {
            filteredData[timestamp] = data.data[timestamp];
          }
        });
        
        return filteredData;
      })
    );
  }

  /**
   * Get all alerts for a patient
   */
  getHealthAlerts(patientId: string): Observable<HealthAlert[]> {
    return this.getPatientHealthData(patientId).pipe(
      map(data => {
        if (!data || !data.alerts) {
          return [];
        }
        return data.alerts;
      })
    );
  }

  /**
   * Get unacknowledged alerts for a patient
   */
  getUnacknowledgedAlerts(patientId: string): Observable<HealthAlert[]> {
    return this.getHealthAlerts(patientId).pipe(
      map(alerts => alerts.filter(alert => !alert.acknowledged))
    );
  }

  /**
   * Get critical alerts for a patient
   */
  getCriticalAlerts(patientId: string): Observable<HealthAlert[]> {
    return this.getHealthAlerts(patientId).pipe(
      map(alerts => alerts.filter(alert => alert.severity === 'high'))
    );
  }

  /**
   * Get statistics for all metrics
   */
  getHealthStats(patientId: string): Observable<any> {
    return this.getPatientHealthData(patientId).pipe(
      map(data => {
        if (!data || !data.stats) {
          return null;
        }
        return data.stats;
      })
    );
  }

  /**
   * Get statistics for a specific metric
   */
  getMetricStats(patientId: string, metric: MetricType): Observable<any> {
    return this.getHealthStats(patientId).pipe(
      map(stats => {
        if (!stats) {
          return null;
        }
        
        // Handle the case where 'bp' is used instead of 'bloodPressure'
        const metricKey = metric === 'bp' ? 'bloodPressure' : metric;
        
        if (metricKey === 'all') {
          return stats;
        }
        
        return stats[metricKey] || null;
      })
    );
  }

  /**
   * Get the latest reading for each metric
   */
  getLatestReadings(patientId: string): Observable<any> {
    return this.getPatientHealthData(patientId).pipe(
      map(data => {
        if (!data || !data.lastUpdate || !data.data) {
          return null;
        }
        
        return data.data[data.lastUpdate] || null;
      })
    );
  }

  /**
   * Format raw data into the format expected by the UI components
   * This helps bridge the Firebase data structure with the component expectations
   */
  formatDataForDisplay(timeframe: TimeframeType, data: any[]): any[] {
    if (!data || data.length === 0) return [];
    
    switch (timeframe) {
      case 'today':
        return data.map(item => ({
          time: new Date(item.timestamp).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
          heartRate: typeof item.heartRate === 'number' ? item.heartRate : parseInt(item.heartRate),
          bloodPressure: item.bloodPressure,
          oxygenLevel: item.oxygenLevel,
          temperature: item.temperature
        }));
      
      case 'week':
        return data.map(item => ({
          date: typeof item.date === 'string' ? item.date : new Date(item.date).toISOString().split('T')[0],
          heartRate: typeof item.heartRate === 'number' ? item.heartRate : item.heartRate.avg,
          bloodPressure: typeof item.bloodPressure === 'string' ? item.bloodPressure : 
            `${item.bloodPressure.systolic.avg}/${item.bloodPressure.diastolic.avg}`,
          oxygenLevel: typeof item.oxygenLevel === 'string' ? item.oxygenLevel : `${item.oxygenLevel.avg}%`,
          temperature: typeof item.temperature === 'string' ? item.temperature : `${item.temperature.avg}°C`
        }));
      
      case 'month':
        return data.map(item => ({
          week: item.week,
          heartRate: typeof item.heartRate === 'number' ? item.heartRate : item.heartRate.avg,
          bloodPressure: typeof item.bloodPressure === 'string' ? item.bloodPressure : 
            `${item.bloodPressure.systolic.avg}/${item.bloodPressure.diastolic.avg}`,
          oxygenLevel: typeof item.oxygenLevel === 'string' ? item.oxygenLevel : `${item.oxygenLevel.avg}%`,
          temperature: typeof item.temperature === 'string' ? item.temperature : `${item.temperature.avg}°C`
        }));
      
      default:
        return data;
    }
  }

  /**
   * Check if a reading is abnormal based on normal ranges
   */
  isAbnormalReading(metric: string, value: any): boolean {
    if (!value) return false;
    
    switch (metric) {
      case 'heartRate':
        const hr = typeof value === 'number' ? value : parseInt(value);
        return hr < 60 || hr > 90;
        
      case 'bloodPressure':
      case 'bp':
        if (typeof value === 'string') {
          const systolic = parseInt(value.split('/')[0]);
          return systolic > 130;
        }
        return value.systolic > 130 || value.diastolic > 85;
        
      case 'oxygenLevel':
        const o2 = typeof value === 'string' ? parseInt(value) : value;
        return o2 < 95;
        
      case 'temperature':
        const temp = typeof value === 'string' ? parseFloat(value) : value;
        return temp < 36.5 || temp > 37.5;
        
      default:
        return false;
    }
  }
}



// import { Injectable } from '@angular/core';
// import { Firestore, collection, doc, getDoc, query, where, orderBy, limit, DocumentData } from '@angular/fire/firestore';
// import { Observable, from, map, catchError, of, forkJoin } from 'rxjs';
// import { PatientHealthData, HealthDataPoint, TimeframeType, HealthAlert, MetricType } from '../../models/patient-health-data.model';


// @Injectable({
//   providedIn: 'root'
// })
// export class PatientHealthDataService {
//   private readonly collectionPath = 'patient-health-data';

//   constructor(private firestore: Firestore) { }

//   /**
//    * Get all health data for a patient
//    */
//   getPatientHealthData(patientId: string): Observable<PatientHealthData | null> {
//     const patientDocRef = doc(this.firestore, `${this.collectionPath}/${patientId}`);
    
//     return from(getDoc(patientDocRef)).pipe(
//       map(docSnap => {
//         if (docSnap.exists()) {
//           return docSnap.data() as PatientHealthData;
//         }
//         return null;
//       }),
//       catchError(error => {
//         console.error('Error fetching patient health data:', error);
//         return of(null);
//       })
//     );
//   }

//   /**
//    * Get today's health data points for a patient
//    */
//   getTodayHealthData(patientId: string): Observable<HealthDataPoint[]> {
//     return this.getPatientHealthData(patientId).pipe(
//       map(data => {
//         if (!data || !data.aggregates || !data.aggregates.today) {
//           return [];
//         }
//         return data.aggregates.today;
//       })
//     );
//   }

//   /**
//    * Get health data for a specific timeframe
//    */
//   getHealthDataByTimeframe(patientId: string, timeframe: TimeframeType): Observable<any[]> {
//     return this.getPatientHealthData(patientId).pipe(
//       map(data => {
//         if (!data || !data.aggregates) {
//           return [];
//         }

//         switch (timeframe) {
//           case 'today':
//             return data.aggregates.today || [];
//           case 'day':
//             return data.aggregates.daily || [];
//           case 'week':
//             return data.aggregates.weekly || [];
//           case 'month':
//             return data.aggregates.monthly || [];
//           case 'year':
//             return data.aggregates.yearly || [];
//           default:
//             return [];
//         }
//       })
//     );
//   }

//   /**
//    * Get raw health data readings for a specific date range
//    */
//   getRawHealthData(patientId: string, startDate: Date, endDate: Date): Observable<any> {
//     return this.getPatientHealthData(patientId).pipe(
//       map(data => {
//         if (!data || !data.data) {
//           return {};
//         }

//         const startTimestamp = startDate.toISOString();
//         const endTimestamp = endDate.toISOString();
        
//         // Filter data by timestamp range
//         const filteredData: {[key: string]: any} = {};
        
//         Object.keys(data.data).forEach(timestamp => {
//           if (timestamp >= startTimestamp && timestamp <= endTimestamp) {
//             filteredData[timestamp] = data.data[timestamp];
//           }
//         });
        
//         return filteredData;
//       })
//     );
//   }

//   /**
//    * Get all alerts for a patient
//    */
//   getHealthAlerts(patientId: string): Observable<HealthAlert[]> {
//     return this.getPatientHealthData(patientId).pipe(
//       map(data => {
//         if (!data || !data.alerts) {
//           return [];
//         }
//         return data.alerts;
//       })
//     );
//   }

//   /**
//    * Get unacknowledged alerts for a patient
//    */
//   getUnacknowledgedAlerts(patientId: string): Observable<HealthAlert[]> {
//     return this.getHealthAlerts(patientId).pipe(
//       map(alerts => alerts.filter(alert => !alert.acknowledged))
//     );
//   }

//   /**
//    * Get critical alerts for a patient
//    */
//   getCriticalAlerts(patientId: string): Observable<HealthAlert[]> {
//     return this.getHealthAlerts(patientId).pipe(
//       map(alerts => alerts.filter(alert => alert.severity === 'high'))
//     );
//   }

//   /**
//    * Get statistics for all metrics
//    */
//   getHealthStats(patientId: string): Observable<any> {
//     return this.getPatientHealthData(patientId).pipe(
//       map(data => {
//         if (!data || !data.stats) {
//           return null;
//         }
//         return data.stats;
//       })
//     );
//   }

//   /**
//    * Get statistics for a specific metric
//    */
//   getMetricStats(patientId: string, metric: MetricType): Observable<any> {
//     return this.getHealthStats(patientId).pipe(
//       map(stats => {
//         if (!stats) {
//           return null;
//         }
        
//         // Handle the case where 'bp' is used instead of 'bloodPressure'
//         const metricKey = metric === 'bp' ? 'bloodPressure' : metric;
        
//         if (metricKey === 'all') {
//           return stats;
//         }
        
//         return stats[metricKey] || null;
//       })
//     );
//   }

//   /**
//    * Get the latest reading for each metric
//    */
//   getLatestReadings(patientId: string): Observable<any> {
//     return this.getPatientHealthData(patientId).pipe(
//       map(data => {
//         if (!data || !data.lastUpdate || !data.data) {
//           return null;
//         }
        
//         return data.data[data.lastUpdate] || null;
//       })
//     );
//   }

//   /**
//    * Format raw data into the format expected by the UI components
//    * This helps bridge the Firebase data structure with the component expectations
//    */
//   formatDataForDisplay(timeframe: TimeframeType, data: any[]): any[] {
//     switch (timeframe) {
//       case 'today':
//         return data.map(item => ({
//           time: new Date(item.timestamp).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
//           heartRate: typeof item.heartRate === 'number' ? item.heartRate : parseInt(item.heartRate),
//           bloodPressure: item.bloodPressure,
//           oxygenLevel: item.oxygenLevel,
//           temperature: item.temperature
//         }));
      
//       case 'week':
//         return data.map(item => ({
//           date: typeof item.date === 'string' ? item.date : new Date(item.date).toISOString().split('T')[0],
//           heartRate: typeof item.heartRate === 'number' ? item.heartRate : item.heartRate.avg,
//           bloodPressure: typeof item.bloodPressure === 'string' ? item.bloodPressure : 
//             `${item.bloodPressure.systolic.avg}/${item.bloodPressure.diastolic.avg}`,
//           oxygenLevel: typeof item.oxygenLevel === 'string' ? item.oxygenLevel : `${item.oxygenLevel.avg}%`,
//           temperature: typeof item.temperature === 'string' ? item.temperature : `${item.temperature.avg}°C`
//         }));
      
//       case 'month':
//         return data.map(item => ({
//           week: item.week,
//           heartRate: typeof item.heartRate === 'number' ? item.heartRate : item.heartRate.avg,
//           bloodPressure: typeof item.bloodPressure === 'string' ? item.bloodPressure : 
//             `${item.bloodPressure.systolic.avg}/${item.bloodPressure.diastolic.avg}`,
//           oxygenLevel: typeof item.oxygenLevel === 'string' ? item.oxygenLevel : `${item.oxygenLevel.avg}%`,
//           temperature: typeof item.temperature === 'string' ? item.temperature : `${item.temperature.avg}°C`
//         }));
      
//       default:
//         return data;
//     }
//   }

//   /**
//    * Check if a reading is abnormal based on normal ranges
//    */
//   isAbnormalReading(metric: string, value: any): boolean {
//     if (!value) return false;
    
//     switch (metric) {
//       case 'heartRate':
//         const hr = typeof value === 'number' ? value : parseInt(value);
//         return hr < 60 || hr > 90;
        
//       case 'bloodPressure':
//       case 'bp':
//         if (typeof value === 'string') {
//           const systolic = parseInt(value.split('/')[0]);
//           return systolic > 130;
//         }
//         return value.systolic > 130 || value.diastolic > 85;
        
//       case 'oxygenLevel':
//         const o2 = typeof value === 'string' ? parseInt(value) : value;
//         return o2 < 95;
        
//       case 'temperature':
//         const temp = typeof value === 'string' ? parseFloat(value) : value;
//         return temp < 36.5 || temp > 37.5;
        
//       default:
//         return false;
//     }
//   }
// }