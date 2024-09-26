import { DatePipe } from '@angular/common';
import { Component, Input, OnChanges, OnDestroy, OnInit, SimpleChanges } from '@angular/core';
import { Validators } from '@angular/forms';
import { MatDialog } from '@angular/material/dialog';
import { ToastrService } from 'ngx-toastr';
import { Subscription } from 'rxjs';
import { ConfirmDialogComponent } from 'src/app/components/dinamicos/confirm-dialog/confirm-dialog.component';
import { EditarDialogComponent } from 'src/app/components/dinamicos/editar-dialog/editar-dialog.component';
import { AfiliadoService } from 'src/app/services/afiliado.service';
import { AfiliacionService } from 'src/app/services/afiliacion.service'; // Servicio para familiares
import { FieldConfig } from 'src/app/shared/Interfaces/field-config';
import { TableColumn } from 'src/app/shared/Interfaces/table-column';
import { convertirFechaInputs } from 'src/app/shared/functions/formatoFecha';
import { unirNombres } from 'src/app/shared/functions/formatoNombresP';
import { AgregarPepsComponent } from '../agregar-peps/agregar-peps.component';
import { AgregarFamiliarComponent } from '../agregar-familiar/agregar-familiar.component';

@Component({
  selector: 'app-edit-peps',
  templateUrl: './edit-peps.component.html',
  styleUrls: ['./edit-peps.component.scss']
})
export class EditPepsComponent implements OnInit, OnDestroy, OnChanges {
  @Input() Afiliado!: any;

  private subscriptions: Subscription = new Subscription();
  convertirFechaInputs = convertirFechaInputs;
  unirNombres: any = unirNombres;

  // Variables para PEPs (Cargos Públicos)
  datosTabl: any[] = [];
  centrosTrabajo: any = [];
  prevAfil: boolean = false;
  public myColumns: TableColumn[] = [];
  public myFormFields: FieldConfig[] = [];
  public filas: any[] = [];
  ejecFPEPs: any;

  // Variables para Familiares
  public familiaresColumns: TableColumn[] = [];
  public familiares: any[] = [];
  ejecFFamiliares: any;

  constructor(
    private svcAfiliado: AfiliadoService,
    private afiliacionService: AfiliacionService, // Servicio para obtener familiares
    private toastr: ToastrService,
    private dialog: MatDialog,
    private datePipe: DatePipe
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

    this.myColumns = [
      {
        header: 'Cargo',
        col: 'cargo',
        isEditable: true,
        validationRules: [Validators.required]
      },
      {
        header: 'Fecha Inicio',
        col: 'fecha_inicio',
        isEditable: true
      },
      {
        header: 'Fecha Fin',
        col: 'fecha_fin',
        isEditable: true
      }
    ];

    // Definir columnas para la tabla de Familiares
    this.familiaresColumns = [
      {
        header: 'Nombre Completo',
        col: 'nombre_completo'
      },
      {
        header: 'Parentesco',
        col: 'parentesco'
      }
    ];

    this.loadData();  // Usar un método para cargar ambas tablas
  }

  loadData(): void {
    // Cargar ambas tablas de manera independiente
    Promise.all([this.getFilas(), this.getFamiliares()])
      .then(() => {
        this.cargar();          // Cargar tabla de PEPs
        this.cargarFamiliares(); // Cargar tabla de Familiares
      })
      .catch(error => {
        this.toastr.error('Error al cargar los datos.');
        console.error('Error en la carga de datos:', error);
      });
  }

  async getFilas(): Promise<void> {
    if (this.Afiliado.n_identificacion) {
      try {
        const data = await this.svcAfiliado.getAllCargoPublicPeps(this.Afiliado.n_identificacion).toPromise();
        this.filas = data[0].cargo_publico.map((item: any) => {
          return {
            cargo: item.cargo,
            fecha_inicio: item.fecha_inicio,
            fecha_fin: item.fecha_fin
          };
        });
      } catch (error) {
        this.toastr.error('Error al cargar los datos de los puestos públicos');
        console.error('Error al obtener datos de los puestos públicos', error);
      }
    }
  }

