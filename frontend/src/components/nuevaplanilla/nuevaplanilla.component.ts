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
  //tablas
  myColumns: TableColumn[] = [];
  filasT: any[] =[];

  //formulario
  public myFormFields: FieldConfig[] = [];
  filas:any;
  tiposPlanilla:any = [];
  data:any;
  nameAfil:string = "";
  formGroup = this._formBuilder.group({
    enableWifi: '', // Asumo que este campo ya existe por alguna razón específica
    acceptTerms: ['', Validators.requiredTrue],
    mes: ['', Validators.required], // Nuevo campo para el mes
    anio: ['', [Validators.required, Validators.min(2000)]] // Nuevo campo para el año
  });

  constructor( private _formBuilder: FormBuilder,
    private planillaService : PlanillaService,
    private svcAfilServ: AfiliadoService) {
      this.obtenerDatos1();
    }

    ngOnInit(): void {
      this.myColumns = [
        {
          header: 'DNI',
          col: 'dni',
          isEditable: false,
          validationRules: [Validators.required, Validators.minLength(5)]
        },
        {
          header: 'Nombre completo',
          col: 'nombre_completo',
          isEditable: true
        },
        {
          header: 'Nombre de institucion',
          col: 'nombre_institucion',
          isEditable: true
        },
        {
          header: 'Monto Total',
          col: 'monto_total',
          isEditable: true
        },
        {
          header: 'Monto aplicado',
          col: 'monto_aplicado',
          isEditable: true,
          validationRules: [Validators.required, Validators.pattern(/^(3[01]|[12][0-9]|0?[1-9])-(1[0-2]|0?[1-9])-\d{4} - (3[01]|[12][0-9]|0?[1-9])-(1[0-2]|0?[1-9])-\d{4}$/)]
        }
      ];
    }

    getFilas = async (mes: number, anio: number) => {
      try {
        const mes = 1; // Ejemplo: Enero
        const anio = 2024;
        // Asegúrate de pasar los parámetros mes y anio a la función getDeduccionesNoAplicadas
        const data = await this.planillaService.getDeduccionesNoAplicadas(mes, anio).toPromise();

        this.filasT = data.map((item: any) => {
          return {
            id_afiliado: item.id_afiliado,
            nombre_completo: `${item.primer_nombre} ${item.segundo_nombre ? item.segundo_nombre : ''} ${item.primer_apellido} ${item.segundo_apellido}`,
            dni: item.dni,
            id_institucion: item.id_institucion,
            nombre_institucion: item.nombre_institucion,
            monto_total: item.monto_total,
            monto_aplicado: item.monto_aplicado
          };
        });
        return this.filasT;
      } catch (error) {
        console.error("Error al obtener datos de deducciones", error);
        throw error;
      }
    }

    editar = (row: any) => {

    }

    obtenerDatos(event:any):any{
      this.data = event;
    }

  obtenerDatos1():any{
    this.getTiposPlanillas()
    this.myFormFields = [{
        type: 'dropdown', label: 'Nombre de Tipo planilla', name: 'nombre_planilla',
        options: this.tiposPlanilla,
        validations: [Validators.required]
      },
      { type: 'number', label: 'Secuencia', name: 'secuencia', validations: [Validators.required,Validators.pattern("^\\d*\\.?\\d+$")] },
      { type: 'number', label: 'Codigo De Planilla', name: 'codigo_planilla', validations: [Validators.required, Validators.pattern("^\\d*\\.?\\d+$")] },
    ]
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


}
