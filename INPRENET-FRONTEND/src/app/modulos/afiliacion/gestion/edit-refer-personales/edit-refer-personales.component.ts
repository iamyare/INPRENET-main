import { Component, Input, OnInit, OnChanges, SimpleChanges, OnDestroy } from '@angular/core';
import { Validators } from '@angular/forms';
import { MatDialog } from '@angular/material/dialog';
import { ToastrService } from 'ngx-toastr';
import { AfiliadoService } from 'src/app/services/afiliado.service';
import { AfiliacionService } from 'src/app/services/afiliacion.service';
import { FieldConfig } from 'src/app/shared/Interfaces/field-config';
import { TableColumn } from 'src/app/shared/Interfaces/table-column';
import { convertirFechaInputs } from 'src/app/shared/functions/formatoFecha';
import { unirNombres } from 'src/app/shared/functions/formatoNombresP';
import { Subscription } from 'rxjs';
import { DatosEstaticosService } from 'src/app/services/datos-estaticos.service';
import { ConfirmDialogComponent } from 'src/app/components/dinamicos/confirm-dialog/confirm-dialog.component';
import { EditarDialogComponent } from 'src/app/components/dinamicos/editar-dialog/editar-dialog.component';
import { AgregarReferenciasPersonalesComponent } from '../agregar-referencias-personales/agregar-referencias-personales.component';
import { PermisosService } from 'src/app/services/permisos.service';

@Component({
  selector: 'app-edit-refer-personales',
  templateUrl: './edit-refer-personales.component.html',
  styleUrls: ['./edit-refer-personales.component.scss']
})
export class EditReferPersonalesComponent implements OnInit, OnChanges, OnDestroy {
  convertirFechaInputs = convertirFechaInputs;
  public myFormFields: FieldConfig[] = [];
  form: any;
  @Input() Afiliado: any;
  unirNombres: any = unirNombres;
  datosTabl: any[] = [];
  prevAfil: boolean = false;
  listaParentesco: any;
  public myColumns: TableColumn[] = [];
  public filas: any[] = [];
  ejecF: any;
  private subscriptions: Subscription = new Subscription();
  public mostrarMensaje: boolean = false;
  public mostrarBotonAgregar: boolean = false;
  public mostrarBotonEditar: boolean = false;
  public mostrarBotonInhabilitar: boolean = false;


  constructor(
    private svcAfiliado: AfiliadoService,
    private svcAfiliacion: AfiliacionService,
    private toastr: ToastrService,
    private dialog: MatDialog,
    private datosEstaticosService: DatosEstaticosService,
    private permisosService: PermisosService
  ) { }

