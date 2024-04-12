import {
  AfterViewInit,
  ChangeDetectorRef,
  Component,
  OnInit,
  ViewChild,
} from '@angular/core';
import {
  FormBuilder,
  FormControl,
  FormGroup,
  Validators,
} from '@angular/forms';
import { MatDialog } from '@angular/material/dialog';
import { MatPaginator } from '@angular/material/paginator';
import { MatSort } from '@angular/material/sort';
import { MatTableDataSource } from '@angular/material/table';
import { DynamicFormDialogComponent } from '@docs-components/dynamic-form-dialog/dynamic-form-dialog.component';
import { EditarDialogComponent } from '@docs-components/editar-dialog/editar-dialog.component';
import { PlanillaIngresosService } from '../../../../services/planillaIngresos.service';
import { DatosEstaticosService } from 'src/app/services/datos-estaticos.service';
import { CentroTrabajoService } from 'src/app/services/centro-trabajo.service';
import { jwtDecode } from 'jwt-decode';
import { ToastrService } from 'ngx-toastr';
import { ConfirmDialogComponent } from '@docs-components/confirm-dialog/confirm-dialog.component';
import * as XLSX from 'xlsx';
import jsPDF from 'jspdf';
import 'jspdf-autotable';


export interface Item {
  id_centro_trabajo: number;
  nombre_centro_trabajo: string;
}

