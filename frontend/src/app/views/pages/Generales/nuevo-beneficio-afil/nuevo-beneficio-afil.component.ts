import { Component, OnInit, ViewChild } from '@angular/core';
import { FormBuilder, FormGroup, ValidatorFn, Validators } from '@angular/forms';
import { DynamicFormComponent } from '@docs-components/dynamic-form/dynamic-form.component';
import { ToastrService, ToastrModule } from 'ngx-toastr';
import { AfiliadoService } from 'src/app/services/afiliado.service';
import { BeneficiosService } from 'src/app/services/beneficios.service';
import { FieldConfig } from 'src/app/shared/Interfaces/field-config';
@Component({
  selector: 'app-nuevo-beneficio-afil',
  templateUrl: './nuevo-beneficio-afil.component.html',
  styleUrl: './nuevo-beneficio-afil.component.scss'
})
export class NuevoBeneficioAfilComponent implements OnInit{
  @ViewChild(DynamicFormComponent) dynamicForm!: DynamicFormComponent;
  form:any
  datosFormateados: any;
  tiposBeneficios:any = []
  public myFormFields: FieldConfig[] = []
  Afiliado:any = {}

  formGroup = this._formBuilder.group({
    acceptTerms: ['', Validators.requiredTrue],
  });


  myColumns:any = []
  filas:any

  constructor(
    private svcBeneficioServ: BeneficiosService,
    private svcAfilServ: AfiliadoService, private fb: FormBuilder,
    private toastr: ToastrService, private _formBuilder: FormBuilder
  ){}

  ngOnInit(): void {
    this.getTipoBen();
    this.myFormFields = [
      { type: 'text', label: 'DNI', name: 'dni', validations: [Validators.required, Validators.minLength(13), Validators.maxLength(14)] },
      { type: 'daterange', label: 'Periodo', name: 'periodo', validations: [Validators.required]},
      {
        type: 'dropdown', label: 'Tipo de beneficio', name: 'nombre_beneficio',
        options: this.tiposBeneficios,
        validations: [Validators.required]
      },
      { type: 'number', label: 'Monto total', name: 'monto_total', validations: [Validators.required]},
      { type: 'dropdown', label: 'Metodo de pago', name: 'metodo_pago',
       options : [{label:'Cheque', value: 'Cheque'}, {label:'Transferencia', value: 'Transferencia' }] ,validations: [Validators.required]},
      { type: 'number', label: 'Monto por periodo', name: 'monto_por_periodo', validations: [Validators.required]},

    ];
  }

  getTipoBen = async () => {
    try {
      const beneficios = await this.svcBeneficioServ.getTipoBeneficio().toPromise();

      const tiposBen = beneficios.map((item: any) => {
        this.tiposBeneficios.push({ label: `${item.nombre_beneficio}`, value: `${item.nombre_beneficio}` })
        return {
          id: item.id_beneficio,
          nombre_beneficio: item.nombre_beneficio,
          descripcion_beneficio: item.descripcion_beneficio || 'No disponible',
          estado: item.estado,
          prioridad: item.prioridad,
          monto_beneficio: item.monto_beneficio,
          porcentaje_beneficio: item.porcentaje_beneficio,
          anio_duracion: item.anio_duracion,
          mes_duracion: item.mes_duracion,
          dia_duracion: item.dia_duracion,
        };
      });

      return tiposBen;
    } catch (error) {
      console.error("Error al obtener datos de beneficios", error);
    }
  };

