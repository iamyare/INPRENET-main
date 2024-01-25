import { Component } from '@angular/core';
import { ValidatorFn, Validators } from '@angular/forms';
import { ToastrService } from 'ngx-toastr';
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
    console.log(this.data);
    this.getFilasAfilById();
  }

  obtenerDatos1():any{
    this.getFilas();
    this.myFormFields = [
      {
        type: 'dropdown', label: 'Tipo de beneficio', name: 'tipo_beneficio',
        options: this.tiposBeneficios,
        validations: []
      },
      { type: 'text', label: 'DNI', name: 'dni', validations: [] },
    ];
  }

  getFilas = async () => {
    try {
      const data = await this.svcBeneficioServ.getTipoBeneficio().toPromise();
      this.filas = data.map((item: any) => {
        this.tiposBeneficios.push({ label: `${item.nombre_beneficio}`, value: `${item.id_beneficio}` })
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
      await this.svcAfilServ.getAfilByParam(this.data.dni).subscribe(result => {
        this.nameAfil = `${result.primer_nombre} ${result.segundo_nombre} ${result.primer_apellido} ${result.segundo_apellido}`
      }
      );

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
