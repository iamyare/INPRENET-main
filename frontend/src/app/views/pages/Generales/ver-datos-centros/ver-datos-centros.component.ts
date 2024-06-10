import { ChangeDetectionStrategy, Component, inject } from '@angular/core';
import { ControlContainer, FormArray, FormBuilder, FormGroup, Validators } from '@angular/forms';
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
  form: FormGroup;
  steps = [
    { label: 'Datos Generales De Centros', isActive: true },
    { label: 'Referencias Bancarias Y Comerciales', isActive: false },
    { label: 'Sociedades', isActive: false },
    { label: 'Socios', isActive: false },
    { label: 'Administración del Centro Educativo', isActive: false },
    { label: 'Declaración de Persona Políticamente Expuesta', isActive: false },
    { label: 'Finalizar', isActive: false },
  ];

  activeStep = 0;
  datosGeneralesForm!: FormGroup;
  referenciasForm!: FormGroup;
  sociedadForm!: FormGroup;
  sociedadSocioForm!: FormGroup;
  adminCentroEducativoForm!: FormGroup;
  datosGeneralesData: any = {}; // Variable para almacenar los datos del formulario de datos generales
  sociedadData: any = {}; // Variable para almacenar los datos del formulario de sociedad

  fields: FieldConfig[] = [
    {
      name: 'nombre_centro_trabajo',
      label: 'Nombre del Centro de Trabajo',
      type: 'text',
      icon: 'business',
      value: '',
      display: true,
      readOnly: false,
      validations: [],
      row: 1,
      col: 6
    },
    {
      name: 'sector_economico',
      label: 'Sector Económico',
      type: 'text',
      icon: 'business',
      value: '',
      display: true,
      readOnly: false,
      validations: [],
      row: 1,
      col: 6
    },
    {
      name: 'telefono_1',
      label: 'Teléfono 1',
      type: 'tel',
      icon: 'phone',
      value: '',
      display: true,
      readOnly: false,
      validations: [],
      row: 2,
      col: 6
    },
    {
      name: 'telefono_2',
      label: 'Teléfono 2',
      type: 'tel',
      icon: 'phone',
      value: '',
      display: true,
      readOnly: false,
      validations: [],
      row: 2,
      col: 6
    },
    {
      name: 'correo_1',
      label: 'Correo 1',
      type: 'email',
      icon: 'email',
      value: '',
      display: true,
      readOnly: false,
      validations: [],
      row: 3,
      col: 6
    },
    {
      name: 'correo_2',
      label: 'Correo 2',
      type: 'email',
      icon: 'email',
      value: '',
      display: true,
      readOnly: false,
      validations: [],
      row: 3,
      col: 6
    },
    {
      name: 'apoderado_legal',
      label: 'Apoderado Legal',
      type: 'text',
      icon: 'person',
      value: '',
      display: true,
      readOnly: false,
      validations: [],
      row: 4,
      col: 6
    },
    {
      name: 'representante_legal',
      label: 'Representante Legal',
      type: 'text',
      icon: 'person',
      value: '',
      display: true,
      readOnly: false,
      validations: [],
      row: 4,
      col: 6
    },
    {
      name: 'rtn',
      label: 'RTN',
      type: 'number',
      icon: 'badge',
      value: '',
      display: true,
      readOnly: false,
      validations: [],
      row: 5,
      col: 6
    },
    {
      name: 'colonia_localidad',
      label: 'Colonia/Localidad',
      type: 'text',
      icon: 'location_on',
      value: '',
      display: true,
      readOnly: false,
      validations: [],
      row: 5,
      col: 6
    },
    {
      name: 'barrio_avenida',
      label: 'Barrio/Avenida',
      type: 'text',
      icon: 'location_on',
      value: '',
      display: true,
      readOnly: false,
      validations: [],
      row: 6,
      col: 4
    },
    {
      name: 'grupo_calle',
      label: 'Grupo/Calle',
      type: 'text',
      icon: 'location_on',
      value: '',
      display: true,
      readOnly: false,
      validations: [],
      row: 6,
      col: 4
    },
    {
      name: 'numero_casa',
      label: 'Número de Casa',
      type: 'number',
      icon: 'home',
      value: '',
      display: true,
      readOnly: false,
      validations: [],
      row: 6,
      col: 4
    },
    {
      name: 'numero_acuerdo',
      label: 'Número de Acuerdo',
      type: 'number',
      icon: 'gavel',
      value: '',
      display: true,
      readOnly: false,
      validations: [],
      row: 7,
      col: 4
    },
    {
      name: 'fecha_emision',
      label: 'Fecha de Emisión',
      type: 'date',
      icon: 'calendar_today',
      value: '',
      display: true,
      readOnly: false,
      validations: [],
      row: 7,
      col: 4
    },
    {
      name: 'fecha_inicio_operaciones',
      label: 'Fecha de Inicio de Operaciones',
      type: 'date',
      icon: 'calendar_today',
      value: '',
      display: true,
      readOnly: false,
      validations: [],
      row: 7,
      col: 4
    },
    {
      name: 'numero_empleados',
      label: 'Número de Empleados',
      type: 'number',
      icon: 'group',
      value: '',
      display: true,
      readOnly: false,
      validations: [],
      row: 8,
      col: 6
    },
    {
      name: 'monto_activos_totales',
      label: 'Monto de Activos Totales',
      type: 'number',
      icon: 'attach_money',
      value: '',
      display: true,
      readOnly: false,
      validations: [],
      row: 8,
      col: 6
    },
    {
      name: 'municipio',
      label: 'Municipio',
      type: 'text',
      icon: 'location_city',
      value: '',
      display: true,
      readOnly: false,
      validations: [],
      row: 9,
      col: 12
    },
    {
      name: 'modalidad_ensenanza',
      label: 'Marque la Modalidad de Enseñanza',
      type: 'checkboxGroup',
      row: 10,
      col: 6,
      display: true,
      options: [
        { label: 'PRE-ESCOLAR', value: 'PRE-ESCOLAR' },
        { label: 'PRIMARIA', value: 'PRIMARIA' },
        { label: 'MEDIA', value: 'MEDIA' },
        { label: 'ACADEMIA', value: 'ACADEMIA' },
        { label: 'TECNICA', value: 'TECNICA' }
      ],
      validations: []
    },
    {
      name: 'tipo_jornada',
      label: 'Marque el Tipo de Jornada',
      type: 'checkboxGroup',
      row: 10,
      col: 6,
      display: true,
      options: [
        { label: 'MATUTINA', value: 'MATUTINA' },
        { label: 'DIURNA', value: 'DIURNA' },
        { label: 'NOCTURNA', value: 'NOCTURNA' }
      ],
      validations: []
    }
  ];

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

  constructor(private fb: FormBuilder) {
    this.form = this.fb.group({
      nombre_centro_trabajo: ['', Validators.required],
      lastName: ['', Validators.required],
      dateRange: this.fb.group({
        start: ['', Validators.required],
        end: ['', Validators.required]
      }),
      preferences: this.fb.array([false, false]),
      gender: ['', Validators.required]
    });
  }

  ngOnInit(): void {
    this.initForms();
  }

  initForms() {
    this.datosGeneralesForm = this.fb.group({
      nombre_centro_trabajo: ['']
      // Agregar otros campos según sea necesario
    });
    this.referenciasForm = this.fb.group({
      referencias: this.fb.array([])
    });
    this.sociedadForm = this.fb.group({});
    this.sociedadSocioForm = this.fb.group({
      sociedadSocios: this.fb.array([])
    });
    this.adminCentroEducativoForm = this.fb.group({});
  }


  /* initForms() {
    this.datosGeneralesForm = this.fb.group({});
    this.referenciasForm = this.fb.group({
      referencias: this.fb.array([])
    });
    this.sociedadForm = this.fb.group({});
    this.sociedadSocioForm = this.fb.group({
      sociedadSocios: this.fb.array([])
    });
    this.adminCentroEducativoForm = this.fb.group({});
  } */

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

  onDatosGeneralesFormUpdate(formValues: any): void {
    this.datosGeneralesData = formValues;
  }

  onSociedadFormUpdate(formValues: any): void {
    this.sociedadData = formValues;
  }

  gatherAllData(): void {
    // Asegurarse de que los datos del formulario de datos generales están actualizados
    this.datosGeneralesData = this.datosGeneralesForm.value;

    const allData = {
      datosGenerales: this.datosGeneralesData,
      referencias: this.referenciasForm.value.referencias.length > 0 ? this.referenciasForm.value.referencias : [],
      sociedad: this.sociedadData,
      sociedadSocio: this.sociedadSocioForm.value.sociedadSocios.length > 0 ? this.sociedadSocioForm.value.sociedadSocios : [],
      adminCentroEducativo: this.isFormGroupEmpty(this.adminCentroEducativoForm) ? {} : this.adminCentroEducativoForm.value
    };
    console.log('Datos Completos:', allData);
  }

  /* gatherAllData(): void {
    const allData = {
      datosGenerales: this.datosGeneralesData,
      referencias: this.referenciasForm.value.referencias.length > 0 ? this.referenciasForm.value.referencias : [],
      sociedad: this.sociedadData,
      sociedadSocio: this.sociedadSocioForm.value.sociedadSocios.length > 0 ? this.sociedadSocioForm.value.sociedadSocios : [],
      adminCentroEducativo: this.isFormGroupEmpty(this.adminCentroEducativoForm) ? {} : this.adminCentroEducativoForm.value
    };
    console.log('Datos Completos:', allData);
  } */

  private isFormGroupEmpty(formGroup: FormGroup): boolean {
    return Object.values(formGroup.controls).every(control => control.value === '' || control.value == null);
  }


  results: any[] = [];
  searchProducts(query: string): any[] {
    const data = [
      { id: 1, nombre_centro_trabajo: 'Instituto Milla Selva', lastName: 'Descripción del producto 1' },
      { id: 2, nombre_centro_trabajo: 'Instituto San Francisco', lastName: 'Descripción del producto 2' },
      { id: 3, nombre_centro_trabajo: 'Instituto Central', lastName: 'Descripción del producto 3' }
    ];

    return data.filter(item => item.nombre_centro_trabajo.toLowerCase().includes(query.toLowerCase()));
  }

  handleSearchResult(searchResult: any) {
    this.fields.forEach(field => {
      if (searchResult[0][field.name] !== undefined) {
        field.value = searchResult[0][field.name];
        const control = this.form.get(field.name);

        if (control) {
          control.setValue(searchResult[0][field.name]);
        } else if (field.type === 'daterange') {
          this.form.get(field.name)?.get('start')?.setValue(searchResult[0][field.name].start);
          this.form.get(field.name)?.get('end')?.setValue(searchResult[0][field.name].end);
        } else if (field.type === 'checkboxGroup') {
          const formArray = this.form.get(field.name) as FormArray;
          formArray.clear();
          field!.options!.forEach((option: any) => {
            formArray.push(this.fb.control(searchResult[0][field.name].includes(option.value)));
          });
        }
      }
    });
  }

  handleFormChange(event: any) {
    console.log('Form changed:', event);
  }

}