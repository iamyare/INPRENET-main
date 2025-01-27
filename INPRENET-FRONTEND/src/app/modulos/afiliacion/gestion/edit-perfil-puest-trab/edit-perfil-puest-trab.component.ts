import { DatePipe } from '@angular/common';
import { ChangeDetectorRef, Component, Input, OnChanges, OnDestroy, OnInit, SimpleChanges } from '@angular/core';
import { Validators } from '@angular/forms';
import { MatDialog } from '@angular/material/dialog';
import { ToastrService } from 'ngx-toastr';
import { Subscription } from 'rxjs';
import { ConfirmDialogComponent } from 'src/app/components/dinamicos/confirm-dialog/confirm-dialog.component';
import { EditarDialogComponent } from '../../../../../../src/app/components/dinamicos/editar-dialog/editar-dialog.component';
import { AfiliadoService } from 'src/app/services/afiliado.service';
import { CentroTrabajoService } from 'src/app/services/centro-trabajo.service';
import { FieldConfig } from 'src/app/shared/Interfaces/field-config';
import { TableColumn } from 'src/app/shared/Interfaces/table-column';
import { convertirFechaInputs } from 'src/app/shared/functions/formatoFecha';
import { unirNombres } from 'src/app/shared/functions/formatoNombresP';
import { AgregarPuestTrabComponent } from '../agregar-puest-trab/agregar-puest-trab.component';
import { PermisosService } from 'src/app/services/permisos.service';

@Component({
  selector: 'app-edit-perfil-puest-trab',
  templateUrl: './edit-perfil-puest-trab.component.html',
  styleUrls: ['./edit-perfil-puest-trab.component.scss'],
  providers: [DatePipe]
})
export class EditPerfilPuestTrabComponent implements OnInit, OnDestroy, OnChanges {
  @Input() Afiliado!: any;

  private subscriptions: Subscription = new Subscription();

  convertirFechaInputs = convertirFechaInputs;

  unirNombres: any = unirNombres;
  datosTabl: any[] = [];
  centrosTrabajo: any = [];
  prevAfil: boolean = false;

  public myColumns: TableColumn[] = [];
  public myFormFields: FieldConfig[] = [];
  public filas: any[] = [];
  ejecF: any;
  public mostrarBotonTrab: boolean = false;
  public mostrarBotonEditar: boolean = false;
  public mostrarBotonEliminar: boolean = false;

  jornadas = [
    { label: 'MATUTINA', value: 'MATUTINA' },
    { label: 'DIURNA', value: 'DIURNA' },
    { label: 'NOCTURNA', value: 'NOCTURNA' }
  ];

  tiposJornada = [
    { label: 'COMPLETA', value: 'COMPLETA' },
    { label: 'PARCIAL', value: 'PARCIAL' }
  ];

  constructor(
    private svcAfiliado: AfiliadoService,
    private toastr: ToastrService,
    private dialog: MatDialog,
    private datePipe: DatePipe,
    private centrosTrabSVC: CentroTrabajoService,
    private permisosService: PermisosService,
    private cdr: ChangeDetectorRef
  ) { }


  ngOnInit(): void {
    this.initializeComponent();
    this.mostrarBotonTrab = this.permisosService.userHasPermission('AFILIACIONES', 'afiliacion/nueva-afiliacion', 'editar');
    this.mostrarBotonEditar = this.permisosService.userHasPermission('AFILIACIONES', 'afiliacion/nueva-afiliacion', 'editar');
    this.mostrarBotonEliminar = this.permisosService.userHasPermission('AFILIACIONES', 'afiliacion/nueva-afiliacion', 'editar');
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
        header: 'Codigo del Centro Trabajo',
        col: 'codigo',
        isEditable: true,
        validationRules: [Validators.required]
      },
      {
        header: 'Nombre del Centro Trabajo',
        col: 'nombre_centro_trabajo',
        isEditable: true,
        validationRules: [Validators.required]
      },
      {
        header: 'Número de Acuerdo',
        col: 'numero_acuerdo',
        isEditable: true
      },
      {
        header: 'Salario Base',
        col: 'salarioBase',
        moneda: true,
        isEditable: true
      },
      {
        header: 'Fecha Ingreso',
        col: 'fechaIngreso',
        isEditable: true
      },
      {
        header: 'Fecha de Egreso',
        col: 'fechaEgreso',
        isEditable: true
      },
      {
        header: 'Cargo',
        col: 'cargo',
        isEditable: true
      },
      {
        header: 'Jornada',
        col: 'jornada',
        isEditable: true
      },
      {
        header: 'Tipo de jornada',
        col: 'tipo_jornada',
        isEditable: true
      }
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

  resetDatos() {
    this.filas = [];
    this.Afiliado = undefined;
  }

