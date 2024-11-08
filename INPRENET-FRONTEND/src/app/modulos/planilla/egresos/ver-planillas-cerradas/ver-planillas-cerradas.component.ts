import { ChangeDetectorRef, Component, EventEmitter, Output, ViewChild } from '@angular/core';
import { FormBuilder, FormGroup, Validators } from '@angular/forms';
import { ToastrService } from 'ngx-toastr';
import { BehaviorSubject } from 'rxjs';
import { DynamicFormComponent } from 'src/app/components/dinamicos/dynamic-form/dynamic-form.component';
import { AfiliadoService } from 'src/app/services/afiliado.service';
import { BeneficiosService } from 'src/app/services/beneficios.service';
import { PlanillaService } from 'src/app/services/planilla.service';
import { FieldConfig } from 'src/app/shared/Interfaces/field-config';
import { unirNombres } from 'src/app/shared/functions/formatoNombresP';

@Component({
  selector: 'app-ver-planillas-cerradas',
  templateUrl: './ver-planillas-cerradas.component.html',
  styleUrl: './ver-planillas-cerradas.component.scss'
})
export class VerPlanillasCerradasComponent {
  @ViewChild(DynamicFormComponent) dynamicForm!: DynamicFormComponent;
  @Output() getElemSeleccionados = new EventEmitter<any>()
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
      header: 'codigo_planilla',
      col: 'codigo_planilla',

    },
    { header: 'secuencia', col: 'secuencia', },
    {
      header: 'estado',
      col: 'estado',
    },
    { header: 'periodoInicio', col: 'periodoInicio', },
    { header: 'periodoFinalizacion', col: 'periodoFinalizacion', },
  ];
  datosTabl: any[] = [];
  filas: any
  ejecF: any;
  desOBenSeleccionado: any
  mostrarB: any;
  planillasActivas: any[] = [];

  constructor(
    private planillaService: PlanillaService,
    private toastr: ToastrService
  ) { }

  ngOnInit(): void {
    this.getFilas().then((data) => {
      if (!data || data.length === 0) {
        this.toastr.warning("No se encontraron planillas cerradas.");
      }
      this.cargar();
    }).catch(error => {
      console.error('Error al cargar planillas cerradas:', error);
    });
  }

  getFilas = async () => {
    try {
      const data = await this.planillaService.getPlanillasCerradas().toPromise();
      this.filas = data.map((item: any) => ({
        id_planilla: item.id_planilla,
        codigo_planilla: item.codigo_planilla,
        fecha_apertura: item.fecha_apertura,
        fecha_cierre: item.fecha_cierre,
        secuencia: item.secuencia,
        estado: item.estado,
        periodoInicio: item.periodoInicio,
        periodoFinalizacion: item.periodoFinalizacion,
        tipoPlanilla: item.tipoPlanilla.nombre_planilla
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
    if (!row || !row.codigo_planilla || row.codigo_planilla.trim() === '') {
      console.error('Error: El código de planilla no puede estar vacío');
      this.toastr.error('Debe seleccionar una fila con un código de planilla válido');
      return;
    }

    this.desOBenSeleccionado = row;
    this.getElemSeleccionados.emit(this.desOBenSeleccionado);
  }
}
