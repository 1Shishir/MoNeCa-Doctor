import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormBuilder, FormGroup, Validators, ReactiveFormsModule } from '@angular/forms';
import { RouterModule } from '@angular/router';


import { SidebarComponent } from '../../../dashboard/components/sidebar/sidebar.component';
import { HeaderComponent } from '../../../dashboard/components/header/header.component';
import { AlertComponent } from '../../../shared/components/alert/alert.component';
import { ButtonComponent } from '../../../shared/components/button/button.component';
import { PrescriptionTemplate } from '../../../models/prescription-template.model';
import { PrescriptionTemplateService } from '../../services/prescription-template.service';

@Component({
  selector: 'app-template-settings',
  standalone: true,
  imports: [
    CommonModule,
    RouterModule,
    ReactiveFormsModule,
    SidebarComponent,
    HeaderComponent,
    AlertComponent,
    ButtonComponent
  ],
  templateUrl: './template-settings.component.html',
  styleUrl: './template-settings.component.css'
})
export class TemplateSettingsComponent implements OnInit {
  templates: PrescriptionTemplate[] = [];
  selectedTemplate: PrescriptionTemplate | null = null;
  templateForm: FormGroup;

  isLoading: boolean = true;
  isSaving: boolean = false;
  isCreating: boolean = false;
  isUploading: boolean = false;

  errorMessage: string = '';
  successMessage: string = '';
  sidebarCollapsed: boolean = false;

  headerImagePreview: string | null = null;
  watermarkImagePreview: string | null = null;


  doctorId: string = 'current-doctor-id';

  constructor(
    private fb: FormBuilder,
    private templateService: PrescriptionTemplateService
  ) {
    this.templateForm = this.createTemplateForm();
  }

  ngOnInit(): void {
    this.loadTemplates();
  }

  toggleSidebar(): void {
    this.sidebarCollapsed = !this.sidebarCollapsed;
  }

  createTemplateForm(): FormGroup {
    return this.fb.group({
      name: ['', [Validators.required, Validators.minLength(3)]],
      hospitalName: ['', Validators.required],
      hospitalAddress: ['', Validators.required],
      hospitalPhone: [''],
      headerImage: [null],
      watermarkImage: [null],
      watermarkOpacity: [0.1, [Validators.min(0.05), Validators.max(0.3)]],
      footerText: ['Powered by MoNeCa Health System'],
      isDefault: [false]
    });
  }

  loadTemplates(): void {
    this.isLoading = true;

    this.templateService.getTemplates(this.doctorId).subscribe({
      next: (templates) => {
        this.templates = templates;


        const defaultTemplate = templates.find(t => t.isDefault);
        if (defaultTemplate) {
          this.selectTemplate(defaultTemplate);
        } else if (templates.length > 0) {
          this.selectTemplate(templates[0]);
        }

        this.isLoading = false;
      },
      error: (error) => {
        console.error('Error loading templates:', error);
        this.errorMessage = 'Failed to load prescription templates.';
        this.isLoading = false;
      }
    });
  }

  selectTemplate(template: PrescriptionTemplate): void {
    this.selectedTemplate = template;
    this.resetForm();

    this.templateForm.patchValue({
      name: template.name,
      hospitalName: template.hospitalName || '',
      hospitalAddress: template.hospitalAddress || '',
      hospitalPhone: template.hospitalPhone || '',
      watermarkOpacity: template.watermarkOpacity,
      footerText: template.footerText || 'Powered by MoNeCa Health System',
      isDefault: template.isDefault
    });

    this.headerImagePreview = template.headerImageUrl || null;
    this.watermarkImagePreview = template.watermarkImageUrl || null;

    this.isCreating = false;
  }

  newTemplate(): void {
    this.selectedTemplate = null;
    this.resetForm();
    this.isCreating = true;
  }

  resetForm(): void {
    this.templateForm.reset({
      name: '',
      hospitalName: '',
      hospitalAddress: '',
      hospitalPhone: '',
      watermarkOpacity: 0.1,
      footerText: 'Powered by MoNeCa Health System',
      isDefault: false
    });

    this.headerImagePreview = null;
    this.watermarkImagePreview = null;
    this.errorMessage = '';
    this.successMessage = '';
  }

  onHeaderImageSelected(event: Event): void {
    const element = event.target as HTMLInputElement;
    if (element.files && element.files.length > 0) {
      const file = element.files[0];
      this.templateForm.patchValue({ headerImage: file });


      const reader = new FileReader();
      reader.onload = () => {
        this.headerImagePreview = reader.result as string;
      };
      reader.readAsDataURL(file);
    }
  }

  onWatermarkImageSelected(event: Event): void {
    const element = event.target as HTMLInputElement;
    if (element.files && element.files.length > 0) {
      const file = element.files[0];
      this.templateForm.patchValue({ watermarkImage: file });


      const reader = new FileReader();
      reader.onload = () => {
        this.watermarkImagePreview = reader.result as string;
      };
      reader.readAsDataURL(file);
    }
  }

