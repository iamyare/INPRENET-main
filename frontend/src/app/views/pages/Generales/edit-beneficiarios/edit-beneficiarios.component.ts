import { Component, Input } from '@angular/core';
import { Validators } from '@angular/forms';
import { MatDialog } from '@angular/material/dialog';
import { AgregarBenefCompComponent } from '@docs-components/agregar-benef-comp/agregar-benef-comp.component';
import { ConfirmDialogComponent } from '@docs-components/confirm-dialog/confirm-dialog.component';
import { EditarDialogComponent } from '@docs-components/editar-dialog/editar-dialog.component';
import { ToastrService } from 'ngx-toastr';
import { AfiliadoService } from 'src/app/services/afiliado.service';
import { FieldConfig } from 'src/app/shared/Interfaces/field-config';
import { TableColumn } from 'src/app/shared/Interfaces/table-column';
import { convertirFechaInputs } from 'src/app/shared/functions/formatoFecha';
import { unirNombres } from 'src/app/shared/functions/formatoNombresP';
import { DatosEstaticosService } from 'src/app/services/datos-estaticos.service';
import { DatePipe } from '@angular/common';

@Component({
  selector: 'app-edit-beneficiarios',
  templateUrl: './edit-beneficiarios.component.html',
  styleUrl: './edit-beneficiarios.component.scss'
})
export class EditBeneficiariosComponent {
  convertirFechaInputs = convertirFechaInputs;
  public myFormFields: FieldConfig[] = [];
  form: any;
  @Input() Afiliado!: any;
  unirNombres: any = unirNombres;
  datosTabl: any[] = [];
  prevAfil: boolean = false;
  public myColumns: TableColumn[] = [];
  public filas: any[] = [];
  ejecF: any;
  municipios: { label: string, value: any }[] = [];
  estados: { label: string, value: any }[] = [];

  constructor(
    private svcAfiliado: AfiliadoService,
    private toastr: ToastrService,
    private dialog: MatDialog,
    private datosEstaticosService: DatosEstaticosService,
    private datePipe: DatePipe
  ) { }

  async ngOnInit(): Promise<void> {
    this.myFormFields = [
      { type: 'text', label: 'DNI del afiliado', name: 'dni', validations: [Validators.required, Validators.minLength(13), Validators.maxLength(14)], display: true },
    ];

    this.myColumns = [
      {
        header: 'DNI',
        col: 'dni',
        validationRules: [Validators.required, Validators.minLength(3)]
      },
      {
        header: 'Nombres',
        col: 'nombres',
      },
      {
        header: 'Apellidos',
        col: 'apellidos',
      },
      {
        header: 'Porcentaje',
        col: 'porcentaje',
      },
      {
        header: 'Estado',
        col: 'estado_descripcion',
      },
      {
        header: 'Fecha de Nacimiento',
        col: 'fecha_nacimiento',
      }
    ];

    await this.cargarMunicipios();
    await this.cargarEstados()
    this.previsualizarInfoAfil();
    this.getFilas().then(() => this.cargar());
  }

  async cargarMunicipios() {
    this.municipios = await this.datosEstaticosService.getMunicipios();
  }

  async cargarEstados() {
    this.estados = await this.datosEstaticosService.getEstados();
  }

  async obtenerDatos(event: any): Promise<any> {
    this.form = event;
  }

