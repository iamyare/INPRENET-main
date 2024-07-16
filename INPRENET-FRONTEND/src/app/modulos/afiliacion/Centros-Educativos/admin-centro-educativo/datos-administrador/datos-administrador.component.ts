import { Component, EventEmitter, Input, Output } from '@angular/core';
import { FormArray, FormBuilder, FormControl, FormGroup, Validators } from '@angular/forms';
import { DatosEstaticosService } from 'src/app/services/datos-estaticos.service';
import { DireccionService } from 'src/app/services/direccion.service';
import { FieldConfig } from 'src/app/shared/Interfaces/field-config';

@Component({
  selector: 'app-datos-administrador',
  templateUrl: './datos-administrador.component.html',
  styleUrl: './datos-administrador.component.scss'
})
export class DatosAdministradorComponent {
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
      name: 'administradorNombre',
      label: 'Nombre del Administrador',
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
      name: 'administradorTelefono',
      label: 'Teléfono 1',
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
      name: 'administradorCorreo',
      label: 'Correo 1',
      type: 'dropdown',
      row: 2,
      col: 6,
      display: true,
      options: [],
      validations: [Validators.required]
    }
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