  async saveTemplate(): Promise<void> {
    if (this.templateForm.invalid) {
      this.markFormGroupTouched(this.templateForm);
      return;
    }

    this.isSaving = true;
    this.errorMessage = '';
    this.successMessage = '';

    try {
      const formValues = this.templateForm.value;


      let headerImageUrl = this.selectedTemplate?.headerImageUrl;
      let watermarkImageUrl = this.selectedTemplate?.watermarkImageUrl;

      if (formValues.headerImage) {
        this.isUploading = true;
        headerImageUrl = await this.uploadImage('header', formValues.headerImage);
      }

      if (formValues.watermarkImage) {
        this.isUploading = true;
        watermarkImageUrl = await this.uploadImage('watermark', formValues.watermarkImage);
      }


      const templateData: Partial<PrescriptionTemplate> = {
        name: formValues.name,
        hospitalName: formValues.hospitalName,
        hospitalAddress: formValues.hospitalAddress,
        hospitalPhone: formValues.hospitalPhone,
        headerImageUrl,
        watermarkImageUrl,
        watermarkOpacity: formValues.watermarkOpacity,
        footerText: formValues.footerText,
        isDefault: formValues.isDefault
      };

      if (this.isCreating) {

        const newTemplateData = {
          ...templateData,
          doctorId: this.doctorId,
          isDefault: formValues.isDefault || false
        } as Omit<PrescriptionTemplate, 'id' | 'createdAt' | 'updatedAt'>;

        this.templateService.createTemplate(newTemplateData).subscribe({
          next: (templateId) => {
            this.successMessage = 'Template created successfully.';
            this.isSaving = false;
            this.isUploading = false;


            if (formValues.isDefault) {
              this.templates.forEach(t => t.isDefault = false);
            }


            this.loadTemplates();
          },
          error: (error) => {
            console.error('Error creating template:', error);
            this.errorMessage = 'Failed to create template.';
            this.isSaving = false;
            this.isUploading = false;
          }
        });
      } else if (this.selectedTemplate) {

        this.templateService.updateTemplate(this.selectedTemplate.id, templateData).subscribe({
          next: () => {
            this.successMessage = 'Template updated successfully.';
            this.isSaving = false;
            this.isUploading = false;

            const updatedTemplate: PrescriptionTemplate = {
              ...this.selectedTemplate,
              ...templateData
            } as PrescriptionTemplate;

            this.selectedTemplate = updatedTemplate;

            this.templates = this.templates.map(template =>
              template.id === updatedTemplate.id ? updatedTemplate : template
            );
          },
          error: (error) => {
            console.error('Error updating template:', error);
            this.errorMessage = 'Failed to update template.';
            this.isSaving = false;
            this.isUploading = false;
          }
        });
      }
    } catch (error) {
      console.error('Error saving template:', error);
      this.errorMessage = 'Failed to save template.';
      this.isSaving = false;
      this.isUploading = false;
    }
  }

  async uploadImage(type: 'header' | 'watermark', file: File): Promise<string> {
    return new Promise((resolve, reject) => {
      this.templateService.uploadTemplateImage(this.doctorId, type, file).subscribe({
        next: (imageUrl) => {
          resolve(imageUrl);
        },
        error: (error) => {
          console.error(`Error uploading ${type} image:`, error);
          reject(error);
        }
      });
    });
  }

  deleteTemplate(): void {
    if (!this.selectedTemplate) return;

    if (confirm(`Are you sure you want to delete the template "${this.selectedTemplate.name}"?`)) {
      this.templateService.deleteTemplate(this.selectedTemplate.id).subscribe({
        next: () => {
          this.successMessage = 'Template deleted successfully.';


          this.templates = this.templates.filter(t => t.id !== this.selectedTemplate?.id);


          if (this.templates.length > 0) {
            this.selectTemplate(this.templates[0]);
          } else {
            this.newTemplate();
          }
        },
        error: (error) => {
          console.error('Error deleting template:', error);
          this.errorMessage = 'Failed to delete template.';
        }
      });
    }
  }

  setDefaultTemplate(): void {
    if (!this.selectedTemplate) return;

    this.templateService.setDefaultTemplate(this.doctorId, this.selectedTemplate.id).subscribe({
      next: () => {
        this.successMessage = 'Default template set successfully.';


        this.templates.forEach(t => t.isDefault = (t.id === this.selectedTemplate?.id));

        if (this.selectedTemplate) {
          this.selectedTemplate.isDefault = true;
          this.templateForm.patchValue({
            isDefault: true
          });
        }
      },
      error: (error) => {
        console.error('Error setting default template:', error);
        this.errorMessage = 'Failed to set default template.';
      }
    });
  }


  markFormGroupTouched(formGroup: FormGroup): void {
    Object.values(formGroup.controls).forEach(control => {
      control.markAsTouched();
    });
  }
}

