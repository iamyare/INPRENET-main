import { ChangeDetectorRef, Component, Input, OnInit, ViewChild } from '@angular/core';
import { FormControl, Validators } from '@angular/forms';
import { MatDialog } from '@angular/material/dialog';
import { MatPaginator } from '@angular/material/paginator';
import { MatSort } from '@angular/material/sort';
import { MatTableDataSource } from '@angular/material/table';
import { ConfirmDialogComponent } from '@docs-components/confirm-dialog/confirm-dialog.component';
import { DynamicFormDialogComponent } from '@docs-components/dynamic-form-dialog/dynamic-form-dialog.component';
import { EditarDialogComponent } from '@docs-components/editar-dialog/editar-dialog.component';
import { ToastrService } from 'ngx-toastr';
import { PlanillaIngresosService } from 'src/app/services/planillaIngresos.service';
import { Item, UserData } from 'src/app/views/pages/planilla/Centros Privados/planilla-colegios-privados/planilla-colegios-privados.component';
import * as XLSX from 'xlsx';
import * as pdfMake from 'pdfmake/build/pdfmake';
import * as pdfFonts from 'pdfmake/build/vfs_fonts';

@Component({
  selector: 'app-ver-dat-plan-ing',
  standalone: false,
  templateUrl: './ver-dat-plan-ing.component.html',
  styleUrls: ['./ver-dat-plan-ing.component.scss']
})
export class VerDatPlanIngComponent implements OnInit {
  dataSourceItems1: any[] = [];
  dataSourceItems: MatTableDataSource<Item>;
  displayedColumns: string[] = ['numeroColegio', 'nombreColegio', 'totalSueldo', 'totalAportaciones', 'totalCotizaciones', 'totalPrestamo', 'totalPagar',];
  recargoPlanilla: number = 0;
  totalPagarConRecargo: number = 0;
  fecha = new FormControl(new Date());

  selectedItem: Item | null = null;

  dataSource: MatTableDataSource<UserData> = new MatTableDataSource<UserData>();
  @ViewChild(MatPaginator) paginator!: MatPaginator;
  @ViewChild(MatSort) sort!: MatSort;

  @Input() idCentroTrabajo: any;
  @Input() selectedTipoPlanilla: any;
  @Input() idPlanilla: any;

  displayedColumns3: string[] = ['identidad', 'nombreDocente', 'sueldo', 'aportaciones', 'cotizaciones', 'prestamos', 'deducciones', 'sueldoNeto', 'editar', 'eliminar'];

  constructor(
    private planillaIngresosService: PlanillaIngresosService,
    private cdr: ChangeDetectorRef,
    private toastr: ToastrService, public dialog: MatDialog,
  ) {
    this.dataSourceItems = new MatTableDataSource<Item>([]);
    (pdfMake as any).vfs = pdfFonts.pdfMake.vfs;
  }

  ngOnInit(): void {
    this.obtenerDetallesPlanillaAgrupCent(this.idCentroTrabajo, this.selectedTipoPlanilla);
    this.obtenerDetallesPlanilla(this.idCentroTrabajo, this.selectedTipoPlanilla);
  }

  ngAfterViewInit() {
    this.obtenerDetallesPlanilla(this.idCentroTrabajo, this.selectedTipoPlanilla);
    this.dataSource.paginator = this.paginator;
    this.dataSource.sort = this.sort;
  }

