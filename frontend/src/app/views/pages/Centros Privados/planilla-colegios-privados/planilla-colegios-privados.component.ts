import { AfterViewInit, ChangeDetectorRef, Component, OnInit, ViewChild } from '@angular/core';
import { FormBuilder, FormControl, FormGroup, Validators } from '@angular/forms';
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

export interface Item {
  id_centro_trabajo: number;
  nombre_centro_trabajo: string;
}

@Component({
  selector: 'app-planilla-colegios-privados',
  templateUrl: './planilla-colegios-privados.component.html',
  styleUrls: ['./planilla-colegios-privados.component.scss']
})
export class PlanillaColegiosPrivadosComponent implements AfterViewInit, OnInit{


  @ViewChild(MatPaginator) paginator!: MatPaginator;
  @ViewChild(MatSort) sort!: MatSort;

  botonSeleccionado: string = 'EMPLEADOS';
  fecha = new FormControl(new Date());
  recargoPlanilla: number = 0;
  totalPagarConRecargo: number = 0;
  showTable: boolean = true;
  dataSource: MatTableDataSource<UserData> = new MatTableDataSource<UserData>();


  displayedColumns: string[] = ['numeroColegio', 'nombreColegio', 'totalSueldo', 'totalPrestamo', 'totalAportaciones', 'totalPagar', 'totalCotizaciones'];
  displayedColumns3: string[] = ['identidad', 'nombreDocente', 'sueldo', 'aportaciones', 'cotizaciones', 'prestamos', 'deducciones', 'sueldoNeto', 'editar'];

  totalSueldo: number = 0;
  totalPrestamo: number = 0;
  totalAportaciones: number = 0;
  totalCotizaciones: number = 0;
  totalPagar: number = 0;
  numeroColegio: number = 12345;
  nombreColegio: string = 'Colegio ABC';
  firstFormGroup: FormGroup;
  mostrarSegundoPaso = false;
  mostrarTercerPaso = false;
  isLinear = false;

  dataSourceItems: MatTableDataSource<Item>;
  selectedItem: Item | null = null;

  tiposPlanillaPrivadas : any;

  idCentroTrabajo: number | null = null;
  mostrarPrimerPaso = true;


  constructor(private _formBuilder: FormBuilder, private cdr: ChangeDetectorRef, public dialog: MatDialog, private planillaIngresosService: PlanillaIngresosService, private datosEstaticos: DatosEstaticosService,
    private centroTrabajoService: CentroTrabajoService
  ) {
    this.tiposPlanillaPrivadas = this.datosEstaticos.tiposPlanillasPrivadas

    this.firstFormGroup = this._formBuilder.group({
      selectedTipoPlanilla: ['', Validators.required],
    });

    this.firstFormGroup.get('selectedTipoPlanilla')?.valueChanges.subscribe(selectedValue => {
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
        const mappedData = response.data.map((item: any) => ({
          identidad: item.IDENTIDAD,
          nombreDocente: item.NOMBREPERSONA,
          sueldo: item.SUELDO,
          aportaciones: item.APORTACIONES,
          prestamos: item.PRESTAMOS,
          cotizaciones: item.COTIZACIONES,
          deducciones: item.DEDUCCIONES,
          sueldoNeto: item.SUELDONETO
        }));

        mappedData.forEach((item: any) => {
          this.totalSueldo += item.sueldo;
          this.totalPrestamo += item.prestamos;
          this.totalAportaciones += item.aportaciones;
          this.totalCotizaciones += item.cotizaciones;
          this.totalPagar += item.sueldoNeto;
        });

        this.dataSource.data = mappedData;
        this.cdr.detectChanges();
      },
      error => {
        this.dataSource.data = []
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
      error => {
        console.error('Error al cargar los centros de trabajo', error);
      }
    );
  }

  agregarDocente() {
    const formFields: any[] = [
      { name: 'Numero de identidad', type: 'text', label: 'Numero de identidad', validations: [Validators.required] },
      { name: 'Sueldo', type: 'number', label: 'Sueldo', validations: [Validators.required] },
      { name: 'Prestamos', type: 'number', label: 'Prestamos', validations: [Validators.required] },
    ];

    const dialogRef = this.dialog.open(DynamicFormDialogComponent, {
      width: '600px',
      data: { fields: formFields, title: 'Agregar docente' }
    });

    dialogRef.afterClosed().subscribe(result => {
      console.log('El diálogo se cerró', result);
    });
  }

  exportarExcelPdf() {
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
    const selectedTipoPlanilla = this.firstFormGroup.value.selectedTipoPlanilla;
    if (selectedTipoPlanilla) {
      const idTipoPlanilla = selectedTipoPlanilla[0].ID_TIPO_PLANILLA;

      const idCentroTrabajo = this.idCentroTrabajo || this.selectedItem?.id_centro_trabajo;

      if (idCentroTrabajo) {
        this.obtenerDetallesPlanilla(idCentroTrabajo, idTipoPlanilla);
      } else {
        console.error('No hay ningún centro de trabajo seleccionado');
      }
    } else {
      console.error('No hay ningún tipo de planilla seleccionado');
    }
  }


  editarElemento(row: UserData) {
    const campos: any[] = [
      { nombre: 'identidad', tipo: 'text', etiqueta: 'Identidad', requerido: true, editable: true },
      { nombre: 'nombreDocente', tipo: 'text', etiqueta: 'Nombre del Docente', requerido: true, editable: true },
      { nombre: 'sueldo', tipo: 'number', etiqueta: 'Sueldo', requerido: true, editable: true },
      { nombre: 'aportaciones', tipo: 'number', etiqueta: 'Aportaciones', requerido: true, editable: true },
      { nombre: 'cotizaciones', tipo: 'number', etiqueta: 'Cotizaciones', requerido: true, editable: true },
      { nombre: 'prestamos', tipo: 'number', etiqueta: 'Préstamos', requerido: true, editable: true },
    ];

    const dialogRef = this.dialog.open(EditarDialogComponent, {
      width: '600px',
      data: { campos: campos, valoresIniciales: row }
    });

    dialogRef.afterClosed().subscribe(result => {
      if (result) {
        console.log('Datos editados:', result);
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

}

export interface UserData {
  identidad: string;
  nombreDocente: string;
  sueldo: number;
  aportaciones: number;
  cotizaciones: number;
  prestamos: number;
  deducciones: number;
  sueldoNeto: number;
}
