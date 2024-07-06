import { Component, Input, OnInit, Output, EventEmitter } from '@angular/core';
import { FormArray, FormBuilder, FormControl, FormGroup, Validators } from '@angular/forms';
import { DatosEstaticosService } from 'src/app/services/datos-estaticos.service';
import { DireccionService } from 'src/app/services/direccion.service';
import { FieldConfig } from 'src/app/shared/Interfaces/field-config';

@Component({
  selector: 'app-datos-generales-centro',
  templateUrl: './datos-generales-centro.component.html',
  styleUrls: ['./datos-generales-centro.component.scss']
})
export class DatosGeneralesCentroComponent implements OnInit {
  @Input() parentForm!: FormGroup;
  @Output() formUpdated = new EventEmitter<any>();
  parentFormIsExist: boolean = false;

  constructor(private fb: FormBuilder, private datosEstaticosService: DatosEstaticosService, private direccionService: DireccionService) { }

  fields: FieldConfig[] = [
    {
      name: 'nombre_centro_trabajo',
      label: 'Nombre del Centro Educativo',
      type: 'text',
      icon: 'business',
      value: '',
      display: true,
      readOnly: false,
      validations: [Validators.required, Validators.maxLength(40)],
      row: 1,
      col: 6
    },
    {
      name: 'rtn',
      label: 'RTN',
      type: 'text',
      icon: 'badge',
      value: '',
      display: true,
      readOnly: false,
      validations: [Validators.required, Validators.maxLength(14)],
      row: 1,
      col: 6
    },
    {
      name: 'departamento',
      label: 'Departamento',
      type: 'dropdown',
      row: 2,
      col: 6,
      display: true,
      options: [],
      validations: [Validators.required]
    },
    {
      name: 'municipio',
      label: 'Municipio',
      type: 'dropdown',
      row: 2,
      col: 6,
      display: true,
      options: [],
      validations: [Validators.required]
    },
    {
      name: 'sector_economico',
      label: 'Sector Económico',
      type: 'dropdown',
      row: 3,
      col: 4,
      display: true,
      options: [{ label: 'PUBLICO', value: 'PUBLICO' },{ label: 'PEGAGOGICO', value: 'PEGAGOGICO' },{ label: 'PEGAGOGICO', value: 'PEGAGOGICO' },{ label: 'PROHECO', value: 'PROHECO' },{ label: 'ADMINISTRATIVO', value: 'ADMINISTRATIVO' }],
      validations: [Validators.required]
    },
    {
      name: 'objetivo_social',
      label: 'Objetivo Social o Razón Económica',
      type: 'text',
      icon: 'business',
      value: '',
      display: true,
      readOnly: false,
      validations: [Validators.maxLength(255)],
      row: 3,
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
      validations: [Validators.required, Validators.min(0)],
      row: 3,
      col: 4
    },
    {
      name: 'telefono_1',
      label: 'Teléfono 1',
      type: 'number',
      icon: 'phone',
      value: '',
      display: true,
      readOnly: false,
      validations: [Validators.required, Validators.maxLength(30)],
      row: 4,
      col: 3
    },
    {
      name: 'telefono_2',
      label: 'Teléfono 2',
      type: 'number',
      icon: 'phone',
      value: '',
      display: true,
      readOnly: false,
      validations: [Validators.maxLength(30)],
      row: 4,
      col: 3
    },
    {
      name: 'celular_1',
      label: 'Celular 1',
      type: 'number',
      icon: 'phone',
      value: '',
      display: true,
      readOnly: false,
      validations: [Validators.required, Validators.maxLength(30)],
      row: 4,
      col: 3
    },
    {
      name: 'celular_2',
      label: 'Celular 2',
      type: 'number',
      icon: 'phone',
      value: '',
      display: true,
      readOnly: false,
      validations: [Validators.maxLength(30)],
      row: 4,
      col: 3
    },
    {
      name: 'correo_1',
      label: 'Correo 1',
      type: 'email',
      icon: 'email',
      value: '',
      display: true,
      readOnly: false,
      validations: [Validators.required, Validators.email, Validators.maxLength(40)],
      row: 5,
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
      validations: [Validators.email, Validators.maxLength(50)],
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
      validations: [Validators.maxLength(200)],
      row: 6,
      col: 3
    },
    {
      name: 'barrio_avenida',
      label: 'Barrio/Avenida',
      type: 'text',
      icon: 'location_on',
      value: '',
      display: true,
      readOnly: false,
      validations: [Validators.maxLength(200)],
      row: 6,
      col: 3
    },
    {
      name: 'grupo_calle',
      label: 'Grupo/Calle',
      type: 'text',
      icon: 'location_on',
      value: '',
      display: true,
      readOnly: false,
      validations: [Validators.maxLength(200)],
      row: 6,
      col: 3
    },
    {
      name: 'numero_casa',
      label: 'Número de Casa',
      type: 'number',
      icon: 'home',
      value: '',
      display: true,
      readOnly: false,
      validations: [Validators.maxLength(200)],
      row: 6,
      col: 3
    },
    {
      name: 'direccion_2',
      label: 'Otro punto de referencia',
      type: 'text',
      icon: 'location_on',
      value: '',
      display: true,
      readOnly: false,
      validations: [Validators.maxLength(200)],
      row: 7,
      col: 12
    },
    {
      name: 'numero_acuerdo',
      label: 'Número de Acuerdo',
      type: 'number',
      icon: 'gavel',
      value: '',
      display: true,
      readOnly: false,
      validations: [Validators.maxLength(50)],
      row: 8,
      col: 3
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
      row: 8,
      col: 3
    },
    {
      name: 'fecha_inicio_operaciones',
      label: 'Inicio de Operaciones',
      type: 'date',
      icon: 'calendar_today',
      value: '',
      display: true,
      readOnly: false,
      validations: [],
      row: 8,
      col: 3
    },
    {
      name: 'modalidad_ensenanza',
      label: 'Marque la Modalidad de Enseñanza',
      type: 'checkboxGroup',
      row: 9,
      col: 6,
      display: true,
      options: [],
      validations: []
    },
    {
      name: 'tipo_jornada',
      label: 'Marque el Tipo de Jornada',
      type: 'checkboxGroup',
      row: 9,
      col: 6,
      display: true,
      options: [],
      validations: []
    },
  ];

