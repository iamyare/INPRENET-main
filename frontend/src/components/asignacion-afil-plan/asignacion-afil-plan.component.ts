import { Component, OnInit } from '@angular/core';
import { FormBuilder, Validators } from '@angular/forms';
import { AfiliadoService } from 'src/app/services/afiliado.service';
import { PlanillaService } from 'src/app/services/planilla.service';
import { FieldConfig } from 'src/app/views/shared/shared/Interfaces/field-config';
import { TableColumn } from 'src/app/views/shared/shared/Interfaces/table-column';

@Component({
  selector: 'app-asignacion-afil-plan',
  templateUrl: './asignacion-afil-plan.component.html',
  styleUrl: './asignacion-afil-plan.component.scss'
})
export class AsignacionAfilPlanComponent implements OnInit{
  myFormFields: FieldConfig[] = [];
  filas: any;
  tiposPlanilla: any[] = [];
  datosFormateados: any;

  myColumnsDed: TableColumn[] = [];
  filasT: any[] = [];
  datosTabl: any;

  verDat: boolean = false;
  ejecF: any;
  constructor( private _formBuilder: FormBuilder,
    private planillaService : PlanillaService,
    private svcAfilServ: AfiliadoService) {
    }

  ngOnInit(): void {
    this.myColumnsDed = [
      {
        header: 'dni',
        col: 'afil_dni',
        isEditable: false,
        validationRules: [Validators.required, Validators.minLength(5)]
      },
      {
        header: 'primer_nombre',
        col: 'afil_primer_nombre',
        isEditable: true
      },
      {
        header: 'IDs de beneficios',
        col: 'BENEFICIOSIDS',
        isEditable: true
      },
      {
        header: 'Nombres de Beneficios',
        col: 'BENEFICIOSNOMBRES',
        isEditable: true
      },
      {
        header: 'deduccionesIds',
        col: 'DEDUCCIONESIDS',
        isEditable: true,
        validationRules: [Validators.required, Validators.pattern(/^(3[01]|[12][0-9]|0?[1-9])-(1[0-2]|0?[1-9])-\d{4} - (3[01]|[12][0-9]|0?[1-9])-(1[0-2]|0?[1-9])-\d{4}$/)]
      },
      {
        header: 'Nombres de deducciones',
        col: 'DEDUCCIONESNOMBRES',
        isEditable: true,
        validationRules: [Validators.required, Validators.pattern(/^(3[01]|[12][0-9]|0?[1-9])-(1[0-2]|0?[1-9])-\d{4} - (3[01]|[12][0-9]|0?[1-9])-(1[0-2]|0?[1-9])-\d{4}$/)]
      }
    ];
    this.previsualizarDatos()
    this.obtenerDatos1()
  }

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
  obtenerDatos1():any{
    this.getTiposPlanillas()
    this.myFormFields = [
      {
        type: 'number', label: 'Codigo De Planilla', name: 'codigo_planilla', validations: [Validators.required, Validators.pattern("^\\d*\\.?\\d+$")]},
      {
        readOnly: true, type: 'dropdown', label: 'Nombre de Tipo planilla', name: 'nombre_planilla',
        options: this.tiposPlanilla,
        validations: [Validators.required]
      },
      {
        readOnly: true, type: 'daterange', label: 'Periodo', name: 'periodo', validations: [Validators.required]},
      {
        readOnly: true, type: 'number', label: 'Secuencia', name: 'secuencia', validations: [Validators.required,Validators.pattern("^\\d*\\.?\\d+$")]
      },
    ]
  }

  getFilas = async (periodoInicio: string, periodoFinalizacion: string) => {
    try {
      // Asegúrate de pasar los parámetros mes y anio a la función getDeduccionesNoAplicadas
      const data = await this.planillaService.getDeduccionesNoAplicadas(periodoInicio, periodoFinalizacion).toPromise();
      this.filasT = data.map((item: any) => {

        return {
          afil_id_afiliado: item.afil_id_afiliado,
          afil_dni: item.afil_dni,
          afil_primer_nombre: item.afil_primer_nombre,
          BENEFICIOSIDS: item.BENEFICIOSIDS,
          BENEFICIOSNOMBRES: item.BENEFICIOSNOMBRES,
          DEDUCCIONESIDS: item.DEDUCCIONESIDS,
          DEDUCCIONESNOMBRES: item.DEDUCCIONESNOMBRES
        };
      });

      return this.filasT;
    } catch (error) {
      console.error("Error al obtener datos de deducciones", error);
      throw error;
    }
  }

  previsualizarDatos = async () => {
      this.datosTabl = await this.getFilas('01-01-2023', '01-01-2023')
      this.verDat = true
      this.filasT = this.datosTabl;

      this.ejecF(this.filasT).then(()=>{})

    return this.datosTabl
  }

  editar = (row: any) => {}

  ejecutarFuncionAsincronaDesdeOtroComponente(funcion: (data:any) => Promise<void>) {
    this.ejecF = funcion;
  }

}