  obtenerDetallesPlanilla(idCentroTrabajo: number, id_tipo_planilla: number) {
    this.dataSource.data = [
      {
        "id_detalle_plan_Ing": 1,
        "identidad": "0801199912345",
        "id_planilla": 1,
        "nombreDocente": "Juan Carlos Antonio Pérez Gómez",
        "sueldo": 24000,
        "aportaciones": 1000,
        "prestamos": 0,
        "cotizaciones": 1000,
        "deducciones": 500,
        "sueldoNeto": 21500,
        "periodoInicio": "01/06/2024",
        "periodoFinalizacion": "30/06/2024"
      },
      {
        "id_detalle_plan_Ing": 2,
        "identidad": "0801199923456",
        "id_planilla": 1,
        "nombreDocente": "María Fernanda López Rodríguez",
        "sueldo": 26000,
        "aportaciones": 1200,
        "prestamos": 500,
        "cotizaciones": 1200,
        "deducciones": 700,
        "sueldoNeto": 22300,
        "periodoInicio": "01/06/2024",
        "periodoFinalizacion": "30/06/2024"
      },
      {
        "id_detalle_plan_Ing": 3,
        "identidad": "0801199934567",
        "id_planilla": 1,
        "nombreDocente": "Carlos Andrés Morales Santos",
        "sueldo": 25000,
        "aportaciones": 1100,
        "prestamos": 0,
        "cotizaciones": 1100,
        "deducciones": 600,
        "sueldoNeto": 22200,
        "periodoInicio": "01/06/2024",
        "periodoFinalizacion": "30/06/2024"
      },
      {
        "id_detalle_plan_Ing": 4,
        "identidad": "0801199945678",
        "id_planilla": 1,
        "nombreDocente": "Ana María García Fernández",
        "sueldo": 27000,
        "aportaciones": 1300,
        "prestamos": 1000,
        "cotizaciones": 1300,
        "deducciones": 800,
        "sueldoNeto": 22600,
        "periodoInicio": "01/06/2024",
        "periodoFinalizacion": "30/06/2024"
      },
      {
        "id_detalle_plan_Ing": 5,
        "identidad": "0801199956789",
        "id_planilla": 1,
        "nombreDocente": "José Miguel Herrera Martínez",
        "sueldo": 24000,
        "aportaciones": 1000,
        "prestamos": 0,
        "cotizaciones": 1000,
        "deducciones": 500,
        "sueldoNeto": 21500,
        "periodoInicio": "01/06/2024",
        "periodoFinalizacion": "30/06/2024"
      },
      {
        "id_detalle_plan_Ing": 6,
        "identidad": "0801199967890",
        "id_planilla": 1,
        "nombreDocente": "Lucía Patricia Mendoza Salazar",
        "sueldo": 28000,
        "aportaciones": 1400,
        "prestamos": 200,
        "cotizaciones": 1400,
        "deducciones": 900,
        "sueldoNeto": 24100,
        "periodoInicio": "01/06/2024",
        "periodoFinalizacion": "30/06/2024"
      },
      {
        "id_detalle_plan_Ing": 7,
        "identidad": "0801199978901",
        "id_planilla": 1,
        "nombreDocente": "Alberto Javier Núñez Reyes",
        "sueldo": 25000,
        "aportaciones": 1100,
        "prestamos": 300,
        "cotizaciones": 1100,
        "deducciones": 600,
        "sueldoNeto": 21900,
        "periodoInicio": "01/06/2024",
        "periodoFinalizacion": "30/06/2024"
      },
      {
        "id_detalle_plan_Ing": 8,
        "identidad": "0801199989012",
        "id_planilla": 1,
        "nombreDocente": "Verónica Isabel Rivera Campos",
        "sueldo": 26000,
        "aportaciones": 1200,
        "prestamos": 400,
        "cotizaciones": 1200,
        "deducciones": 700,
        "sueldoNeto": 22400,
        "periodoInicio": "01/06/2024",
        "periodoFinalizacion": "30/06/2024"
      },
      {
        "id_detalle_plan_Ing": 9,
        "identidad": "0801199990123",
        "id_planilla": 1,
        "nombreDocente": "Jorge Luis Rivas Pérez",
        "sueldo": 24000,
        "aportaciones": 1000,
        "prestamos": 0,
        "cotizaciones": 1000,
        "deducciones": 500,
        "sueldoNeto": 21500,
        "periodoInicio": "01/06/2024",
        "periodoFinalizacion": "30/06/2024"
      },
      {
        "id_detalle_plan_Ing": 10,
        "identidad": "0801200001234",
        "id_planilla": 1,
        "nombreDocente": "Gabriela Sofía Ortiz Castro",
        "sueldo": 28000,
        "aportaciones": 1400,
        "prestamos": 600,
        "cotizaciones": 1400,
        "deducciones": 900,
        "sueldoNeto": 24000,
        "periodoInicio": "01/06/2024",
        "periodoFinalizacion": "30/06/2024"
      },
      {
        "id_detalle_plan_Ing": 11,
        "identidad": "0801200012345",
        "id_planilla": 1,
        "nombreDocente": "Ricardo Antonio Cruz Varela",
        "sueldo": 27000,
        "aportaciones": 1300,
        "prestamos": 700,
        "cotizaciones": 1300,
        "deducciones": 800,
        "sueldoNeto": 22900,
        "periodoInicio": "01/06/2024",
        "periodoFinalizacion": "30/06/2024"
      },
      {
        "id_detalle_plan_Ing": 12,
        "identidad": "0801200023456",
        "id_planilla": 1,
        "nombreDocente": "Patricia Alejandra Moreno Lara",
        "sueldo": 26000,
        "aportaciones": 1200,
        "prestamos": 500,
        "cotizaciones": 1200,
        "deducciones": 700,
        "sueldoNeto": 22400,
        "periodoInicio": "01/06/2024",
        "periodoFinalizacion": "30/06/2024"
      },
      {
        "id_detalle_plan_Ing": 13,
        "identidad": "0801200034567",
        "id_planilla": 1,
        "nombreDocente": "Fernando Manuel López Pérez",
        "sueldo": 25000,
        "aportaciones": 1100,
        "prestamos": 0,
        "cotizaciones": 1100,
        "deducciones": 600,
        "sueldoNeto": 22200,
        "periodoInicio": "01/06/2024",
        "periodoFinalizacion": "30/06/2024"
      },
      {
        "id_detalle_plan_Ing": 14,
        "identidad": "0801200045678",
        "id_planilla": 1,
        "nombreDocente": "Sofía María Vargas Gómez",
        "sueldo": 28000,
        "aportaciones": 1400,
        "prestamos": 200,
        "cotizaciones": 1400,
        "deducciones": 900,
        "sueldoNeto": 24100,
        "periodoInicio": "01/06/2024",
        "periodoFinalizacion": "30/06/2024"
      },
      {
        "id_detalle_plan_Ing": 15,
        "identidad": "0801200056789",
        "id_planilla": 1,
        "nombreDocente": "Mario Alberto Castillo Díaz",
        "sueldo": 27000,
        "aportaciones": 1300,
        "prestamos": 0,
        "cotizaciones": 1300,
        "deducciones": 800,
        "sueldoNeto": 23600,
        "periodoInicio": "01/06/2024",
        "periodoFinalizacion": "30/06/2024"
      }
    ]

    /* this.planillaIngresosService.obtenerDetallesPorCentroTrabajo(idCentroTrabajo, id_tipo_planilla).subscribe(
      (response: any) => {
        if (response.data.length > 0) {
          const mappedData = response.data.map((item: any) => {
            return {
              id_detalle_plan_Ing: item.ID_DETALLE_PLAN_INGRESO,
              identidad: item.IDENTIDAD,
              id_planilla: item.ID_PLANILLA,
              nombreDocente: item.NOMBREPERSONA,
              sueldo: item.SUELDO,
              aportaciones: item.APORTACIONES,
              prestamos: item.PRESTAMOS,
              cotizaciones: item.COTIZACIONES,
              deducciones: item.DEDUCCIONES,
              sueldoNeto: item.SUELDONETO,
              periodoInicio: item.PERIODO_INICIO,
              periodoFinalizacion: item.PERIODO_FINALIZACION
            }
          }
          );
          this.dataSource.data = mappedData;
          this.cdr.detectChanges();
        } else {
          this.dataSource.data = []
        }
      });
      */
  }

