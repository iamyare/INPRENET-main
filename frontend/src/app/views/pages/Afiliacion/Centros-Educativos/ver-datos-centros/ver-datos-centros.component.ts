import { ChangeDetectionStrategy, Component, inject } from '@angular/core';
import { ControlContainer, FormArray, FormBuilder, FormGroup, Validators } from '@angular/forms';
import { ToastrService } from 'ngx-toastr';
import { CentroTrabajoService } from 'src/app/services/centro-trabajo.service';
import { FieldConfig } from 'src/app/shared/Interfaces/field-config';

@Component({
  selector: 'app-ver-datos-centros',
  templateUrl: './ver-datos-centros.component.html',
  styleUrl: './ver-datos-centros.component.scss',
  changeDetection: ChangeDetectionStrategy.OnPush,
  viewProviders: [
    {
      provide: ControlContainer,
      useFactory: () =>
        inject(ControlContainer, { skipSelf: true, host: true }),
    },
  ]
})
export class VerDatosCentrosComponent {
  steps = [
    { label: 'Datos Generales De Centros', isActive: true },
    { label: 'Referencias Bancarias Y Comerciales', isActive: false },
    { label: 'Sociedades', isActive: false },
    { label: 'Socios', isActive: false },
    { label: 'Administración del Centro Educativo', isActive: false },
    { label: 'Finalizar', isActive: false },
  ];

  activeStep = 0;
  datosGeneralesForm!: FormGroup;
  referenciasForm!: FormGroup;
  sociedadForm!: FormGroup;
  sociedadSocioForm!: FormGroup;
  adminCentroEducativoForm!: FormGroup;
  datosGeneralesData: any = {};
  sociedadData: any = {};

  fieldsStep5: FieldConfig[] = [
    {
      name: 'pep_declaration',
      label: '¿Alguno de los socios o propietario ha desempeñado o ha desempeñado un cargo público?',
      type: 'radio',
      options: [
        { label: 'Sí', value: 'si' },
        { label: 'No', value: 'no' }
      ],
      value: '',
      display: true,
      validations: [],
      row: 1,
      col: 12
    },
    {
      name: 'pep_nombre_apellidos',
      label: 'Nombre y Apellidos',
      type: 'text',
      value: '',
      display: false,
      validations: [],
      row: 2,
      col: 6
    },
    {
      name: 'pep_cargo_desempenado',
      label: 'Cargo Desempeñado',
      type: 'text',
      value: '',
      display: false,
      validations: [],
      row: 2,
      col: 6
    },
    {
      name: 'pep_periodo',
      label: 'Periodo',
      type: 'text',
      value: '',
      display: false,
      validations: [],
      row: 3,
      col: 6
    },
    {
      name: 'pep_otras_referencias',
      label: 'Otras Referencias',
      type: 'text',
      value: '',
      display: false,
      validations: [],
      row: 3,
      col: 6
    },
    {
      name: 'docente_deducciones',
      label: 'HA REALIZADO DEDUCCIONES DE COTIZACIONES A LOS DOCENTES QUE TRABAJAN EN LA INSTITUCIÓN:',
      type: 'radio',
      options: [
        { label: 'Sí', value: 'si' },
        { label: 'No', value: 'no' }
      ],
      value: '',
      display: true,
      validations: [],
      row: 4,
      col: 12
    }
  ];

  formData!: any
  mostrar: boolean = false

  searchResults: any;

  constructor(
    private fb: FormBuilder,
    private SVCCentrosTrabajo: CentroTrabajoService,
    private toastr: ToastrService,
  ) {
  }

  ngOnInit(): void {
    this.initForms();
  }

  initForms() {
    this.referenciasForm = this.fb.group({
      referencias: this.fb.array([])
    });
    this.sociedadForm = this.fb.group({});
    this.sociedadSocioForm = this.fb.group({
      sociedadSocios: this.fb.array([])
    });
    this.adminCentroEducativoForm = this.fb.group({});
  }

  handleStepChange(index: number): void {
    this.activeStep = index;
  }

  onDatosBenChange(formValues: any): void {
    this.updateFieldVisibility(formValues.pep_declaration);
  }

  updateFieldVisibility(pepDeclarationValue: string): void {
    const fieldsToUpdate = ['pep_nombre_apellidos', 'pep_cargo_desempenado', 'pep_periodo', 'pep_otras_referencias'];
    this.fieldsStep5.forEach(field => {
      if (fieldsToUpdate.includes(field.name)) {
        field.display = pepDeclarationValue === 'si';
      }
    });
  }

  onDatosGeneralesFormUpdate(formData: FormGroup): void {
    this.datosGeneralesData = formData
    const temp = formData;
    console.log(temp);
    this.handleSearchResult1(temp);
  }

  onSociedadFormUpdate(formValues: any): void {
    this.sociedadData = formValues;
  }

