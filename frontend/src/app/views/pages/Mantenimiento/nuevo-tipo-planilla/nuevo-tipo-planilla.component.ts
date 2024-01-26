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

  obtenerDatos(event: any): any {

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





  insertarDatos(): void {
  this.planillaService.createTipoPlanilla(this.datosFormateados).subscribe({
    next: (response) => {
      this.toastr.success('TipoPlanilla creada con éxito');
    },
    error: (error) => {
      let mensajeError = 'Error desconocido al crear TipoPlanilla';

      if (error.error && error.error.message) {
        mensajeError = error.error.message;
      } else if (typeof error.error === 'string') {
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
