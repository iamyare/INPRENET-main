import { DatePipe } from '@angular/common';
import { Component, Input } from '@angular/core';
import { Validators } from '@angular/forms';
import { MatDialog } from '@angular/material/dialog';
import { AgregarPuestTrabComponent } from '@docs-components/agregar-puest-trab/agregar-puest-trab.component';
import { ConfirmDialogComponent } from '@docs-components/confirm-dialog/confirm-dialog.component';
import { EditarDialogComponent } from '@docs-components/editar-dialog/editar-dialog.component';
import { ToastrService } from 'ngx-toastr';
import { AfiliadoService } from 'src/app/services/afiliado.service';
import { CentroTrabajoService } from 'src/app/services/centro-trabajo.service';
import { DatosEstaticosService } from 'src/app/services/datos-estaticos.service';
import { FieldConfig } from 'src/app/shared/Interfaces/field-config';
import { TableColumn } from 'src/app/shared/Interfaces/table-column';
import { convertirFechaInputs } from 'src/app/shared/functions/formatoFecha';
import { unirNombres } from 'src/app/shared/functions/formatoNombresP';

@Component({
  selector: 'app-edit-perfil-puest-trab',
  templateUrl: './edit-perfil-puest-trab.component.html',
  styleUrls: ['./edit-perfil-puest-trab.component.scss'],
  providers: [DatePipe] // Añadir el DatePipe como proveedor
})
export class EditPerfilPuestTrabComponent {
  convertirFechaInputs = convertirFechaInputs;
  public myFormFields: FieldConfig[] = [];
  form: any;
  @Input() Afiliado!: any;
  unirNombres: any = unirNombres;
  datosTabl: any[] = [];
  centrosTrabajo: any = [];
  prevAfil: boolean = false;

  public myColumns: TableColumn[] = [];
  public filas: any[] = [];
  ejecF: any;

  constructor(
    private svcAfiliado: AfiliadoService,
    private toastr: ToastrService,
    private dialog: MatDialog,
    private datosEstaticosService: DatosEstaticosService,
    private datePipe: DatePipe,
    private centrosTrabSVC: CentroTrabajoService,
  ) { }

  ngOnInit(): void {
    this.myFormFields = [
      { type: 'text', label: 'DNI del afiliado', name: 'dni', validations: [Validators.required, Validators.minLength(13), Validators.maxLength(14)], display: true }
    ];

    this.myColumns = [
      {
        header: 'Nombre del Centro Trabajo',
        col: 'nombre_centro_trabajo',
        isEditable: true,
        validationRules: [Validators.required]
      },
      {
        header: 'Número de Acuerdo',
        col: 'numeroAcuerdo',
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
      }
    ];

    this.getCentrosTrabajo();
    this.previsualizarInfoAfil();
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

  previsualizarInfoAfil() {
    if (this.Afiliado.N_IDENTIFICACION) {
      this.svcAfiliado.getAfilByParam(this.Afiliado.N_IDENTIFICACION).subscribe(
        async (result) => {
          this.prevAfil = true;
          this.Afiliado = result;
          this.Afiliado.nameAfil = this.unirNombres(
            result.PRIMER_NOMBRE,
            result.SEGUNDO_NOMBRE,
            result.TERCER_NOMBRE,
            result.PRIMER_APELLIDO,
            result.SEGUNDO_APELLIDO
          );
          this.getFilas().then(() => this.cargar());
        },
        (error) => {
          this.getFilas().then(() => this.cargar());
          this.toastr.error(`Error: ${error.error.message}`);
          this.resetDatos();
        }
      );
    }
  }

  resetDatos() {
    if (this.form) {
      this.form.reset();
    }
    this.filas = [];
    this.Afiliado = undefined;
  }

  async getFilas() {
    if (this.Afiliado) {
      try {
        const data = await this.svcAfiliado.getAllPerfCentroTrabajo(this.Afiliado.N_IDENTIFICACION).toPromise();
        this.filas = data.map((item: any) => ({
          id_perf_pers_centro_trab: item.id_perf_pers_centro_trab,
          id_centro_trabajo: item.centroTrabajo.id_centro_trabajo,
          nombre_centro_trabajo: item.centroTrabajo.nombre_centro_trabajo,
          numeroAcuerdo: item.numero_acuerdo || 'No disponible',
          salarioBase: item.salario_base,
          fechaIngreso: this.datePipe.transform(item.fecha_ingreso, 'dd/MM/yyyy') || 'Fecha no disponible',
          fechaEgreso: this.datePipe.transform(item.fecha_egreso, 'dd/MM/yyyy') || 'Fecha no disponible',
          cargo: item.cargo,
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
        nombre: 'id_centro_trabajo',
        tipo: 'list',
        requerido: true,
        etiqueta: 'Nombre Centro Trabajo',
        editable: true,
        opciones: this.centrosTrabajo,
        icono: 'business'
      },
      {
        nombre: 'numeroAcuerdo',
        tipo: 'text',
        requerido: true,
        etiqueta: 'Número Acuerdo',
        editable: true,
        icono: 'description',
        validaciones: [Validators.required, Validators.maxLength(40)]
      },
      {
        nombre: 'salarioBase',
        tipo: 'number',
        requerido: true,
        etiqueta: 'Salario Base',
        editable: true,
        icono: 'attach_money',
        validaciones: [Validators.required, Validators.min(0)]
      },
      {
        nombre: 'fechaIngreso',
        tipo: 'date',
        requerido: false,
        etiqueta: 'Fecha Ingreso',
        editable: true,
        icono: 'event',
        validaciones: [Validators.required]
      },
      {
        nombre: 'fechaEgreso',
        tipo: 'date',
        requerido: false,
        etiqueta: 'Fecha Egreso',
        editable: true,
        icono: 'event_busy'
      },
      {
        nombre: 'cargo',
        tipo: 'text',
        requerido: false,
        etiqueta: 'Cargo',
        editable: true,
        icono: 'work_outline',
        validaciones: [Validators.required, Validators.maxLength(40)]
      }
    ];

    console.log(row);

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

  AgregarPuestoTrabajo() {
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