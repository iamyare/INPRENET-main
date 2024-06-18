import { Component, ElementRef, ViewChild } from '@angular/core';
import { FormBuilder, FormGroup, ValidatorFn, Validators } from '@angular/forms';
import { ToastrService } from 'ngx-toastr';
import { AfiliadoService } from 'src/app/services/afiliado.service';
import { DeduccionesService } from 'src/app/services/deducciones.service';
import { InstitucionesService } from '../../../../services/instituciones.service';
import { Subject, takeUntil } from 'rxjs';
import * as XLSX from 'xlsx';
import { FieldConfig } from '../../../../shared/Interfaces/field-config';
import { DynamicFormComponent } from '@docs-components/dynamic-form/dynamic-form.component';

@Component({
  selector: 'app-nueva-deduccion-afil',
  templateUrl: './nueva-deduccion-afil.component.html',
  styleUrl: './nueva-deduccion-afil.component.scss'
})
export class NuevaDeduccionAfilComponent {
  @ViewChild(DynamicFormComponent) dynamicForm!: DynamicFormComponent;
  data: any
  filas: any
  tiposDeducciones: any = [];
  instituciones: any = [];
  nameAfil: string = ""
  Afiliado: any
  public myFormFields: FieldConfig[] = []

  isChecked = true;
  formGroup = this._formBuilder.group({
    enableWifi: '',
    acceptTerms: ['', Validators.requiredTrue],
  });

  constructor(
    private deduccionesService: DeduccionesService,
    private svcAfilServ: AfiliadoService,
    private toastr: ToastrService,
    private fb: FormBuilder,
    private _formBuilder: FormBuilder,
    private institucionesService: InstitucionesService
  ) {
    this.obtenerDatos1();
  }

  alertFormValues(formGroup: FormGroup) {
    alert(JSON.stringify(formGroup.value, null, 2));
  }


  async obtenerDatos(event: any): Promise<any> {
    this.data = event;

    if (this.data.value.nombre_institucion) {
      await this.getTiposDeducciones(this.data.value.nombre_institucion);
    }
    if (this.data.value.dni) {
      this.getFilasAfilById();
    }
  }

  obtenerDatos1(): any {
    this.getInstituciones();
    this.myFormFields = [
      { type: 'text', label: 'DNI', name: 'dni', validations: [Validators.required], display: true },
      {
        type: 'dropdown', label: 'Nombre de institucion', name: 'nombre_institucion',
        options: this.instituciones,
        validations: [Validators.required], display: true
      },
      {
        type: 'dropdown', label: 'Nombre de deduccion', name: 'nombre_deduccion',
        options: [], // Deja los tipos de deducción inicialmente vacíos
        validations: [Validators.required], display: true
      },
      { type: 'number', label: 'Monto total', name: 'monto_total', validations: [Validators.required, Validators.pattern("^\\d*\\.?\\d+$")], display: true },
      { type: 'number', label: 'Año', name: 'anio', validations: [Validators.required, Validators.pattern("^\\d*\\.?\\d+$")], display: true },
      { type: 'number', label: 'Mes', name: 'mes', validations: [Validators.required, Validators.pattern("^\\d*\\.?\\d+$")], display: true },
    ];
  }

  getTiposDeducciones = async (nombre_institucion: string): Promise<void> => {
    try {
      const response = await this.deduccionesService.getDeduccionesByEmpresa(nombre_institucion).toPromise();
      const field = this.myFormFields.find(field => field.name === 'nombre_deduccion');
      if (field) {
        if (response.length > 0) {
          const temp = response.map((item: any) => {
            return {
              label: item.NOMBRE_DEDUCCION,
              value: item.NOMBRE_DEDUCCION
            };
          });
          field.options = temp;
        } else {
          field.options = []
        }
      } else {
        console.error("No se encontró el campo 'nombre_deduccion' en myFormFields");
      }

    } catch (error) {
      console.error("Error al obtener datos de deduccion", error);
    }
  };

  getInstituciones = async () => {
    try {
      const data = await this.institucionesService.getInstituciones().toPromise();
      this.filas = data.map((item: any) => {
        this.instituciones.push({ label: `${item.nombre_institucion}`, value: `${item.nombre_institucion}` })
        return {
          id: item.id_institucion,
          nombre_institucion: item.nombre_institucion,
        };
      });
      return this.filas;

    } catch (error) {
      console.error("Error al obtener datos de instituciones", error);
    }
  }

  getTipAfi() {
    return this.tiposDeducciones;
  }

  getFilasAfilById = async () => {
    await this.svcAfilServ.getAfilByParam(this.data.value.dni).subscribe(result => {
      this.Afiliado = result;
      this.nameAfil = this.unirNombres(result.primer_nombre, result.segundo_nombre, result.tercer_nombre, result.primer_apellido, result.segundo_apellido);
    }
    );
  }

  unirNombres(
    primerNombre: string, segundoNombre?: string, tercerNombre?: string,
    primerApellido?: string, segundoApellido?: string
  ): string {
    let partesNombre: any = [primerNombre, segundoNombre, tercerNombre, primerApellido, segundoApellido].filter(Boolean);

    let nombreCompleto: string = partesNombre.join(' ');
    return nombreCompleto;
  }

