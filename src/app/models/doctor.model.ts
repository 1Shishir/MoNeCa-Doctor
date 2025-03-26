export interface Doctor {
    uid: string;
    email: string;
    fullName: string;
    specialization: string;
    phoneNumber: string;
    licenseNumber: string;
    hospital?: string;
    profileImage?: string;
    isApproved?: boolean;
    createdAt: Date;
    updatedAt: Date;
  }