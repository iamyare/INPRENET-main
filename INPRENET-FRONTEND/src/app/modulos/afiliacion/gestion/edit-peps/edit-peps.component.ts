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
import { AgregarPuestTrabComponent } from '../agregar-puest-trab/agregar-puest-trab.component';

@Component({
  selector: 'app-edit-peps',
  templateUrl: './edit-peps.component.html',
  styleUrl: './edit-peps.component.scss'
})
export class EditPepsComponent {
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
      },
      
    ];

    //this.getCentrosTrabajo();
    this.getFilas().then(() => this.cargar());

  }


  /* async getCentrosTrabajo() {
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
  } */

 /*  resetDatos() {
    this.filas = [];
    this.Afiliado = undefined;
  } */

  async getFilas() {

    if (this.Afiliado.n_identificacion) {
      try {
        const data = await this.svcAfiliado.getAllCargoPublicPeps(this.Afiliado.n_identificacion).toPromise();
        this.filas = data[0].cargo_publico.map((item: any) => {
          return {
            cargo: item.cargo,
            fecha_inicio: item.fecha_inicio,
            fecha_fin: item.fecha_fin,
          }
        }
      );
      } catch (error) {
        this.toastr.error('Error al cargar los datos de los perfiles de los centros de trabajo');
        console.error('Error al obtener datos de los perfiles de los centros de trabajo', error);
      }
    } else {
      /* this.resetDatos(); */
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
        etiqueta: 'F  echa Fin',
        editable: true,
        icono: 'event',
        validaciones: [Validators.required]
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

  AgregarPuestoTrabajo() {
    const dialogRef = this.dialog.open(AgregarPuestTrabComponent, {
      width: '55%',
      height: '75%',
      data: {
        idPersona: this.Afiliado.id_persona
      }
    });

    dialogRef.afterClosed().subscribe((result: any) => {
      this.ngOnInit();
    });
  }

}
