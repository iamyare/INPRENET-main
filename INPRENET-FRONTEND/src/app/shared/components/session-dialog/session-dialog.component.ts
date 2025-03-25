import { Component, Inject } from '@angular/core';
import { MAT_DIALOG_DATA, MatDialogRef } from '@angular/material/dialog';

export interface SessionDialogData {
  title: string;
  message: string;
  showLogoutButton?: boolean;
  showStayButton?: boolean;
}

@Component({
  selector: 'app-session-dialog',
  template: `
    <h2 mat-dialog-title>{{ data.title }}</h2>
    <mat-dialog-content>
      <p>{{ data.message }}</p>
    </mat-dialog-content>
    <mat-dialog-actions align="end">
      <button *ngIf="data.showStayButton" 
              mat-button 
              (click)="onStayClicked()">
        Permanecer conectado
      </button>
      <button *ngIf="data.showLogoutButton" 
              mat-button 
              color="warn" 
              (click)="onLogoutClicked()">
        Cerrar sesión
      </button>
    </mat-dialog-actions>
  `,
  styles: [`
    :host {
      display: block;
      padding: 20px;
    }
    mat-dialog-content {
      margin: 20px 0;
    }
    button {
      margin-left: 8px;
    }
  `]
})
export class SessionDialogComponent {
  @Inject(MAT_DIALOG_DATA) public data!: SessionDialogData;

  constructor(
    public dialogRef: MatDialogRef<SessionDialogComponent>
  ) {}

  onStayClicked(): void {
    this.dialogRef.close('stay');
  }

  onLogoutClicked(): void {
    this.dialogRef.close('logout');
  }
}