import { AfterViewInit, ChangeDetectorRef, Component, OnInit, ViewChild } from '@angular/core';
import { FormBuilder, FormControl, FormGroup, Validators } from '@angular/forms';
import { MatDialog } from '@angular/material/dialog';
import { MatPaginator } from '@angular/material/paginator';
import { MatSort } from '@angular/material/sort';
import { MatTableDataSource } from '@angular/material/table';
import { DynamicFormDialogComponent } from '@docs-components/dynamic-form-dialog/dynamic-form-dialog.component';
import { EditarDialogComponent } from '@docs-components/editar-dialog/editar-dialog.component';
import { PlanillaIngresosService } from '../../../../services/planillaIngresos.service';

@Component({
  selector: 'app-planilla-colegios-privados',
  templateUrl: './planilla-colegios-privados.component.html',
  styleUrls: ['./planilla-colegios-privados.component.scss']
})
export class PlanillaColegiosPrivadosComponent implements AfterViewInit, OnInit  {


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
  mostrarSegundoPaso  = false;

  constructor(private _formBuilder: FormBuilder, private cdr: ChangeDetectorRef, public dialog: MatDialog, private planillaIngresosService: PlanillaIngresosService) {
    this.firstFormGroup = this._formBuilder.group({
      selectedShoe: ['', Validators.required],
    });

    this.firstFormGroup.get('selectedShoe')?.valueChanges.subscribe(selectedValue => {
      this.mostrarSegundoPaso = !!selectedValue;
      this.cdr.detectChanges();
      this.dataSource.paginator = this.paginator;
      this.dataSource.sort = this.sort;
    });
  }

  ngOnInit(): void {
    this.obtenerDetallesPlanilla(1);
  }

  obtenerDetallesPlanilla(idCentroTrabajo: number) {
    this.planillaIngresosService.obtenerDetallesPorCentroTrabajo(idCentroTrabajo).subscribe(
      (response: any) => {
        console.log(response.data);

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
        console.error('Error al obtener detalles de planilla:', error);
      }
    );
  }

  ngAfterViewInit() {
    this.dataSource.paginator = this.paginator;
    this.dataSource.sort = this.sort;
  }

  applyFilter(event: Event) {
    const filterValue = (event.target as HTMLInputElement).value;
    this.dataSource.filter = filterValue.trim().toLowerCase();

    if (this.dataSource.paginator) {
      this.dataSource.paginator.firstPage();
    }
  }

  agregarDocente() {
    const formFields: any[] = [
      { name: 'Numero de identidad', type: 'text', label: 'Numero de identidad', validations: [Validators.required]  },
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
  }

  generarActualizarPlanilla() {
  }

  calcularRecargo() {
  }

  actualizarValores() {
    this.recargoPlanilla = 100;
    this.totalPagarConRecargo = 1050;
  }

  seleccionarBoton(boton: string) {
    this.botonSeleccionado = boton;
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


  form = new FormGroup({
    mes: new FormControl(''),
    anio: new FormControl(''),
  });

  typesOfShoes: string[] = ['01. Planilla Ordinaria', '02. Planilla Decimo Tercero', '03. Planilla Decimo Cuarto'];

  isLinear = false;

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
