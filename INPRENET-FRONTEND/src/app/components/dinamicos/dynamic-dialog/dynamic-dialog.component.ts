import { Component, Inject, Input, OnInit } from '@angular/core';
import { MAT_DIALOG_DATA } from '@angular/material/dialog';
import { DeduccionesService } from 'src/app/services/deducciones.service';

@Component({
  selector: 'app-dynamic-dialog',
  templateUrl: './dynamic-dialog.component.html',
  styleUrls: ['./dynamic-dialog.component.scss']
})
export class DynamicDialogComponent implements OnInit {
  @Input() titulo = "";
  @Input() subtitulo = "";
  dialogTitle: string = 'Desglose'; // Título del diálogo

  displayedColumnsB: string[] = ['CODIGO', 'NOMBRE_BENEFICIO', 'MontoAPagar']; // Columnas para beneficios
  displayedColumnsD: string[] = ['NOMBRE_INSTITUCION', 'NOMBRE_DEDUCCION', 'MontoAplicado']; // Columnas para deducciones

  constructor(@Inject(MAT_DIALOG_DATA) public data: { logs: any[] }, private deduccionSVC: DeduccionesService) { }

  ngOnInit() {
    this.dialogTitle = this.titulo || 'Desglose';
  }


  isArray(obj: any): boolean {
    return Array.isArray(obj);
  }
}
