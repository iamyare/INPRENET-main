import { ChangeDetectorRef, Component, Inject, OnInit } from '@angular/core';
import { MAT_DIALOG_DATA, MatDialogRef } from '@angular/material/dialog';
import { MatTableDataSource } from '@angular/material/table';
import * as pdfMake from 'pdfmake/build/pdfmake';
import * as pdfFonts from 'pdfmake/build/vfs_fonts';

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
    this.detallePlanillas = data.detallePlanillas;
    this.columnas = this.getColumnas();

    this.dataSource = new MatTableDataSource<any>(this.detallePlanillas);

    (pdfMake as any).vfs = pdfFonts.pdfMake.vfs;
  }

  ngOnInit(): void {
  }

  aplicarFiltro(event: Event) {
    const inputElement = (event.target as HTMLInputElement)?.value;
    if (inputElement !== undefined) {
      const filtro = (inputElement || '').trim().toLowerCase();
      this.dataSource.filter = filtro;
    }
  }

  getColumnas(): string[] {
    const propiedadesUnicas = new Set<string>();
    this.detallePlanillas.forEach((item) => {
      Object.keys(item).forEach((key) => {
        propiedadesUnicas.add(key);
      });
    });
    return Array.from(propiedadesUnicas);
  }

  generarReportePDF() {
    const docDefinition = {
      content: [
        { text: 'Detalles de la Planilla', style: 'header' },
        this.crearTabla()
      ],
      styles: {
        header: {
          fontSize: 18,
          bold: true,
          margin: [0, 0, 0, 10] as [number, number, number, number]
        },
        tableHeader: {
          bold: true,
          fontSize: 13,
          color: 'black'
        }
      }
    };

    pdfMake.createPdf(docDefinition).download('Detalle_Planilla.pdf');
  }

  crearTabla() {
    return {
      table: {
        widths: ['*', '*', '*', '*', '*'],
        body: [
          ['ID Afiliado', 'DNI', 'NOMBRE COMPLETO', 'Total Ingreso', 'Total Deducciones'],
          ...this.detallePlanillas.map(p => ([p.id_afiliado, p.dni, p.NOMBRE_COMPLETO, p['Total Beneficio'], p['Total Deducciones']]))
        ]
      }
    };
  }




}