  previsualizarInfoAfil() {
    if (this.Afiliado.DNI) {
      this.svcAfiliado.getAfilByParam(this.Afiliado.DNI).subscribe(
        async (result) => {
          this.prevAfil = true;
          this.Afiliado = result;
          this.Afiliado.nameAfil = this.unirNombres(result.PRIMER_NOMBRE, result.SEGUNDO_NOMBRE, result.TERCER_NOMBRE, result.PRIMER_APELLIDO, result.SEGUNDO_APELLIDO);
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
        const data = await this.svcAfiliado.getAllBenDeAfil(this.Afiliado.DNI).toPromise();
        this.filas = data.map((item: any) => {
          const nombres = [item.primerNombre, item.segundoNombre, item.tercerNombre].filter(part => part).join(' ');
          const apellidos = [item.primerApellido, item.segundoApellido].filter(part => part).join(' ');
          const fechaNacimiento = this.datePipe.transform(item.fechaNacimiento, 'dd/MM/yyyy') || 'Fecha no disponible';
          return {
            id: item.ID_PERSONA,
            dni: item.DNI,
            nombres,
            apellidos,
            genero: item.genero,
            sexo: item.sexo,
            cantidad_dependientes: item.cantidadDependientes,
            telefono_1: item.telefono1,
            fecha_nacimiento: fechaNacimiento,
            direccion_residencia: item.direccionResidencia,
            idPaisNacionalidad: item.idPaisNacionalidad,
            id_municipio_residencia: item.idMunicipioResidencia,
            id_estado_persona: item.idEstadoPersona,
            estado_descripcion: item.estadoDescripcion,
            porcentaje: item.porcentaje,
            tipo_persona: item.tipoPersona
          };
        });
      } catch (error) {
        this.toastr.error('Error al cargar los datos de los beneficiarios');
        console.error('Error al obtener datos de los beneficiarios', error);
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
      this.ejecF(this.filas).then(() => {
      });
    }
  }

  async manejarAccionUno(row: any) {
    const campos = [
      { nombre: 'dni', tipo: 'text', etiqueta: 'DNI', editable: true, icono: 'badge' },
      { nombre: 'nombres', tipo: 'text', etiqueta: 'Nombres', editable: true, icono: 'person' },
      { nombre: 'apellidos', tipo: 'text', etiqueta: 'Apellidos', editable: true, icono: 'person_outline' },
      { nombre: 'genero', tipo: 'list', etiqueta: 'Género', editable: true, opciones: this.datosEstaticosService.genero, icono: 'wc' },
      { nombre: 'sexo', tipo: 'list', etiqueta: 'Sexo', editable: true, opciones: this.datosEstaticosService.sexo, icono: 'transgender' },
      { nombre: 'cantidad_dependientes', tipo: 'number', etiqueta: 'Cantidad de Dependientes', editable: true, icono: 'people' },
      { nombre: 'telefono_1', tipo: 'text', etiqueta: 'Teléfono 1', editable: true, icono: 'phone' },
      { nombre: 'fecha_nacimiento', tipo: 'date', etiqueta: 'Fecha de Nacimiento', editable: true, icono: 'calendar_today' },
      { nombre: 'direccion_residencia', tipo: 'text', etiqueta: 'Dirección de Residencia', editable: true, icono: 'home' },
      { nombre: 'idPaisNacionalidad', tipo: 'list', etiqueta: 'País Nacionalidad', editable: true, opciones: this.datosEstaticosService.nacionalidades, icono: 'public' },
      { nombre: 'id_municipio_residencia', tipo: 'list', etiqueta: 'Municipio Residencia', editable: true, opciones: this.datosEstaticosService.municipios, icono: 'location_city' },
      { nombre: 'id_estado_persona', tipo: 'list', etiqueta: 'Estado Persona', editable: true, opciones: this.datosEstaticosService.estados, icono: 'assignment_ind' },
      { nombre: 'porcentaje', tipo: 'number', etiqueta: 'Porcentaje', editable: true, icono: 'pie_chart' }
    ];

    this.openDialog(campos, row);
  }


  manejarAccionDos(row: any) {
    const dialogRef = this.dialog.open(ConfirmDialogComponent, {
      width: '350px',
      data: {
        title: 'Confirmación de eliminación',
        message: '¿Estás seguro de querer eliminar este elemento?'
      }
    });
    dialogRef.afterClosed().subscribe((result: any) => {
      if (result) {
        this.inactivarPersona(row.id, this.Afiliado.ID_PERSONA);
      }
    });
  }

  AgregarBeneficiario() {
    const dialogRef = this.dialog.open(AgregarBenefCompComponent, {
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

  inactivarPersona(idPersona: number, idCausante: number) {
    this.svcAfiliado.inactivarPersona(idPersona, idCausante).subscribe(
      () => {
        this.toastr.success('Persona inactivada exitosamente');
        this.getFilas().then(() => this.cargar());
      },
      (error) => {
        this.toastr.error('Error al inactivar persona');
        console.error('Error al inactivar persona', error);
      }
    );
  }

  openDialog(campos: any, row: any): void {
    const dialogRef = this.dialog.open(EditarDialogComponent, {
      width: '500px',
      data: { campos: campos, valoresIniciales: row }
    });

    dialogRef.afterClosed().subscribe((result: any) => {
      if (result) {

        const [primer_nombre, segundo_nombre, tercer_nombre] = result.nombres.split(' ');
        const [primer_apellido, segundo_apellido] = result.apellidos.split(' ');

        const fecha_nacimiento = this.datePipe.transform(result.fecha_nacimiento, 'dd-MM-yyyy') || '';

        const updatedBeneficiario = {
          id_pais: result.idPaisNacionalidad,
          dni: result.dni,
          primer_nombre,
          segundo_nombre: segundo_nombre || '',
          tercer_nombre: tercer_nombre || '',
          primer_apellido,
          segundo_apellido: segundo_apellido || '',
          genero: result.genero,
          sexo: result.sexo,
          cantidad_dependientes: result.cantidad_dependientes,
          telefono_1: result.telefono_1,
          fecha_nacimiento,
          direccion_residencia: result.direccion_residencia,
          id_municipio_residencia: result.id_municipio_residencia,
          id_estado_persona: result.id_estado_persona,
          porcentaje: result.porcentaje
        };

        this.svcAfiliado.updateBeneficiario(row.id, updatedBeneficiario).subscribe(
          (response) => {
            this.toastr.success('Beneficiario actualizado exitosamente');
            this.getFilas().then(() => {
              const index = this.filas.findIndex((fila) => fila.id === row.id);
              if (index !== -1) {
                this.filas[index] = { ...this.filas[index], ...updatedBeneficiario };
                this.cargar();
              }
            });
          },
          (error) => {
            this.toastr.error('Error al actualizar el beneficiario');
            console.error('Error al actualizar el beneficiario', error);
          }
        );
      }
    });
  }

  /* get porcentajes() {
    return this.formParent.get('beneficiario') as FormArray;
  }

  validateTotalPercentage() {

  }
  suma100Validator(): any {
    return (control: FormControl) => {
      const valor = control.value;
      const beneficiarioArray = this.formParent.get('beneficiario') as FormArray;
      const totalPercentage = beneficiarioArray.controls.reduce((total, control) => {
        return total + (control.get('beneficiario')?.value || 0);
      }, 0);

      //this.formParent.setErrors({ 'invalidPercentage': true });
      console.log(this.formParent);
      if (totalPercentage !== 100) {
        return { sumaNo100: true };

        this.formParent.setErrors({ 'invalidPercentage': true });
      } else {
        return { sumaNo100: false };
        this.formParent.setErrors({ 'invalidPercentage': false });
      }
    };
  } */
}
