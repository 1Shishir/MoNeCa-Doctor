export interface PrescriptionTemplate {
    id: string;
    name: string;
    doctorId: string;
    headerImageUrl?: string;
    footerText?: string;
    watermarkImageUrl?: string;
    watermarkOpacity: number;
    hospitalName?: string;
    hospitalAddress?: string;
    hospitalPhone?: string;
    hospitalLogo?: string;
    isDefault: boolean;
    createdAt: Date;
    updatedAt: Date;
  }
  