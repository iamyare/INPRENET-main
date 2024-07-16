import { Component, EventEmitter, Input, Output } from '@angular/core';
import { FormArray, FormBuilder, FormControl, FormGroup, Validators } from '@angular/forms';
import { DatosEstaticosService } from 'src/app/services/datos-estaticos.service';
import { DireccionService } from 'src/app/services/direccion.service';
import { FieldConfig } from 'src/app/shared/Interfaces/field-config';

@Component({
  selector: 'app-datos-propietario',
  templateUrl: './datos-propietario.component.html',
  styleUrl: './datos-propietario.component.scss'
})
export class DatosPropietarioComponent {
  @Input() parentForm!: FormGroup;
  departamentos: any = [];
  municipios: any = [];
  @Output() formUpdated = new EventEmitter<any>();
  parentFormIsExist: boolean = false;

  constructor(private fb: FormBuilder, private datosEstaticosService: DatosEstaticosService, private direccionService: DireccionService) { }


  fields: FieldConfig[] = [
    {
      name: 'n_identificacion',
      label: 'Numero de identificación',
      type: 'text',
      icon: 'group',
      value: '',
      display: true,
      readOnly: false,
      validations: [Validators.required, Validators.min(0)],
      row: 1,
      col: 4
    },
    {
      name: 'propietarioNombre',
      label: 'Nombre Completo',
      type: 'text',
      icon: 'group',
      value: '',
      display: true,
      readOnly: false,
      validations: [Validators.required, Validators.min(0)],
      row: 1,
      col: 4
    },
    {
      name: 'propietarioColonia',
      label: 'Colonia / Localidad',
      type: 'text',
      icon: '',
      value: '',
      display: true,
      readOnly: false,
      validations: [Validators.required, Validators.maxLength(30)],
      row: 1,
      col: 4
    },

    {
      name: 'propietarioBarrio',
      label: 'Barrio  / Avenida',
      type: 'text',
      icon: '',
      value: '',
      display: true,
      readOnly: false,
      validations: [Validators.maxLength(30)],
      row: 1,
      col: 4
    },

    {
      name: 'propietarioGrupo',
      label: 'Grupo / Calle',
      type: 'text',
      icon: '',
      value: '',
      display: true,
      readOnly: false,
      validations: [Validators.maxLength(30)],
      row: 2,
      col: 4
    },

    {
      name: 'propietarioCasa',
      label: 'N° de casa',
      type: 'text',
      icon: '',
      value: '',
      display: true,
      readOnly: false,
      validations: [Validators.maxLength(30)],
      row: 2,
      col: 4
    },
    {
      name: 'propietarioDepartamento',
      label: 'Departamento',
      type: 'dropdown',
      options: [],
      icon: 'location_on',
      value: '',
      display: true,
      readOnly: false,
      validations: [Validators.required, Validators.email, Validators.maxLength(40)],
      row: 2,
      col: 4
    },
    {
      name: 'propietarioMunicipio',
      label: 'Municipio',
      type: 'dropdown',
      options: [],
      icon: 'location_on',
      value: '',
      display: true,
      readOnly: false,
      validations: [Validators.email, Validators.maxLength(50)],
      row: 3,
      col: 4
    },
    {
      name: 'propietarioTelefonoCasa',
      label: 'Teléfono de Casa',
      type: 'text',
      icon: 'phone',
      value: '',
      display: true,
      readOnly: false,
      validations: [Validators.maxLength(200)],
      row: 3,
      col: 4
    },
    {
      name: 'propietarioCelular1',
      label: 'Celular 1',
      type: 'text',
      icon: 'phone',
      value: '',
      display: true,
      readOnly: false,
      validations: [Validators.maxLength(200)],
      row: 3,
      col: 4
    },
    {
      name: 'propietarioCelular2',
      label: 'Teléfono 2',
      type: 'text',
      icon: 'phone',
      value: '',
      display: true,
      readOnly: false,
      validations: [Validators.maxLength(200)],
      row: 4,
      col: 4
    },
    {
      name: 'propietarioCorreo1',
      label: 'Correo Electrónico 1',
      type: 'email',
      icon: 'home',
      value: '',
      display: true,
      readOnly: false,
      validations: [Validators.maxLength(200)],
      row: 4,
      col: 4
    },
    {
      name: 'propietarioCorreo2',
      label: 'Correo Electrónico 2',
      type: 'email',
      icon: 'location_on',
      value: '',
      display: true,
      readOnly: false,
      validations: [Validators.maxLength(200)],
      row: 4,
      col: 4
    },
    {
      name: 'propietarioReferencia',
      label: 'Otros Puntos de Referencia',
      type: 'text',
      icon: 'gavel',
      value: '',
      display: true,
      readOnly: false,
      validations: [Validators.maxLength(50)],
      row: 5,
      col: 12
    },
  ];

  async ngOnInit() {
    this.parentForm = this.fb.group({});
    await this.loadDepartamentos();


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


  addControlsToForm() {
    this.fields.forEach((field: any) => {
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
