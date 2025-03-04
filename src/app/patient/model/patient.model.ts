export interface VitalStatus {
    bp: string;
    heartRate: string;
    oxygenLevel: string;
    temperature: string;
  }
  
  export type Criticality = 'critical' | 'high' | 'medium' | 'low';
  
  export interface Patient {
    id: number;
    name: string;
    age: number;
    weeks: number;
    criticality: Criticality;
    vitalStatus: VitalStatus;
    lastCheckup: string;
    nextAppointment: string;
    healthWorker: string;
    profile?: string;
  }
  
  export interface FilterOptions {
    criticality: string;
    healthWorker: string;
    searchTerm: string;
  }
  
  export interface StatCard {
    title: string;
    value: number;
    icon: string;
    change: string;
    colorClass: string;
  }