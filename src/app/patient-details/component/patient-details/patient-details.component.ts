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
import { PatientDetailsService } from '../../services/patient-details.service';
import { Patient } from '../../../patient/model/patient.model';
import { Subscription } from 'rxjs';


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
    PatientPrescriptionsComponent,
    PatientMedicalReportsComponent,
    PatientAssessmentComponent,
    PatientProfileComponent,
    PatientInsightsComponent,
    PatientHealthDataComponent
  ],
  templateUrl: './patient-details.component.html',
  styleUrl: './patient-details.component.css'
})
export class PatientDetailsComponent implements OnInit {
  sidebarCollapsed = false;
  activeTab = 'profile';
  isLoading = false;
  patient: Patient | null = null;
  private subscription = new Subscription();


  private dummyPatient: Patient = {
    id: "1",
    personalInfo: {
      fullName: 'Fatima Akter',
      age: 28,
      phoneNumber: '+8801712345678',
      address: 'Village: Boalia, District: Rajshahi',
      bloodType: 'B+',
      height: 162,
      weight: 65,
      bmi: 24.8,
      emergencyContact: {
        name: 'Abdul Karim',
        relation: 'Husband',
        phone: '+8801698765432'
      }
    },
    medicalInfo: {
      allergies: ['Penicillin', 'Sulfa drugs'],
      medicalConditions: ['Gestational Diabetes', 'Mild Hypertension'],
      previousSurgeries: [
        {
          date: '2022-07-10',
          procedure: "Apendix"
        }
      ],
      currentMedications: [
        {
          name: "Napa",
          dosage: "50 mg",
          frequency: "1 each day",
          reason: "Iron Suppliment",
        },
        {
          name: "Zif Forte",
          dosage: "500 mg",
          frequency: "2 each day",
          reason: "Fever",
        },
      ],
    },
    pregnancyInfo: {
      weeks: 32,
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
    },
    assignmentInfo: {
      assignedDoctor: "Dummy Id",
      assignedHealthWorker: "Nasreen Ahmed",
      initialNotes: "no need",
      riskLevel: "low",
    },
    criticality: 'critical',
    vitalStatus: {
      bp: '150/95',
      heartRate: '92',
      oxygenLevel: '95%',
      temperature: '37.5°C'
    },
    lastCheckup: '2025-02-25',
    nextAppointment: '2025-03-05',
    createdBy: 'Dummy Id',
    createdAt: new Date('2025-01-25'),
    updatedAt: new Date('2025-02-25'),
    profile: 'assets/images/patients/patient1.jpg',
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

  constructor(private route: ActivatedRoute, private patientDetailsService: PatientDetailsService) { }

  ngOnInit(): void {

    this.loadPatientDetails();
    console.log('Patient Medical Conditions:', 
     JSON.stringify(this.patient?.medicalInfo?.medicalConditions) 
    );

  }

  loadPatientDetails(): void {
    if (this.isLoading) return;

    this.isLoading = true;
    const patientId = this.patientDetailsService.getPatientId();

    if (!patientId) {
      console.error('No patient ID available');
      this.patient = this.dummyPatient; // Set dummy data
      this.isLoading = false;
      return;
    }

    this.subscription.add(
      this.patientDetailsService.getPatient(patientId).subscribe({
        next: (result) => {
          if (result) {
            this.patient = result;
          } else {
            console.warn('Patient not found, showing dummy data');
            this.patient = this.dummyPatient; // Set dummy data if no patient found
          }
          this.isLoading = false;
        },
        error: (err) => {
          console.error('Error loading patient:', err);
          this.isLoading = false;
          this.patient = this.dummyPatient; // Set dummy data on error
        }
      })
    );
  }


  toggleSidebar(): void {
    this.sidebarCollapsed = !this.sidebarCollapsed;
  }

  setActiveTab(tab: string): void {
    this.activeTab = tab;
  }
  ngOnDestroy(): void {
    this.subscription.unsubscribe();
  }
}