export interface HealthReading {
  timestamp: string;
  deviceId?: string;
}

export interface MetricReading extends HealthReading {
  value: number;
  unit: string;
  isNormal: boolean;
}

export interface BloodPressureReading extends HealthReading {
  systolic: number;
  diastolic: number;
  unit: string;
  isNormal: boolean;
}

// Daily data point format (raw readings)
export interface HealthDataPoint {
  timestamp: string;
  heartRate: number;
  bloodPressure: string; // "systolic/diastolic" format
  oxygenLevel: string; // Percentage with % symbol
  temperature: string; // Includes unit (°C)
  [key: string]: any; // For additional metrics
}

// Aggregated data for different timeframes
export interface DailyData {
  time: string; // Hour of day (HH:MM)
  heartRate: number;
  bloodPressure: {
    systolic: number;
    diastolic: number;
  };
  oxygenLevel: number;
  temperature: number;
}

export interface WeeklyData {
  date: string; // YYYY-MM-DD
  heartRate: number | { avg: number; min: number; max: number };
  bloodPressure: string | { 
    systolic: { avg: number; min: number; max: number };
    diastolic: { avg: number; min: number; max: number };
  };
  oxygenLevel: string | { avg: number; min: number; max: number };
  temperature: string | { avg: number; min: number; max: number };
}

export interface MonthlyData {
  week: string; // "MMM D-D" or label format
  startDate?: string;
  endDate?: string;
  heartRate: number | { avg: number; trend?: number };
  bloodPressure: string | { 
    systolic: { avg: number; trend?: number };
    diastolic: { avg: number; trend?: number };
  };
  oxygenLevel: string | { avg: number; trend?: number };
  temperature: string | { avg: number; trend?: number };
}

export interface YearlyData {
  month: string; // "MMM" format
  heartRate: { avg: number; trend: number };
  bloodPressure: { 
    systolic: { avg: number; trend: number };
    diastolic: { avg: number; trend: number };
  };
  oxygenLevel: { avg: number; trend: number };
  temperature: { avg: number; trend: number };
}

// Stats for metrics
export interface MetricStats {
  current: number;
  min: number;
  max: number;
  avg: number;
  normal: {
    min: number;
    max: number;
  };
}

export interface BloodPressureStats {
  current: string; // "systolic/diastolic" format
  systolicRange: {
    min: number;
    max: number;
  };
  diastolicRange: {
    min: number;
    max: number;
  };
  normal: {
    systolic: {
      min: number;
      max: number;
    };
    diastolic: {
      min: number;
      max: number;
    };
  };
}

// Alert interface for health data alerts
export interface HealthAlert {
  id: string;
  metric: 'heartRate' | 'bloodPressure' | 'oxygenLevel' | 'temperature' | string;
  status: 'Critical' | 'Warning' | 'Alert' | 'Normal';
  message: string;
  timestamp: string;
  severity: 'high' | 'medium' | 'low';
  acknowledged: boolean;
}

// Main container for patient health data
export interface PatientHealthData {
  patientId: string;
  lastUpdate: string;
  
  
  // Raw data readings organized by timestamp
  data: {
    [timestamp: string]: {
      heartRate?: MetricReading;
      bloodPressure?: BloodPressureReading;
      oxygenLevel?: MetricReading;
      temperature?: MetricReading;
      [key: string]: any; // For additional metrics
    }
  };
  
  // Pre-computed aggregates for different timeframes
  aggregates: {
    today: HealthDataPoint[];
    daily: DailyData[];
    weekly: WeeklyData[];
    monthly: MonthlyData[];
    yearly: YearlyData[];
  };
  
  // Statistical summaries for each metric
  stats: {
    heartRate: MetricStats;
    bloodPressure: BloodPressureStats;
    oxygenLevel: MetricStats;
    temperature: MetricStats;
  };
  
  // Alerts based on readings
  alerts: HealthAlert[];
}

// Type for timeframe selection
export type TimeframeType = 'today' | 'day' | 'week' | 'month' | 'year';

// Type for metric selection
export type MetricType = 'heartRate' | 'bloodPressure' | 'bp' | 'oxygenLevel' | 'temperature' | 'all';



// export interface PatientHealthData {
//   patientId: string;
//   createdAt: Date;
//   updatedAt: Date;
//   isLiveMonitoring: boolean;
//   metrics: {
//     heartRate: HeartRateData;
//     bloodPressure: BloodPressureData;
//     oxygenLevel: OxygenLevelData;
//     temperature: TemperatureData;
//   };
//   data: { // Add this to match existing data structure
//     'heart-rate': Record<string, {
//       value: number;
//       unit: string;
//       isNormal: boolean;
//       deviceId?: string;
//     }>;
//     'blood-pressure': Record<string, {
//       systolic: number;
//       diastolic: number;
//       unit: string;
//       isNormal: boolean;
//       deviceId?: string;
//     }>;
//     'oxygen-level': Record<string, {
//       value: number;
//       unit: string;
//       isNormal: boolean;
//       deviceId?: string;
//     }>;
//     'temperature': Record<string, {
//       value: number;
//       unit: string;
//       isNormal: boolean;
//       deviceId?: string;
//     }>;
//   };
//   timeSeriesData: {
//     hourly: HourlyHealthData[];
//     daily: DailyHealthData[];
//     weekly: WeeklyHealthData[];
//     monthly: MonthlyHealthData[];
//     yearly: YearlyHealthData[];
//   };
//   alerts: HealthAlert[];
// }

