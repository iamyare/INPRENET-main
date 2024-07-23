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
  dialogTitle: string = 'Desglose de Beneficios'; // Título del diálogo

  displayedColumnsB: string[] = ['CODIGO_BENEFICIO', 'NOMBRE_BENEFICIO', 'MONTO_A_PAGAR', 'verDeducciones']; // Columnas para beneficios
  displayedColumnsD: string[] = []; // Columnas para deducciones

  constructor(@Inject(MAT_DIALOG_DATA) public data: { logs: any[] }, private deduccionSVC: DeduccionesService) {
    console.log(data);

   }

  ngOnInit() {
    // Ajustar el título del diálogo según los datos proporcionados
    this.dialogTitle = this.titulo || 'Desglose de Beneficios';
  }

  getDeduccionesByBeneficio(element: any) {
    // Limpiar cualquier deducción previa antes de agregar nuevas deducciones
    this.data.logs = this.data.logs.filter(log => log.type !== 'deducciones');
    this.deduccionSVC.getDeduccionesByPersonaAndBenef(element.ID_PERSONA, element.ID_BENEFICIO, this.data.logs[2].detail[0].ID_PLANILLA).subscribe({
      next: (response1) => {
        if (response1) {
          const data = response1;
          this.data.logs.push({ message: 'Datos De Deducciones:', detail: data, type: 'deducciones' });
          this.displayedColumnsD = ['NOMBRE_INSTITUCION', 'NOMBRE_DEDUCCION', 'MontoAplicado'];
        }
      },
    });
  }

  isArray(obj: any): boolean {
    return Array.isArray(obj);
  }
}
