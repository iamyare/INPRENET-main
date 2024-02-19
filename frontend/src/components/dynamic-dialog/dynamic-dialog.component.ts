import { Component, Inject, OnInit } from '@angular/core';
import { MAT_DIALOG_DATA } from '@angular/material/dialog';

@Component({
  selector: 'app-dynamic-dialog',
  templateUrl: './dynamic-dialog.component.html',
  styleUrl: './dynamic-dialog.component.scss'
})
export class DynamicDialogComponent implements OnInit{

  displayedColumns: string[] = []; // Dejar esto vacío inicialmente
  dialogTitle: string = ''; // Título del diálogo

  constructor(@Inject(MAT_DIALOG_DATA) public data: { logs: any[], type: string }) {
  }

  ngOnInit() {
    // Configurar las columnas y el título basado en el tipo de datos
    if (this.data.type === 'deduccion') {
      // Añadir 'monto_aplicado' a la lista de columnas mostradas para deducciones
      this.displayedColumns = ['deduccion', 'monto_aplicado'];
      this.dialogTitle = 'Detalle de Deducciones';
    } else if (this.data.type === 'beneficio') {
      this.displayedColumns = ['nombre_beneficio', 'monto'];
      this.dialogTitle = 'Detalle de Beneficios';
    }
  }

  isArray(obj: any): boolean {
    return Array.isArray(obj);
  }


}
