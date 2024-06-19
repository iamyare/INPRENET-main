import { Component, Input, OnInit, OnChanges, SimpleChanges, OnDestroy } from '@angular/core';
import { Validators } from '@angular/forms';
import { MatDialog } from '@angular/material/dialog';
import { AgregarReferenciasPersonalesComponent } from '@docs-components/agregar-referencias-personales/agregar-referencias-personales.component';
import { ConfirmDialogComponent } from '@docs-components/confirm-dialog/confirm-dialog.component';
import { EditarDialogComponent } from '@docs-components/editar-dialog/editar-dialog.component';
import { ToastrService } from 'ngx-toastr';
import { AfiliadoService } from 'src/app/services/afiliado.service';
import { FieldConfig } from 'src/app/shared/Interfaces/field-config';
import { TableColumn } from 'src/app/shared/Interfaces/table-column';
import { convertirFechaInputs } from 'src/app/shared/functions/formatoFecha';
import { unirNombres } from 'src/app/shared/functions/formatoNombresP';
import { Subscription } from 'rxjs';
import { DatosEstaticosService } from 'src/app/services/datos-estaticos.service';

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
  public loading: boolean = false;

  constructor(
    private svcAfiliado: AfiliadoService,
    private toastr: ToastrService,
    private dialog: MatDialog,
    private datosEstaticosService: DatosEstaticosService
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
    this.listaParentesco = this.datosEstaticosService.parentesco;
    this.myFormFields = [
      { type: 'text', label: 'DNI del afiliado', name: 'dni', validations: [Validators.required, Validators.minLength(13), Validators.maxLength(14)], display: true },
    ];

    this.myColumns = [
      {
        header: 'Nombre Completo',
        col: 'nombre_completo',
        isEditable: true,
        validationRules: [Validators.required, Validators.minLength(3)]
      },
      {
        header: 'DNI',
        col: 'dni',
        isEditable: true,
        validationRules: [Validators.required, Validators.minLength(3)]
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
      },
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
    this.loading = true; // Mostrar el spinner antes de cargar los datos
    this.mostrarMensaje = false;
    if (this.Afiliado) {
      try {
        const data = await this.svcAfiliado.getAllReferenciasPersonales(this.Afiliado.n_identificacion).toPromise();
        this.filas = data.map((item: any) => {
          const filaProcesada = {
            id_ref_personal: item.id_ref_personal ?? 'ID no disponible',
            dni: item.dni ?? 'ID no disponible',
            nombre_completo: item.nombre_completo ?? 'Nombre no disponible',
            parentesco: item.parentesco || 'No disponible',
            direccion: item.direccion ?? 'Dirección no disponible',
            telefono_domicilio: item.telefono_domicilio ?? 'No disponible',
            telefono_personal: item.telefono_personal ?? 'No disponible',
            telefono_trabajo: item.telefono_trabajo ?? 'No disponible',
          };
          return filaProcesada;
        });
      } catch (error) {
        this.toastr.error('Error al cargar los datos de las referencias personales');
        console.error('Error al obtener datos de las referencias personales:', error);
      }
    } else {
      this.resetDatos();
    }
    setTimeout(() => {
      this.loading = false;
      if (this.filas.length === 0) {
        this.mostrarMensaje = true;
      }
      this.cargar();
    }, 1000);
  }

  ejecutarFuncionAsincronaDesdeOtroComponente(funcion: (data: any) => Promise<void>) {
    this.ejecF = funcion;
  }

  cargar() {
    if (this.ejecF) {
      this.ejecF(this.filas).then(() => {});
    }
  }

  editarFila(row: any) {
    const rowParentesco = row.parentesco.toLowerCase();
    const parentescoSeleccionado = this.listaParentesco.find(
      (item: any) => item.label.toLowerCase() === rowParentesco
    );

    const campos = [
      {
        nombre: 'nombre_completo',
        tipo: 'text',
        requerido: true,
        etiqueta: 'Nombre completo',
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
        nombre: 'dni',
        tipo: 'text',
        requerido: true,
        etiqueta: 'DNI',
        editable: true,
        icono: 'badge',
        validadores: [Validators.required, Validators.pattern(/^[0-9]{13}$|^[0-9]{4}-[0-9]{4}-[0-9]{5}$/)]
      }
    ];

    const valoresIniciales = {
      ...row,
      parentesco: parentescoSeleccionado ? parentescoSeleccionado.value : ''
    };

    this.openDialog(campos, valoresIniciales);
  }

  eliminarFila(row: any) {
    const dialogRef = this.dialog.open(ConfirmDialogComponent, {
      width: '350px',
      data: {
        title: 'Confirmación de eliminación',
        message: '¿Estás seguro de querer eliminar esta referencia personal?'
      }
    });
    dialogRef.afterClosed().subscribe((result: boolean) => {
      if (result) {
        this.svcAfiliado.eliminarReferenciaPersonal(row.id_ref_personal).subscribe({
          next: (response) => {
            this.toastr.success(response.mensaje, 'Referencia Personal Eliminada');
            this.getFilas(); // Volver a cargar las filas después de eliminar
          },
          error: (error) => {
            console.error('Error al eliminar la referencia personal:', error);
            this.toastr.error('Error al eliminar la referencia personal.');
          }
        });
      } else {
        console.log('Eliminación cancelada.');
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
        this.svcAfiliado.updateReferenciaPersonal(row.id_ref_personal, result).subscribe({
          next: (response) => {
            this.toastr.success('Datos modificados correctamente.');
            this.getFilas(); // Volver a cargar las filas después de actualizar
          },
          error: (error) => {
            this.toastr.error('Error al actualizar la referencia personal.');
            console.error('Error al actualizar la referencia personal:', error);
            this.getFilas(); // Volver a cargar las filas incluso si hay un error
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
        this.getFilas(); // Volver a cargar las filas después de agregar una nueva referencia
      }
    });
  }
}
