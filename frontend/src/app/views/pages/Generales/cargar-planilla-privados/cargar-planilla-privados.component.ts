import { Component, ViewChild, AfterViewInit } from '@angular/core';
import { FormBuilder, FormGroup, Validators } from '@angular/forms';
import { MatTableDataSource } from '@angular/material/table';
import { MatPaginator } from '@angular/material/paginator';

export interface Item {
  id: number;
  nombre: string;
}

export interface PlanillaData {
  codigoColegio: string;
  anioPlanilla: number;
  mesPlanilla: string;
  codigoPlanilla: string;
  cantidadDocentes: number;
  sueldos: number;
  aportaciones: number;
  cotizaciones: number;
  prestamos: number;
  recargo: number;
}

const ELEMENT_DATA: PlanillaData[] = [
  // Añade aquí tus objetos con datos concretos
  {
    codigoColegio: '123',
    anioPlanilla: 2024,
    mesPlanilla: 'Enero',
    codigoPlanilla: 'CP001',
    cantidadDocentes: 10,
    sueldos: 100000,
    aportaciones: 5000,
    cotizaciones: 2000,
    prestamos: 3000,
    recargo: 750
  },
  // Más objetos si son necesarios...
];

@Component({
  selector: 'app-cargar-planilla-privados',
  templateUrl: './cargar-planilla-privados.component.html',
  styleUrls: ['./cargar-planilla-privados.component.scss']
})
export class CargarPlanillaPrivadosComponent implements AfterViewInit {
  isLinear = true;
  firstFormGroup: FormGroup;
  dataSource: MatTableDataSource<Item>;
  displayedColumns: string[] = ['id', 'nombre'];
  selectedItem: Item | null = null;

  displayedColumnsPlanilla: string[] = ['codigoColegio', 'anioPlanilla', 'mesPlanilla', 'codigoPlanilla', 'cantidadDocentes', 'sueldos', 'aportaciones', 'cotizaciones', 'prestamos', 'recargo'];

  // Fuente de datos para la nueva tabla.
  dataSourcePlanilla = new MatTableDataSource<PlanillaData>(ELEMENT_DATA);

  datosGenerales: string[] = ['numeroColegio', 'nombreColegio', 'totalSueldo', 'totalPrestamo', 'totalAportaciones', 'totalPagar', 'totalCotizaciones'];
  totalSueldo: number = 7000;
  totalPrestamo: number = 5000;
  totalAportaciones: number = 650;
  totalCotizaciones: number = 400;
  totalPagar: number = 3000;
  numeroColegio: number = 12345;
  nombreColegio: string = 'Colegio ABC';

  @ViewChild(MatPaginator) paginator!: MatPaginator;

  constructor(private _formBuilder: FormBuilder) {
    this.firstFormGroup = this._formBuilder.group({
      firstCtrl: ['', Validators.required],
    });

    const ITEMS: Item[] = [
      {id: 1, nombre: 'Item 1'},
      {id: 2, nombre: 'Item 2'},
      {id: 3, nombre: 'Item 3'},
    ];
    this.dataSource = new MatTableDataSource(ITEMS);
  }

  ngAfterViewInit() {
    this.dataSource.paginator = this.paginator;
  }

  selectRow(row: Item) {
    this.selectedItem = row;
    this.firstFormGroup.controls['firstCtrl'].setValue(row ? true : null);
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

  descargarDetallePlanilla(){

  }
}