  async ngOnInit() {
    this.parentForm = this.fb.group({});
    await this.loadDepartamentos();
    await this.loadJornadas();
    await this.loadNivelesEducativos();

    if (this.fields) {
      this.addControlsToForm();
    }
    this.parentForm.valueChanges.subscribe(value => {
      this.formUpdated.emit(this.convertNumberFields(value));
    });
  }

  async loadDepartamentos() {
    const departamentos = await this.datosEstaticosService.getDepartamentos();
    const departamentoField = this.fields.find(field => field.name === 'departamento');
    if (departamentoField) {
      departamentoField.options = departamentos;
    }
  }

  async loadJornadas() {
    const jornadas = await this.datosEstaticosService.getJornadas();
    const jornadaField = this.fields.find(field => field.name === 'tipo_jornada');
    if (jornadaField) {
      jornadaField.options = jornadas.map(jornada => ({
        label: jornada.label,
        value: jornada.value
      }));

    }
  }

  async loadNivelesEducativos() {
    const nivelesEducativos = await this.datosEstaticosService.getNivelesEducativos();
    const modalidadField = this.fields.find(field => field.name === 'modalidad_ensenanza');
    if (modalidadField) {
      modalidadField.options = nivelesEducativos.map(nivel => ({
        label: nivel.label,
        value: nivel.value
      }));
    }
  }

  addControlsToForm() {
    this.fields.forEach((field:any) => {
      if (field.type === 'checkboxGroup') {
        const formArray = new FormArray(
          field.options.map(() => new FormControl(false))
        );
        this.parentForm.addControl(field.name, formArray);
      } else {
        const control = new FormControl(field.value, field.validations);
        this.parentForm.addControl(field.name, control);
      }
    });
    this.formUpdated.emit(this.convertNumberFields(this.parentForm));
    this.parentFormIsExist = true;
  }

  handleSelectChange(event: { fieldName: string, value: any }) {
    if (event.fieldName === 'departamento') {
      this.onDepartamentoChange(event);
    }
  }

  convertNumberFields(form: any) {
    const updatedValues = { ...form.value };
    this.fields.forEach(field => {
      if (field.type === 'number' && updatedValues[field.name] !== null && updatedValues[field.name] !== '') {
        this.parentForm.value[field.name] = Number(this.parentForm.value[field.name]);
      }
    });

    return form;
  }

  async onDatosBenChange(form: any) {
    this.formUpdated.emit(this.convertNumberFields(form));
  }

  async onDepartamentoChange(event: any) {
    const departamentoId = event.value;

    const municipios = await this.direccionService.getMunicipiosPorDepartamentoId(departamentoId).toPromise();

    const municipioField = this.fields.find(field => field.name === 'municipio');
    if (municipioField) {
      municipioField.options = municipios;
    }

    const municipioControl = this.parentForm.get('municipio');
    if (municipioControl) {
      municipioControl.setValue(null);
    }
  }
}
