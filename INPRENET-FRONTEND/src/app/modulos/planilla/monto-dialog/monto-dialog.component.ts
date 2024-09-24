import { Component, Inject } from '@angular/core';
import { MAT_DIALOG_DATA, MatDialogRef } from '@angular/material/dialog';

@Component({
  selector: 'app-monto-dialog',
  templateUrl: './monto-dialog.component.html',
  styleUrl: './monto-dialog.component.scss'
})
export class MontoDialogComponent {
  constructor(
    public dialogRef: MatDialogRef<MontoDialogComponent>,
    @Inject(MAT_DIALOG_DATA) public data: { monto_a_pagar: number }
  ) {}

  onCancel(): void {
    this.dialogRef.close();
  }

  onConfirm(): void {
    this.dialogRef.close(this.data);
  }

}
