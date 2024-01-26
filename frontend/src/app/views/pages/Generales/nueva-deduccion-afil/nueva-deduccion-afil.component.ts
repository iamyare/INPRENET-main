import { Component } from '@angular/core';
import { ValidatorFn, Validators } from '@angular/forms';
import { ToastrService } from 'ngx-toastr';
import { AfiliadoService } from 'src/app/services/afiliado.service';
import { DeduccionesService } from 'src/app/services/deducciones.service';
import { InstitucionesService } from '../../../../services/instituciones.service';

@Component({
  selector: 'app-nueva-deduccion-afil',
  templateUrl: './nueva-deduccion-afil.component.html',
  styleUrl: './nueva-deduccion-afil.component.scss'
})
export class NuevaDeduccionAfilComponent{
  data:any
  filas:any
  tiposDeducciones:any = [];
  instituciones:any = [];
  nameAfil:string = ""
  public myFormFields: FieldConfig[] = []



  constructor(
    private deduccionesService : DeduccionesService,
    private svcAfilServ: AfiliadoService,
    private toastr: ToastrService,
    private institucionesService:InstitucionesService
  ){
    this.obtenerDatos1();
  }


  obtenerDatos(event:any):any{
    this.data = event;
    this.getFilasAfilById();
  }

  obtenerDatos1():any{
    this.getTiposDeducciones();
    this.getInstituciones();
    this.myFormFields = [
      { type: 'text', label: 'DNI', name: 'dni', validations: [Validators.required] },
      {
        type: 'dropdown', label: 'Nombre de deduccion', name: 'nombre_deduccion',
        options: this.tiposDeducciones,
        validations: [Validators.required]
      },
      {
        type: 'dropdown', label: 'Nombre de institucion', name: 'nombre_institucion',
        options: this.instituciones,
        validations: [Validators.required,]
      },
      { type: 'number', label: 'Monto total', name: 'monto_total', validations: [Validators.required,Validators.pattern("^\\d*\\.?\\d+$")] },
      { type: 'number', label: 'Año', name: 'anio', validations: [Validators.required, Validators.pattern("^\\d*\\.?\\d+$")] },
      { type: 'number', label: 'Mes', name: 'mes', validations: [Validators.required ,Validators.pattern("^\\d*\\.?\\d+$")] },
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

guardarDetalleDeduccion(){
  console.log(this.data.value);

  this.deduccionesService.createDetalleDeduccion(this.data.value).subscribe(
    {
      next: (response) => {
        this.toastr.success('Detalle de deduccion creado con éxito');
      },
      error: (error) => {
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
    }
    );
}

onFileSelect(event: any) {
  if (event.target.files.length > 0) {
    const file = event.target.files[0];
    this.deduccionesService.uploadDetalleDeduccion(file).subscribe({
      next: (res) => {
        console.log('Upload successful', res);
      },
      error: (err) => {
        console.error('Upload failed', err);
      }
    });
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
