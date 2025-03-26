import { Component, Input, Output, EventEmitter } from '@angular/core';
import { CommonModule } from '@angular/common';
import { Test } from '../../../models/prescription.model';


@Component({
  selector: 'app-test-item',
  standalone: true,
  imports: [CommonModule],
  templateUrl: './test-item.component.html',
  styleUrl: './test-item.component.css'
})
export class TestItemComponent {
  @Input() test!: Test;
  @Input() showDelete: boolean = true;
  @Input() showResults: boolean = false;
  @Output() delete = new EventEmitter<void>();
  @Output() uploadResult = new EventEmitter<Test>();

  onDelete(): void {
    this.delete.emit();
  }

  onUploadResult(): void {
    this.uploadResult.emit(this.test);
  }
}