  gatherAllData(): void {
    const allData = {
      datosGenerales: this.datosGeneralesData,
      referencias: this.referenciasForm.value.referencias.length > 0 ? this.referenciasForm.value.referencias : [],
      sociedad: this.sociedadData,
      sociedadSocio: this.sociedadSocioForm.value.sociedadSocios.length > 0 ? this.sociedadSocioForm.value.sociedadSocios : [],
      adminCentroEducativo: this.isFormGroupEmpty(this.adminCentroEducativoForm) ? {} : this.adminCentroEducativoForm.value
    };
    console.log('Datos Completos:', allData);
  }

  private isFormGroupEmpty(formGroup: FormGroup): boolean {
    return Object.values(formGroup.controls).every(control => control.value === '' || control.value == null);
  }

  results: any[] = [];
  search = (query: string): Promise<any[]> => {
    return new Promise((resolve, reject) => {
      let data: any[] = [];

      return this.SVCCentrosTrabajo.findBy(query).subscribe(
        (res: any) => {
          data.push(res)
          const filteredData = data.filter(item => item.nombre_centro_trabajo.toLowerCase().includes(query.toLowerCase()));
          resolve(filteredData);
        },
        (error) => {
          this.toastr.error(error);
          reject(error);
        }
      );
    });
  }

  handleSearchResult1(form: any) {
    console.log(form);

    form.controls["nombre_centro_trabajo"]!.patchValue(this.searchResults[0].nombre_centro_trabajo)
    form.controls["rtn"]!.patchValue(this.searchResults[0].rtn)
    form.controls["departamento"]!.patchValue(this.searchResults[0].municipio.departamento.id_departamento)
    form.controls["municipio"]!.patchValue(this.searchResults[0].municipio.id_municipio)
    form.controls["objetivo_social"]!.patchValue(this.searchResults[0].objetivo_social)
    form.controls["numero_empleados"]!.patchValue(this.searchResults[0].numero_empleados)
    form.controls["telefono_1"]!.patchValue(this.searchResults[0].telefono_1)
    form.controls["telefono_2"]!.patchValue(this.searchResults[0].telefono_2)
    form.controls["celular_1"]!.patchValue(this.searchResults[0].celular_1)
    form.controls["celular_2"]!.patchValue(this.searchResults[0].celular_2)
    form.controls["correo_1"]!.patchValue(this.searchResults[0].correo_1)
    form.controls["correo_2"]!.patchValue(this.searchResults[0].correo_2)
    form.controls["colonia_localidad"]!.patchValue(this.searchResults[0].colonia_localidad)
    form.controls["barrio_avenida"]!.patchValue(this.searchResults[0].barrio_avenida)
    form.controls["grupo_calle"]!.patchValue(this.searchResults[0].grupo_calle)
    form.controls["numero_casa"]!.patchValue(this.searchResults[0].numero_casa)
    form.controls["direccion_2"]!.patchValue(this.searchResults[0].direccion_2)
    form.controls["numero_acuerdo"]!.patchValue(this.searchResults[0].numero_acuerdo)
    form.controls["fecha_emision"]!.patchValue(this.searchResults[0].fecha_emision)
    form.controls["fecha_inicio_operaciones"]!.patchValue(this.searchResults[0].fecha_inicio_operaciones)
    form.controls["monto_activos_totales"]!.patchValue(this.searchResults[0].monto_activos_totales)

    const tipo_jornada = this.searchResults[0].centroTrabajoJornadas.map((jornada: { jornada: { nombre: string; }; }) => ({
      key: jornada.jornada.nombre,
      value: true
    }));

    const modalidad = this.searchResults[0].centroTrabajoNiveles.map((nivel: { nivel: { nombre: string; }; }) => ({
      key: nivel.nivel.nombre,
      value: true
    }));

    const modalidades = [
      { nombre: 'PRE-ESCOLAR' },
      { nombre: 'PRIMARIA' },
      { nombre: 'MEDIA' },
      { nombre: 'ACADEMIA' },
      { nombre: 'TECNICA' },
    ]
    const tipo_jornadas = [
      { nombre: 'MATUTINA' },
      { nombre: 'DIURNA' },
      { nombre: 'NOCTURNA' }
    ]

    for (let j = 0; j < modalidades.length; j++) {
      for (let i = 0; i < modalidad.length; i++) {
        if (modalidades[j].nombre == modalidad[i].key) {
          form.controls["modalidad_ensenanza"]!.get(`${j}`)?.patchValue(modalidad[i].value)
        }
      }
    }

    for (let j = 0; j < tipo_jornadas.length; j++) {
      for (let i = 0; i < tipo_jornada.length; i++) {
        if (tipo_jornadas[j].nombre == tipo_jornada[i].key) {
          form.controls["tipo_jornada"]!.get(`${j}`)?.patchValue(tipo_jornada[i].value)
        }
      }
    }

    this.datosGeneralesData = form
  }

  handleSearchResult(searchResult: any) {
    this.searchResults = searchResult;
    this.datosGeneralesData = this.fb.group({})
    this.mostrar = true;

  }

  handleFormChange(event: any) {
    console.log('Form changed:', event);
  }
}
