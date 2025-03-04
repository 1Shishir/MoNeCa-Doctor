import { Component, EventEmitter, OnInit, Output } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule, ReactiveFormsModule, FormBuilder, FormGroup } from '@angular/forms';
import { debounceTime, distinctUntilChanged } from 'rxjs/operators';

@Component({
  selector: 'app-patient-search',
  standalone: true,
  imports: [
    CommonModule,
    FormsModule,
    ReactiveFormsModule
  ],
  templateUrl: './patient-search.component.html',
  styleUrl: './patient-search.component.css'
})
export class PatientSearchComponent implements OnInit {
  @Output() filtersChanged = new EventEmitter<any>();
  
  searchForm: FormGroup;
  
  criticalityOptions = [
    { value: 'all', label: 'All Patients' },
    { value: 'critical', label: 'Critical' },
    { value: 'high', label: 'High Risk' },
    { value: 'medium', label: 'Medium Risk' },
    { value: 'low', label: 'Low Risk' }
  ];
  
  healthWorkerOptions = [
    { value: 'all', label: 'All Health Workers' },
    { value: 'Nasreen Ahmed', label: 'Nasreen Ahmed' },
    { value: 'Tahmina Islam', label: 'Tahmina Islam' },
    { value: 'Mahmuda Begum', label: 'Mahmuda Begum' },
    { value: 'Farida Yesmin', label: 'Farida Yesmin' },
    { value: 'Shahana Akhter', label: 'Shahana Akhter' },
    { value: 'Najma Begum', label: 'Najma Begum' }
  ];
  
  constructor(private fb: FormBuilder) {
    this.searchForm = this.fb.group({
      searchTerm: [''],
      criticality: ['all'],
      healthWorker: ['all']
    });
  }
  
  ngOnInit(): void {
    // Emit changes when form values change with debounce for search term
    this.searchForm.get('searchTerm')?.valueChanges
      .pipe(
        debounceTime(300),
        distinctUntilChanged()
      )
      .subscribe(value => {
        this.emitFilterChanges();
      });
    
    // Emit changes immediately for dropdown changes
    this.searchForm.get('criticality')?.valueChanges.subscribe(value => {
      this.emitFilterChanges();
    });
    
    this.searchForm.get('healthWorker')?.valueChanges.subscribe(value => {
      this.emitFilterChanges();
    });
  }
  
  emitFilterChanges(): void {
    this.filtersChanged.emit(this.searchForm.value);
  }
  
  resetFilters(): void {
    this.searchForm.patchValue({
      searchTerm: '',
      criticality: 'all',
      healthWorker: 'all'
    });
  }
}