import { Injectable, Optional } from '@angular/core';
import { Firestore, collection, doc, addDoc, updateDoc, deleteDoc, getDoc, getDocs, query, where, writeBatch, orderBy, Timestamp } from '@angular/fire/firestore';
import { from, Observable, of, throwError } from 'rxjs';
import { map, switchMap, catchError } from 'rxjs/operators';
import { Storage, ref as storageRef, uploadBytes, getDownloadURL, deleteObject, ref } from '@angular/fire/storage';
import { PrescriptionTemplate } from '../../models/prescription-template.model';

@Injectable({
  providedIn: 'root'
})
export class PrescriptionTemplateService {
  constructor(
    private firestore: Firestore,
    @Optional() private storage: Storage
      ) {
        if (!this.storage) {
          console.warn('Firebase Storage is not available. Some features will be limited.');
        }
      }

  
  getTemplates(doctorId: string): Observable<PrescriptionTemplate[]> {
    const templatesRef = collection(this.firestore, 'prescriptionTemplates');
    const q = query(templatesRef, where('doctorId', '==', doctorId));

    return from(getDocs(q)).pipe(
      map(snapshot => {
        return snapshot.docs.map(doc => {
          const data = doc.data();
          return {
            id: doc.id,
            ...data,
            createdAt: data['createdAt'].toDate(),
            updatedAt: data['updatedAt'].toDate()
          } as PrescriptionTemplate;
        });
      }),
      catchError(error => {
        console.error('Error fetching templates:', error);
        return throwError(() => new Error('Failed to fetch templates'));
      })
    );
  }

  
  getDefaultTemplate(doctorId: string): Observable<PrescriptionTemplate | null> {
    const templatesRef = collection(this.firestore, 'prescriptionTemplates');
    const q = query(templatesRef, where('doctorId', '==', doctorId), where('isDefault', '==', true));
    
    return from(getDocs(q)).pipe(
      map(snapshot => {
        if (snapshot.empty) {
          return null;
        }
        
        const docSnapshot = snapshot.docs[0];
        const data = docSnapshot.data();
        
        return {
          id: docSnapshot.id,
          ...data,
          createdAt: data['createdAt'].toDate(),
          updatedAt: data['updatedAt'].toDate()
        } as PrescriptionTemplate;
      }),
      catchError(error => {
        console.error('Error fetching default template:', error);
        return throwError(() => new Error('Failed to fetch default template'));
      })
    );
  }

  
  createTemplate(template: Omit<PrescriptionTemplate, 'id' | 'createdAt' | 'updatedAt'>): Observable<string> {
    const templateData = {
      ...template,
      createdAt: Timestamp.fromDate(new Date()),
      updatedAt: Timestamp.fromDate(new Date())
    };
    
    return from(addDoc(collection(this.firestore, 'prescriptionTemplates'), templateData)).pipe(
      map(docRef => docRef.id),
      catchError(error => {
        console.error('Error creating template:', error);
        return throwError(() => new Error('Failed to create template'));
      })
    );
  }

  
  updateTemplate(templateId: string, template: Partial<PrescriptionTemplate>): Observable<void> {
    const templateRef = doc(this.firestore, 'prescriptionTemplates', templateId);
    const updateData = {
      ...template,
      updatedAt: Timestamp.fromDate(new Date())
    };
    
    return from(updateDoc(templateRef, updateData)).pipe(
      catchError(error => {
        console.error('Error updating template:', error);
        return throwError(() => new Error('Failed to update template'));
      })
    );
  }

  
  deleteTemplate(templateId: string): Observable<void> {
    const templateRef = doc(this.firestore, 'prescriptionTemplates', templateId);
    
    return from(deleteDoc(templateRef)).pipe(
      catchError(error => {
        console.error('Error deleting template:', error);
        return throwError(() => new Error('Failed to delete template'));
      })
    );
  }

  
  uploadTemplateImage(doctorId: string, imageType: 'header' | 'watermark', file: File): Observable<string> {
    const filePath = `prescription-templates/${doctorId}/${imageType}_${new Date().getTime()}`;
    const fileRef = storageRef(this.storage, filePath);
    if (!this.storage) {
      return throwError(() => new Error('Storage service is not available'));
    }
    return from(uploadBytes(fileRef, file)).pipe(
      switchMap(() => from(getDownloadURL(fileRef))),
      catchError(error => {
        console.error('Error uploading image:', error);
        return throwError(() => new Error('Failed to upload image'));
      })
    );
  }

  
  setDefaultTemplate(doctorId: string, templateId: string): Observable<void> {
    const templatesRef = collection(this.firestore, 'prescriptionTemplates');
    const q = query(templatesRef, where('doctorId', '==', doctorId), where('isDefault', '==', true));
    
    return from(getDocs(q)).pipe(
      switchMap(snapshot => {
        const batch = writeBatch(this.firestore);
        
        
        snapshot.docs.forEach(docSnapshot => {
          if (docSnapshot.id !== templateId) {
            const templateRef = doc(this.firestore, 'prescriptionTemplates', docSnapshot.id);
            batch.update(templateRef, { isDefault: false, updatedAt: Timestamp.fromDate(new Date()) });
          }
        });
        
        
        const newDefaultRef = doc(this.firestore, 'prescriptionTemplates', templateId);
        batch.update(newDefaultRef, { isDefault: true, updatedAt: Timestamp.fromDate(new Date()) });
        
        return from(batch.commit());
      }),
      catchError(error => {
        console.error('Error setting default template:', error);
        return throwError(() => new Error('Failed to set default template'));
      })
    );
  }
}