import { DatePipe } from '@angular/common';
import { ChangeDetectorRef, Component, Input, OnChanges, OnDestroy, OnInit, SimpleChanges } from '@angular/core';
import { Validators } from '@angular/forms';
import { MatDialog } from '@angular/material/dialog';
import { ToastrService } from 'ngx-toastr';
import { Subscription } from 'rxjs';
import { ConfirmDialogComponent } from 'src/app/components/dinamicos/confirm-dialog/confirm-dialog.component';
import { EditarDialogComponent } from 'src/app/components/dinamicos/editar-dialog/editar-dialog.component';
import { CentroTrabajoService } from 'src/app/services/centro-trabajo.service';
import { FieldConfig } from 'src/app/shared/Interfaces/field-config';
import { TableColumn } from 'src/app/shared/Interfaces/table-column';
import { convertirFechaInputs } from 'src/app/shared/functions/formatoFecha';
import { unirNombres } from 'src/app/shared/functions/formatoNombresP';
import { AgregarOtrasFuentesIngresoComponent } from '../../gestion/agregar-otras-fuentes-ingreso/agregar-otras-fuentes-ingreso.component';
import { AfiliacionService } from 'src/app/services/afiliacion.service';
import { AfiliadoService } from 'src/app/services/afiliado.service';
import { PermisosService } from 'src/app/services/permisos.service';

@Component({
  selector: 'ver-otras-fuentes-ingreso',
  templateUrl: './ver-otras-fuentes-ingreso.component.html',
  styleUrl: './ver-otras-fuentes-ingreso.component.scss',
  providers: [DatePipe]
})
export class VerOtrasFuentesIngresoComponent implements OnInit, OnDestroy, OnChanges {
  @Input() Afiliado!: any;

  private subscriptions: Subscription = new Subscription();

  convertirFechaInputs = convertirFechaInputs;
  form: any;

  unirNombres: any = unirNombres;
  datosTabl: any[] = [];
  centrosTrabajo: any = [];
  prevAfil: boolean = false;

  public myColumns: TableColumn[] = [];
  public myFormFields: FieldConfig[] = [];
  public filas: any[] = [];
  ejecF: any;
  public mostrarBotonFuente: boolean = false;
  public mostrarBotonEditar: boolean = false;
  public mostrarBotonEliminar: boolean = false;


  constructor(
    private svcAfiliado: AfiliadoService,
    private afiliacionService: AfiliacionService,
    private toastr: ToastrService,
    private dialog: MatDialog,
    private centrosTrabSVC: CentroTrabajoService,
    private permisosService: PermisosService,
    private cdr: ChangeDetectorRef
  ) { }
  ngOnInit(): void {
    this.initializeComponent();
    this.mostrarBotonFuente = this.permisosService.userHasPermission('AFILIACIÓN', 'afiliacion/nueva-afiliacion', 'editar');
    this.mostrarBotonEditar = this.permisosService.userHasPermission('AFILIACIÓN', 'afiliacion/nueva-afiliacion', 'editar');
    this.mostrarBotonEliminar = this.permisosService.userHasPermission('AFILIACIÓN', 'afiliacion/nueva-afiliacion', 'editar');
  }

  ngOnChanges(changes: SimpleChanges): void {
    if (changes['Afiliado'] && this.Afiliado) {
      this.initializeComponent();
    }
  }

  ngOnDestroy(): void {
    this.subscriptions.unsubscribe();
  }

  initializeComponent(): void {
    if (!this.Afiliado) {
      return;
    }

    this.myFormFields = [
      { type: 'text', label: 'DNI del afiliado', name: 'dni', validations: [Validators.required, Validators.minLength(13), Validators.maxLength(14)], display: true }
    ];

    this.myColumns = [
      {
        header: 'Actividad Económica',
        col: 'actividad_economica',
        moneda: false,
        isEditable: true
      },
      {
        header: 'Monto Ingreso',
        col: 'monto_ingreso',
        moneda: true,
        isEditable: true
      },
      {
        header: 'Observacion',
        col: 'observacion',
        isEditable: true
      },
    ];

    this.getCentrosTrabajo();
    this.getFilas().then(() => this.cargar());
  }

  async getCentrosTrabajo() {
    const response = await this.centrosTrabSVC.obtenerTodosLosCentrosTrabajo().toPromise();
    if (response) {
      const mappedResponse = response.map((item) => ({
        label: item.nombre_centro_trabajo,
        value: String(item.id_centro_trabajo),
        sector: item.sector_economico,
      }));
      this.centrosTrabajo = mappedResponse;
    }

    //this.centrosTrabajo = await this.datosEstaticosService.getAllCentrosTrabajo();
  }