@Component({
  selector: 'app-planilla-colegios-privados',
  templateUrl: './planilla-colegios-privados.component.html',
  styleUrls: ['./planilla-colegios-privados.component.scss'],
})
export class PlanillaColegiosPrivadosComponent
  implements AfterViewInit, OnInit {
  @ViewChild(MatPaginator) paginator!: MatPaginator;
  @ViewChild(MatSort) sort!: MatSort;

  botonSeleccionado: string = 'EMPLEADOS';
  fecha = new FormControl(new Date());
  recargoPlanilla: number = 0;
  totalPagarConRecargo: number = 0;
  showTable: boolean = true;
  dataSource: MatTableDataSource<UserData> = new MatTableDataSource<UserData>();

  displayedColumns: string[] = ['numeroColegio', 'nombreColegio', 'totalSueldo', 'totalPrestamo', 'totalAportaciones', 'totalPagar', 'totalCotizaciones'];
  displayedColumns3: string[] = ['identidad', 'nombreDocente', 'sueldo', 'aportaciones', 'cotizaciones', 'prestamos', 'deducciones', 'sueldoNeto', 'editar', 'eliminar'];

  firstFormGroup: FormGroup;
  mostrarPrimerPaso = true;
  mostrarSegundoPaso = false;
  mostrarTercerPaso = false;
  isLinear = false;

  dataSourceItems: MatTableDataSource<Item>;
  dataSourceItems1: any[] = [];

  selectedItem: Item | null = null;

  tiposPlanillaPrivadas: any;
  selectedTipoPlanilla: any;

  idCentroTrabajo!: number;

  constructor(
    private _formBuilder: FormBuilder,
    private cdr: ChangeDetectorRef,
    public dialog: MatDialog,
    private planillaIngresosService: PlanillaIngresosService,
    private datosEstaticos: DatosEstaticosService,
    private centroTrabajoService: CentroTrabajoService,
    private toastr: ToastrService
  ) {
    this.tiposPlanillaPrivadas = this.datosEstaticos.tiposPlanillasPrivadas;

    this.firstFormGroup = this._formBuilder.group({
      selectedTipoPlanilla: ['', Validators.required],
    });

    this.firstFormGroup
      .get('selectedTipoPlanilla')
      ?.valueChanges.subscribe((selectedValue) => {
        this.mostrarTercerPaso = !!selectedValue;
        this.cdr.detectChanges();
        this.dataSource.paginator = this.paginator;
        this.dataSource.sort = this.sort;
      });

    this.dataSourceItems = new MatTableDataSource<Item>([]);
  }

  ngOnInit(): void {
    const tokenData = this.decodeToken();
    if (tokenData && tokenData.idCentroTrabajo) {
      this.idCentroTrabajo = tokenData.idCentroTrabajo;
      this.mostrarPrimerPaso = false;
      this.mostrarSegundoPaso = true;
    }
  }

  selectRow(item: Item) {
    this.idCentroTrabajo = item.id_centro_trabajo
    this.selectedItem = item;
    this.mostrarSegundoPaso = true;
  }

  applyFilter(event: Event) {
    const filterValue = (event.target as HTMLInputElement).value;
    this.dataSourceItems.filter = filterValue.trim().toLowerCase();

    if (this.dataSourceItems.paginator) {
      this.dataSourceItems.paginator.firstPage();
    }
  }

  obtenerDetallesPlanilla(idCentroTrabajo: number, id_tipo_planilla: number) {
    this.planillaIngresosService.obtenerDetallesPorCentroTrabajo(idCentroTrabajo, id_tipo_planilla).subscribe(
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
  }

  obtenerDetallesPlanillaAgrupCent(
    idCentroTrabajo: number,
    id_tipo_planilla: number
  ) {
    this.planillaIngresosService
      .obtenerDetallesPlanillaAgrupCent(idCentroTrabajo, id_tipo_planilla)
      .subscribe(
        (response: any) => {
          this.dataSourceItems1 = response.data;
        },
        (error) => {
          this.dataSourceItems1 = [];
          console.error('Error al obtener detalles de planilla:', error);
        }
      );
  }

  ngAfterViewInit() {
    this.cargarCentrosDeTrabajo();
    this.dataSource.paginator = this.paginator;
    this.dataSource.sort = this.sort;
  }

  cargarCentrosDeTrabajo() {
    this.centroTrabajoService.obtenerTodosLosCentrosTrabajo().subscribe(
      (centros: Item[]) => {
        this.dataSourceItems.data = centros;
        this.dataSourceItems.paginator = this.paginator;
        this.dataSourceItems.sort = this.sort;
      },
      (error) => {
        console.error('Error al cargar los centros de trabajo', error);
      }
    );
  }

  agregarDocente() {
    const formFields: any[] = [
      { name: 'dni', type: 'text', label: 'Numero de identidad', validations: [Validators.required] },
      { name: 'Sueldo', type: 'number', label: 'Sueldo', validations: [Validators.required] },
      { name: 'Prestamos', type: 'number', label: 'Prestamos', validations: [Validators.required] },
    ];

    const dialogRef = this.dialog.open(DynamicFormDialogComponent, {
      width: '600px',
      data: { fields: formFields, title: 'Agregar docente' },
    });

    dialogRef.afterClosed().subscribe(result => {
      if (result) {

        /* SUELDO */
        let dataEnviar = {
          dni: result.dni,
          id_centro_educativo: this.selectedItem!.id_centro_trabajo,
          id_planilla: this.dataSource.data[0].id_planilla,
          data: {
            prestamos: result.Prestamos,
            salario_base: 80000
          }
        }

        this.planillaIngresosService.agregarDetallesPlanillaAgrupCent(dataEnviar.id_planilla, dataEnviar.dni, dataEnviar.id_centro_educativo, dataEnviar.data).subscribe(
          (response: any) => {
            if (response) {
              this.toastr.success(`Docente agregado a la planilla ${dataEnviar.id_planilla}. con éxito`);
              //this.obtenerDetallesPlanilla(dataEnviar.id_centro_educativo, dataEnviar.id_planilla)
              //this.obtenerDetallesPlanillaAgrupCent(dataEnviar.id_centro_educativo, dataEnviar.id_planilla)
            } else {
              this.toastr.error(`El docente no ha sido agregado a la planilla ${dataEnviar.id_planilla}.`);
            }
          },
          error => {
            console.error('Error al Insertar el registro en la planilla:', error);
          }
        );
      }
    });
  }

  descargarExcelPdf() {
    // Lógica para exportar a Excel y PDF
  }

  generarActualizarPlanilla() {
    // Lógica para generar o actualizar la planilla
  }

  calcularRecargo() {
    // Lógica para calcular el recargo
  }

  actualizarValores() {
    this.recargoPlanilla = 100;
    this.totalPagarConRecargo = 1050;
  }

  seleccionarBoton(boton: string) {
    this.botonSeleccionado = boton;
  }

  datosPlanilla() {
    this.selectedTipoPlanilla = this.firstFormGroup.value.selectedTipoPlanilla;
    if (this.selectedTipoPlanilla) {
      const idTipoPlanilla = this.selectedTipoPlanilla[0].ID_TIPO_PLANILLA;

      const idCentroTrabajo =
        this.idCentroTrabajo || this.selectedItem?.id_centro_trabajo;

      if (idCentroTrabajo) {
        this.obtenerDetallesPlanilla(idCentroTrabajo, idTipoPlanilla);
        this.obtenerDetallesPlanillaAgrupCent(idCentroTrabajo, idTipoPlanilla);
      } else {
        console.error('No hay ningún centro de trabajo seleccionado');
      }
    } else {
      console.error('No hay ningún tipo de planilla seleccionado');
    }
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

    dialogRef.afterClosed().subscribe((result) => {
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
                this.obtenerDetallesPlanilla(idCentroTrabajo, this.selectedTipoPlanilla[0].ID_TIPO_PLANILLA);
                this.obtenerDetallesPlanillaAgrupCent(idCentroTrabajo, this.selectedTipoPlanilla[0].ID_TIPO_PLANILLA);
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

    dialogRef.afterClosed().subscribe(result => {
      if (result) {
        this.planillaIngresosService.eliminarDetallePlanillaIngreso(row.id_detalle_plan_Ing).subscribe({
          next: (response) => {
            this.toastr.success(response.message);
            if (this.selectedTipoPlanilla && this.selectedTipoPlanilla.length > 0) {
              this.obtenerDetallesPlanilla(this.idCentroTrabajo, this.selectedTipoPlanilla[0].ID_TIPO_PLANILLA);
              this.obtenerDetallesPlanillaAgrupCent(this.idCentroTrabajo, this.selectedTipoPlanilla[0].ID_TIPO_PLANILLA);
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



  decodeToken(): any {
    const token = localStorage.getItem('token');
    if (token) {
      try {
        const decoded = jwtDecode(token);
        return decoded;
      } catch (error) {
        console.error('Error decoding token:', error);
        return null;
      }
    }
    return null;
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
      'Nombre del Colegio':  this.dataSourceItems1[0].NOMBRE_CENTRO_TRABAJO,
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
    const doc = new jsPDF();

    // Configuración para la segunda tabla
    const columns2 = ['Número de Colegio', 'Nombre del Colegio', 'Total Sueldo', 'Total Préstamo', 'Total Aportaciones', 'Total de Deducciones', 'Total Cotizaciones'];
    const data2 = this.dataSourceItems1.map(item => [item.ID_CENTRO_TRABAJO, item.NOMBRE_CENTRO_TRABAJO, item.SUELDO, item.PRESTAMOS, item.APORTACIONES, item.DEDUCCIONES, item.COTIZACIONES]);

    // Agregar título para la segunda tabla
    doc.text('Resumen Colegios', 14, 15);

    // Agregar la segunda tabla al PDF
    (doc as any).autoTable({
      head: [columns2],
      body: data2,
      startY: 20
    });

    // Configuración para la primera tabla
    const columns = ['Identidad', 'Nombre Docente', 'Sueldo', 'Aportaciones', 'Cotizaciones', 'Préstamos', 'Deducciones', 'Sueldo Neto'];
    const data = this.dataSource.data.map(item => [item.identidad, item.nombreDocente, item.sueldo, item.aportaciones, item.cotizaciones, item.prestamos, item.deducciones, item.sueldoNeto]);

    // Agregar título para la primera tabla
    doc.text('Detalles Planilla', 14, (doc as any).lastAutoTable.finalY + 25);

    // Agregar la primera tabla al PDF
    (doc as any).autoTable({
      head: [columns],
      body: data,
      startY: (doc as any).lastAutoTable.finalY + 40
    });

    // Guardar el PDF
    doc.save('planilla.pdf');
}




}

export interface UserData {
  id_planilla: any;
  periodoFinalizacion: any;
  periodoInicio: any;
  identidad: string;
  nombreDocente: string;
  sueldo: number;
  aportaciones: number;
  cotizaciones: number;
  prestamos: number;
  deducciones: number;
  sueldoNeto: number;
  id_detalle_plan_Ing: number;
}
