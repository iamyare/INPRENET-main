import { Component } from '@angular/core';
import { MatDialog } from '@angular/material/dialog';
import { AfiliacionService } from '../../../services/afiliacion.service';
import * as XLSX from 'xlsx';
import { DialogSuboptionsComponent } from '../../afiliacion/constancias/dialog-suboptions/dialog-suboptions.component';

@Component({
  selector: 'app-menu-documentos',
  templateUrl: './menu-documentos.component.html',
  styleUrls: ['./menu-documentos.component.scss']
})
export class MenuDocumentosComponent {
  loading: boolean = false;

  constanciaButtons = [
    { label: 'Generar Reporte de Fallecidos', params: [
      { key: 'mes', label: 'Seleccione el Mes', type: 'number' },
      { key: 'anio', label: 'Seleccione el Año', type: 'number' }
    ]}
  ];

  constructor(
    private afiliacionService: AfiliacionService,
    private dialog: MatDialog
  ) {}

  onConstanciaClick(event: { label: string; params?: any }): void {
    if (event.label === 'Generar Reporte de Fallecidos') {
      this.openDialogForParams();
    }
  }

  openDialogForParams(): void {
    const dialogRef = this.dialog.open(DialogSuboptionsComponent, {
      width: '400px',
      data: {
        options: ['Generar Reporte'],
        params: [
          { key: 'mes', label: 'Seleccione el Mes', type: 'number' },
          { key: 'anio', label: 'Seleccione el Año', type: 'number' }
        ]
      }
    });
  
    dialogRef.afterClosed().subscribe((result) => {
      console.log('Resultado del diálogo:', result); // ✅ Verifica en la consola
  
      if (result?.selectedOption === 'Generar Reporte' && result?.params) {
        this.generarReporteFallecidos(result.params.mes, result.params.anio);
      }
    });
  }
  
  generarReporteFallecidos(mes: number, anio: number): void {
    console.log(mes);
    console.log(anio);
    
    if (!mes || !anio) {
      alert('Por favor, seleccione un mes y un año válidos.');
      return;
    }

    this.loading = true;

    this.afiliacionService.obtenerFallecidosPorMes(mes, anio).subscribe(
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
        const fileName = `Fallecidos_${mes}-${anio}.xlsx`;
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
