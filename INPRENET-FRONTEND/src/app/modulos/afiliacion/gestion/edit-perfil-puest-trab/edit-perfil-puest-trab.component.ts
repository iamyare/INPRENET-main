import { DatePipe } from '@angular/common';
import { ChangeDetectorRef, Component, EventEmitter, Input, OnChanges, OnDestroy, OnInit, Output, SimpleChanges } from '@angular/core';
import { AbstractControl, ValidatorFn, Validators } from '@angular/forms';
import { MatDialog } from '@angular/material/dialog';
import { ToastrService } from 'ngx-toastr';
import { Subscription } from 'rxjs';
import { ConfirmDialogComponent } from 'src/app/components/dinamicos/confirm-dialog/confirm-dialog.component';
import { EditarDialogComponent } from '../../../../../../src/app/components/dinamicos/editar-dialog/editar-dialog.component';
import { AfiliadoService } from 'src/app/services/afiliado.service';
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
  @Output() onDatoAgregado = new EventEmitter<void>();

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
    private permisosService: PermisosService,
    private cdr: ChangeDetectorRef
  ) { }


  ngOnInit(): void {
    this.initializeComponent();
    this.mostrarBotonTrab = this.permisosService.userHasPermission(
      'AFILIACIONES', 
      'afiliacion/nueva-afiliacion', 
      ['editar', 'editarDos', 'administrar']
    );
    this.mostrarBotonEditar = this.permisosService.userHasPermission(
      'AFILIACIONES', 
      'afiliacion/nueva-afiliacion', 
      ['editar', 'editarDos', 'administrar']
    );
    this.mostrarBotonEliminar = this.permisosService.userHasPermission(
      'AFILIACIONES', 
      'afiliacion/nueva-afiliacion', 
      ['editar', 'editarDos', 'administrar']
    );
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

    this.myColumns = [
      {
        header: 'Estado',
        col: 'estado',
        isEditable: false
      },
      {
        header: 'Codigo',
        col: 'codigo',
        isEditable: true,
        validationRules: [Validators.required]
      },
      {
        header: 'Nombre',
        col: 'nombre_centro_trabajo',
        isEditable: true,
        validationRules: [Validators.required]
      },
      {
        header: 'Departamento',
        col: 'departamento',
        isEditable: false
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
        col: 'fecha_ingreso',
        isEditable: true
      },
      {
        header: 'Fecha de Egreso',
        col: 'fecha_egreso',
        isEditable: true,
        validationRules: []
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
    this.getFilas().then(() => this.cargar());
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
          estado: item.estado,
          id_perf_pers_centro_trab: item.id_perf_pers_centro_trab,
          codigo: item.centroTrabajo.codigo,
          id_centro_trabajo: item.centroTrabajo.id_centro_trabajo,
          direccion_1: item.centroTrabajo.direccion_1,
          direccion_2: item.centroTrabajo.direccion_2,
          nombre_centro_trabajo: item.centroTrabajo.nombre_centro_trabajo,
          numero_acuerdo: item.numero_acuerdo,
          salarioBase: item.salario_base,
          fecha_ingreso: this.datePipe.transform(item.fecha_ingreso, 'dd/MM/yyyy'),
          fecha_egreso: item.fecha_egreso ? this.datePipe.transform(item.fecha_egreso, 'dd/MM/yyyy') : null,
          cargo: item.cargo,
          jornada: item.jornada,
          tipo_jornada: item.tipo_jornada,
          municipio: item.centroTrabajo.municipio.nombre,
          departamento: item.centroTrabajo.departamento.nombre,
          sector_economico: item.centroTrabajo.sector_economico,
          telefono_1: item.centroTrabajo.telefono_1,
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
    const sectorEconomico = row.sector_economico || '';
  
    const campos: any[] = [
      { nombre: 'codigo', tipo: 'text', etiqueta: 'Código de Centro Trabajo', editable: false, icono: 'business' },
      { nombre: 'nombre_centro_trabajo', tipo: 'text', etiqueta: 'Nombre Centro Trabajo', editable: false, icono: 'business' },
      { nombre: 'municipio', tipo: 'text', etiqueta: 'Municipio', editable: false, icono: 'location_city' },
      { nombre: 'departamento', tipo: 'text', etiqueta: 'Departamento', editable: false, icono: 'map' },
      { nombre: 'sector_economico', tipo: 'text', etiqueta: 'Sector Económico', editable: false, icono: 'business_center' },
      { nombre: 'direccion_1', tipo: 'text', etiqueta: 'Dirección 1', editable: true, icono: 'place' },
      { nombre: 'direccion_2', tipo: 'text', etiqueta: 'Dirección 2', editable: true, icono: 'place' },
      { nombre: 'telefono_1', tipo: 'text', etiqueta: 'Teléfono', editable: true, icono: 'phone', validadores: [Validators.pattern('^[0-9]{8,15}$')] },
      { nombre: 'salarioBase', tipo: 'number', etiqueta: 'Salario Base', editable: true, icono: 'money', validadores: [Validators.required, Validators.min(0)] },
      { nombre: 'fecha_ingreso', tipo: 'date', etiqueta: 'Fecha de Ingreso', editable: true, icono: 'event', validadores: [Validators.required] },
      { nombre: 'fecha_egreso', tipo: 'date', etiqueta: 'Fecha de Egreso', editable: true, icono: 'event' },
      { nombre: 'cargo', tipo: 'text', etiqueta: 'Cargo', editable: true, icono: 'work_outline', validadores: [Validators.required, Validators.maxLength(40)] },
      { nombre: 'jornada', tipo: 'list', etiqueta: 'Jornada', editable: true, opciones: this.jornadas, icono: 'schedule' },
      { nombre: 'tipo_jornada', tipo: 'list', etiqueta: 'Tipo de Jornada', editable: true, opciones: this.tiposJornada, icono: 'assignment_turned_in' },
    ];
  
    if (sectorEconomico === 'PUBLICO') {
      campos.push({
        nombre: 'numero_acuerdo',
        tipo: 'text',
        etiqueta: 'Número Acuerdo',
        editable: true,
        icono: 'description',
        validadores: [Validators.required, Validators.maxLength(40)]
      });
    }
  
    const valoresIniciales = {
      ...row,
      fecha_ingreso: this.convertirCadenaAFecha(row.fecha_ingreso),
      fecha_egreso: this.convertirCadenaAFecha(row.fecha_egreso)
    };

    const validacionesDinamicas = {
      fecha_egreso: [this.validarFechaEgresoDinamica()]
    };
    
    const dialogRef = this.dialog.open(EditarDialogComponent, {
      width: '1200px',
      data: { campos: campos, valoresIniciales: valoresIniciales, validacionesDinamicas: validacionesDinamicas }
    });
  
    dialogRef.afterClosed().subscribe(async (result: any) => {
      if (result) {
        result.fecha_ingreso = this.datePipe.transform(result.fecha_ingreso, 'dd/MM/yyyy');
        result.fecha_egreso = this.datePipe.transform(result.fecha_egreso, 'dd/MM/yyyy');
  
        const estadoFinal = result.fecha_egreso ? 'INACTIVO' : row.estado;
  
        const dataToSend = {
          ...result,
          idCentroTrabajo: row.id_centro_trabajo,
          estado: estadoFinal
        };
  
        this.svcAfiliado.updatePerfCentroTrabajo(row.id_perf_pers_centro_trab, dataToSend).subscribe({
          next: () => {
            const index = this.filas.findIndex(item => item.id === row.id);
            if (index !== -1) {
              this.filas[index] = {
                ...this.filas[index],
                ...result,
                nombre_centro_trabajo: row.nombre_centro_trabajo,
                estado: estadoFinal
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
        message: '¿Está seguro de que desea desactivar este Centro De Trabajo?',
        idPersona: this.Afiliado.ID_PERSONA
      }
    });

    dialogRef.afterClosed().subscribe((result: boolean) => {
      if (result) {
        this.svcAfiliado.desactivarPerfCentroTrabajo(row.id_perf_pers_centro_trab).subscribe({
          next: (response) => {
            this.toastr.success(response.mensaje, 'Centro De Trabajo Desactivado');
            this.getFilas().then(() => this.cargar());
            this.onDatoAgregado.emit();
          },
          error: (error) => {
            console.error('Error al desactivar el perfil:', error);
            this.toastr.error('Ocurrió un error al desactivar el Centro De Trabajo.');
          }
        });
      } else {
      }
    });
  }

  AgregarPuestoTrabajo() {
    const dialogRef = this.dialog.open(AgregarPuestTrabComponent, {
      width: '80%',
      height: '75%',
      data: {
        idPersona: this.Afiliado.id_persona
      }
    });

    dialogRef.afterClosed().subscribe((result: any) => {
      this.getFilas().then(() => this.cargar());
      this.onDatoAgregado.emit();
    });
  }

  convertirCadenaAFecha(fecha: string | null | undefined): Date | null {
    if (!fecha || !fecha.includes('/')) {
      return null
    }
  
    const [day, month, year] = fecha.split('/').map(Number);
    return new Date(year, month - 1, day);
  }
  
  validarFechaEgresoDinamica(): ValidatorFn {
    return (control: AbstractControl): { [key: string]: any } | null => {
      if (!control.parent) return null;
  
      const fechaIngreso = control.parent.get('fecha_ingreso')?.value;
      const fechaEgreso = control.value;
  
      if (fechaIngreso && fechaEgreso) {
        const fechaIngresoDate = new Date(fechaIngreso);
        const fechaEgresoDate = new Date(fechaEgreso);
  
        if (fechaEgresoDate < fechaIngresoDate) {
          return { fechaEgresoInvalida: true };
        }
      }
      return null;
    };
  }
  
  
  
}
