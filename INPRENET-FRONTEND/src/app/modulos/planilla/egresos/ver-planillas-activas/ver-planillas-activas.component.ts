import { ChangeDetectorRef, Component, EventEmitter, Output, ViewChild } from '@angular/core';
import { FormBuilder, FormGroup, Validators } from '@angular/forms';
import { ToastrService } from 'ngx-toastr';
import { BehaviorSubject } from 'rxjs';
import { DynamicFormComponent } from 'src/app/components/dinamicos/dynamic-form/dynamic-form.component';
import { AfiliadoService } from 'src/app/services/afiliado.service';
import { BeneficiosService } from 'src/app/services/beneficios.service';
import { PlanillaService } from 'src/app/services/planilla.service';
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
  planillasActivas: any[] = []; // Para almacenar las planillas activas

  constructor(
    private planillaService: PlanillaService,
    private cdr: ChangeDetectorRef,
    private svcBeneficioServ: BeneficiosService,
    private svcAfilServ: AfiliadoService, private fb: FormBuilder,
    private toastr: ToastrService, private _formBuilder: FormBuilder
  ) { }

  ngOnInit(): void {

    this.myFormFields = [
      { type: 'text', label: 'DNI del afiliado', name: 'dni', validations: [Validators.required, Validators.minLength(13), Validators.maxLength(14)], display: true },
    ];
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
    // Ocultamos el formulario temporalmente
    this.mostrarB = false;

    // Asignamos el valor del DNI de la fila seleccionada al campo de DNI del beneficiario
    this.desOBenSeleccionado = row;
    this.getElemSeleccionados.emit(this.desOBenSeleccionado);

  }
}
