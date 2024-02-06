import { Component, OnInit } from '@angular/core';
import { FormBuilder, Validators } from '@angular/forms';
import { AfiliadoService } from 'src/app/services/afiliado.service';
import { PlanillaService } from 'src/app/services/planilla.service';
import { TableColumn } from 'src/app/views/shared/shared/Interfaces/table-column';

@Component({
  selector: 'app-asignacion-afil-plan',
  templateUrl: './asignacion-afil-plan.component.html',
  styleUrl: './asignacion-afil-plan.component.scss'
})
export class AsignacionAfilPlanComponent implements OnInit{
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
