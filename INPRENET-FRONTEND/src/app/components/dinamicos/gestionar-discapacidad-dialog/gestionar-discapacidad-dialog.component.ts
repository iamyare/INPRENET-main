import { Component, Inject } from '@angular/core';
import { MAT_DIALOG_DATA, MatDialogRef } from '@angular/material/dialog';

@Component({
  selector: 'app-gestionar-discapacidad-dialog',
  templateUrl: './gestionar-discapacidad-dialog.component.html',
  styleUrls: ['./gestionar-discapacidad-dialog.component.scss']
})
export class GestionarDiscapacidadDialogComponent {
  discapacidadesDisponibles: any[];
  discapacidadesActuales: any[];

  constructor(
    @Inject(MAT_DIALOG_DATA) public data: any,
    private dialogRef: MatDialogRef<GestionarDiscapacidadDialogComponent>
  ) {
    this.discapacidadesDisponibles = data.discapacidades;
    this.discapacidadesActuales = Array.isArray(data.personaDiscapacidades)
      ? data.personaDiscapacidades
      : [];
  }

  agregarDiscapacidad(tipoDiscapacidad: any) {
    this.dialogRef.close({ agregar: true, tipo_discapacidad: tipoDiscapacidad });
  }

  eliminarDiscapacidad(discapacidadId: number) {
    if (discapacidadId === undefined) {
      console.error("El ID de discapacidad es undefined o nulo");
      return;
    }
    this.dialogRef.close({ eliminar: true, discapacidadId: discapacidadId });
  }
}