  editarElemento(row: UserData) {
    const campos: any[] = [
      {
        nombre: 'sueldo',
        tipo: 'number',
        etiqueta: 'Sueldo',
        requerido: true,
        editable: true,
      },
      {
        nombre: 'prestamos',
        tipo: 'number',
        etiqueta: 'Préstamos',
        requerido: true,
        editable: true,
      },
    ];

    const dialogRef = this.dialog.open(EditarDialogComponent, {
      width: '600px',
      data: { campos: campos, valoresIniciales: row },
    });

    dialogRef.afterClosed().subscribe((result: { sueldo: any; prestamos: any; }) => {
      if (result) {
        const nuevoSueldo = result.sueldo;
        const nuevosPrestamos = result.prestamos;
        const idDetallePlanIngreso: any = row.id_detalle_plan_Ing;
        const dni = row.identidad;
        const idCentroTrabajo: any = this.idCentroTrabajo;

        this.planillaIngresosService.actualizarSalarioBase(dni, idCentroTrabajo, nuevoSueldo).subscribe({
          next: () => {
            this.planillaIngresosService.actualizarDetallesPlanillaPrivada(dni, idDetallePlanIngreso, nuevoSueldo, nuevosPrestamos).subscribe({
              next: (response) => {
                this.toastr.success('Detalles de la planilla actualizados con éxito');
                this.obtenerDetallesPlanilla(idCentroTrabajo, this.selectedTipoPlanilla);
                this.obtenerDetallesPlanillaAgrupCent(idCentroTrabajo, this.selectedTipoPlanilla);
              },
              error: (error) => {
                console.error('Error al actualizar detalles de la planilla privada:', error);
                this.toastr.error('Error al actualizar detalles de la planilla privada');
              }
            });
          },
          error: (error) => {
            console.error('Error al actualizar el salario base:', error);
            this.toastr.error('Error al actualizar el salario base');
          }
        });
      }
    });
  }

