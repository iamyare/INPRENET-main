import { AfterViewInit, ChangeDetectorRef, Component, OnInit, ViewChild } from '@angular/core';
import { FormBuilder, FormControl, FormGroup, Validators } from '@angular/forms';
import { MatDialog } from '@angular/material/dialog';
import { MatPaginator } from '@angular/material/paginator';
import { MatSort } from '@angular/material/sort';
import { MatTableDataSource } from '@angular/material/table';
import { DynamicFormDialogComponent } from '@docs-components/dynamic-form-dialog/dynamic-form-dialog.component';
import { EditarDialogComponent } from '@docs-components/editar-dialog/editar-dialog.component';

@Component({
  selector: 'app-planilla-colegios-privados',
  templateUrl: './planilla-colegios-privados.component.html',
  styleUrls: ['./planilla-colegios-privados.component.scss']
})
export class PlanillaColegiosPrivadosComponent implements AfterViewInit {

  botonSeleccionado: string = 'EMPLEADOS';
  fecha = new FormControl(new Date());
  recargoPlanilla: number = 0;
  totalPagarConRecargo: number = 0;
  showTable: boolean = true;
  dataSource: MatTableDataSource<UserData>;

  displayedColumns: string[] = ['numeroColegio', 'nombreColegio', 'totalSueldo', 'totalPrestamo', 'totalAportaciones', 'totalPagar', 'totalCotizaciones'];
  displayedColumns3: string[] = ['identidad', 'nombreDocente', 'sueldo', 'aportaciones', 'cotizaciones', 'prestamos', 'deducciones', 'sueldoNeto', 'editar'];

  totalSueldo: number = 7000;
  totalPrestamo: number = 5000;
  totalAportaciones: number = 650;
  totalCotizaciones: number = 400;
  totalPagar: number = 3000;
  numeroColegio: number = 12345;
  nombreColegio: string = 'Colegio ABC';

  firstFormGroup: FormGroup;
  mostrarSegundoPaso  = false;

  constructor(private _formBuilder: FormBuilder, private cdr: ChangeDetectorRef, public dialog: MatDialog) {
    this.firstFormGroup = this._formBuilder.group({
      selectedShoe: ['', Validators.required],
    });

    this.firstFormGroup.get('selectedShoe')?.valueChanges.subscribe(selectedValue => {
      this.mostrarSegundoPaso = !!selectedValue;
      this.cdr.detectChanges();
      this.dataSource.paginator = this.paginator;
      this.dataSource.sort = this.sort;
    });

    const users: UserData[] = this.generateUsers(20);
    this.dataSource = new MatTableDataSource(users);
  }

  @ViewChild(MatPaginator) paginator!: MatPaginator;
  @ViewChild(MatSort) sort!: MatSort;

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
      // Agrega más campos según necesites
    ];

    const dialogRef = this.dialog.open(EditarDialogComponent, {
      width: '600px',
      data: { campos: campos, valoresIniciales: row }
    });

    dialogRef.afterClosed().subscribe(result => {
      if (result) {
        console.log('Datos editados:', result);
        // Aquí puedes actualizar los datos en tu dataSource o realizar otras acciones necesarias
      }
    });
  }


  form = new FormGroup({
    mes: new FormControl(''),
    anio: new FormControl(''),
  });

  typesOfShoes: string[] = ['01. Planilla Ordinaria', '02. Planilla Decimo Tercero', '03. Planilla Decimo Cuarto'];

  isLinear = false;

  private generateRandomData(id: number): UserData {
    const identidad = `ID${id}`;
    const nombreDocente = `Docente ${id}`;
    const sueldo = this.generateRandomNumber(1500, 2500);
    const aportaciones = this.generateRandomNumber(50, 200);
    const cotizaciones = this.generateRandomNumber(200, 500);
    const prestamos = this.generateRandomNumber(100, 500);
    const deducciones = aportaciones + cotizaciones + prestamos;
    const sueldoNeto = sueldo - deducciones;

    return {
      identidad,
      nombreDocente,
      sueldo,
      aportaciones,
      cotizaciones,
      prestamos,
      deducciones,
      sueldoNeto
    };
  }

  private generateRandomNumber(min: number, max: number): number {
    return Math.floor(Math.random() * (max - min + 1)) + min;
  }

  generateUsers(numberOfUsers: number): UserData[] {
    return Array.from({ length: numberOfUsers }, (_, i) => this.generateRandomData(i + 1));
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