// interface MetricNormalRange<T> {
//   min: T;
//   max: T;
// }

// interface MetricStats<T> {
//   current: T;
//   min: T;
//   max: T;
//   avg: T;
//   normal: MetricNormalRange<T>;
// }

// interface TrendData {
//   trend: number;
// }


// export interface HeartRateData extends MetricStats<number> { }

// export interface HeartRateDataWithTrend extends HeartRateData, TrendData { }

// export interface BloodPressureRange {
//   systolic: MetricNormalRange<number>;
//   diastolic: MetricNormalRange<number>;
// }

// export interface BloodPressureStats {
//   current: string; // Format: "120/80"
//   systolicRange: {
//     min: number;
//     max: number;
//   };
//   diastolicRange: {
//     min: number;
//     max: number;
//   };
//   normal: BloodPressureRange;
// }

// export interface BloodPressureData extends BloodPressureStats { }

// export interface BloodPressureReading {
//   systolic: number;
//   diastolic: number;
// }

// export interface BloodPressureDataWithTrend {
//   systolic: {
//     avg: number;
//     trend: number;
//   };
//   diastolic: {
//     avg: number;
//     trend: number;
//   };
// }


// export interface OxygenLevelData extends MetricStats<number> { }

// export interface OxygenLevelDataWithTrend extends OxygenLevelData, TrendData { }


// export interface TemperatureData extends MetricStats<number> { }

// export interface TemperatureDataWithTrend extends TemperatureData, TrendData { }

// export interface MonthlyHealthData {
//   heartRate: Record<string, any>;
//   bloodPressure: Record<string, any>;
//   oxygenLevel: Record<string, any>;
//   temperature: Record<string, any>;
// }

// export interface HourlyHealthData {
//   time: Date;
//   heartRate: number;
//   bloodPressure: BloodPressureReading;
//   oxygenLevel: number;
//   temperature: number;
// }

// export interface DailyHealthData {
//   date: Date;
//   heartRate: {
//     avg: number;
//     min: number;
//     max: number;
//   };
//   bloodPressure: {
//     systolic: {
//       avg: number;
//       min: number;
//       max: number;
//     };
//     diastolic: {
//       avg: number;
//       min: number;
//       max: number;
//     };
//   };
//   oxygenLevel: {
//     avg: number;
//     min: number;
//     max: number;
//   };
//   temperature: {
//     avg: number;
//     min: number;
//     max: number;
//   };
// }

// export interface WeeklyHealthData {
//   startDate: Date;
//   endDate: Date;
//   label: string;
//   heartRate: {
//     avg: number;
//     trend: number;
//   };
//   bloodPressure: BloodPressureDataWithTrend;
//   oxygenLevel: {
//     avg: number;
//     trend: number;
//   };
//   temperature: {
//     avg: number;
//     trend: number;
//   };
// }

// // export interface MonthlyHealthData extends WeeklyHealthData { }

// export interface YearlyHealthData {
//   month: Date;
//   label: string;
//   heartRate: {
//     avg: number;
//     trend: number;
//   };
//   bloodPressure: BloodPressureDataWithTrend;
//   oxygenLevel: {
//     avg: number;
//     trend: number;
//   };
//   temperature: {
//     avg: number;
//     trend: number;
//   };
// }


// export type AlertSeverity = 'low' | 'medium' | 'high';
// export type AlertMetric = 'heartRate' | 'bloodPressure' | 'oxygenLevel' | 'temperature';

// export interface HealthAlert {
//   id: string;
//   patientId: string;
//   metric: AlertMetric;
//   status: string;
//   message: string;
//   date: Date;
//   severity: AlertSeverity;
//   isRead: boolean;
//   acknowledgedBy?: string;
//   acknowledgedAt?: Date;
// }


// export const isAbnormalHeartRate = (value: number): boolean => {
//   return value < 60 || value > 100;
// };

// export const isAbnormalBloodPressure = (systolic: number, diastolic: number): boolean => {
//   return systolic > 130 || systolic < 90 || diastolic > 80 || diastolic < 60;
// };

// export const isAbnormalOxygenLevel = (value: number): boolean => {
//   return value < 95;
// };

// export const isAbnormalTemperature = (value: number): boolean => {
//   return value > 37.5 || value < 36.5;
// };

// export const parseBloodPressure = (value: string): BloodPressureReading => {
//   const [systolic, diastolic] = value.split('/').map(v => parseInt(v.trim(), 10));
//   return { systolic, diastolic };
// };

// export const formatBloodPressure = (reading: BloodPressureReading): string => {
//   return `${reading.systolic}/${reading.diastolic}`;
// };
