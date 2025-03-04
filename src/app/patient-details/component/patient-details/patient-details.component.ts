import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { ActivatedRoute, RouterModule } from '@angular/router';
import { FormsModule, ReactiveFormsModule } from '@angular/forms';
import { HeaderComponent } from '../../../dashboard/components/header/header.component';
import { SidebarComponent } from '../../../dashboard/components/sidebar/sidebar.component';
import { PatientAssessmentComponent } from '../patient-assessment/patient-assessment.component';
import { PatientHealthDataComponent } from '../patient-health-data/patient-health-data.component';
import { PatientInsightsComponent } from '../patient-insights/patient-insights.component';
import { PatientMedicalReportsComponent } from '../patient-medical-reports/patient-medical-reports.component';
import { PatientPrescriptionsComponent } from '../patient-prescriptions/patient-prescriptions.component';
import { PatientProfileComponent } from '../patient-profile/patient-profile.component';


@Component({
  selector: 'app-patient-details',
  standalone: true,
  imports: [
    CommonModule,
    RouterModule,
    FormsModule,
    ReactiveFormsModule,
    SidebarComponent,
    HeaderComponent,
    PatientHealthDataComponent,
    PatientPrescriptionsComponent,
    PatientMedicalReportsComponent,
    PatientAssessmentComponent,
    PatientProfileComponent,
    PatientInsightsComponent
  ],
  templateUrl: './patient-details.component.html',
  styleUrl: './patient-details.component.css'
})
export class PatientDetailsComponent implements OnInit {
  sidebarCollapsed = false;
  activeTab = 'profile';
  patientId: number = 0;
  
  // Sample patient data - this would come from a service in a real app
  patient = {
    id: 1,
    name: 'Fatima Akter',
    age: 28,
    weeks: 32,
    criticality: 'critical',
    vitalStatus: {
      bp: '150/95',
      heartRate: '92',
      oxygenLevel: '95%',
      temperature: '37.5°C'
    },
    lastCheckup: '2025-02-25',
    nextAppointment: '2025-03-05',
    healthWorker: 'Nasreen Ahmed',
    profile: 'assets/images/patients/patient1.jpg',
    additionalInfo: {
      bloodType: 'B+',
      height: '162 cm',
      weight: '65 kg',
      bmi: '24.8',
      address: 'Village: Boalia, District: Rajshahi',
      phone: '+8801712345678',
      emergencyContact: {
        name: 'Abdul Karim (Husband)',
        phone: '+8801698765432'
      },
      allergies: ['Penicillin', 'Sulfa drugs'],
      medicalConditions: ['Gestational Diabetes', 'Mild Hypertension'],
      pregnancyInfo: {
        edd: '2025-05-15',
        gravida: 2,
        para: 1,
        trimester: 3,
        previousDeliveries: [
          {
            date: '2022-07-10',
            type: 'Vaginal',
            complications: 'None',
            babyWeight: '3.2 kg'
          }
        ]
      }
    }
  };
  
  // Health data from smartwatch
  healthData = {
    today: [
      { time: '08:00', heartRate: 72, bp: '118/75', oxygenLevel: '98%', temperature: '36.8°C' },
      { time: '10:30', heartRate: 84, bp: '124/82', oxygenLevel: '97%', temperature: '36.9°C' },
      { time: '13:00', heartRate: 92, bp: '132/86', oxygenLevel: '96%', temperature: '37.1°C' },
      { time: '15:30', heartRate: 88, bp: '128/84', oxygenLevel: '96%', temperature: '37.2°C' },
      { time: '18:00', heartRate: 76, bp: '122/80', oxygenLevel: '97%', temperature: '37.0°C' }
    ],
    weekly: [
      // Would have daily averages
    ],
    monthly: [
      // Would have weekly averages
    ]
  };
  
  // Prescriptions data
  prescriptions = [
    {
      id: 1,
      date: '2025-02-25',
      doctor: 'Dr. Rafiq Ahmed',
      medications: [
        { name: 'Prenatal Vitamins', dosage: '1 tablet', frequency: 'Once daily', duration: '4 weeks' },
        { name: 'Calcium Supplements', dosage: '500mg', frequency: 'Twice daily', duration: '4 weeks' },
        { name: 'Iron Supplements', dosage: '65mg', frequency: 'Once daily', duration: '4 weeks' }
      ],
      instructions: 'Take with food. Continue regular monitoring of blood pressure.'
    },
    {
      id: 2,
      date: '2025-01-28',
      doctor: 'Dr. Rafiq Ahmed',
      medications: [
        { name: 'Prenatal Vitamins', dosage: '1 tablet', frequency: 'Once daily', duration: '4 weeks' },
        { name: 'Calcium Supplements', dosage: '500mg', frequency: 'Twice daily', duration: '4 weeks' },
        { name: 'Methyldopa', dosage: '250mg', frequency: 'Twice daily', duration: '2 weeks' }
      ],
      instructions: 'Monitor blood pressure daily. Report any headaches or vision changes immediately.'
    }
  ];
  
  // Medical reports data
  medicalReports = [
    {
      id: 1,
      date: '2025-02-25',
      type: 'Blood Test',
      summary: 'Hemoglobin: 10.8 g/dL (Low), Blood Sugar: 126 mg/dL (Elevated)',
      details: 'Complete blood count and glucose tolerance test results',
      provider: 'Rajshahi Medical College Hospital',
      fileUrl: 'assets/reports/blood_test_feb25.pdf'
    },
    {
      id: 2,
      date: '2025-02-15',
      type: 'Ultrasound',
      summary: 'Fetal growth consistent with 30 weeks. Normal amniotic fluid.',
      details: 'Fetal measurements and anatomy scan results',
      provider: 'Maternal Health Clinic, Rajshahi',
      fileUrl: 'assets/reports/ultrasound_feb15.pdf'
    },
    {
      id: 3,
      date: '2025-01-20',
      type: 'Urine Analysis',
      summary: 'Trace protein detected. No glucose or ketones.',
      details: 'Routine urine analysis results',
      provider: 'Rajshahi Medical College Hospital',
      fileUrl: 'assets/reports/urine_jan20.pdf'
    }
  ];
  
  // Assessment history
  assessments = [
    {
      id: 1,
      date: '2025-02-25',
      assessedBy: 'Dr. Rafiq Ahmed',
      findings: 'Blood pressure remains elevated. Mild edema in lower extremities.',
      riskLevel: 'High',
      recommendations: 'Continue medication. Increase rest periods and reduce salt intake.'
    },
    {
      id: 2,
      date: '2025-01-28',
      assessedBy: 'Dr. Rafiq Ahmed',
      findings: 'Blood pressure elevated. No other concerning symptoms.',
      riskLevel: 'Medium',
      recommendations: 'Start blood pressure medication. Monitor daily.'
    }
  ];
  
  constructor(private route: ActivatedRoute) {}
  
  ngOnInit(): void {
    // In a real application, we would get the patient ID from the route
    // and fetch the patient data from a service
    this.route.params.subscribe(params => {
      this.patientId = +params['id']; // Convert to number
      // Then fetch patient data based on ID
    });
  }
  
  toggleSidebar(): void {
    this.sidebarCollapsed = !this.sidebarCollapsed;
  }
  
  setActiveTab(tab: string): void {
    this.activeTab = tab;
  }
}