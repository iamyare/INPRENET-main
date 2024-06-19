// src/app/components/agregar-movimiento/agregar-movimiento.component.ts
import { Component, Inject } from '@angular/core';
import { MatDialogRef, MAT_DIALOG_DATA } from '@angular/material/dialog';
import { FormBuilder, FormGroup, Validators } from '@angular/forms';

@Component({
  selector: 'app-agregar-movimiento',
  templateUrl: './agregar-movimiento.component.html',
  styleUrls: ['./agregar-movimiento.component.scss']
})
export class AgregarMovimientoComponent {
  movimientoForm: FormGroup;

  constructor(
    public dialogRef: MatDialogRef<AgregarMovimientoComponent>,
    @Inject(MAT_DIALOG_DATA) public data: any,
    private fb: FormBuilder
  ) {
    this.movimientoForm = this.fb.group({
      tipoCuenta: ['', Validators.required],
      monto: [null, [Validators.required, Validators.min(1)]],
      descripcion: ['', [Validators.required, Validators.maxLength(30)]],
      tipo: ['', Validators.required]
    });
  }

  onNoClick(): void {
    this.dialogRef.close();
  }

  onSubmit(): void {
    if (this.movimientoForm.valid) {
      this.dialogRef.close(this.movimientoForm.value);
    }
  }
}
