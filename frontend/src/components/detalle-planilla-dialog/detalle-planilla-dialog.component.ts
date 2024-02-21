import { ChangeDetectorRef, Component, Inject, OnInit } from '@angular/core';
import { MAT_DIALOG_DATA, MatDialogRef } from '@angular/material/dialog';
import { MatTableDataSource } from '@angular/material/table';
import { Observable, of } from 'rxjs';
import { TableColumn } from 'src/app/shared/Interfaces/table-column';

@Component({
  selector: 'app-detalle-planilla-dialog',
  templateUrl: './detalle-planilla-dialog.component.html',
  styleUrl: './detalle-planilla-dialog.component.scss'
})
export class DetallePlanillaDialogComponent{

  detallePlanillas: any[] = [];
  dataSource: MatTableDataSource<any>;
  columnas: string[] = []; // Definir las columnas como un array vacío

  constructor(@Inject(MAT_DIALOG_DATA) public data: any) {
    // Acceder a los datos pasados al diálogo
    this.detallePlanillas = data.detallePlanillas;

    // Obtener las propiedades únicas de los objetos en detallePlanillas y usarlas como columnas
    this.columnas = this.getColumnas();

    this.dataSource = new MatTableDataSource<any>(this.detallePlanillas);
  }

  ngOnInit(): void {
    // Puedes realizar cualquier inicialización adicional aquí
  }

  aplicarFiltro(event: Event) {
    const inputElement = (event.target as HTMLInputElement)?.value;
    if (inputElement !== undefined) {
      const filtro = (inputElement || '').trim().toLowerCase();
      this.dataSource.filter = filtro;
    }
  }

  // Función para obtener propiedades únicas como columnas
  getColumnas(): string[] {
    const propiedadesUnicas = new Set<string>();

    this.detallePlanillas.forEach((item) => {
      Object.keys(item).forEach((key) => {
        propiedadesUnicas.add(key);
      });
    });

    return Array.from(propiedadesUnicas);
  }


}
