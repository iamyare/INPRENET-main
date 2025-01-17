import { Component } from '@angular/core';
import * as XLSX from 'xlsx';
import { AfiliacionService } from '../../../../services/afiliacion.service';

@Component({
  selector: 'app-contancias-afiliados',
  templateUrl: './contancias-afiliados.component.html',
  styleUrls: ['./contancias-afiliados.component.scss'],
})
export class ContanciasAfiliadosComponent {
  mes!: number;
  anio!: number;
  loading: boolean = false;

  constructor(private afiliacionService: AfiliacionService) {}

  generarReporteFallecidos(): void {
    if (!this.mes || !this.anio) {
      alert('Por favor, seleccione un mes y un año válidos.');
      return;
    }

    this.loading = true;

    this.afiliacionService.obtenerFallecidosPorMes(this.mes, this.anio).subscribe(
      (response) => {
        this.loading = false;
        const fallecidos = response.data;

        if (fallecidos.length === 0) {
          alert('No se encontraron fallecidos para el periodo seleccionado.');
          return;
        }

        // Convertir datos a Excel
        const worksheet = XLSX.utils.json_to_sheet(fallecidos);
        const workbook = XLSX.utils.book_new();
        XLSX.utils.book_append_sheet(workbook, worksheet, 'Fallecidos');

        // Descargar archivo
        const fileName = `Fallecidos_${this.mes}-${this.anio}.xlsx`;
        XLSX.writeFile(workbook, fileName);
      },
      (error) => {
        this.loading = false;
        console.error('Error al generar el reporte:', error);
        alert('Ocurrió un error al generar el reporte. Inténtelo nuevamente.');
      }
    );
  }
}
