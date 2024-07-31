import { Component, OnInit, ViewChild } from '@angular/core';
import { FormBuilder, FormGroup, Validators } from '@angular/forms';
import { ToastrService } from 'ngx-toastr';
import { AfiliadoService } from 'src/app/services/afiliado.service';
import { DeduccionesService } from 'src/app/services/deducciones.service';
import { PlanillaService } from 'src/app/services/planilla.service';
import { FieldConfig } from 'src/app/shared/Interfaces/field-config';
import { DynamicFormComponent } from 'src/app/components/dinamicos/dynamic-form/dynamic-form.component';
import { unirNombres } from 'src/app/shared/functions/formatoNombresP';
import { convertirFecha } from 'src/app/shared/functions/formatoFecha';

@Component({
  selector: 'app-nueva-deduccion-pers',
  templateUrl: './nueva-deduccion-pers.component.html',
  styleUrls: ['./nueva-deduccion-pers.component.scss']
})
export class NuevaDeduccionPersComponent implements OnInit {
  @ViewChild(DynamicFormComponent) dynamicForm!: DynamicFormComponent;
  form!: FormGroup;
  formDeduccion!: FormGroup;
  Afiliado: any = {};
  deducciones: any[] = [];
  selectedDeduccion: any = null;
  planillas: any[] = [];

  public myFormFields: FieldConfig[] = [];
  public myFormFieldsDeduccion: FieldConfig[] = [];

  constructor(
    private svcAfilServ: AfiliadoService,
    private deduccionesService: DeduccionesService,
    private planillaService: PlanillaService,
    private fb: FormBuilder,
    private toastr: ToastrService
  ) {}

  ngOnInit(): void {
    this.myFormFields = [
      { type: 'text', label: 'DNI del afiliado', name: 'dni', validations: [Validators.required, Validators.minLength(13), Validators.maxLength(14)], display: true },
    ];

    // Obtener año y mes actuales
    const currentDate = new Date();
    const currentYear = currentDate.getFullYear();
    const currentMonth = currentDate.getMonth() + 1; // getMonth() returns 0-based index

    this.myFormFieldsDeduccion = [
      { type: 'dropdown', label: 'Planilla', name: 'id_planilla', options: [], validations: [Validators.required], display: true },
      { type: 'dropdown', label: 'Nombre de la deducción', name: 'nombre_deduccion', options: [], validations: [Validators.required], display: true },
      { type: 'number', label: 'Monto total', name: 'monto_total', validations: [Validators.required, Validators.pattern('^[0-9]+$')], display: true },
    ];

    this.form = this.fb.group({
      dni: ['', [Validators.required, Validators.minLength(13), Validators.maxLength(14)]]
    });

    this.formDeduccion = this.fb.group({
      nombre_deduccion: ['', Validators.required],
      monto_total: ['', [Validators.required, Validators.pattern('^[0-9]+$')]],
      id_planilla: ['', Validators.required],
      anio: [currentYear, Validators.required], // Año actual por defecto
      mes: [currentMonth, Validators.required] // Mes actual por defecto
    });

    this.cargarDeducciones();
    this.cargarPlanillas();
  }

  async obtenerDatos(event: any): Promise<any> {
    this.form = event;
  }

  async obtenerDatosDeduccion(event: any): Promise<any> {
    this.formDeduccion = event;
  }

  cargarDeducciones() {
    this.deduccionesService.getDeducciones().subscribe(
      (data) => {
        this.deducciones = data;
        this.myFormFieldsDeduccion.find(field => field.name === 'nombre_deduccion')!.options = this.deducciones.map(deduccion => ({ label: deduccion.nombre_deduccion, value: deduccion.nombre_deduccion }));
      },
      (error) => {
        this.toastr.error('Error al cargar deducciones');
      }
    );
  }

  cargarPlanillas() {
    this.planillaService.getPlanillasActivas('EGRESO').subscribe(
      (data) => {
        this.planillas = data;
        this.myFormFieldsDeduccion.find(field => field.name === 'id_planilla')!.options = this.planillas.map(planilla => ({ label: planilla.codigo_planilla, value: planilla.id_planilla }));
      },
      (error) => {
        this.toastr.error('Error al cargar planillas activas');
      }
    );
  }

  previsualizarInfoAfil() {
    if (this.form.value.dni) {
      this.svcAfilServ.getPersonaParaDeduccion(this.form.value.dni).subscribe(
        (res) => {
          this.Afiliado = {
            dni: res.N_IDENTIFICACION,
            nombreCompleto: unirNombres(res.PRIMER_NOMBRE, res.SEGUNDO_NOMBRE, res.TERCER_NOMBRE, res.PRIMER_APELLIDO, res.SEGUNDO_APELLIDO),
            genero: res.GENERO,
            fecha_nacimiento: convertirFecha(res.FECHA_NACIMIENTO, false),
            direccion_residencia: res.DIRECCION_RESIDENCIA,
            telefono_1: res.TELEFONO_1,
            estado_civil: res.ESTADO_CIVIL,
            colegio_magisterial: res.COLEGIO_MAGISTERIAL,
            numero_carnet: res.NUMERO_CARNET,
            salario_base: res.SALARIO_BASE,
            estado: res.ESTADO,
          };
        },
        (error) => {
          this.Afiliado = {};
          this.toastr.error('Error: No se puede asignar deduccion a la persona con el DNI proporcionado.');
        }
      );
    }
  }


  onDeduccionChange(event: any) {
    const selectedNombreDeduccion = event.value;
    this.selectedDeduccion = this.deducciones.find(deduccion => deduccion.nombre_deduccion === selectedNombreDeduccion);
  }

  guardarDeduccion() {
    if (this.formDeduccion.valid && this.Afiliado.dni && this.selectedDeduccion) {
      const detalleDeduccion = {
        n_identificacion: this.Afiliado.dni,
        codigo_deduccion: this.selectedDeduccion.codigo_deduccion,
        anio: Number(this.formDeduccion.get('anio')?.value || new Date().getFullYear()),
        mes: Number(this.formDeduccion.get('mes')?.value || new Date().getMonth() + 1),
        monto_total: Number(this.formDeduccion.value.monto_total),
        id_planilla: Number(this.formDeduccion.value.id_planilla)
      };

      this.deduccionesService.createDetalleDeduccion(detalleDeduccion).subscribe(
        (response) => {
          this.toastr.success('Deducción asignada con éxito.');
          this.limpiarFormulario();
        },
        (error) => {
          this.toastr.error('Error al asignar la deducción.');
          console.error('Error al asignar la deducción:', error);
        }
      );
    } else {
      this.toastr.error('Por favor, completa todos los campos obligatorios.');
    }
  }


  limpiarFormulario(): void {
    this.Afiliado = {};
    this.selectedDeduccion = null;

    if (this.form) {
      this.form.reset();
    }
    if (this.formDeduccion) {
      this.formDeduccion.reset();
    }
    if (this.dynamicForm) {
      this.dynamicForm.form.reset();
    }
  }

}