  eliminarElemento(row: UserData) {
    const dialogRef = this.dialog.open(ConfirmDialogComponent, {
      width: '350px',
      data: {
        title: 'Confirmación de eliminación',
        message: '¿Estás seguro de querer eliminar este elemento?'
      }
    });

    dialogRef.afterClosed().subscribe((result: any) => {
      if (result) {
        this.planillaIngresosService.eliminarDetallePlanillaIngreso(row.id_detalle_plan_Ing).subscribe({
          next: (response) => {
            this.toastr.success(response.message);

            if (this.selectedTipoPlanilla) {
              this.obtenerDetallesPlanilla(this.idCentroTrabajo, this.selectedTipoPlanilla);
              this.obtenerDetallesPlanillaAgrupCent(this.idCentroTrabajo, this.selectedTipoPlanilla);
            } else {
              console.error('selectedTipoPlanilla está indefinido o no es un array válido.');
              this.toastr.error('Ocurrió un error debido a un problema con el tipo de planilla seleccionado.');
            }
          },
          error: (error) => {
            console.error('Error al eliminar el detalle de la planilla ingreso:', error);
            this.toastr.error('Ocurrió un error al eliminar el detalle de la planilla ingreso.');
          }
        });
      }
    });
  }

  obtenerNombreMes(fecha: any): string {
    if (fecha) {
      const partesFecha: string[] = fecha?.periodoInicio.split('/');

      if (partesFecha.length !== 3) {
        return 'Formato de fecha inválido';
      }

      const numMes: number = parseInt(partesFecha[1], 10);
      const anio: number = parseInt(partesFecha[2], 10);

      const meses: string[] = ['Enero', 'Febrero', 'Marzo', 'Abril', 'Mayo', 'Junio', 'Julio', 'Agosto', 'Septiembre', 'Octubre', 'Noviembre', 'Diciembre'];

      if (numMes >= 1 && numMes <= 12) {
        const nombreMes: string = meses[numMes - 1];
        return `${nombreMes} ${anio}`;
      } else {
        return '';
      }
    }
    return '';
  }

  agregarDocente() {
    const formFields: any[] = [
      { name: 'dni', type: 'text', label: 'Numero de identidad', validations: [Validators.required] },
      { name: 'Prestamos', type: 'number', label: 'Prestamos', validations: [Validators.required] },
    ];

    const dialogRef = this.dialog.open(DynamicFormDialogComponent, {
      width: '600px',
      data: { fields: formFields, title: 'Agregar docente', id_centro_trabajo: this.idCentroTrabajo },
    });

    dialogRef.afterClosed().subscribe(async result => {
      if (result) {
        let dataEnviar = {
          dni: result.dni,
          id_centro_educativo: this.selectedItem!.id_centro_trabajo,
          id_planilla: this.idPlanilla,
          data: {
            prestamos: result.Prestamos
          }
        }

        await this.planillaIngresosService.agregarDetallesPlanillaAgrupCent(dataEnviar.id_planilla, dataEnviar.dni, dataEnviar.id_centro_educativo, dataEnviar.data).subscribe({
          next: async (response) => {
            if (response) {
              await this.obtenerDetallesPlanillaAgrupCent(dataEnviar.id_centro_educativo, this.selectedTipoPlanilla[0].ID_TIPO_PLANILLA)
              await this.obtenerDetallesPlanilla(dataEnviar.id_centro_educativo, this.selectedTipoPlanilla[0].ID_TIPO_PLANILLA)
              this.toastr.success(`Docente agregado a la planilla ${dataEnviar.id_planilla} con éxito`);
            } else {
              this.toastr.error(`El docente no ha sido agregado a la planilla ${dataEnviar.id_planilla}.`);
            }
          },
          error: (error: any) => {
            console.error('Error al actualizar detalles de la planilla privada:', error);
            this.toastr.error('Error al actualizar detalles de la planilla privada');
          }
        });

      }
    })
  }

