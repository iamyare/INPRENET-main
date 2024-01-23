import { Component } from '@angular/core';
import { ValidatorFn, Validators } from '@angular/forms';
import { ToastrService } from 'ngx-toastr';
import { PlanillaService } from 'src/app/services/planilla.service';

@Component({
  selector: 'app-nuevo-tipo-planilla',
  templateUrl: './nuevo-tipo-planilla.component.html',
  styleUrl: './nuevo-tipo-planilla.component.scss'
})
export class NuevoTipoPlanillaComponent {

  datosFormateados: any;

  constructor(
    private planillaService: PlanillaService,
    private toastr: ToastrService
  ){

  }


  myFormFields: FieldConfig[] = [
    { type: 'daterange', label: 'Periodo', name: 'periodo', validations: [Validators.required]},
    { type: 'text', label: 'Nombre de planilla', name: 'nombre_planilla', validations: [Validators.required,Validators.maxLength(50)] },
    { type: 'text', label: 'Descripción de planilla', name: 'descripcion', validations: [] },
  ];

  obtenerDatos(event:any): any {
    const { periodo, ...otrosDatos } = event.value;
    const startDate = new Date(periodo.start);
    const endDate = new Date(periodo.end);

    const opciones: Intl.DateTimeFormatOptions = {
      year: 'numeric',
      month: '2-digit',
      day: '2-digit'
    };

    const startDateFormatted = startDate.toLocaleDateString('es', opciones).replace(/\//g, '-');
    const endDateFormatted = endDate.toLocaleDateString('es', opciones).replace(/\//g, '-');

    const datosFormateados = {
      ...otrosDatos,
      periodoInicio: startDateFormatted,
      periodoFinalizacion: endDateFormatted
    };

    this.datosFormateados = datosFormateados;

    //console.log(datosFormateados);
  }



  insertarDatos(): void {
  this.planillaService.createTipoPlanilla(this.datosFormateados).subscribe({
    next: (response) => {
      console.log('TipoPlanilla creada con éxito', response);
      this.toastr.success('TipoPlanilla creada con éxito');
    },
    error: (error) => {
      let mensajeError = 'Error desconocido al crear TipoPlanilla';

      // Verifica si el error tiene una estructura específica
      if (error.error && error.error.message) {
        mensajeError = error.error.message;
      } else if (typeof error.error === 'string') {
        // Para errores que vienen como un string simple
        mensajeError = error.error;
      }

      this.toastr.error(mensajeError);
    }
  });
}




}

interface FieldConfig {
  type: string;
  label: string;
  name: string;
  value?: any | { start: Date; end: Date };
  options?: { label: string; value: any }[];
  validations?: ValidatorFn[];
}
