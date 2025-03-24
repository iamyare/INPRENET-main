import { Component, Input } from '@angular/core';
import { AbstractControl } from '@angular/forms';
import { ValidationService } from '../services/validation.service';

@Component({
  selector: 'app-error-messages',
  template: `
    <mat-error *ngIf="control && control.invalid && (control.dirty || control.touched)">
      <ng-container *ngFor="let error of getErrors()">
        {{ error }}
      </ng-container>
    </mat-error>
  `
})
export class ErrorMessagesComponent {
  @Input() control!: AbstractControl;  

  constructor(private validationService: ValidationService) {}

  getErrors(): string[] {
    return this.validationService.getErrorMessages(this.control);
  }
}
