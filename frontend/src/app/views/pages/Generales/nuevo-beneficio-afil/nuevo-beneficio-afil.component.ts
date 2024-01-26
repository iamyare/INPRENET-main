import { Component } from '@angular/core';
import { FormBuilder, FormGroup, ValidatorFn, Validators } from '@angular/forms';
import { ToastrService, ToastrModule } from 'ngx-toastr';
import { AfiliadoService } from 'src/app/services/afiliado.service';
import { BeneficiosService } from 'src/app/services/beneficios.service';
@Component({
  selector: 'app-nuevo-beneficio-afil',
  templateUrl: './nuevo-beneficio-afil.component.html',
  styleUrl: './nuevo-beneficio-afil.component.scss'
})
export class NuevoBeneficioAfilComponent {
  data:any
  filas:any
  tiposBeneficios:any = []
  nameAfil:string = ""
  public myFormFields: FieldConfig[] = []

  isChecked = true;
  formGroup = this._formBuilder.group({
    enableWifi: '',
    acceptTerms: ['', Validators.requiredTrue],
  });

  constructor( private svcBeneficioServ: BeneficiosService,
    private svcAfilServ: AfiliadoService,
    private fb: FormBuilder,
    private toastr: ToastrService,
    private _formBuilder: FormBuilder
    ){
    this.obtenerDatos1();
  }

  alertFormValues(formGroup: FormGroup) {
    console.log(formGroup);

    alert(JSON.stringify(formGroup.value, null, 2));
  }

  obtenerDatos(event:any):any{
      this.data = event;
      this.getFilasAfilById();
    }

  obtenerDatos1():any{
    this.getFilas();
    this.myFormFields = [
      {
        type: 'dropdown', label: 'Tipo de beneficio', name: 'tipo_beneficio',
        options: this.tiposBeneficios,
        validations: [Validators.required]
      },
      { type: 'text', label: 'DNI', name: 'dni', validations: [Validators.required, Validators.minLength(13), Validators.maxLength(14)] },
    ];
  }

  getFilas = async () => {
    try {
      const data = await this.svcBeneficioServ.getTipoBeneficio().toPromise();
      this.filas = data.map((item: any) => {
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
      return this.filas;
    } catch (error) {
      console.error("Error al obtener datos de beneficios", error);
    }
  };

  getFilasAfilById = async () => {
    this.nameAfil = ""
    await this.svcAfilServ.getAfilByParam(this.data.value.dni).subscribe(result => {
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

   guardarNTBenef(){
         this.svcBeneficioServ.asigBeneficioAfil(this.data.value).subscribe(
          {
            next: (response)=>{
              this.toastr.success("se asigno correctamente el beneficio")
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


}

interface FieldConfig {
  type: string;
  label: string;
  name: string;
  value?: any;
  options?: { label: string; value: any }[];
  validations?: ValidatorFn[];
}
