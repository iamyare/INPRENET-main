import { DatePipe } from '@angular/common';
import { Component, Input } from '@angular/core';
import { Validators } from '@angular/forms';
import { MatDialog } from '@angular/material/dialog';
import { AgregarReferenciasPersonalesComponent } from '@docs-components/agregar-referencias-personales/agregar-referencias-personales.component';
import { ConfirmDialogComponent } from '@docs-components/confirm-dialog/confirm-dialog.component';
import { EditarDialogComponent } from '@docs-components/editar-dialog/editar-dialog.component';
import { NewFamiliaresComponent } from '@docs-components/new-familiares/new-familiares.component';
import { ToastrService } from 'ngx-toastr';
import { AfiliadoService } from 'src/app/services/afiliado.service';
import { DatosEstaticosService } from 'src/app/services/datos-estaticos.service';
import { FieldConfig } from 'src/app/shared/Interfaces/field-config';
import { TableColumn } from 'src/app/shared/Interfaces/table-column';
import { convertirFechaInputs } from 'src/app/shared/functions/formatoFecha';
import { unirNombres } from 'src/app/shared/functions/formatoNombresP';

@Component({
  selector: 'app-edit-familiares',
  templateUrl: './edit-familiares.component.html',
  styleUrl: './edit-familiares.component.scss',
  providers: [DatePipe]
})
export class EditFamiliaresComponent {
  convertirFechaInputs = convertirFechaInputs
  public myFormFields: FieldConfig[] = []
  form: any;
  unirNombres: any = unirNombres;
  datosTabl: any[] = [];
  prevAfil: boolean = false;
  listaParentesco: any;


  public myColumns: TableColumn[] = [];
  public filas: any[] = [];
  ejecF: any;
  @Input() Afiliado: any;
  constructor(
    private svcAfiliado: AfiliadoService,
    private toastr: ToastrService,
    private dialog: MatDialog,
    private datosEstaticosService: DatosEstaticosService,
    private datePipe: DatePipe
  ) { }

  ngOnInit(): void {

    this.listaParentesco = this.datosEstaticosService.parentesco;
    this.myFormFields = [
      { type: 'text', label: 'DNI del afiliado', name: 'dni', validations: [Validators.required, Validators.minLength(13), Validators.maxLength(14)], display: true },
    ];
    this.myColumns = [
      {
        header: 'Nombres',
        col: 'nombres',
        isEditable: true,
        validationRules: [Validators.required, Validators.minLength(3)]
      },
      {
        header: 'Apellidos',
        col: 'apellidos',
        isEditable: true,
        validationRules: [Validators.required, Validators.minLength(3)]
      },
      {
        header: 'DNI',
        col: 'dni',
        isEditable: true
      },
      {
        header: 'Fecha de nacimiento',
        col: 'fechaNacimiento',
        isEditable: true
      },
      {
        header: 'Parentesco',
        col: 'parentesco',
        isEditable: true
      }
    ];

    this.previsualizarInfoAfil();
    this.getFilas().then(() => this.cargar());
  }

  async obtenerDatos(event: any): Promise<any> {
    this.form = event;
  }