  async obtenerDatos(event:any):Promise<any>{
    this.form = event;

    if (event?.value.periodo) {
      const startDate = new Date(event.value.periodo.start);
      const endDate = new Date(event.value.periodo.end);

      const opciones: Intl.DateTimeFormatOptions = {
        year: 'numeric',
        month: '2-digit',
        day: '2-digit'
      };

      const startDateFormatted = startDate.toLocaleDateString('es', opciones).replace(/\//g, '-');
      const endDateFormatted = endDate.toLocaleDateString('es', opciones).replace(/\//g, '-');

      // Preparar los datos formateados, excluyendo 'periodo'
      const datosFormateados = {
        ...event.value,
        periodoInicio: startDateFormatted,
        periodoFinalizacion: endDateFormatted
      };
      delete datosFormateados.periodo;
        this.datosFormateados = datosFormateados;
    } else {
        console.error('La propiedad periodo no está definida en el evento');
    }

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
    if (this.form.value.dni){
      /* SOLO RETORNA LOS AFILIADOS SIN BENEFICIARIOS Y SIN IMPORTAR EL ESTADO: ACTIVO, FALLECIDO, ETC. */
      await this.svcAfilServ.getAfilByParam(this.form.value.dni).subscribe(
        (result) => {
          this.Afiliado = result
          console.log(this.Afiliado);
          this.Afiliado.nameAfil = this.unirNombres(result.primer_nombre,result.segundo_nombre, result.tercer_nombre, result.primer_apellido,result.segundo_apellido);

          //this.toastr.success('TipoPlanilla editada con éxito');
        },
        (error) => {
          this.Afiliado.estado = ""
          this.toastr.error(`Error: ${error.error.message}`);
      })


    }
  }

  getColumns = async () => {
    try {

      await this.svcAfilServ.obtenerBenDeAfil(this.form.value.dni).subscribe(
        (response) => {
          const primerObjetoTransformado = this.transformarObjeto(response[0]);
          this.myColumns = primerObjetoTransformado;
          //this.toastr.success('TipoPlanilla editada con éxito');
        },
        (error) => {
          //this.toastr.error('Error al actualizar TipoPlanilla');
      })

    } catch (error) {
      console.log(error);
    }
  }

  getFilas = async () => {
    if (this.Afiliado.estado == "FALLECIDO"){
      try {
        await this.getColumns();
        const data = this.svcAfilServ.obtenerBenDeAfil(this.form.value.dni).toPromise();
        this.filas = data


        return this.filas;
      } catch (error) {
        console.error("Error al obtener datos de beneficios", error);
        throw error;
      }
      /*
      Servicio que traera la informacion de los beneficiarios pertenecientes al afiliado anterior sin importar el estado de los beneficiarios.
      */
    }
  };

  transformarObjeto(objeto:any) {
    return Object.keys(objeto).map(key => {
      return {
        header: key,
        col: key,
        isEditable: false,
      };
    });
  }

  guardarNTBenef(){
    /* Asignar al afiliado si no ha fallecido */
    /* Asignar a los beneficioarios si el afiliado ya fallecio */
    console.log(this.datosFormateados);

    if (this.Afiliado.estado != "FALLECIDO"){
      this.svcBeneficioServ.asigBeneficioAfil(this.datosFormateados).subscribe(
       {
         next: (response)=>{
           this.toastr.success("se asigno correctamente el beneficio");
           this.limpiarFormulario()
         },
         error: (error)=>{
           let mensajeError = 'Error desconocido al crear Detalle de deduccion';
           // Verifica si el error tiene una estructura específica
           if (error.error && error.error.message) {
             mensajeError = error.error.message;
           } else if (typeof error.error === 'string') {
           // Para errores que vienen como un string simple
             mensajeError = error.error;
           }
           this.toastr.error(mensajeError);
         }
       })
    }else{
      console.log(this.Afiliado);
      console.log(this.filas);
    }
  }

  onFileSelect(event: any) {
    if (event.target.files.length > 0) {
      const file = event.target.files[0];
/*       this.deduccionesService.uploadDetalleDeduccion(file).subscribe({
        next: (res: any) => {
          console.log('Upload successful', res);
        },
        error: (err: any) => {
          console.error('Upload failed', err);
        }
      }); */
    }
  }

  limpiarFormulario(): void {
    // Utiliza la referencia al componente DynamicFormComponent para resetear el formulario
    if (this.dynamicForm) {
      this.dynamicForm.form.reset();
    }
  }
}
