import { Component, OnInit, ViewChild } from '@angular/core';
import { firstValueFrom } from 'rxjs';
import { PlanillaService } from 'src/app/services/planilla.service';
import { TableColumn } from 'src/app/shared/Interfaces/table-column';
import { DatePipe } from '@angular/common';
import { MatDialog } from '@angular/material/dialog';
import { MatPaginator } from '@angular/material/paginator';
import { MatTableDataSource } from '@angular/material/table';
import { DetallePlanillaDialogComponent } from '@docs-components/detalle-planilla-dialog/detalle-planilla-dialog.component';

@Component({
  selector: 'app-ver-planillas',
  templateUrl: './ver-planillas.component.html',
  styleUrl: './ver-planillas.component.scss'
})
export class VerPlanillasComponent implements OnInit {
  @ViewChild(MatPaginator) paginator!: MatPaginator;
  myColumns: TableColumn[] = [];
  filas: any[] = [];
  ejecF: any;

  detallePlanillas: any[] = [];
  dataSource = new MatTableDataSource<any>(this.detallePlanillas);

  constructor(private planillaService: PlanillaService,
    private datePipe: DatePipe,
    private dialog: MatDialog) {
  }

  ngOnInit(): void {
    this.myColumns = [
      {
        header: 'Código de planilla',
        col: 'codigo_planilla',
        isEditable: false
      },
      {
        header: 'Fecha de apertura',
        col: 'fecha_apertura',
        isEditable: true
      },
      {
        header: 'Secuencia',
        col: 'secuencia',
        isEditable: true
      },
      {
        header: 'Estado',
        col: 'estado',
        isEditable: true
      },
      {
        header: 'Período de inicio',
        col: 'periodoInicio',
        isEditable: false
      },
      {
        header: 'Período de finalización',
        col: 'periodoFinalizacion',
        isEditable: false
      },
      {
        header: 'Tipo de planilla',
        col: 'nombre_planilla',
        isEditable: true
      },
      {
        header: 'Fecha de cierre',
        col: 'fecha_cierre',
        isEditable: true
      },
      {
        header: 'Total de Ingresos',
        col: 'totalBeneficio',
        moneda: true,
        isEditable: true
      },
      {
        header: 'Total de deducciones',
        col: 'totalDeducciones',
        moneda: true,
        isEditable: true
      },
      {
        header: 'Total de la Planilla',
        col: 'totalPlanilla',
        moneda: true,
        isEditable: false
      },
    ];

    this.getFilas().then(() => this.cargar());
  }

  async getFilas() {
    try {
      const data = await firstValueFrom(this.planillaService.findAllPlanillas());
      const enrichedRows = [
        {
          id_planilla: "1",
          nombre_planilla: "ORDINARIA - JUBILADOS",
          codigo_planilla: "5A",
          estado: "CERRADA",
          secuencia: "1",
          periodoFinalizacion: "01/05/2024",
          periodoInicio: "30/05/2024",
          totalBeneficio: "350000",
          totalDeducciones: "10000",
          totalPlanilla: "340000", // Añade el total de la planilla
          fecha_apertura: "01/05/2024",
          fecha_cierre: "30/05/2024",
        },
        {
          id_planilla: "1",
          nombre_planilla: "ORDINARIA - JUBILADOS",
          codigo_planilla: "1A",
          estado: "ACTIVA",
          secuencia: "1",
          periodoFinalizacion: "01/06/2024",
          periodoInicio: "30/06/2024",
          totalBeneficio: "400000",
          totalDeducciones: "15000",
          totalPlanilla: "385000", // Añade el total de la planilla
          fecha_apertura: "01/06/2024",
          fecha_cierre: "30/06/2024",
        },
      ];

      /* const enrichedRows = await Promise.all(data.map(async (item: any) => {
        const totalResponse = await firstValueFrom(this.planillaService.obtenerTotalPlanilla(item.id_planilla));
        return {
          id_planilla: item.id_planilla,
          nombre_planilla: item.tipoPlanilla.nombre_planilla,
          codigo_planilla: item.codigo_planilla,
          estado: item.estado,
          secuencia: item.secuencia,
          periodoFinalizacion: item.periodoFinalizacion,
          periodoInicio: item.periodoInicio,
          totalBeneficio: totalResponse.totalBeneficio,
          totalDeducciones: totalResponse.totalDeducciones,
          totalPlanilla: totalResponse.totalPlanilla, // Añade el total de la planilla
          fecha_apertura: this.datePipe.transform(item.fecha_apertura, 'dd/MM/yyyy HH:mm:ss'),
          fecha_cierre: this.datePipe.transform(item.fecha_cierre, 'dd/MM/yyyy HH:mm:ss'),
        };
      })); */
      this.filas = enrichedRows;
      console.log(this.filas);

    } catch (error) {
      console.error("Error al obtener los detalles completos de planilla", error);
    }
  }

  cargar() {
    if (this.ejecF) {
      this.ejecF(this.filas).then(() => {
      });
    }
  }

  ejecutarFuncionAsincronaDesdeOtroComponente(funcion: (data: any) => Promise<void>) {
    this.ejecF = funcion;
  }

  aplicarFiltro(event: Event) {
    const inputElement = (event.target as HTMLInputElement)?.value;
    if (inputElement !== undefined) {
      const filtro = inputElement.trim().toLowerCase();
      this.dataSource.filter = filtro;
    }
  }

  manejarAccionUno(row: any) {
    this.planillaService.getPlanillas(row.CODIGO_PLANILLA).subscribe(
      (response) => {
        console.log('Planilla Preliminar:', response);
        this.detallePlanillas = response;
        this.dataSource.data = this.detallePlanillas;
        this.dataSource.paginator = this.paginator;

        // Abre el diálogo cuando se recibe la respuesta
        this.openDialog();
      },
      (error) => {
        console.error('Error al obtener la planilla preliminar', error);
      }
    );
  }

  openDialog(): void {
    const dialogRef = this.dialog.open(DetallePlanillaDialogComponent, {
      width: '800px',
      data: { detallePlanillas: this.detallePlanillas }
    });

    dialogRef.afterClosed().subscribe(result => {
      console.log('Diálogo cerrado');
    });
  }

}
