import { Component, Inject } from '@angular/core';
import { MAT_DIALOG_DATA, MatDialogRef } from '@angular/material/dialog';

@Component({
  selector: 'app-dialog-suboptions',
  templateUrl: './dialog-suboptions.component.html',
  styleUrl: './dialog-suboptions.component.scss'
})
export class DialogSuboptionsComponent {
  constructor(
    @Inject(MAT_DIALOG_DATA) public data: { options: string[] },
    private dialogRef: MatDialogRef<DialogSuboptionsComponent>
  ) {}

  onOptionClick(option: string): void {
    this.dialogRef.close(option); // Envía la opción seleccionada al componente padre
  }

  onClose(): void {
    this.dialogRef.close(); // Cierra el dialog sin enviar nada
  }
}
