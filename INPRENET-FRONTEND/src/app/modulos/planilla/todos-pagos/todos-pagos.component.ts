import { Component, Input, OnInit } from '@angular/core';
import { PlanillaService } from 'src/app/services/planilla.service';
import { forkJoin } from 'rxjs';
import * as pdfMake from 'pdfmake/build/pdfmake';
import * as pdfFonts from 'pdfmake/build/vfs_fonts';

(<any>pdfMake).vfs = pdfFonts.pdfMake.vfs;

@Component({
  selector: 'app-todos-pagos',
  templateUrl: './todos-pagos.component.html',
  styleUrls: ['./todos-pagos.component.scss']
})
export class TodosPagosComponent implements OnInit {
  @Input() datos: any;
  planillas: any[] = [];
  allPagosData: any[] = [];
  loading: boolean = true;

  displayedColumns: string[] = ['planilla', 'bancos', 'montoPagado', 'deducciones', 'total'];

  constructor(private planillaService: PlanillaService) {}

  ngOnInit(): void {
    if (this.datos && this.datos.n_identificacion) {
      this.obtenerPlanillasYBeneficiosPorPersona(this.datos.n_identificacion);
    }
  }

  obtenerPlanillasYBeneficiosPorPersona(dni: string) {
    this.planillaService.obtenerPlanillasPagosPorPersona(dni).subscribe({
      next: (response) => {
        this.planillas = response.data;
        const observables = this.planillas.map(planilla =>
          this.planillaService.obtenerPagosYBeneficiosPorPersona(planilla.id_planilla, dni)
        );
        forkJoin(observables).subscribe({
          next: (pagosResponses) => {
            this.allPagosData = pagosResponses.map(response => {
              response.beneficios.forEach((beneficio:any) => {
                beneficio.totalPagado = beneficio.pagos.reduce((acc: number, curr: any) => acc + curr.monto_a_pagar, 0);
              });
              return response;
            });
            this.loading = false;
          },
          error: (error) => {
            console.error('Error al obtener los beneficios y deducciones', error);
            this.loading = false;
          }
        });
      },
      error: (error) => {
        console.error('Error al obtener las planillas de pagos', error);
        this.loading = false;
      }
    });
  }

  // Función para calcular el total (beneficios - deducciones)
  calcularTotal(pago: any): number {
    const totalBeneficios = pago.beneficios.reduce((acc: number, beneficio: any) => {
      return acc + beneficio.pagos.reduce((accPago: number, pagoBeneficio: any) => accPago + pagoBeneficio.monto_a_pagar, 0);
    }, 0);

    const totalDeducciones = pago.deducciones.reduce((acc: number, deduccion: any) => acc + deduccion.monto_total, 0);

    return totalBeneficios - totalDeducciones;
  }


  // Función para generar el PDF
  generarPDF() {
    const documentDefinition:any = this.getDocumentDefinition();
    pdfMake.createPdf(documentDefinition).download('pagos-beneficios.pdf');
  }

  // Crear la estructura del documento PDF
  getDocumentDefinition() {
    const tableBody = [
      [{ text: 'Planilla', bold: true }, { text: 'Banco', bold: true }, { text: 'Monto Pagado', bold: true }, { text: 'Deducciones', bold: true }, { text: 'Total', bold: true }]
    ];

    this.allPagosData.forEach(pago => {
      // Aquí se acceden a los bancos a nivel de beneficios y no a nivel global
      const bancos = pago.beneficios.map((beneficio: any) =>
        beneficio.pagos.map((pago: any) => `${pago.banco} - ${pago.num_cuenta}`).join('\n')
      ).join('\n') || 'Sin información de bancos';

      const beneficios = pago.beneficios.map((beneficio: any) => `${beneficio.beneficio}: ${beneficio.totalPagado}`).join('\n');
      const deducciones = pago.deducciones.map((deduccion: any) => `${deduccion.deduccion}: ${deduccion.monto_total}`).join('\n');
      const total = this.calcularTotal(pago);

      tableBody.push([
        pago.planilla.codigo_planilla,
        bancos,
        beneficios,
        deducciones,
        total
      ]);
    });

    return {
      content: [
        { text: 'Reporte de Pagos y Beneficios', style: 'header' },
        {
          style: 'tableExample',
          table: {
            headerRows: 1,
            widths: ['*', '*', '*', '*', '*'],
            body: tableBody
          },
          layout: 'lightHorizontalLines'
        }
      ],
      styles: {
        header: {
          fontSize: 18,
          bold: true,
          margin: [0, 0, 0, 10]
        },
        tableExample: {
          margin: [0, 5, 0, 15]
        }
      }
    };
  }


}
