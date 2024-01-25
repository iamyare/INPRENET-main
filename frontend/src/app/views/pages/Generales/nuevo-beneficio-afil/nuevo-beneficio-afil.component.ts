import { Component } from '@angular/core';
import { ValidatorFn, Validators } from '@angular/forms';
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

  constructor( private svcBeneficioServ: BeneficiosService,
    private svcAfilServ: AfiliadoService,
    private toastr: ToastrService){
    this.obtenerDatos1();
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
      throw error; // Puedes manejar el error aquí o dejarlo para que se maneje en el componente que llama a esta función
    }
  };

  getFilasAfilById = async () => {
    this.nameAfil = ""
    try {
      await this.svcAfilServ.getAfilByParam(this.data.dni).subscribe(
        {
          next: (result)=>{
            if (result.id_afiliado!=""){
              if (result.segundo_nombre || result.segundo_apellido){
                this.nameAfil = `${result.primer_nombre} ${result.segundo_nombre} ${result.primer_apellido} ${result.segundo_apellido}`
              }else if (result.primer_nombre && result.primer_apellido){
                this.nameAfil = `${result.primer_nombre}  ${result.primer_apellido}`
              }
            }
          },
          error: (error)=>{
            /* this.toastr.error(`${error.error.message}`); */
          }
        })
    } catch (error) {
      console.log(error);
    }
  }

  async guardarNTBenef(){
      if (this.nameAfil!=""){
        await this.svcBeneficioServ.asigBeneficioAfil(this.data).subscribe(
          {
            next: (response)=>{
              this.toastr.success("se asigno correctamente el beneficio")
            },
            error: (error)=>{
              this.toastr.error(`${error.error.message}`);
            }
          })
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
