import { Component, Input, OnInit } from '@angular/core';
import { FormBuilder, FormGroup, FormArray, Validators, AbstractControl } from '@angular/forms';
import { DireccionService } from 'src/app/services/direccion.service';
import { FieldArrays } from 'src/app/shared/Interfaces/field-arrays';

@Component({
  selector: 'app-sociedad-socio',
  templateUrl: './sociedad-socio.component.html',
  styleUrls: ['./sociedad-socio.component.scss']
})
export class SociedadSocioComponent implements OnInit {
  @Input() parentForm!: FormGroup;
  departamentos: any = [];
  municipios: any = [];

  fields: FieldArrays[] = [
    { name: 'nombreSociedad', label: 'Nombre de la Sociedad', icon: 'business', layout: { row: 0, col: 4 }, type: 'text', value: '', validations: [] },
    { name: 'rtn', label: 'RTN', icon: 'badge', layout: { row: 0, col: 4 }, type: 'text', value: '', validations: [Validators.required, Validators.maxLength(14), Validators.minLength(14), Validators.pattern('^[0-9]{14}$')] },
    { name: 'telefonoSociedad', label: 'Teléfono de la Sociedad', icon: 'phone', layout: { row: 0, col: 4 }, type: 'text', value: '', validations: [] },
    { name: 'correoSociedad', label: 'Correo de la Sociedad', icon: 'email', layout: { row: 1, col: 12 }, type: 'text', value: '', validations: [Validators.email] },
    { name: 'nombreSocio', label: 'Nombre del Socio', icon: 'person', layout: { row: 2, col: 4 }, type: 'text', value: '', validations: [Validators.required] },
    { name: 'apellido', label: 'Apellido', icon: 'person', layout: { row: 2, col: 4 }, type: 'text', value: '', validations: [Validators.required] },
    { name: 'porcentajeParticipacion', label: 'Porcentaje de Participación', icon: 'percent', layout: { row: 2, col: 4 }, type: 'number', value: '', validations: [Validators.required, Validators.min(0), Validators.max(100)] },
    { name: 'dni', label: 'DNI', icon: 'badge', layout: { row: 3, col: 6 }, type: 'text', value: '', validations: [Validators.required, Validators.pattern('^[0-9]*$')] },
    { name: 'otroPuntoReferencia', label: 'Otro Punto de Referencia', icon: 'location_on', layout: { row: 3, col: 6 }, type: 'text', value: '', validations: [] },
    { name: 'barrioAvenida', label: 'Barrio / Avenida', icon: 'location_city', layout: { row: 4, col: 6 }, type: 'text', value: '', validations: [] },
    { name: 'grupoCalle', label: 'Grupo / Calle', icon: 'streetview', layout: { row: 4, col: 6 }, type: 'text', value: '', validations: [] },
    { name: 'numeroCasa', label: 'N° de Casa', icon: 'home', layout: { row: 5, col: 6 }, type: 'number', value: '', validations: [] },
    { name: 'telefonoSocio', label: 'Teléfono del Socio', icon: 'phone', layout: { row: 5, col: 6 }, type: 'text', value: '', validations: [] },
    { name: 'emailSocio', label: 'Correo del Socio', icon: 'email', layout: { row: 6, col: 12 }, type: 'text', value: '', validations: [Validators.email] },
    { name: 'departamento', label: 'Departamento', icon: 'location_city', layout: { row: 6, col: 6 }, type: 'select', value: '', options: [], validations: [Validators.required] },
    { name: 'municipio', label: 'Municipio', icon: 'location_city', layout: { row: 6, col: 6 }, type: 'select', value: '', options: [], validations: [Validators.required] },
    { name: 'fechaIngreso', label: 'Fecha de Ingreso', icon: 'calendar_today', layout: { row: 7, col: 6 }, type: 'date', value: '', validations: [Validators.required] },
    { name: 'fechaSalida', label: 'Fecha de Salida', icon: 'calendar_today', layout: { row: 7, col: 6 }, type: 'date', value: '', validations: [] },
    {
      name: 'pep_declaration',
      label: '¿Ha desempeñado un cargo público?',
      type: 'radio',
      options: [
        { label: 'Sí', value: 'si' },
        { label: 'No', value: 'no' }
      ],
      value: '',
      validations: [],
      layout: { row: 8, col: 12 }
    },
    /*
    {
      name: 'pep_cargo_desempenado',
      label: 'Cargo Desempeñado',
      type: 'text',
      value: '',
      validations: [],
      layout: { row: 9, col: 6 }
    },
    {
      name: 'pep_periodo',
      label: 'Periodo',
      type: 'text',
      value: '',
      validations: [],
      layout: { row: 9, col: 6 }
    },
    {
      name: 'pep_otras_referencias',
      label: 'Otras Referencias',
      type: 'text',
      value: '',
      validations: [],
      layout: { row: 10, col: 12 }
    },
    {
      name: 'docente_deducciones',
      label: '¿Ha realizado deducciones de cotizaciones a los docentes que trabajan en la institución?',
      type: 'radio',
      options: [
        { label: 'Sí', value: 'si' },
        { label: 'No', value: 'no' }
      ],
      value: '',
      validations: [],
      layout: { row: 11, col: 12 }
    } */
  ];

