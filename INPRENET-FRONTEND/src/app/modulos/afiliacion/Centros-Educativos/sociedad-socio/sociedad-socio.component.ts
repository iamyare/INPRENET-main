import { Component, Input, OnInit } from '@angular/core';
import { FormBuilder, FormGroup, FormArray, Validators, AbstractControl } from '@angular/forms';
import { DireccionService } from 'src/app/services/direccion.service';
import { FieldArrays } from 'src/app/shared/Interfaces/field-arrays';
import { ValidationService } from 'src/app/shared/services/validation.service';

@Component({
  selector: 'app-sociedad-socio',
  templateUrl: './sociedad-socio.component.html',
  styleUrls: ['./sociedad-socio.component.scss']
})
export class SociedadSocioComponent implements OnInit {
  @Input() parentForm!: FormGroup;
  departamentos: any = [];
  municipios: any = [];

  constructor(private fb: FormBuilder, private direccionService: DireccionService, private validationService: ValidationService) { }

  fields: FieldArrays[] = [
    { name: 'nombreSocio', label: 'Nombre', icon: 'person', layout: { row: 2, col: 4 }, type: 'text', value: '', validations: [Validators.required, this.validationService.namesValidator()] },
    { name: 'apellido', label: 'Apellido', icon: 'person', layout: { row: 2, col: 4 }, type: 'text', value: '', validations: [Validators.required, this.validationService.namesValidator()] },
    { name: 'porcentajeParticipacion', label: 'Porcentaje de Participación', icon: 'percent', layout: { row: 2, col: 4 }, type: 'number', value: '', validations: [Validators.required, Validators.min(0), Validators.max(100)] },
    { name: 'dni', label: 'DNI', icon: 'badge', layout: { row: 3, col: 6 }, type: 'text', value: '', validations: [Validators.required, Validators.pattern('^[0-9]*$'), this.validationService.dniValidator()] },
    { name: 'otroPuntoReferencia', label: 'Otro Punto de Referencia', icon: 'location_on', layout: { row: 3, col: 6 }, type: 'text', value: '', validations: [this.validationService.noSpecialCharactersOrSequencesValidator()] },
    { name: 'barrioAvenida', label: 'Barrio / Avenida', icon: 'location_city', layout: { row: 4, col: 6 }, type: 'text', value: '', validations: [this.validationService.noSpecialCharactersOrSequencesValidator()] },
    { name: 'grupoCalle', label: 'Grupo / Calle', icon: 'streetview', layout: { row: 4, col: 6 }, type: 'text', value: '', validations: [this.validationService.noSpecialCharactersOrSequencesValidator()] },
    { name: 'numeroCasa', label: 'N° de Casa', icon: 'home', layout: { row: 5, col: 6 }, type: 'number', value: '', validations: [this.validationService.houseNumberValidator()] },
    { name: 'telefonoSocio', label: 'Teléfono', icon: 'phone', layout: { row: 5, col: 6 }, type: 'text', value: '', validations: [this.validationService.phoneValidator()] },
    { name: 'emailSocio', label: 'Correo', icon: 'email', layout: { row: 6, col: 12 }, type: 'text', value: '', validations: [Validators.email, this.validationService.emailOptionalValidator()] },
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
  ];

  ngOnInit(): void {
    if (!this.parentForm) {
      this.parentForm = this.fb.group({
        sociedadSocios: this.fb.array([])
      });
    } else if (!this.parentForm.get('sociedadSocios')) {
      this.parentForm.addControl('sociedadSocios', this.fb.array([]));
    }
    console.log('parentForm:', this.parentForm);
    console.log('Control Nombre:', this.parentForm.get('nombreSocio'));
    console.log('Control Apellido:', this.parentForm.get('apellido'));

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
      municipioField.options = municipios.map((mun: any) => ({
        value: mun.value,
        label: mun.label
      }));

    }
    event.formGroup.get('municipio')?.setValue(null);
  }

  addSociedadSocio(): void {
    const sociedadSocioGroup = this.fb.group({
      nombreSocio: ['', [Validators.required, this.validationService.namesValidator()]],
      pep_declaration: ['', [Validators.required]],
      apellido: ['',[Validators.required, this.validationService.namesValidator()]],
      dni: ['', [Validators.required, Validators.pattern('^[0-9]*$'), this.validationService.dniValidator()]],
      otroPuntoReferencia: ['', [this.validationService.noSpecialCharactersOrSequencesValidator()]],
      barrioAvenida: ['', [this.validationService.noSpecialCharactersOrSequencesValidator()]],
      grupoCalle: ['', [this.validationService.noSpecialCharactersOrSequencesValidator()]],
      numeroCasa: ['', [this.validationService.numberValidator()]],
      telefonoSocio: ['', [this.validationService.phoneValidatorOptional()]],
      emailSocio: ['', [Validators.email, this.validationService.emailOptionalValidator()]],
      departamento: ['', [Validators.required]],
      municipio: ['', [Validators.required]],
      porcentajeParticipacion: ['', [Validators.required, Validators.min(0), Validators.max(100)]],
      fechaIngreso: ['', [Validators.required]],
      fechaSalida: [''],
    });

    this.sociedadSocios.push(sociedadSocioGroup);

    sociedadSocioGroup.get('pep_declaration')?.valueChanges.subscribe((value: any) => {
      this.updateFieldVisibility(sociedadSocioGroup, value);
    });

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
