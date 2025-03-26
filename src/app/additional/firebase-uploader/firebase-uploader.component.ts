import { Component } from '@angular/core';
import { CommonModule } from '@angular/common';
import { Firestore, collection, doc, setDoc, writeBatch } from '@angular/fire/firestore';

@Component({
  selector: 'app-firebase-uploader',
  standalone: true,
  imports: [CommonModule],
  template: `
    <div class="container p-4">
      <div class="card shadow">
        <div class="card-header bg-primary text-white">
          <h3 class="m-0">Firebase Data Uploader</h3>
        </div>
        <div class="card-body">
          <div class="mb-3">
            <label for="jsonFile" class="form-label">Select JSON file to import</label>
            <input type="file" class="form-control" id="jsonFile" accept=".json" (change)="onFileSelected($event)">
            <div class="form-text">The JSON file should contain collections and documents to import.</div>
          </div>

          <div *ngIf="selectedFile" class="mb-3">
            <p><strong>Selected File:</strong> {{ selectedFile.name }}</p>
            <button class="btn btn-primary" (click)="uploadData()" [disabled]="isUploading">
              <span *ngIf="isUploading" class="spinner-border spinner-border-sm me-2" role="status" aria-hidden="true"></span>
              {{ isUploading ? 'Importing...' : 'Import to Firebase' }}
            </button>
          </div>

          <div *ngIf="progressMessage" class="alert" [ngClass]="{'alert-info': !uploadComplete && !error, 'alert-success': uploadComplete && !error, 'alert-danger': error}">
            <p class="mb-0">{{ progressMessage }}</p>
          </div>

          <div *ngIf="logs.length > 0" class="mt-4">
            <h5>Import Log:</h5>
            <div class="border rounded p-3 bg-light" style="max-height: 300px; overflow-y: auto;">
              <p *ngFor="let log of logs" class="mb-1 small">{{ log }}</p>
            </div>
          </div>
        </div>
      </div>
    </div>
  `,
  styles: [`
    .container {
      max-width: 800px;
    }
    
    .card {
      border: none;
      border-radius: 10px;
    }
    
    .card-header {
      border-radius: 10px 10px 0 0 !important;
    }
  `]
})
export class FirebaseUploaderComponent {
  selectedFile: File | null = null;
  isUploading = false;
  uploadComplete = false;
  error = false;
  progressMessage = '';
  logs: string[] = [];

  constructor(private firestore: Firestore) {}

  onFileSelected(event: Event): void {
    const input = event.target as HTMLInputElement;
    if (input.files && input.files.length > 0) {
      this.selectedFile = input.files[0];
      this.logs = [];
      this.progressMessage = '';
      this.uploadComplete = false;
      this.error = false;
    }
  }

  addLog(message: string): void {
    const timestamp = new Date().toLocaleTimeString();
    this.logs.push(`[${timestamp}] ${message}`);
  }

  async uploadData(): Promise<void> {
    if (!this.selectedFile) {
      this.progressMessage = 'No file selected.';
      return;
    }

    this.isUploading = true;
    this.progressMessage = 'Reading file...';
    this.addLog('Starting import process...');
    this.addLog(`Reading file: ${this.selectedFile.name}`);

    try {
      // Read the file
      const fileData = await this.readFileAsJson(this.selectedFile);
      
      // Validate the data structure
      if (!fileData || typeof fileData !== 'object') {
        throw new Error('Invalid JSON data. Expected an object with collections.');
      }
      
      // Import each collection
      const collections = Object.keys(fileData);
      this.addLog(`Found ${collections.length} collections to import.`);
      this.progressMessage = `Importing ${collections.length} collections...`;
      
      let docsImported = 0;
      
      for (const collectionName of collections) {
        const collectionData = fileData[collectionName];
        if (typeof collectionData !== 'object') continue;
        
        const documentCount = Object.keys(collectionData).length;
        this.addLog(`Importing ${documentCount} documents to "${collectionName}" collection...`);
        
        // Use batched writes for better performance
        await this.importCollection(collectionName, collectionData);
        docsImported += documentCount;
      }
      
      this.uploadComplete = true;
      this.progressMessage = `Import completed successfully! Imported ${docsImported} documents across ${collections.length} collections.`;
      this.addLog('Import completed successfully!');
    } catch (error: any) { // Properly type the error parameter
      this.error = true;
      this.progressMessage = `Error: ${error?.message || 'Unknown error occurred'}`;
      this.addLog(`ERROR: ${error?.message || 'Unknown error occurred'}`);
      console.error('Import error:', error);
    } finally {
      this.isUploading = false;
    }
  }

  private readFileAsJson(file: File): Promise<any> {
    return new Promise((resolve, reject) => {
      const reader = new FileReader();
      
      reader.onload = (event) => {
        try {
          const json = JSON.parse(event.target?.result as string);
          resolve(json);
        } catch (error) {
          reject(new Error('Failed to parse JSON file. Please check file format.'));
        }
      };
      
      reader.onerror = () => {
        reject(new Error('Failed to read file.'));
      };
      
      reader.readAsText(file);
    });
  }

  private async importCollection(collectionName: string, collectionData: any): Promise<void> {
    const BATCH_SIZE = 450; // Firestore batch size limit is 500
    const documentIds = Object.keys(collectionData);
    const documentCount = documentIds.length;
    
    // Create batches
    const batches = [];
    let currentBatch = writeBatch(this.firestore);
    let operationCount = 0;
    let batchCount = 1;
    
    for (const documentId of documentIds) {
      const documentData = collectionData[documentId];
      const docRef = doc(collection(this.firestore, collectionName), documentId);
      
      currentBatch.set(docRef, documentData);
      operationCount++;
      
      // If batch is full, commit it and start a new one
      if (operationCount >= BATCH_SIZE) {
        batches.push(currentBatch.commit());
        this.addLog(`Committing batch ${batchCount} for "${collectionName}" (${operationCount} operations)`);
        
        currentBatch = writeBatch(this.firestore);
        operationCount = 0;
        batchCount++;
      }
    }
    
    // Commit any remaining operations
    if (operationCount > 0) {
      batches.push(currentBatch.commit());
      this.addLog(`Committing final batch ${batchCount} for "${collectionName}" (${operationCount} operations)`);
    }
    
    // Wait for all batches to complete
    await Promise.all(batches);
    this.addLog(`Successfully imported ${documentCount} documents to "${collectionName}"`);
  }
}