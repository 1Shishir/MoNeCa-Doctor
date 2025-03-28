// export interface VitalStatus {
//     bp: string;
//     heartRate: string;
//     oxygenLevel: string;
//     temperature: string;
//   }
  
//   export type Criticality = 'critical' | 'high' | 'medium' | 'low';
  
//   export interface Patient {
//     id: number;
//     name: string;
//     age: number;
//     weeks: number;
//     criticality: Criticality;
//     vitalStatus: VitalStatus;
//     lastCheckup: string;
//     nextAppointment: string;
//     healthWorker: string;
//     profile?: string;
//   }
  
//   export interface FilterOptions {
//     criticality: string;
//     healthWorker: string;
//     searchTerm: string;
//   }
  
//   export interface StatCard {
//     title: string;
//     value: number;
//     icon: string;
//     change: string;
//     colorClass: string;
//   }
// Updated patient.model.ts

// v2

// export interface VitalStatus {
//   bp: string;
//   heartRate: string;
//   oxygenLevel: string;
//   temperature: string;
// }

// export type Criticality = 'critical' | 'high' | 'medium' | 'low';

// export interface Patient {
//   id?: string; // Using string for Firestore document ID
//   personalInfo: {
//     fullName: string;
//     age: number;
//     phoneNumber: string;
//     address: string;
//     bloodType: string;
//     height: number;
//     weight: number;
//     bmi: number;
//     emergencyContact: {
//       name: string;
//       relation: string;
//       phone: string;
//     }
//   };
//   medicalInfo: {
//     allergies: string[];
//     medicalConditions: string[];
//     previousSurgeries: Surgery[];
//     currentMedications: Medication[];
//   };
//   pregnancyInfo: {
//     weeks: number;
//     gravida: number;
//     para: number;
//     trimester: number;
//     edd: string; // Expected Delivery Date
//     previousDeliveries: PreviousDelivery[];
//   };
//   assignmentInfo: {
//     assignedDoctor: string;
//     assignedHealthWorker: string;
//     initialNotes: string;
//     riskLevel: string;
//   };
//   criticality: Criticality;
//   vitalStatus?: VitalStatus;
//   lastCheckup?: string;
//   nextAppointment?: string;
//   profile?: string;
//   createdBy: string; // Doctor UID who created this patient
//   createdAt: Date;
//   updatedAt: Date;
// }

// export interface Surgery {
//   procedure: string;
//   date: string;
//   notes?: string;
// }

// export interface Medication {
//   name: string;
//   dosage: string;
//   frequency: string;
//   reason?: string;
// }

// export interface PreviousDelivery {
//   date: string;
//   type: string;
//   complications?: string;
//   babyWeight: string;
// }

// export interface FilterOptions {
//   criticality: string;
//   healthWorker: string;
//   searchTerm: string;
// }

// export interface StatCard {
//   title: string;
//   value: number;
//   icon: string;
//   change: string;
//   colorClass: string;
// }


// v3
export interface VitalStatus {
  bp: string;
  heartRate: string;
  oxygenLevel: string;
  temperature: string;
}

export type Criticality = 'critical' | 'high' | 'medium' | 'low';

export interface Patient {
  id?: string; // Using string for Firestore document ID
  personalInfo: {
    fullName: string;
    age: number;
    phoneNumber: string;
    address: string;
    bloodType: string;
    height: number;
    weight: number;
    bmi: number;
    emergencyContact: {
      name: string;
      relation: string;
      phone: string;
    }
  };
  medicalInfo: {
    allergies: string[];
    medicalConditions: string[];
    previousSurgeries: Surgery[];
    currentMedications: Medication[];
  };
  pregnancyInfo: {
    weeks: number;
    gravida: number;
    para: number;
    trimester: number;
    edd: string; // Expected Delivery Date
    previousDeliveries: PreviousDelivery[];
  };
  assignmentInfo: {
    assignedDoctor: string;
    assignedHealthWorker: string;
    initialNotes: string;
    riskLevel: string;
  };
  criticality: Criticality;
  vitalStatus?: VitalStatus;
  lastCheckup?: string;
  nextAppointment?: string;
  profile?: string;
  createdBy: string; // Doctor UID who created this patient
  createdAt: Date;
  updatedAt: Date;
}

export interface Surgery {
  procedure: string;
  date: string;
  notes?: string;
}

export interface Medication {
  name: string;
  dosage: string;
  frequency: string;
  reason?: string;
}

export interface PreviousDelivery {
  date: string;
  type: string;
  complications?: string;
  babyWeight: string;
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