  generarExcel() {
    // Datos para la primera hoja del Excel
    const dataForExcel = this.dataSource.data.map(item => ({
      Identidad: item.identidad,
      'Nombre Docente': item.nombreDocente,
      Sueldo: item.sueldo,
      Aportaciones: item.aportaciones,
      Cotizaciones: item.cotizaciones,
      Préstamos: item.prestamos,
      Deducciones: item.deducciones,
      'Sueldo Neto': item.sueldoNeto
    }));

    // Crear la primera hoja de trabajo
    const ws1: XLSX.WorkSheet = XLSX.utils.json_to_sheet(dataForExcel);
    const wb: XLSX.WorkBook = XLSX.utils.book_new();
    XLSX.utils.book_append_sheet(wb, ws1, 'Detalles Planilla');

    // Datos para la segunda hoja del Excel

    const dataForSecondSheet = this.dataSourceItems1.map(item => ({
      'Número de Colegio': this.dataSourceItems1[0].ID_CENTRO_TRABAJO,
      'Nombre del Colegio': this.dataSourceItems1[0].NOMBRE_CENTRO_TRABAJO,
      'Total Sueldo': this.dataSourceItems1[0].SUELDO,
      'Total Préstamo': this.dataSourceItems1[0].PRESTAMOS,
      'Total Aportaciones': this.dataSourceItems1[0].APORTACIONES,
      'Total de Deducciones': this.dataSourceItems1[0].DEDUCCIONES,
      'Total Cotizaciones': this.dataSourceItems1[0].COTIZACIONES
    }));
    const ws2: XLSX.WorkSheet = XLSX.utils.json_to_sheet(dataForSecondSheet);
    XLSX.utils.book_append_sheet(wb, ws2, 'Resumen Colegios');
    XLSX.writeFile(wb, 'planilla.xlsx');
  }

  generarPDF() {
    const docDefinition:any = {
      pageOrientation: 'landscape',
      content: [
        { text: 'Resumen De Colegio', style: 'header' },
        {
          style: 'tableExample',
          table: {
            body: [
              ['Número de Colegio', 'Nombre del Colegio', 'Total Sueldo', 'Total Préstamo', 'Total Aportaciones', 'Total de Deducciones', 'Total Cotizaciones'],
              ...this.dataSourceItems1.map(item => [item.ID_CENTRO_TRABAJO, item.NOMBRE_CENTRO_TRABAJO, item.SUELDO, item.PRESTAMOS, item.APORTACIONES, item.DEDUCCIONES, item.COTIZACIONES])
            ]
          }
        },
        { text: 'Detalles Planilla', style: 'header', margin: [0, 20, 0, 10] },
        {
          style: 'tableExample',
          table: {
            body: [
              ['Identidad', 'Nombre Docente', 'Sueldo', 'Aportaciones', 'Cotizaciones', 'Préstamos', 'Deducciones', 'Sueldo Neto'],
              ...this.dataSource.data.map(item => [item.identidad, item.nombreDocente, item.sueldo, item.aportaciones, item.cotizaciones, item.prestamos, item.deducciones, item.sueldoNeto])
            ]
          }
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
        },
        tableHeader: {
          bold: true,
          fontSize: 13,
          color: 'black'
        }
      },
      defaultStyle: {
        // alignment: 'justify'
      }
    };

    pdfMake.createPdf(docDefinition).download('planilla.pdf');
  }

  actualizarValores() {
    this.recargoPlanilla = 100;
    this.totalPagarConRecargo = 1050;
  }

  generarActualizarPlanilla() {
    // Lógica para generar o actualizar la planilla
  }

  applyFilter(event: Event) {
    const filterValue = (event.target as HTMLInputElement).value;
    this.dataSource.filter = filterValue.trim().toLowerCase();
    if (this.dataSourceItems.paginator) {
      this.dataSourceItems.paginator.firstPage();
    }
  }

  obtenerDetallesPlanillaAgrupCent(idCentroTrabajo: number, id_tipo_planilla: number) {
    this.dataSourceItems1 = [{
      'ID_CENTRO_TRABAJO': 1,
      'NOMBRE_CENTRO_TRABAJO': "INSTITUTO TECNICO TAULAR",
      'SUELDO': 240000,
      'PRESTAMOS': 0,
      'APORTACIONES': 15000,
      'DEDUCCIONES': 0,
      'COTIZACIONES': 15000
    }]
    /* this.planillaIngresosService
      .obtenerDetallesPlanillaAgrupCent(idCentroTrabajo, id_tipo_planilla)
      .subscribe(
        (response: any) => {
          this.dataSourceItems1 = response.data;
        },
        (error) => {
          console.error('Error al obtener detalles de planilla:', error);
        }
      ); */
  }

  descargarExcelPdf() {
    // Lógica para descargar Excel y PDF
  }

  calcularRecargo() {
    // Lógica para calcular el recargo
  }

  exportarExcelPdf() {
    // Lógica para exportar a Excel y PDF
  }
}