  async previsualizarInfoAfil() {
    this.Afiliado.nameAfil = ""
    if (this.data.value.dni) {
      /* SOLO RETORNA LOS AFILIADOS SIN BENEFICIARIOS Y SIN IMPORTAR EL ESTADO: ACTIVO, FALLECIDO, ETC. */
      await this.svcAfilServ.getAfilByParam(this.data.value.dni).subscribe(
        (result) => {
          this.Afiliado = result
          this.Afiliado.nameAfil = this.unirNombres(result.primer_nombre, result.segundo_nombre, result.tercer_nombre, result.primer_apellido, result.segundo_apellido);

          //this.toastr.success('TipoPlanilla editada con éxito');
        },
        (error) => {
          this.Afiliado.estado = ""
          this.toastr.error(`Error: ${error.error.message}`);
        })
    }
  }

  guardarDetalleDeduccion() {
    this.deduccionesService.createDetalleDeduccion(this.data.value).subscribe(
      {
        next: (response) => {
          this.toastr.success('Detalle de deduccion creado con éxito');
          this.limpiarFormulario()

        },
        error: (error) => {
          let mensajeError = 'Error desconocido al crear Detalle de deduccion';
          if (error.error && error.error.message) {
            mensajeError = error.error.message;
          } else if (typeof error.error === 'string') {
            mensajeError = error.error;
          }
          this.toastr.error(mensajeError);
        }
      }
    );
  }

  /* Carga de archivos */
  file: File | null = null;
  isUploading = false;
  private cancelUploadSubject = new Subject<void>();
  progressValue = 0;
  uploadInterval: any = null;
  @ViewChild('fileInput') fileInput!: ElementRef;
  datosCargados: any[] = [];
  datosCargadosExitosamente: any;

  onFileSelected(event: any) {
    const target: DataTransfer = <DataTransfer>(event.target);
    if (target.files.length !== 1) {
      console.error('Cannot use multiple files');
      return;
    }
    this.file = target.files[0];
  }

  clearFile() {
    this.file = null;
    this.progressValue = 0;
    if (this.fileInput && this.fileInput.nativeElement) {
      this.fileInput.nativeElement.value = '';
    }
  }

  startUpload() {
    if (!this.file) {
      this.toastr.error('No se seleccionó ningún archivo.', 'Error');
      return;
    }

    this.isUploading = true;
    this.progressValue = 0;

    const reader: FileReader = new FileReader();
    reader.onload = (e: any) => {
      const bstr: string = e.target.result;
      const wb: XLSX.WorkBook = XLSX.read(bstr, { type: 'binary' });
      const wsname: string = wb.SheetNames[0];
      const ws: XLSX.WorkSheet = wb.Sheets[wsname];

      // Convertir hoja a un arreglo de objetos
      let data: any[] = XLSX.utils.sheet_to_json(ws, { raw: false, defval: null });

      // Filtrar filas completamente vacías
      data = data.filter(row => Object.values(row).some(cell => cell != null && cell.toString().trim() !== ''));

      // Encuentra la primera fila con columnas vacías y sus nombres
      let errorDetails: { row: number; columns: string[] }[] = [];
      data.forEach((row, rowIndex) => {
        const emptyColumns = Object.keys(row).filter(key => {
          const value = row[key];
          return value == null || value.toString().trim() === '';
        });

        if (emptyColumns.length > 0) {
          errorDetails.push({ row: rowIndex + 1, columns: emptyColumns });
        }
      });

      if (errorDetails.length > 0) {
        // Crear un mensaje de error que incluye detalles de todas las filas con problemas
        const errorMessage = errorDetails.map(error => `Error en la fila ${error.row}: las columnas ${error.columns.join(', ')} están vacías.`).join(' ');
        this.toastr.error(errorMessage, 'Error en la carga');
        this.resetState();
        return;
      }

      // Enviar datos procesados y validados al backend
      this.deduccionesService.crearDesdeExcel(data).subscribe({
        next: (response) => {
          console.log('Datos insertados exitosamente:', response);
          this.toastr.success('Todos los datos se cargaron correctamente.', 'Carga exitosa');
          this.datosCargadosExitosamente = true;
          this.resetState(); // Reiniciar estado después de la carga exitosa
        },
        error: (error) => {
          this.toastr.error('Error al cargar los datos.', 'Error de carga');
          this.datosCargadosExitosamente = false;
          this.resetState(); // Reiniciar estado en caso de error

          // Verificar si la respuesta de error contiene detalles específicos
          if (error.error && error.error.details) {
            error.error.details.forEach((detail: any) => {
              this.toastr.error(`Detalle: ${detail.message}`, 'Error Detallado');
            });
          } else {
            // Mensaje de error genérico si no hay detalles disponibles
            this.toastr.error(error.message || 'Ocurrió un error desconocido.', 'Error');
          }
        }
      });
    };

    reader.onerror = () => {
      this.toastr.error('Ocurrió un error al leer el archivo. Asegúrate de que el formato del archivo sea correcto.', 'Error');
      this.resetState(); // Reiniciar estado en caso de error de lectura
    };

    reader.readAsBinaryString(this.file as Blob);
  }

  cancelUpload() {
    if (this.uploadInterval) {
      clearInterval(this.uploadInterval); // Detiene el intervalo
      this.uploadInterval = null; // Limpia la referencia
    }

    this.isUploading = false;
    this.progressValue = 0;
  }

  resetState() {
    this.isUploading = false;
    this.progressValue = 0;
    this.file = null;
    this.datosCargados = []; // Limpia los datos cargados para evitar mostrar datos residuales
    if (this.fileInput && this.fileInput.nativeElement) {
      this.fileInput.nativeElement.value = '';
    }
  }

  limpiarFormulario(): void {
    // Utiliza la referencia al componente DynamicFormComponent para resetear el formulario
    if (this.dynamicForm) {
      this.dynamicForm.form.reset();
      this.Afiliado = [];
    }
  }
}