  async obtenerDatos(event: any): Promise<any> {
    this.form = event;
  }

  resetDatos() {
    if (this.form) {
      this.form.reset();
    }
    this.filas = [];
    this.Afiliado = undefined;
  }

  async getFilas() {
    if (this.Afiliado.n_identificacion) {
      try {
        const data = await this.svcAfiliado.getAllOtrasFuentesIngres(this.Afiliado.n_identificacion).toPromise();
        this.filas = data.map((item: any) => ({
          id_otra_fuente_ingreso: item.id_otra_fuente_ingreso,
          actividad_economica: item.actividad_economica,
          monto_ingreso: item.monto_ingreso,
          observacion: item.observacion
        }));
        this.cdr.detectChanges();
      } catch (error) {
        this.toastr.error('Error al cargar los datos de los perfiles de los centros de trabajo');
        console.error('Error al obtener datos de los perfiles de los centros de trabajo', error);
      }
    } else {
      this.resetDatos();
    }
  }

  ejecutarFuncionAsincronaDesdeOtroComponente(funcion: (data: any) => Promise<boolean>) {
    this.ejecF = funcion;
  }

  cargar() {
    if (this.ejecF) {
      this.ejecF(this.filas).then(() => { });
    }
  }

  async manejarAccionUno(row: any) {
    const campos = [
      {
        nombre: 'actividad_economica',
        tipo: 'text',
        requerido: true,
        etiqueta: 'Actividad Económica',
        editable: true,
        icono: 'work',
        validaciones: [Validators.required, Validators.min(5), Validators.max(100)]
      },
      {
        nombre: 'monto_ingreso',
        tipo: 'text',
        requerido: false,
        etiqueta: 'Monto Ingreso',
        editable: true,
        icono: 'money',
        validaciones: [Validators.required]
      },
      {
        nombre: 'observacion',
        tipo: 'text',
        requerido: false,
        etiqueta: 'Observación',
        editable: true,
        icono: 'note',
        validaciones: []
      },
    ];


    const dialogRef = this.dialog.open(EditarDialogComponent, {
      width: '500px',
      data: { campos: campos, valoresIniciales: row }
    });

    dialogRef.afterClosed().subscribe(async (result: any) => {
      if (result) {
        const dataToSend = {
          actividad_economica: result.actividad_economica,
          monto_ingreso: result.monto_ingreso,
          observacion: result.observacion
        };
        this.afiliacionService.editarOtraFuenteIngreso(row.id_otra_fuente_ingreso, dataToSend).subscribe({
          next: (response) => {
            const index = this.filas.findIndex(item => item.id_otra_fuente_ingreso === row.id_otra_fuente_ingreso);
            if (index !== -1) {
              this.filas[index] = {
                ...this.filas[index],
                ...result
              };
            }
            this.toastr.success('Fuente de ingreso actualizada correctamente');
            this.cargar();
          },
          error: (error) => {
            this.toastr.error('Error', 'No se actualizó la fuente de ingreso');
            console.error('Error al actualizar:', error);
          }
        });
      } else {
      }
    });
  }

  manejarAccionDos(row: any) {
    const dialogRef = this.dialog.open(ConfirmDialogComponent, {
      width: '350px',
      data: {
        title: 'Confirmar Eliminación',
        message: '¿Está seguro de que desea eliminar esta fuente de ingreso?',
        idFuenteIngreso: row.id_otra_fuente_ingreso
      }
    });
    dialogRef.afterClosed().subscribe((result: boolean) => {
      if (result) {
        this.afiliacionService.eliminarOtraFuenteIngreso(row.id_otra_fuente_ingreso).subscribe({
          next: () => {
            this.toastr.success('Fuente de ingreso eliminada correctamente');
            this.getFilas().then(() => this.cargar());
          },
          error: (error) => {
            console.error('Error al eliminar la fuente de ingreso:', error);
            this.toastr.error('Ocurrió un error al eliminar la fuente de ingreso.');
          }
        });
      } else {
        console.log('Eliminación cancelada por el usuario.');
      }
    });
  }

  AgregarOtraFuenteIngreso() {
    const dialogRef = this.dialog.open(AgregarOtrasFuentesIngresoComponent, {
      width: '55%',
      height: '75%',
      data: {
        idPersona: this.Afiliado.id_persona
      }
    });
    dialogRef.afterClosed().subscribe((result: any) => {
      this.getFilas().then(() => this.cargar());
    });
  }

}
