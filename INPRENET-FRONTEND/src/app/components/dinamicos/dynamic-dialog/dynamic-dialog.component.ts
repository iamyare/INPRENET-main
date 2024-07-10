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
  dialogTitle: string = ''; // Título del diálogo

  displayedColumnsB: string[] = []; // Dejar esto vacío inicialmente
  displayedColumnsD: string[] = []; // Dejar esto vacío inicialmente

  constructor(@Inject(MAT_DIALOG_DATA) public data: { logs: any[] }, private deduccionSVC: DeduccionesService) { }

  ngOnInit() {
    for (let i = 0; i < this.data.logs.length; i++) {
      const element = this.data.logs[i];
      if (element.type === 'beneficios') {
        this.displayedColumnsB = ['NOMBRE_BENEFICIO', 'MontoAPagar', 'verDeducciones'];
      }
    }
  }

  getDeduccionesByBeneficio(element: any) {
    // Limpiar cualquier deducción previa antes de agregar nuevas deducciones
    this.data.logs = this.data.logs.filter(log => log.type !== 'deducciones');

    this.deduccionSVC.getDeduccionesByPersonaAndBenef(element.ID_PERSONA, element.ID_BENEFICIO).subscribe({
      next: (response1) => {
        if (response1) {
          const data = response1;
          this.data.logs.push({ message: 'Datos De Deducciones:', detail: data, type: 'deducciones' });
          this.displayedColumnsD = ['NOMBRE_DEDUCCION', 'MontoAplicado'];
        }
      },
    });
  }

  isArray(obj: any): boolean {
    return Array.isArray(obj);
  }
}
