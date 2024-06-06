import { Component, Input, OnInit, Output, EventEmitter } from '@angular/core';
import { FormControl, FormGroup } from '@angular/forms';
import { FieldConfig } from 'src/app/shared/Interfaces/field-config';

@Component({
  selector: 'app-datos-generales-centro',
  templateUrl: './datos-generales-centro.component.html',
  styleUrls: ['./datos-generales-centro.component.scss']
})
export class DatosGeneralesCentroComponent implements OnInit {
  @Input() parentForm!: FormGroup;
  @Output() formUpdated = new EventEmitter<any>();

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

  ngOnInit() {
    this.addControlsToForm();
    this.parentForm.valueChanges.subscribe(value => {
      this.formUpdated.emit(this.convertNumberFields(value));
    });
  }

  addControlsToForm() {
    this.fields.forEach(field => {
      const control = new FormControl(field.value, field.validations);
      this.parentForm.addControl(field.name, control);
    });
    this.formUpdated.emit(this.convertNumberFields(this.parentForm.value));
  }

  convertNumberFields(values: any) {
    const updatedValues = { ...values };
    this.fields.forEach(field => {
      if (field.type === 'number' && updatedValues[field.name] !== null && updatedValues[field.name] !== '') {
        updatedValues[field.name] = Number(updatedValues[field.name]);
      }
    });
    return updatedValues;
  }

  onDatosBenChange(form: any) {
    this.formUpdated.emit(this.convertNumberFields(form));
  }
}
