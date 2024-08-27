import { DatePipe } from '@angular/common';
import { Component, Input, OnChanges, OnDestroy, OnInit, SimpleChanges } from '@angular/core';
import { Validators } from '@angular/forms';
import { MatDialog } from '@angular/material/dialog';
import { ToastrService } from 'ngx-toastr';
import { Subscription } from 'rxjs';
import { ConfirmDialogComponent } from 'src/app/components/dinamicos/confirm-dialog/confirm-dialog.component';
import { EditarDialogComponent } from 'src/app/components/dinamicos/editar-dialog/editar-dialog.component';
import { AfiliadoService } from 'src/app/services/afiliado.service';
import { CentroTrabajoService } from 'src/app/services/centro-trabajo.service';
import { FieldConfig } from 'src/app/shared/Interfaces/field-config';
import { TableColumn } from 'src/app/shared/Interfaces/table-column';
import { convertirFechaInputs } from 'src/app/shared/functions/formatoFecha';
import { unirNombres } from 'src/app/shared/functions/formatoNombresP';
import { AgregarPuestTrabComponent } from '../../gestion/agregar-puest-trab/agregar-puest-trab.component';

@Component({
  selector: 'ver-otras-fuentes-ingreso',
  templateUrl: './ver-otras-fuentes-ingreso.component.html',
  styleUrl: './ver-otras-fuentes-ingreso.component.scss',
  providers: [DatePipe] // Añadir el DatePipe como proveedor
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

  constructor(
    private svcAfiliado: AfiliadoService,
    private toastr: ToastrService,
    private dialog: MatDialog,
    private datePipe: DatePipe,
    private centrosTrabSVC: CentroTrabajoService,
  ) { }
  ngOnInit(): void {
    this.initializeComponent();
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
      } catch (error) {
        this.toastr.error('Error al cargar los datos de los perfiles de los centros de trabajo');
        console.error('Error al obtener datos de los perfiles de los centros de trabajo', error);
      }
    } else {
      this.resetDatos();
    }
  }

  ejecutarFuncionAsincronaDesdeOtroComponente(funcion: (data: any) => Promise<void>) {
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
        nombre: 'n_identificacion',
        tipo: 'list',
        requerido: true,
        etiqueta: 'Número De Identificación',
        editable: true,
        opciones: this.centrosTrabajo,
        icono: 'business'
      },
      {
        nombre: 'nombre_completo',
        tipo: 'text',
        requerido: true,
        etiqueta: 'Nombre Completo',
        editable: true,
        icono: 'description',
        validaciones: [Validators.required, Validators.maxLength(40)]
      },
      {
        nombre: 'actividad_economica',
        tipo: 'number',
        requerido: true,
        etiqueta: 'Actividad Económica',
        editable: true,
        icono: 'attach_money',
        validaciones: [Validators.required, Validators.min(0)]
      },
      {
        nombre: 'monto_ingreso',
        tipo: 'date',
        requerido: false,
        etiqueta: 'Monto Ingreso',
        editable: true,
        icono: 'event',
        validaciones: [Validators.required]
      },
      {
        nombre: 'observacion',
        tipo: 'date',
        requerido: false,
        etiqueta: 'Observación',
        editable: true,
        icono: 'event_busy'
      },
    ];

    const dialogRef = this.dialog.open(EditarDialogComponent, {
      width: '500px',
      data: { campos: campos, valoresIniciales: row }
    });

    dialogRef.afterClosed().subscribe(async (result: any) => {
      if (result) {
        // Formateo de fechas antes de enviar los datos
        result.fechaIngreso = this.datePipe.transform(result.fechaIngreso, 'dd/MM/yyyy');
        result.fechaEgreso = this.datePipe.transform(result.fechaEgreso, 'dd/MM/yyyy');

        const idCentroTrabajo = result.id_centro_trabajo;
        delete result.nombre_centro_trabajo;

        const dataToSend = {
          ...result,
          idCentroTrabajo: idCentroTrabajo
        };

        this.svcAfiliado.updatePerfCentroTrabajo(row.id, result).subscribe({

          next: (response) => {
            const index = this.filas.findIndex(item => item.id === row.id);
            if (index !== -1) {
              this.filas[index] = {
                ...this.filas[index],
                ...result,
                nombre_centro_trabajo: row.nombre_centro_trabajo
              };
            }
            this.toastr.success("Se actualizó el perfil de trabajo correctamente")
            this.cargar();
          },
          error: (error) => {
            this.toastr.error("Error", "No se actualizo el perfil de trabajo")
            console.error("Error al actualizar:", error);
          }
        });
      } else {
        console.log('No se realizaron cambios.');
      }
    });
  }


  manejarAccionDos(row: any) {
    const dialogRef = this.dialog.open(ConfirmDialogComponent, {
      width: '350px',
      data: {
        title: 'Confirmar Desactivación',
        message: '¿Está seguro de que desea desactivar este perfil?',
        idPersona: this.Afiliado.ID_PERSONA
      }
    });

    dialogRef.afterClosed().subscribe((result: boolean) => {
      if (result) {
        this.svcAfiliado.desactivarPerfCentroTrabajo(row.id).subscribe({
          next: (response) => {
            this.toastr.success(response.mensaje, 'Perfil Desactivado');
            this.getFilas().then(() => this.cargar());
          },
          error: (error) => {
            console.error('Error al desactivar el perfil:', error);
            this.toastr.error('Ocurrió un error al desactivar el perfil.');
          }
        });
      } else {
        console.log('Desactivación cancelada por el usuario.');
      }
    });
  }

  AgregarOtraFuenteIngreso() {
    const dialogRef = this.dialog.open(AgregarPuestTrabComponent, {
      width: '55%',
      height: '75%',
      data: {
        idPersona: this.Afiliado.ID_PERSONA
      }
    });

    dialogRef.afterClosed().subscribe((result: any) => {
      this.ngOnInit();
    });
  }

}
