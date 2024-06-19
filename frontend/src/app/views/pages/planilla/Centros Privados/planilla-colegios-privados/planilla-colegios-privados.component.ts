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
import { DatosEstaticosService } from 'src/app/services/datos-estaticos.service';
import { CentroTrabajoService } from 'src/app/services/centro-trabajo.service';
import { jwtDecode } from 'jwt-decode';
import { ToastrService } from 'ngx-toastr';
import { PlanillaIngresosService } from 'src/app/services/planillaIngresos.service';

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

  firstFormGroup!: FormGroup;
  mostrarPrimerPaso = true;
  mostrarSegundoPaso = false;
  mostrarTercerPaso = false;
  isLinear = false;

  dataSourceItems!: MatTableDataSource<Item>;
  tiposPlanillaPrivadas: any;

  selectedItem: Item | null = null;
  idCentroTrabajo!: number;

  selectedTipoPlanilla: any;
  idPlanilla!: number;
  idTipoPlanilla!: number;

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
        this.dataSourceItems.paginator = this.paginator;
        this.dataSourceItems.sort = this.sort;
      });

    this.dataSourceItems = new MatTableDataSource<Item>([]);
  }

  ngOnInit(): void {
    this.tiposPlanillaPrivadas = this.datosEstaticos.tiposPlanillasPrivadas;

    this.firstFormGroup = this._formBuilder.group({
      selectedTipoPlanilla: ['', Validators.required],
    });

    this.reiniciarFormularios();
    const tokenData = this.decodeToken();
    if (tokenData && tokenData.idCentroTrabajo) {
      this.idCentroTrabajo = tokenData.idCentroTrabajo;
      this.cargarCentrosDeTrabajo();
    }

    this.firstFormGroup
      .get('selectedTipoPlanilla')
      ?.valueChanges.subscribe((selectedValue) => {
        if (selectedValue) {
          this.selectedTipoPlanilla = selectedValue;
          this.idTipoPlanilla = selectedValue[0].ID_TIPO_PLANILLA

          this.mostrarPrimerPaso = true;
          this.mostrarSegundoPaso = true;
          this.mostrarTercerPaso = false;

          this.datosPlanilla()

          /* this.mostrarTercerPaso = true; */
          this.cdr.detectChanges();
          this.dataSourceItems.paginator = this.paginator;
          this.dataSourceItems.sort = this.sort;
        }
      });

    this.dataSourceItems = new MatTableDataSource<Item>([]);
    if (tokenData && tokenData.idCentroTrabajo) {
      this.idCentroTrabajo = tokenData.idCentroTrabajo;
      this.mostrarPrimerPaso = true;
      this.mostrarSegundoPaso = true;
      this.mostrarTercerPaso = false;
    }
  }

  async reiniciarFormularios() {
    // Restablecer el estado de los formularios y los pasos
    this.firstFormGroup.reset();
    this.mostrarPrimerPaso = true;
    this.mostrarSegundoPaso = false;
    this.mostrarTercerPaso = false;
  }
  async cargarCentrosDeTrabajo() {
    await this.centroTrabajoService.obtenerTodosLosCentrosTrabajoPrivados().subscribe(
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

  async datosPlanilla() {
    if (this.selectedTipoPlanilla.length > 0) {
      const idCentroTrabajo = this.idCentroTrabajo || this.selectedItem?.id_centro_trabajo;

      if (idCentroTrabajo) {
        await this.planillaIngresosService.obtenerPlanillaSeleccionada(idCentroTrabajo, this.idTipoPlanilla).subscribe(
          (response: any) => {
            if (response.data.length > 0) {
              this.idPlanilla = response.data[0].ID_PLANILLA

              this.mostrarTercerPaso = true;

              this.firstFormGroup
                .get('selectedTipoPlanilla')
                ?.valueChanges.subscribe((selectedValue) => {
                  this.mostrarPrimerPaso = true;
                  this.mostrarSegundoPaso = true;
                  this.mostrarTercerPaso = true;
                  this.cdr.detectChanges();
                  this.dataSourceItems.paginator = this.paginator;
                  this.dataSourceItems.sort = this.sort;
                });

            } else {
              console.error('No hay ninguna planilla');
              this.mostrarTercerPaso = false;
            }
          });

        /* this.obtenerDetallesPlanilla(idCentroTrabajo, idTipoPlanilla);
        this.obtenerDetallesPlanillaAgrupCent(idCentroTrabajo, idTipoPlanilla); */

      } else {
        console.error('No hay ningún centro de trabajo seleccionado');
      }
    } else {
      console.error('No hay ningún tipo de planilla seleccionado');
      this.mostrarTercerPaso = false;
      // Reiniciar estados de visibilidad y formulario al no seleccionar un tipo de planilla
      this.mostrarPrimerPaso = true;
      this.mostrarSegundoPaso = true;
    }
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

  async selectRow(item: Item) {
    this.idCentroTrabajo = item.id_centro_trabajo;
    this.selectedItem = item;
    this.mostrarSegundoPaso = true;
    this.mostrarPrimerPaso = true;
    this.mostrarTercerPaso = false;
  }

  ngAfterViewInit() {
    this.cargarCentrosDeTrabajo();
    this.dataSourceItems.paginator = this.paginator;
    this.dataSourceItems.sort = this.sort;
  }

  applyFilter(event: Event) {
    const filterValue = (event.target as HTMLInputElement).value;
    this.dataSourceItems.filter = filterValue.trim().toLowerCase();

    if (this.dataSourceItems.paginator) {
      this.dataSourceItems.paginator.firstPage();
    }
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
