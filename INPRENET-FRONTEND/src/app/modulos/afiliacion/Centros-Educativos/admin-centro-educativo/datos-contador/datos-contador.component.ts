import { Component, EventEmitter, Input, Output } from '@angular/core';
import { FormArray, FormBuilder, FormControl, FormGroup, Validators } from '@angular/forms';
import { DatosEstaticosService } from 'src/app/services/datos-estaticos.service';
import { DireccionService } from 'src/app/services/direccion.service';
import { FieldConfig } from 'src/app/shared/Interfaces/field-config';
@Component({
  selector: 'app-datos-contador',
  templateUrl: './datos-contador.component.html',
  styleUrl: './datos-contador.component.scss'
})
export class DatosContadorComponent {
  @Input() parentForm!: FormGroup;
  departamentos: any = [];
  municipios: any = [];
  @Output() formUpdated = new EventEmitter<any>();
  parentFormIsExist: boolean = false;

  constructor(private fb: FormBuilder, private datosEstaticosService: DatosEstaticosService, private direccionService: DireccionService) { }


  fields: FieldConfig[] = [
    {
      name: 'n_identificacion',
      label: 'Número De Identificación',
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
      name: 'contadorNombre',
      label: 'Nombre Completo',
      type: 'dropdown',
      row: 2,
      col: 6,
      display: true,
      options: [],
      validations: [Validators.required]
    },
    {
      name: 'contadorTelefono',
      label: 'Teléfono 1',
      type: 'dropdown',
      row: 3,
      col: 4,
      display: true,
      options: [{ label: 'PUBLICO', value: 'PUBLICO' }, { label: 'PEGAGOGICO', value: 'PEGAGOGICO' }, { label: 'PRIVADO', value: 'PRIVADO' }, { label: 'PROHECO', value: 'PROHECO' }, { label: 'ADMINISTRATIVO', value: 'ADMINISTRATIVO' }],
      validations: [Validators.required]
    },
    {
      name: 'contadorCorreo',
      label: 'Correo 1',
      type: 'text',
      icon: 'business',
      value: '',
      display: true,
      readOnly: false,
      validations: [Validators.maxLength(255)],
      row: 3,
      col: 4
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