  async getFilas() {
    if (this.Afiliado.n_identificacion) {
      try {
        const data = await this.svcAfiliado.getAllPerfCentroTrabajo(this.Afiliado.n_identificacion).toPromise();
        
        this.filas = data.map((item: any) => ({
          id_perf_pers_centro_trab: item.id_perf_pers_centro_trab,
          codigo: item.centroTrabajo.codigo,
          id_centro_trabajo: item.centroTrabajo.id_centro_trabajo,
          direccion_1: item.centroTrabajo.direccion_1,
          direccion_2: item.centroTrabajo.direccion_2,
          nombre_centro_trabajo: item.centroTrabajo.nombre_centro_trabajo,
          numero_acuerdo: item.numero_acuerdo,
          salarioBase: item.salario_base,
          fechaIngreso: this.datePipe.transform(item.fecha_ingreso, 'dd/MM/yyyy'),
          fechaEgreso: this.datePipe.transform(item.fecha_egreso, 'dd/MM/yyyy'),
          cargo: item.cargo,
          jornada: item.jornada,
          tipo_jornada: item.tipo_jornada,
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
      { nombre: 'codigo', tipo: 'text', requerido: true, etiqueta: 'Codigo de Centro Trabajo', editable: false, icono: 'business' },
      { nombre: 'nombre_centro_trabajo', tipo: 'text', requerido: true, etiqueta: 'Nombre Centro Trabajo', editable: false, icono: 'business' },
      { nombre: 'direccion_1', tipo: 'text', requerido: true, etiqueta: 'Direccion 1', editable: false, icono: 'place' },
      { nombre: 'direccion_2', tipo: 'text', requerido: true, etiqueta: 'Direccion 2', editable: false, icono: 'place' },
      { nombre: 'numero_acuerdo', tipo: 'text', requerido: true, etiqueta: 'Número Acuerdo', editable: true, icono: 'description', validaciones: [Validators.required, Validators.maxLength(40)] },
      { nombre: 'salarioBase', tipo: 'number', requerido: true, etiqueta: 'Salario Base', editable: true, icono: 'money', validaciones: [Validators.required, Validators.min(0)] },
      { nombre: 'fechaRango', tipo: 'daterange', requerido: false, etiqueta: 'Periodo laboral', editable: true, icono: 'event', validaciones: [Validators.required] },
      { nombre: 'cargo', tipo: 'text', requerido: false, etiqueta: 'Cargo', editable: true, icono: 'work_outline', validaciones: [Validators.required, Validators.maxLength(40)] },
      { nombre: 'jornada', tipo: 'list', requerido: true, etiqueta: 'Jornada', editable: true, opciones: this.jornadas, icono: 'schedule' },
      { nombre: 'tipo_jornada', tipo: 'list', requerido: true, etiqueta: 'Tipo de Jornada', editable: true, opciones: this.tiposJornada, icono: 'assignment_turned_in' }
    ];

    const fechaRango = {
      start: this.convertirCadenaAFecha(row.fechaIngreso),
      end: this.convertirCadenaAFecha(row.fechaEgreso)
    };

    const valoresIniciales = {
      ...row,
      fechaRango: fechaRango
    };

    const dialogRef = this.dialog.open(EditarDialogComponent, {
      width: '500px',
      data: { campos: campos, valoresIniciales: valoresIniciales }
    });

    dialogRef.afterClosed().subscribe(async (result: any) => {
      if (result) {
        result.fechaIngreso = this.datePipe.transform(result.fechaRango.start, 'dd/MM/yyyy');
        result.fechaEgreso = this.datePipe.transform(result.fechaRango.end, 'dd/MM/yyyy');
        delete result.fechaRango;

        const dataToSend = {
          ...result,
          idCentroTrabajo: row.id_centro_trabajo
        };

        this.svcAfiliado.updatePerfCentroTrabajo(row.id_perf_pers_centro_trab, dataToSend).subscribe({
          next: () => {
            const index = this.filas.findIndex(item => item.id === row.id);
            if (index !== -1) {
              this.filas[index] = {
                ...this.filas[index],
                ...result,
                nombre_centro_trabajo: row.nombre_centro_trabajo
              };
            }
            this.toastr.success("Se actualizó el perfil de trabajo correctamente");
            this.cargar();
          },
          error: (error) => {
            this.toastr.error("Error", "No se actualizó el perfil de trabajo");
            console.error("Error al actualizar:", error);
          }
        });
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
        this.svcAfiliado.desactivarPerfCentroTrabajo(row.id_perf_pers_centro_trab).subscribe({
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
      }
    });
  }

  AgregarPuestoTrabajo() {
    const dialogRef = this.dialog.open(AgregarPuestTrabComponent, {
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

  convertirCadenaAFecha(fecha: string | null | undefined): Date | null {
    if (!fecha || !fecha.includes('/')) {
      return null; // Retorna null si la fecha es null, undefined o no contiene el formato esperado
    }
  
    const [day, month, year] = fecha.split('/').map(Number);
    return new Date(year, month - 1, day); // Retorna la fecha si el formato es correcto
  }
  
  
  
}
