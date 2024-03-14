import { AfterViewInit, Component, ViewChild } from '@angular/core';
import { FormBuilder, FormControl, FormGroup, Validators } from '@angular/forms';
import { MatPaginator } from '@angular/material/paginator';
import { MatSort } from '@angular/material/sort';
import { MatTableDataSource } from '@angular/material/table';

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

  constructor(private _formBuilder: FormBuilder) {
    this.firstFormGroup = this._formBuilder.group({
      firstCtrl: ['', Validators.required],
    });

    const users: UserData[] = [];
    const numberOfUsers = 20;

    for (let i = 1; i <= numberOfUsers; i++) {
      users.push(this.generateRandomData(i));
    }

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

  cargarUltimaPlanilla() {
  }

  agregarDocente() {
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

  editarElemento(row: any) {
    console.log('Editar:', row);
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
