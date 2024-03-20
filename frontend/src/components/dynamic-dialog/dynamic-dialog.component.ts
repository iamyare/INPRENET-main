import { Component, Inject, Input, OnInit } from '@angular/core';
import { MAT_DIALOG_DATA } from '@angular/material/dialog';

@Component({
  selector: 'app-dynamic-dialog',
  templateUrl: './dynamic-dialog.component.html',
  styleUrl: './dynamic-dialog.component.scss'
})
export class DynamicDialogComponent implements OnInit{

  displayedColumns: string[] = []; // Dejar esto vacío inicialmente
  dialogTitle: string = ''; // Título del diálogo
  @Input() titulo = "";
  @Input() subtitulo = "";

  constructor(@Inject(MAT_DIALOG_DATA) public data: { logs: any[], type: string }) {
  }

  ngOnInit() {
  if (this.data.type === 'deduccion') {
    this.displayedColumns = ['NOMBRE_DEDUCCION', 'MontoAplicado']; // Ajustar según los nombres reales de tus propiedades
    this.dialogTitle = 'Detalle de Deducciones';
  } else if (this.data.type === 'beneficio') {
    this.displayedColumns = ['NOMBRE_BENEFICIO', 'MontoAPagar'];
    this.dialogTitle = 'Detalle de Beneficios';
  }
}

  isArray(obj: any): boolean {
    return Array.isArray(obj);
  }
}
