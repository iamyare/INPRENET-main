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
export class NuevaDeduccionAfilComponent{
  @ViewChild(DynamicFormComponent) dynamicForm!: DynamicFormComponent;
  data:any
  filas:any
  tiposDeducciones:any = [];
  instituciones:any = [];
  nameAfil:string = ""
  Afiliado:any
  public myFormFields: FieldConfig[] = []

  isChecked = true;
  formGroup = this._formBuilder.group({
    enableWifi: '',
    acceptTerms: ['', Validators.requiredTrue],
  });

  constructor(
    private deduccionesService : DeduccionesService,
    private svcAfilServ: AfiliadoService,
    private toastr: ToastrService,
    private fb: FormBuilder,
    private _formBuilder: FormBuilder,
    private institucionesService:InstitucionesService
  ){
    this.obtenerDatos1();
  }

  alertFormValues(formGroup: FormGroup) {

    alert(JSON.stringify(formGroup.value, null, 2));
  }


  obtenerDatos(event:any):any{
    this.data = event;
    this.getFilasAfilById();
  }

  obtenerDatos1():any{
    this.getTiposDeducciones();
    this.getInstituciones();
    this.myFormFields = [
      { type: 'text', label: 'DNI', name: 'dni', validations: [Validators.required], display:true },
      {
        type: 'dropdown', label: 'Nombre de deduccion', name: 'nombre_deduccion',
        options: this.tiposDeducciones,
        validations: [Validators.required], display:true
      },
      {
        type: 'dropdown', label: 'Nombre de institucion', name: 'nombre_institucion',
        options: this.instituciones,
        validations: [Validators.required], display:true
      },
      { type: 'number', label: 'Monto total', name: 'monto_total', validations: [Validators.required,Validators.pattern("^\\d*\\.?\\d+$")], display:true },
      { type: 'number', label: 'Año', name: 'anio', validations: [Validators.required, Validators.pattern("^\\d*\\.?\\d+$")], display:true },
      { type: 'number', label: 'Mes', name: 'mes', validations: [Validators.required ,Validators.pattern("^\\d*\\.?\\d+$")], display:true },
    ];
  }


  getTiposDeducciones = async () => {
    try {
      const data = await this.deduccionesService.getDeducciones().toPromise();
      this.filas = data.map((item: any) => {
        this.tiposDeducciones.push({ label: `${item.nombre_deduccion}`, value: `${item.nombre_deduccion}` })
        return {
          id: item.id_deduccion,
          nombre_deduccion: item.nombre_deduccion,
          descripcion_deduccion: item.descripcion_deduccion || 'No disponible',
          tipo_deduccion: item.nombre_deduccion,
          prioridad: item.prioridad,
        };
      });
      return this.filas;
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

  getFilasAfilById = async () => {
    await this.svcAfilServ.getAfilByParam(this.data.value.dni).subscribe(result => {
      this.Afiliado = result;
      this.nameAfil = this.unirNombres(result.primer_nombre,result.segundo_nombre, result.tercer_nombre, result.primer_apellido,result.segundo_apellido);
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

async previsualizarInfoAfil(){
  this.Afiliado.nameAfil = ""
  if (this.data.value.dni){
    /* SOLO RETORNA LOS AFILIADOS SIN BENEFICIARIOS Y SIN IMPORTAR EL ESTADO: ACTIVO, FALLECIDO, ETC. */
    await this.svcAfilServ.getAfilByParam(this.data.value.dni).subscribe(
      (result) => {
        this.Afiliado = result
        this.Afiliado.nameAfil = this.unirNombres(result.primer_nombre,result.segundo_nombre, result.tercer_nombre, result.primer_apellido,result.segundo_apellido);

        //this.toastr.success('TipoPlanilla editada con éxito');
      },
      (error) => {
        this.Afiliado.estado = ""
        this.toastr.error(`Error: ${error.error.message}`);
    })


  }
}

guardarDetalleDeduccion(){
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
      let data: any[][] = XLSX.utils.sheet_to_json(ws, { header: 1, raw: false, defval: null }) as any[][];

      // Elimina filas completamente vacías
      data = data.filter(row => row.some(cell => cell != null && cell.toString().trim() !== ''));

      // Encuentra la primera fila con columnas vacías y sus posiciones
      let errorDetails = [];
      for (let i = 0; i < data.length; i++) {
        let emptyColumns = data[i].reduce((acc, cell, index) => {
          if (cell == null || cell.toString().trim() === '') {
            acc.push(index + 1); // Asume que la numeración de columnas comienza en 1
          }
          return acc;
        }, []);

        if (emptyColumns.length > 0) {
          errorDetails.push({ row: i + 1, columns: emptyColumns });
          break; // Detiene el bucle después de encontrar la primera fila con errores
        }
      }

      if (errorDetails.length > 0) {
        let message = `Error en la fila ${errorDetails[0].row}: las columnas ${errorDetails[0].columns.join(', ')} están vacías.`;
        this.toastr.error(message, 'Error en la carga');
        this.resetState();
        return;
      }

      console.log("Datos procesados del archivo Excel:", data);

      this.progressValue = 100; // Completa la barra de progreso asumiendo la carga exitosa
      this.toastr.success('Todos los datos se cargaron correctamente.', 'Carga exitosa');
      this.resetState();
    };

    reader.onerror = (error) => {
      this.toastr.error('Ocurrió un error al leer el archivo. Asegúrate de que el formato del archivo sea correcto.', 'Error');
      this.resetState();
    };

    reader.readAsBinaryString(this.file as Blob);
  }

  cancelUpload() {
    if (this.uploadInterval) {
      clearInterval(this.uploadInterval); // Detiene el intervalo
      this.uploadInterval = null; // Limpia la referencia
    }

    this.isUploading = false; // Marca la subida como no en progreso
    this.progressValue = 0; // Opcional: restablece la barra de progreso

    // Opcional: Lógica adicional en caso de cancelación...
  }

  resetState() {
    this.isUploading = false;
    this.progressValue = 0;
    this.file = null;
    if (this.fileInput && this.fileInput.nativeElement) {
      this.fileInput.nativeElement.value = '';
    }
  }

  limpiarFormulario(): void {
    // Utiliza la referencia al componente DynamicFormComponent para resetear el formulario
    if (this.dynamicForm) {
      this.dynamicForm.form.reset();
    }
  }

}

