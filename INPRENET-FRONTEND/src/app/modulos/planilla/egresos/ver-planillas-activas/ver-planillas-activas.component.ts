import { Component, EventEmitter, Output, ViewChild } from '@angular/core';
import { FormGroup, Validators } from '@angular/forms';
import { BehaviorSubject } from 'rxjs';
import { DynamicFormComponent } from 'src/app/components/dinamicos/dynamic-form/dynamic-form.component';
import { PlanillaService } from 'src/app/services/planilla.service';
import { convertirFecha } from 'src/app/shared/functions/formatoFecha';
import { unirNombres } from 'src/app/shared/functions/formatoNombresP';
import { FieldConfig } from 'src/app/shared/Interfaces/field-config';

@Component({
  selector: 'app-ver-planillas-activas',
  templateUrl: './ver-planillas-activas.component.html',
  styleUrl: './ver-planillas-activas.component.scss'
})
export class VerPlanillasActivasComponent {
  @ViewChild(DynamicFormComponent) dynamicForm!: DynamicFormComponent;
  @Output() getElemSeleccionados = new EventEmitter<any>()
  @Output() planActivas = new EventEmitter<any>()

  form!: FormGroup;
  form1!: FormGroup;

  FormBen: any
  datosFormateados: any;
  unirNombres: any = unirNombres;
  tiposBeneficios: any = [];
  tiposBeneficiosLoaded: BehaviorSubject<boolean> = new BehaviorSubject(false);
  mostrarDB = false

  public myFormFields: FieldConfig[] = []
  public myFormFields1: FieldConfig[] = []
  public myFormFields2: FieldConfig[] = []

  Afiliado: any = {}

  myColumns: any = [
    {
      header: 'Código Planilla',
      col: 'codigo_planilla',

    },
    { header: 'Secuencia', col: 'secuencia', },
    {
      header: 'Estado',
      col: 'estado',
    },
    { header: 'Fecha Inicio', col: 'periodoInicio', },
    { header: 'Fecha Finalización', col: 'periodoFinalizacion', },
  ];
  datosTabl: any[] = [];
  filas: any
  ejecF: any;
  desOBenSeleccionado: any
  mostrarB: any;
  planillasActivas: any[] = [];

  constructor(
    private planillaService: PlanillaService
  ) { }

  ngOnInit(): void {
    this.getFilas().then(() => this.cargar());
    this.cargar();
  }

  getFilas = async () => {
    try {
      const data = await this.planillaService.getPlanillasActivas().toPromise();
      this.filas = data.map((item: any) => ({
        id_planilla: item.id_planilla,
        codigo_planilla: item.codigo_planilla,
        fecha_apertura: item.fecha_apertura,
        fecha_cierre: item.fecha_cierre,
        secuencia: item.secuencia,
        estado: item.estado,
        periodoInicio: convertirFecha(item.periodoInicio, false),
        periodoFinalizacion: convertirFecha(item.periodoFinalizacion, false),
        tipoPlanilla: item.tipoPlanilla.nombre_planilla,
        idTipoPlanilla: item.tipoPlanilla.id_tipo_planilla
      }));

      return data;
    } catch (error) {
      console.error("Error al obtener datos de beneficios", error);
      throw error;
    }
  };

  ejecutarFuncionAsincronaDesdeOtroComponente(funcion: (data: any) => Promise<boolean>) {
    this.ejecF = funcion;
  }

  cargar() {
    if (this.ejecF) {
      this.ejecF(this.filas).then(() => {
      });
    }
  }

  manejarRowClick(row: any) {
    this.mostrarB = false;
    this.desOBenSeleccionado = row;
    this.getElemSeleccionados.emit(this.desOBenSeleccionado);
    this.planActivas.emit(this.filas);
  }
}
