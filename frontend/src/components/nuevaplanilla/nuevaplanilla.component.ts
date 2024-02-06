import { Component, OnInit} from '@angular/core';
import { FieldConfig } from '../../app/views/shared/shared/Interfaces/field-config';
import { FormBuilder, Validators } from '@angular/forms';
import { PlanillaService } from 'src/app/services/planilla.service';
import { AfiliadoService } from 'src/app/services/afiliado.service';
import { TableColumn } from 'src/app/views/shared/shared/Interfaces/table-column';

@Component({
  selector: 'app-nuevaplanilla',
  templateUrl: './nuevaplanilla.component.html',
  styleUrl: './nuevaplanilla.component.scss'
})
export class NuevaplanillaComponent implements OnInit{
  myFormFields: FieldConfig[] = [];
  filas: any;
  tiposPlanilla: any[] = [];
  datosFormateados: any;

  constructor( private _formBuilder: FormBuilder,
    private planillaService : PlanillaService,
    private svcAfilServ: AfiliadoService) {
      this.obtenerDatos1();
    }

    ngOnInit(): void {}

    getTiposPlanillas = async () => {
      try {
        const data = await this.planillaService.findAllTipoPlanilla().toPromise();
        this.filas = data.map((item: any) => {
          this.tiposPlanilla.push({ label: `${item.nombre_planilla}`, value: `${item.nombre_planilla}` })
          return {
            id: item.id_tipo_planilla,
            nombre_planilla: item.nombre_planilla,
            descripcion: item.descripcion || 'No disponible',
            periodoInicio: item.periodoInicio,
            periodoFinalizacion: item.periodoFinalizacion,
            estado: item.estado,
          };
        });
        return this.filas;
      } catch (error) {
        console.error("Error al obtener datos de Tipo Planilla", error);
      }
    };

    obtenerDatos1():any{
      this.getTiposPlanillas()
      this.myFormFields = [
        { type: 'number', label: 'Codigo De Planilla', name: 'codigo_planilla', validations: [Validators.required, Validators.pattern("^\\d*\\.?\\d+$")] },
        {
          type: 'dropdown', label: 'Nombre de Tipo planilla', name: 'nombre_planilla',
          options: this.tiposPlanilla,
          validations: [Validators.required]
        },
        { type: 'daterange', label: 'Periodo', name: 'periodo', validations: [Validators.required]},
        { type: 'number', label: 'Secuencia', name: 'secuencia', validations: [Validators.required,Validators.pattern("^\\d*\\.?\\d+$")] },
      ]
    }

/*     getFilasBenef = async (periodoInicio: string, periodoFinalizacion: string) => {
      try {
        // Asegúrate de pasar los parámetros mes y anio a la función getDeduccionesNoAplicadas
        const data = await this.planillaService.getBeneficiosNoAplicadas(periodoInicio, periodoFinalizacion).toPromise();
        this.filasBen = data.map((item: any) => {
          return {
            id_afiliado: item.id_afiliado,
            nombre_completo: `${item.primer_nombre} ${item.segundo_nombre ? item.segundo_nombre : ''} ${item.primer_apellido} ${item.segundo_apellido}`,
            dni: item.dni,
            monto: item.monto
          };
        });

        return this.filasBen;
      } catch (error) {
        console.error("Error al obtener datos de deducciones", error);
        throw error;
      }
    } */

    obtenerDatos(event:any):any{
      this.formatRangFech(event)
    }

    formatRangFech(event:any) {
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

  crearPlanilla(){
      console.log(this.datosFormateados);
  }
}
