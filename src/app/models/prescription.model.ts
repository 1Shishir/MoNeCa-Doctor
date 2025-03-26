export interface Prescription {
    id: string;
    patientId: string;
    doctorId: string;
    date: Date;
    chiefComplaints: string;
    clinicalFindings: string;
    diagnosis: string[];
    medications: Medication[];
    tests: Test[];
    advice: string;
    nextVisit: Date | null;
    vitalSigns: VitalSigns;
    createdAt: Date;
    updatedAt: Date;
  }

  export interface Medication {
    id: string;
    name: string;
    dosage: string;
    frequency: string; 
    duration: string;
    instructions: string;
  }
  
  export interface Test {
    id: string;
    name: string;
    description?: string;
    isPending: boolean;
    result?: TestResult;
  }
  
  export interface TestResult {
    id: string;
    testId: string;
    fileUrl?: string;
    fileType?: string;
    notes?: string;
    uploadedAt: Date;
  }
  
  export interface VitalSigns {
    bloodPressure?: string;
    heartRate?: number;
    oxygenLevel?: number;
    temperature?: number;
    weight?: number;
    fetalHeartRate?: number;
    fundalHeight?: number;
    gestationalAge?: number;
  }

  export interface QuickOptions {
    complaints: string[];
    diagnoses: string[];
    advice: string[];
  }