  constructor(private fb: FormBuilder, private direccionService: DireccionService) { }

  ngOnInit(): void {
    if (!this.parentForm) {
      this.parentForm = this.fb.group({
        sociedadSocios: this.fb.array([])
      });
    } else if (!this.parentForm.get('sociedadSocios')) {
      this.parentForm.addControl('sociedadSocios', this.fb.array([]));
    }
    this.loadDepartamentos();
  }

  get sociedadSocios(): FormArray {
    return this.parentForm.get('sociedadSocios') as FormArray;
  }

  async loadDepartamentos() {
    this.departamentos = await this.direccionService.getAllDepartments().toPromise();
    const departamentoField = this.fields.find(field => field.name === 'departamento');
    if (departamentoField) {
      departamentoField.options = this.departamentos.map((dep: any) => ({
        value: dep.id_departamento,
        label: dep.nombre_departamento
      }));
    }
  }

  async onDepartamentoChange(event: { fieldName: string, value: any, formGroup: FormGroup }) {
    if (event.fieldName !== 'departamento') return;

    const departamentoId = event.value;

    const municipios = await this.direccionService.getMunicipiosPorDepartamentoId(departamentoId).toPromise();

    const municipioField = this.fields.find(field => field.name === 'municipio');
    if (municipioField && municipios) {
      console.log(municipios);
      municipioField.options = municipios.map((mun: any) => ({
        value: mun.value,
        label: mun.label
      }));

    }

    event.formGroup.get('municipio')?.setValue(null);
  }

  addSociedadSocio(): void {
    const sociedadSocioGroup = this.fb.group({
      nombreSociedad: ['', Validators.required],
      pep_declaration: ['', Validators.required],
      rtn: ['', [Validators.required, Validators.maxLength(14), Validators.minLength(14), Validators.pattern('^[0-9]{14}$')]],
      telefonoSociedad: [''],
      correoSociedad: ['', Validators.email],
      nombreSocio: ['', Validators.required],
      apellido: ['', Validators.required],
      dni: ['', [Validators.required, Validators.pattern('^[0-9]*$')]],
      otroPuntoReferencia: [''],
      barrioAvenida: [''],
      grupoCalle: [''],
      numeroCasa: [''],
      telefonoSocio: [''],
      emailSocio: ['', Validators.email],
      departamento: ['', Validators.required],
      municipio: ['', Validators.required],
      porcentajeParticipacion: ['', [Validators.required, Validators.min(0), Validators.max(100)]],
      fechaIngreso: ['', Validators.required],
      fechaSalida: [''],
      /* pep_declaration: ['', Validators.required],
      pep_nombre_apellidos: [{ value: '', disabled: true }],
      pep_cargo_desempenado: [{ value: '', disabled: true }],
      pep_periodo: [{ value: '', disabled: true }],
      pep_otras_referencias: [{ value: '', disabled: true }],
      docente_deducciones: ['', Validators.required] */
    });

    this.sociedadSocios.push(sociedadSocioGroup);

    sociedadSocioGroup.get('pep_declaration')?.valueChanges.subscribe((value: any) => {
      this.updateFieldVisibility(sociedadSocioGroup, value);
    });
  }

  updateFieldVisibility(sociedadSocioGroup: FormGroup, pepDeclarationValue: string): void {
    const fieldsToUpdate = ['pep_nombre_apellidos', 'pep_cargo_desempenado', 'pep_periodo', 'pep_otras_referencias'];
    fieldsToUpdate.forEach(fieldName => {
      const control = sociedadSocioGroup.get(fieldName);
      if (pepDeclarationValue === 'si') {
        control?.enable();
      } else {
        control?.disable();
      }
    });
  }

  removeSociedadSocio(index: number): void {
    this.sociedadSocios.removeAt(index);
  }

  asFormGroup(control: AbstractControl): FormGroup {
    return control as FormGroup;
  }
}
