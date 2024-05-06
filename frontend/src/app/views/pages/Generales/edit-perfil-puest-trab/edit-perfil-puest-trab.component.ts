import { Component } from '@angular/core';
import { Validators } from '@angular/forms';
import { MatDialog } from '@angular/material/dialog';
import { AgregarPuestTrabComponent } from '@docs-components/agregar-puest-trab/agregar-puest-trab.component';
import { ConfirmDialogComponent } from '@docs-components/confirm-dialog/confirm-dialog.component';
import { EditarDialogComponent } from '@docs-components/editar-dialog/editar-dialog.component';
import { ToastrService } from 'ngx-toastr';
import { AfiliadoService } from 'src/app/services/afiliado.service';
import { FieldConfig } from 'src/app/shared/Interfaces/field-config';
import { TableColumn } from 'src/app/shared/Interfaces/table-column';
import { unirNombres } from 'src/app/shared/functions/formatoNombresP';
import { convertirFechaInputs } from 'src/app/shared/functions/formatoFecha';
@Component({
  selector: 'app-edit-perfil-puest-trab',
  templateUrl: './edit-perfil-puest-trab.component.html',
  styleUrl: './edit-perfil-puest-trab.component.scss'
})
export class EditPerfilPuestTrabComponent {
  convertirFechaInputs = convertirFechaInputs
  public myFormFields: FieldConfig[] = []
  form: any;
  Afiliado!: any;
  unirNombres: any = unirNombres;
  datosTabl: any[] = [];
  prevAfil:boolean = false;

  public myColumns: TableColumn[] = [];
  public filas: any[] = [];
  ejecF: any;

  constructor(
    private svcAfiliado: AfiliadoService,
    private toastr: ToastrService,
    private dialog: MatDialog
  ) { }

  ngOnInit(): void {
    this.myFormFields = [
      { type: 'text', label: 'DNI del afiliado', name: 'dni', validations: [Validators.required, Validators.minLength(13), Validators.maxLength(14)], display: true },
    ];

    this.myColumns = [
      {
        header: 'Nombre del Centro Trabajo',
        col: 'nombre_centro_trabajo',
        isEditable: true,
        validationRules: [Validators.required, Validators.minLength(3)]
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
        header: 'Fecha de egreso',
        col: 'fechaEgreso',
        isEditable: true
      },
      {
        header: 'Cargo',
        col: 'cargo',
        isEditable: true
      },
      {
        header: 'Sector Económico',
        col: 'sectorEconomico',
        isEditable: true
      },
      {
        header: 'Clase Cliente',
        col: 'claseCliente',
        isEditable: true
      },
    ];

    this.getFilas().then(() => this.cargar());
  }

  async obtenerDatos(event: any): Promise<any> {
    this.form = event;
  }

  previsualizarInfoAfil() {
    if (this.form.value.dni) {

      this.svcAfiliado.getAfilByParam(this.form.value.dni).subscribe(
        async (result) => {
          this.prevAfil = true;
          this.Afiliado = result
          this.Afiliado.nameAfil = this.unirNombres(result.PRIMER_NOMBRE, result.SEGUNDO_NOMBRE, result.TERCER_NOMBRE, result.PRIMER_APELLIDO, result.SEGUNDO_APELLIDO);
          this.getFilas().then(() => this.cargar());
        },
        (error) => {
          this.getFilas().then(() => this.cargar());
          this.toastr.error(`Error: ${error.error.message}`);
          this.resetDatos();
        })
    }
  }
  resetDatos(){
    if (this.form){
      this.form.reset();
    }
    this.filas = [];
    this.Afiliado = undefined;
  }

  async getFilas() {
    if (this.Afiliado){
      try {
        const data = await this.svcAfiliado.getAllPerfCentroTrabajo(this.Afiliado.DNI).toPromise();
        this.filas = data.map((item: any) => ({
          id: item.id_perf_pers_centro_trab,
          nombre_centro_trabajo: item.centroTrabajo.nombre_centro_trabajo,
          numeroAcuerdo: item.numero_acuerdo || 'No disponible',
          salarioBase: item.salario_base,
          fechaIngreso: item.fecha_ingreso,
          fechaEgreso: item.fecha_egreso,
          cargo: item.cargo,
          sectorEconomico: item.sector_economico,
          claseCliente: item.clase_cliente,
        }));
      } catch (error) {
        this.toastr.error('Error al cargar los datos de los perfiles de los centros de trabajo');
        console.error('Error al obtener datos de datos de los perfiles de los centros de trabajo', error);
      }
    }else{
      this.resetDatos()
    }

  }

  ejecutarFuncionAsincronaDesdeOtroComponente(funcion: (data: any) => Promise<void>) {
    this.ejecF = funcion;
  }

  cargar() {
    if (this.ejecF) {
      this.ejecF(this.filas).then(() => {
      });
    }
  }

  manejarAccionUno(row: any) {
    const campos = [
      { nombre: 'nombre_centro_trabajo', tipo: 'text', requerido: true, etiqueta: 'Nombre Centro Trabajo', editable: true },
      { nombre: 'numeroAcuerdo', tipo: 'text', requerido: true, etiqueta: 'Número Acuerdo', editable: true },
      { nombre: 'salarioBase', tipo: 'number', requerido: true, etiqueta: 'salarioBase', editable: true },
      { nombre: 'fechaIngreso', tipo: 'text', requerido: false, etiqueta: 'Fecha Ingreso', editable: false },
      { nombre: 'fechaEgreso', tipo: 'text', requerido: false, etiqueta: 'Fecha Ingreso', editable: false },
      { nombre: 'cargo', tipo: 'text', requerido: false, etiqueta: 'Cargo', editable: false },
      { nombre: 'sectorEconomico', tipo: 'text', requerido: false, etiqueta: 'Sector Económico', editable: false },
      { nombre: 'claseCliente', tipo: 'text', requerido: false, etiqueta: 'Clase Cliente', editable: false }
    ];

    this.openDialog(campos, row);
  }

  manejarAccionDos(row: any) {
    const dialogRef = this.dialog.open(ConfirmDialogComponent, {
      width: '350px',
      data: {
        title: 'Confirmar Desactivación',
        message: '¿Está seguro de que desea desactivar este perfil?'
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


  AgregarPuestoTrabajo(){
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

  openDialog(campos: any, row: any): void {
    const dialogRef = this.dialog.open(EditarDialogComponent, {
        width: '500px',
        data: { campos: campos, valoresIniciales: row }
    });

    dialogRef.afterClosed().subscribe(async (result: any) => {
        if (result) {
            delete result.nombre_centro_trabajo;
            if (!result.claseCliente) {
                console.error("Falta la propiedad 'claseCliente'");
                return;
            }
            this.svcAfiliado.updatePerfCentroTrabajo(row.id, result).subscribe({
                next: (response) => {
                    const index = this.filas.findIndex(item => item.id === row.id);
                    if (index !== -1) {
                        this.filas[index] = {
                            ...this.filas[index],
                            ...result
                        };
                    }
                    this.cargar();
                },
                error: (error) => {
                    console.error("Error al actualizar:", error);
                }
            });
        } else {
            console.log("No se realizaron cambios.");
        }
    });
}



}