  ngOnInit(): void {
    this.initializeComponent();
    const tieneAccesoCompleto = this.permisosService.tieneAccesoCompletoAfiliacion();
    this.mostrarBotonAgregar = tieneAccesoCompleto;
    this.mostrarBotonEditar = tieneAccesoCompleto;
    this.mostrarBotonInhabilitar = tieneAccesoCompleto;
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
    this.listaParentesco = this.datosEstaticosService.parentesco;
    this.myColumns = [
      {
        header: 'Nombre Completo',
        col: 'nombre_completo',
        isEditable: true,
        validationRules: [Validators.required, Validators.minLength(3)]
      },
      {
        header: 'Numero De Identificacion',
        col: 'n_identificacion',
        isEditable: true,
        validationRules: [Validators.required, Validators.minLength(3)]
      },
      {
        header: 'Tipo De Referencia',
        col: 'tipo_referencia',
        isEditable: true,
        validationRules: [Validators.required]
      },
      {
        header: 'Parentesco',
        col: 'parentesco',
        isEditable: true
      },
      {
        header: 'Dirección',
        col: 'direccion',
        isEditable: true
      },
      {
        header: 'Teléfono Domicilio',
        col: 'telefono_domicilio',
        isEditable: true
      },
      {
        header: 'Teléfono personal',
        col: 'telefono_personal',
        isEditable: true
      },
      {
        header: 'Teléfono trabajo',
        col: 'telefono_trabajo',
        isEditable: true
      }
    ];
    this.getFilas();
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

    this.mostrarMensaje = false;
    if (this.Afiliado) {
      try {
        const data = await this.svcAfiliacion.obtenerReferenciasPorIdentificacion(this.Afiliado.n_identificacion).toPromise();
        this.filas = data
          .filter((item: any) => item.estado === 'ACTIVO')
          .map((item: any) => {
            const filaProcesada = {
              id_referencia: item.id_referencia ?? 'ID no disponible',
              n_identificacion: item.n_identificacion ?? 'ID no disponible',
              nombre_completo: `${item.primer_nombre ?? ''} ${item.segundo_nombre ?? ''} ${item.primer_apellido ?? ''} ${item.segundo_apellido ?? ''}`.trim(),
              parentesco: item.parentesco || 'No disponible',
              direccion: item.direccion ?? 'Dirección no disponible',
              telefono_domicilio: item.telefono_domicilio ?? '00000000',
              telefono_personal: item.telefono_personal ?? '00000000',
              telefono_trabajo: item.telefono_trabajo ?? '00000000',
              estado: item.estado ?? 'No disponible',
              tipo_referencia: item.tipo_referencia ?? 'No disponible',
              primer_nombre: item.primer_nombre ?? 'No disponible',
              segundo_nombre: item.segundo_nombre ?? 'No disponible',
              primer_apellido: item.primer_apellido ?? 'No disponible',
              segundo_apellido: item.segundo_apellido ?? 'No disponible',
            };
            return filaProcesada;
          });

        this.mostrarMensaje = this.filas.length === 0;
      } catch (error) {
        console.error('Error al obtener datos de las referencias personales:', error);
        this.filas = [];
        this.mostrarMensaje = true;
      } finally {
        this.cargar();
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

  editarFila(row: any) {
    const rowParentesco = row.parentesco.toLowerCase();
    const parentescoSeleccionado = this.listaParentesco.find(
      (item: any) => item.label.toLowerCase() === rowParentesco
    );
    const campos = [
      {
        nombre: 'primer_nombre',
        tipo: 'text',
        requerido: true,
        etiqueta: 'Primer Nombre',
        editable: true,
        icono: 'person',
        validadores: [Validators.required, Validators.minLength(2), Validators.maxLength(100)]
      },
      {
        nombre: 'segundo_nombre',
        tipo: 'text',
        requerido: true,
        etiqueta: 'Segundo Nombre',
        editable: true,
        icono: 'person',
        validadores: [Validators.required, Validators.minLength(2), Validators.maxLength(100)]
      },
      {
        nombre: 'primer_apellido',
        tipo: 'text',
        requerido: true,
        etiqueta: 'Primer Apellido',
        editable: true,
        icono: 'person',
        validadores: [Validators.required, Validators.minLength(2), Validators.maxLength(100)]
      },
      {
        nombre: 'segundo_apellido',
        tipo: 'text',
        requerido: true,
        etiqueta: 'Segundo Apellido',
        editable: true,
        icono: 'person',
        validadores: [Validators.required, Validators.minLength(2), Validators.maxLength(100)]
      },
      {
        nombre: 'parentesco',
        tipo: 'list',
        requerido: true,
        etiqueta: 'Parentesco',
        editable: true,
        icono: 'supervisor_account',
        opciones: this.listaParentesco,
        validadores: [Validators.required]
      },
      {
        nombre: 'direccion',
        tipo: 'text',
        requerido: true,
        etiqueta: 'Dirección',
        editable: true,
        icono: 'home',
        validadores: [Validators.required, Validators.minLength(10), Validators.maxLength(200)]
      },
      {
        nombre: 'telefono_domicilio',
        tipo: 'text',
        requerido: false,
        etiqueta: 'Teléfono Domicilio',
        editable: true,
        icono: 'phone',
        validadores: [Validators.minLength(8), Validators.maxLength(12), Validators.pattern(/^\+?[0-9]+(-?[0-9]+)*$/)]
      },
      {
        nombre: 'telefono_personal',
        tipo: 'text',
        requerido: true,
        etiqueta: 'Teléfono Personal',
        editable: true,
        icono: 'smartphone',
        validadores: [Validators.required, Validators.minLength(8), Validators.maxLength(12), Validators.pattern(/^\+?[0-9]+(-?[0-9]+)*$/)]
      },
      {
        nombre: 'telefono_trabajo',
        tipo: 'text',
        requerido: true,
        etiqueta: 'Teléfono Trabajo',
        editable: true,
        icono: 'work',
        validadores: [Validators.required, Validators.minLength(8), Validators.maxLength(12), Validators.pattern(/^\+?[0-9]+(-?[0-9]+)*$/)]
      },
      {
        nombre: 'n_identificacion',
        tipo: 'text',
        requerido: true,
        etiqueta: 'Numero de Identificacion',
        editable: true,
        icono: 'badge',
        validadores: []
      },
      {
        nombre: 'tipo_referencia',
        tipo: 'text',
        requerido: true,
        etiqueta: 'Tipo De Referencia',
        editable: true,
        icono: 'badge',
        validadores: [Validators.required]
      }
    ];

    const valoresIniciales = {
      ...row,
      parentesco: parentescoSeleccionado ? parentescoSeleccionado.value : ''
    };

    this.openDialog(campos, valoresIniciales);
  }

  inhabilitarFila(row: any) {
    const dialogRef = this.dialog.open(ConfirmDialogComponent, {
      width: '350px',
      data: {
        title: 'Confirmación de inhabilitación',
        message: '¿Estás seguro de querer inhabilitar esta referencia personal?'
      }
    });
    dialogRef.afterClosed().subscribe((result: boolean) => {
      if (result) {

        this.svcAfiliacion.inactivarReferencia(row.id_referencia).subscribe({
          next: () => {
            this.toastr.success('Referencia personal inactivada correctamente.');
            this.getFilas();
          },
          error: (error) => {
            console.error('Error al inactivar la referencia personal:', error);
            this.toastr.error('Error al inactivar la referencia personal.');
          }
        });
      } else {
        console.log('Inactivación cancelada.');
      }
    });
  }

  openDialog(campos: any, row: any): void {
    const dialogRef = this.dialog.open(EditarDialogComponent, {
      width: '500px',
      data: { campos: campos, valoresIniciales: row }
    });
    dialogRef.afterClosed().subscribe((result: any) => {
      if (result) {
        const updateDto = {
          primer_nombre: result.primer_nombre,
          segundo_nombre: result.segundo_nombre,
          primer_apellido: result.primer_apellido,
          segundo_apellido: result.segundo_apellido,
          direccion: result.direccion,
          telefono_domicilio: result.telefono_domicilio,
          telefono_personal: result.telefono_personal,
          telefono_trabajo: result.telefono_trabajo,
          n_identificacion: result.n_identificacion,
          tipo_referencia: result.tipo_referencia,
          parentesco: result.parentesco,
          estado: 'ACTIVO'
        };

        this.svcAfiliado.updateReferenciaPersonal(row.id_referencia, updateDto).subscribe({
          next: (response) => {
            this.toastr.success('Datos modificados correctamente.');
            this.getFilas();
          },
          error: (error) => {
            this.toastr.error('Error al actualizar la referencia personal.');
            console.error('Error al actualizar la referencia personal:', error);
            this.getFilas();
          }
        });
      } else {
        console.log('Edición cancelada.');
      }
    });
  }

  crearReferenciaPers() {
    const dialogRef = this.dialog.open(AgregarReferenciasPersonalesComponent, {
      width: '55%',
      height: '75%',
      data: {
        idPersona: this.Afiliado.id_persona
      }
    });

    dialogRef.afterClosed().subscribe((result: any) => {
      if (result) {
        this.getFilas();
      }
    });
  }
}
