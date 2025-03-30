export interface AuthCredentials {
    email: string;
    password: string;
  }
  
  export interface SignupData extends AuthCredentials {
    fullName: string;
    specialization: string;
    licenseNumber: string;
    phoneNumber: string;
    hospital?: string;
  }
  
  export interface Doctor {
    uuid: string;
    email: string;
    fullName: string;
    specialization: string;
    licenseNumber: string;
    phoneNumber: string;
    hospital?: string;
    isApproved?: boolean;
    createdAt: Date;
    updatedAt: Date;
  }