  previsualizarInfoAfil() {
    if (this.Afiliado.DNI) {

      this.svcAfiliado.getAfilByParam(this.Afiliado.DNI).subscribe(
        async (result) => {
          this.prevAfil = true;
          this.Afiliado = result
          this.Afiliado.nameAfil = this.unirNombres(result.PRIMER_NOMBRE, result.SEGUNDO_NOMBRE, result.TERCER_NOMBRE, result.PRIMER_APELLIDO, result.SEGUNDO_APELLIDO);
          this.getFilas().then(() => this.cargar());
        },
        (error) => {
          this.resetDatos();
          this.getFilas().then(() => this.cargar());
          this.toastr.error(`Error: ${error.error.message}`);
        })
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
        const data = await this.svcAfiliado.getAllFamiliares(this.Afiliado.DNI).toPromise();

        this.filas = data.map((item: any) => {
          const nombres = [item.primerNombre, item.segundoNombre, item.tercerNombre].filter(part => part).join(' ');
          const apellidos = [item.primerApellido, item.segundoApellido].filter(part => part).join(' ');

          const fechaNacimiento = this.datePipe.transform(item.fechaNacimiento, 'dd/MM/yyyy') || 'Fecha no disponible';
          const parentesco = item.parentesco || 'Parentesco no disponible';
          const dni = item.dni || 'DNI no disponible';

          return {
            nombres,
            apellidos,
            fechaNacimiento,
            parentesco,
            dni
          };
        });
      } catch (error) {
        this.toastr.error('Error al cargar los datos de los familiares');
        console.error('Error al obtener datos de los familiares', error);
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

  manejarAccionUno(row: any) {
    const campos = [
      {
        nombre: 'nombres',
        tipo: 'text',
        etiqueta: 'Nombres',
        editable: true,
        icono: 'person',
        validadores: [
          Validators.required,
          Validators.minLength(2),
          Validators.maxLength(120),
          Validators.pattern(/^[^\s]+(\s[^\s]+){0,2}$/)
        ]
      },
      {
        nombre: 'apellidos',
        tipo: 'text',
        etiqueta: 'Apellidos',
        editable: true,
        icono: 'person_outline',
        validadores: [
          Validators.required,
          Validators.minLength(2),
          Validators.maxLength(80),
          Validators.pattern(/^[^\s]+(\s[^\s]+)?$/)
        ]
      },
      {
        nombre: 'fechaNacimiento',
        tipo: 'date',
        etiqueta: 'Fecha de nacimiento',
        editable: true,
        icono: 'calendar_today',
        validadores: [
          Validators.required,
        ]
      },
      {
        nombre: 'dni',
        tipo: 'text',
        etiqueta: 'Número de identidad',
        editable: true,
        icono: 'badge',
        validadores: [
          Validators.required,
          Validators.pattern(/^[0-9]{13}$|^[0-9]{4}-[0-9]{4}-[0-9]{5}$/)
        ]
      },
      {
        nombre: 'parentesco',
        tipo: 'list',
        etiqueta: 'Parentesco',
        editable: true,
        icono: 'supervisor_account',
        opciones: this.listaParentesco,
        validadores: [Validators.required]
      }
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
        const [primerNombre, segundoNombre, tercerNombre = ''] = result.nombres.split(' ');
        const [primerApellido, segundoApellido = ''] = result.apellidos.split(' ');
        const dataToSend = {
          primerNombre,
          segundoNombre,
          tercerNombre,
          primerApellido,
          segundoApellido,
          fechaNacimiento: result.fechaNacimiento,
          dni: result.dni,
          parentesco: result.parentesco
        };

        this.svcAfiliado.updateVinculoFamiliar(this.Afiliado.DNI, row.dni, dataToSend).subscribe({
          next: (response) => {
            this.toastr.success('Vínculo familiar actualizado con éxito.');
            const index = this.filas.findIndex(item => item.dni === row.dni);
            if (index !== -1) {
              const fechaFormateada = this.datePipe.transform(result.fechaNacimiento, 'dd/MM/yyyy') || 'Fecha no disponible';
              this.filas[index] = {
                ...this.filas[index],
                ...result,
                fechaNacimiento: fechaFormateada
              };
            }
            this.cargar();
          },
          error: (error) => {
            console.error('Error al actualizar el vínculo familiar:', error);
            this.toastr.error('Error al actualizar el vínculo familiar.');
          }
        });
      } else {
        console.log('Edición cancelada.');
      }
    });
  }


  crearFamiliar() {
    const dialogRef = this.dialog.open(NewFamiliaresComponent, {
      width: '60%',
      height: '75%',
      data: {
        dniPersona: this.Afiliado.DNI,
        idPersona: this.Afiliado.ID_PERSONA
      }
    });

    dialogRef.afterClosed().subscribe((result: any) => {
      this.ngOnInit();
    });
  }

  descomponerNombres(nombres: string): string[] {
    return nombres.split(' ').concat(['', '', '']).slice(0, 3);
  }

  descomponerApellidos(apellidos: string): string[] {
    return apellidos.split(' ').concat(['', '']).slice(0, 2);
  }
}