  async getFamiliares(): Promise<void> {
    if (this.Afiliado.id_persona) {
      try {
        const data = await this.afiliacionService.obtenerFamiliares(this.Afiliado.id_persona).toPromise();
        this.familiares = data.map((familiar: any) => ({
          nombre_completo: `${familiar.referenciada.primer_nombre || ''} ${familiar.referenciada.segundo_nombre || ''} ${familiar.referenciada.primer_apellido || ''} ${familiar.referenciada.segundo_apellido || ''}`.trim(),
          parentesco: familiar.parentesco
        }));
      } catch (error) {
        this.toastr.error('Error al cargar los familiares');
        console.error('Error al obtener familiares:', error);
      }
    }
  }

  // Función para cargar los datos de la tabla de PEPs
  cargar() {
    if (this.ejecFPEPs) {
      this.ejecFPEPs(this.filas).then(() => { });
    }
  }

  // Función para cargar los datos de la tabla de Familiares
  cargarFamiliares() {
    if (this.ejecFFamiliares) {
      this.ejecFFamiliares(this.familiares).then(() => { });
    }
  }

  // Método para ejecutar funciones asíncronas desde la tabla de PEPs
  ejecutarFuncionAsincronaDesdeOtroComponentePEPs(funcion: (data: any) => Promise<void>) {
    this.ejecFPEPs = funcion;
  }

  // Método para ejecutar funciones asíncronas desde la tabla de Familiares
  ejecutarFuncionAsincronaDesdeOtroComponenteFamiliares(funcion: (data: any) => Promise<void>) {
    this.ejecFFamiliares = funcion;
  }

  async manejarAccionUno(row: any) {
    const campos = [
      {
        nombre: 'cargo',
        tipo: 'text',
        requerido: true,
        etiqueta: 'Cargo',
        editable: true,
        icono: 'description',
        validaciones: [Validators.required, Validators.maxLength(40)]
      },
      {
        nombre: 'fecha_inicio',
        tipo: 'date',
        requerido: true,
        etiqueta: 'Fecha Inicio',
        editable: true,
        icono: 'event',
        validaciones: [Validators.required]
      },
      {
        nombre: 'fecha_fin',
        tipo: 'date',
        requerido: true,
        etiqueta: 'Fecha Fin',
        editable: true,
        icono: 'event',
        validaciones: [Validators.required]
      }
    ];

    const dialogRef = this.dialog.open(EditarDialogComponent, {
      width: '500px',
      data: { campos: campos, valoresIniciales: row }
    });

    dialogRef.afterClosed().subscribe(async (result: any) => {
      if (result) {
        result.fechaIngreso = this.datePipe.transform(result.fechaIngreso, 'dd/MM/yyyy');
        result.fechaEgreso = this.datePipe.transform(result.fechaEgreso, 'dd/MM/yyyy');

        this.svcAfiliado.updatePerfCentroTrabajo(row.id, result).subscribe({
          next: () => {
            const index = this.filas.findIndex(item => item.id === row.id);
            if (index !== -1) {
              this.filas[index] = { ...this.filas[index], ...result };
            }
            this.toastr.success("Se actualizó el perfil de trabajo correctamente");
            this.cargar();
          },
          error: () => {
            this.toastr.error("Error", "No se actualizó el perfil de trabajo");
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
        this.svcAfiliado.desactivarPerfCentroTrabajo(row.id).subscribe({
          next: () => {
            this.toastr.success('Perfil Desactivado');
            this.getFilas().then(() => this.cargar());
          },
          error: () => {
            this.toastr.error('Ocurrió un error al desactivar el perfil.');
          }
        });
      }
    });
  }

  agregarFamiliar() {
    const dialogRef = this.dialog.open(AgregarFamiliarComponent, {
      width: '55%',
      height: '75%',
      data: {
        idPersona: this.Afiliado.id_persona
      }
    });
    dialogRef.afterClosed().subscribe(() => {
      this.getFamiliares().then(() => this.cargarFamiliares());
    });
  }

  agregarPEP() {
    const dialogRef = this.dialog.open(AgregarPepsComponent, {
      width: '55%',
      height: '75%',
      data: {
        idPersona: this.Afiliado.id_persona
      }
    });
    dialogRef.afterClosed().subscribe(() => {
      this.ngOnInit();
    });
  }
}
