import { Component, Input, OnInit, Output, EventEmitter } from '@angular/core';
import { FormBuilder, FormGroup, Validators } from '@angular/forms';
import { CentroTrabajoService } from 'src/app/services/centro-trabajo.service';
import { DatosEstaticosService } from 'src/app/services/datos-estaticos.service';
import { DireccionService } from 'src/app/services/direccion.service';
import { TipoIdentificacionService } from 'src/app/services/tipo-identificacion.service';
import { FieldConfig } from 'src/app/shared/Interfaces/field-config';

@Component({
  selector: 'app-dat-generales-afiliado',
  templateUrl: './dat-generales-afiliado.component.html',
  styleUrls: ['./dat-generales-afiliado.component.scss']
})
export class DatGeneralesAfiliadoComponent implements OnInit {
  @Input() parentForm!: FormGroup;
  @Output() formUpdated = new EventEmitter<any>();
  parentFormIsExist: boolean = false;

  fields: FieldConfig[] = [
    {
      name: 'n_identificacion',
      label: 'Número de Identificación',
      type: 'text',
      icon: 'credit_card',
      display: true,
      validations: [Validators.required, Validators.maxLength(15), Validators.pattern(/^[0-9]{13}$|^[0-9]{4}-[0-9]{4}-[0-9]{5}$/)],
      row: 1,
      col: 4
    },
    {
      name: 'primer_nombre',
      label: 'Primer Nombre',
      type: 'text',
      icon: 'person',
      display: true,
      validations: [Validators.required, Validators.maxLength(40), Validators.minLength(1), Validators.pattern(/^[^\s]+$/)],
      row: 1,
      col: 4
    },
    {
      name: 'segundo_nombre',
      label: 'Segundo Nombre',
      type: 'text',
      icon: 'person',
      display: true,
      validations: [Validators.maxLength(40), Validators.pattern(/^[^\s]+$/)],
      row: 1,
      col: 4
    },
    {
      name: 'tercer_nombre',
      label: 'Tercer Nombre',
      type: 'text',
      icon: 'person',
      display: true,
      validations: [Validators.maxLength(40), Validators.pattern(/^[^\s]+$/)],
      row: 2,
      col: 6
    },
    {
      name: 'primer_apellido',
      label: 'Primer Apellido',
      type: 'text',
      icon: 'person',
      display: true,
      validations: [Validators.required, Validators.maxLength(40), Validators.minLength(1), Validators.pattern(/^[^\s]+$/)],
      row: 3,
      col: 6
    },
    {
      name: 'segundo_apellido',
      label: 'Segundo Apellido',
      type: 'text',
      icon: 'person',
      display: true,
      validations: [Validators.maxLength(40)],
      row: 3,
      col: 6
    },
    {
      name: 'fallecido',
      label: 'Fallecido',
      type: 'text',
      icon: '',
      display: false,
      validations: [Validators.maxLength(2)],
      row: 3,
      col: 6
    },
    {
      name: 'fecha_nacimiento',
      label: 'Fecha de Nacimiento',
      type: 'date',
      icon: '',
      display: true,
      validations: [Validators.required],
      row: 4,
      col: 6
    },
    {
      name: 'fecha_vencimiento_ident',
      label: 'Fecha de Vencimiento de Identificación',
      type: 'date',
      icon: '',
      display: true,
      validations: [Validators.required],
      row: 4,
      col: 6
    },
    {
      name: 'cantidad_dependientes',
      label: 'Cantidad de Dependientes',
      type: 'number',
      icon: '',
      display: true,
      validations: [Validators.required, Validators.pattern("^[0-9]+$")],
      row: 4,
      col: 6
    },
    {
      name: 'estado_civil',
      label: 'Estado Civil',
      type: 'dropdown',
      options: [], // Se cargará dinámicamente
      display: true,
      validations: [Validators.required, Validators.maxLength(40)],
      row: 5,
      col: 6
    },
    {
      name: 'representacion',
      label: 'Representación',
      type: 'dropdown',
      options: [], // Se cargará dinámicamente
      display: true,
      validations: [Validators.required, Validators.maxLength(40)],
      row: 5,
      col: 6
    },
    {
      name: 'telefono_1',
      label: 'Teléfono Principal',
      type: 'text',
      icon: 'phone',
      display: true,
      validations: [Validators.required, Validators.maxLength(12)],
      row: 5,
      col: 6
    },
    {
      name: 'telefono_2',
      label: 'Teléfono Secundario',
      type: 'text',
      icon: 'phone',
      display: true,
      validations: [Validators.maxLength(12)],
      row: 5,
      col: 6
    },
    {
      name: 'correo_1',
      label: 'Correo Principal',
      type: 'email',
      icon: 'email',
      display: true,
      validations: [Validators.required, Validators.maxLength(40), Validators.email],
      row: 6,
      col: 6
    },
    {
      name: 'correo_2',
      label: 'Correo Secundario',
      type: 'email',
      icon: 'email',
      display: true,
      validations: [Validators.maxLength(40), Validators.email],
      row: 6,
      col: 6
    },
    {
      name: 'rtn',
      label: 'Número de RTN',
      type: 'text',
      icon: 'credit_card',
      display: true,
      validations: [Validators.required, Validators.maxLength(14), Validators.pattern(/^[0-9]{14}$/)],
      row: 6,
      col: 6
    },
    {
      name: 'genero',
      label: 'Género',
      type: 'dropdown',
      options: [], // Se cargará dinámicamente
      display: true,
      validations: [Validators.required, Validators.maxLength(30)],
      row: 7,
      col: 6
    },
    {
      name: 'id_profesion',
      label: 'Profesión',
      type: 'dropdown',
      options: [], // Se cargará dinámicamente
      display: true,
      validations: [Validators.required],
      row: 7,
      col: 6
    },
    {
      name: 'id_departamento_residencia',
      label: 'Departamento de Residencia',
      type: 'dropdown',
      options: [],
      display: true,
      validations: [Validators.required],
      row: 8,
      col: 6
    },
    {
      name: 'id_municipio_residencia',
      label: 'Municipio de Residencia',
      type: 'dropdown',
      options: [],
      display: true,
      validations: [Validators.required],
      row: 8,
      col: 6
    },
    {
      name: 'id_departamento_nacimiento',
      label: 'Departamento de Nacimiento',
      type: 'dropdown',
      options: [],
      display: true,
      validations: [Validators.required],
      row: 9,
      col: 6
    },
    {
      name: 'id_municipio_nacimiento',
      label: 'Municipio de Nacimiento',
      type: 'dropdown',
      options: [],
      display: true,
      validations: [Validators.required],
      row: 9,
      col: 6
    },
    {
      name: 'id_tipo_identificacion',
      label: 'Tipo de Identificación',
      type: 'dropdown',
      options: [], // Se cargará dinámicamente
      display: true,
      validations: [Validators.required],
      row: 10,
      col: 6
    },
    {
      name: 'id_pais_nacionalidad',
      label: 'Nacionalidad',
      type: 'dropdown',
      options: [], // Se cargará dinámicamente
      display: true,
      validations: [Validators.required],
      row: 10,
      col: 6
    },
    {
      name: 'sexo',
      label: 'Sexo',
      type: 'dropdown',
      options: [], // Se cargará dinámicamente
      display: true,
      validations: [Validators.required, Validators.maxLength(1), Validators.pattern(/^[FM]$/)],
      row: 11,
      col: 6
    },
    {
      name: 'grupo_etnico',
      label: 'Grupo Étnico',
      type: 'dropdown',
      options: [], // Se cargará dinámicamente
      display: true,
      validations: [Validators.required],
      row: 11,
      col: 6
    },
    {
      name: 'cantidad_hijos',
      label: 'Cantidad de Hijos',
      type: 'number',
      icon: 'child_care',
      display: true,
      validations: [Validators.required],
      row: 12,
      col: 6
    },
    {
      name: 'barrio_colonia',
      label: 'Barrio / Colonia',
      type: 'text',
      icon: 'location_on',
      display: true,
      validations: [Validators.maxLength(75), Validators.pattern(/^[a-zA-Z0-9\s]*$/)],
      row: 12,
      col: 6
    },
    {
      name: 'avenida',
      label: 'Avenida',
      type: 'text',
      icon: 'location_on',
      display: true,
      validations: [Validators.maxLength(75), Validators.pattern(/^[a-zA-Z0-9\s]*$/)],
      row: 12,
      col: 6
    },
    {
      name: 'calle',
      label: 'Calle',
      type: 'text',
      icon: 'location_on',
      display: true,
      validations: [Validators.maxLength(75), Validators.pattern(/^[a-zA-Z0-9\s]*$/)],
      row: 12,
      col: 6
    },
    {
      name: 'sector',
      label: 'Sector',
      type: 'text',
      icon: 'location_on',
      display: true,
      validations: [Validators.maxLength(75), Validators.pattern(/^[a-zA-Z0-9\s]*$/)],
      row: 12,
      col: 6
    },
    {
      name: 'bloque',
      label: 'Bloque',
      type: 'text',
      icon: 'location_on',
      display: true,
      validations: [Validators.maxLength(25), Validators.pattern(/^[a-zA-Z0-9\s]*$/)],
      row: 12,
      col: 6
    },
    {
      name: 'numero_casa',
      label: 'Número de Casa',
      type: 'text',
      icon: 'home',
      display: true,
      validations: [Validators.maxLength(25), Validators.pattern(/^[a-zA-Z0-9\s]*$/)],
      row: 12,
      col: 6
    },
    {
      name: 'color_casa',
      label: 'Color de Casa',
      type: 'text',
      icon: 'palette',
      display: true,
      validations: [Validators.maxLength(40), Validators.pattern(/^[a-zA-Z0-9\s]*$/)],
      row: 12,
      col: 6
    },
    {
      name: 'aldea',
      label: 'Aldea',
      type: 'text',
      icon: 'location_on',
      display: true,
      validations: [Validators.maxLength(75), Validators.pattern(/^[a-zA-Z0-9\s]*$/)],
      row: 12,
      col: 6
    },
    {
      name: 'caserio',
      label: 'Caserío',
      type: 'text',
      icon: 'location_on',
      display: true,
      validations: [Validators.maxLength(75), Validators.pattern(/^[a-zA-Z0-9\s]*$/)],
      row: 12,
      col: 6
    },
    {
      name: 'grado_academico',
      label: 'Grado Académico',
      type: 'dropdown',
      options: [
        { label: 'PRIMARIA', value: 'PRIMARIA' },
        { label: 'EDUCACIÓN MEDIA', value: 'EDUCACIÓN MEDIA' },
        { label: 'PRE-GRADO', value: 'PRE-GRADO' },
        { label: 'POST-GRADO', value: 'POST-GRADO' }
      ],
      display: true,
      validations: [Validators.maxLength(75)],
      row: 14,
      col: 6
    },
    {
      name: 'cargoPublico',
      label: '¿Ha desempeñado un cargo público?',
      type: 'radio',
      options: [
        { label: 'Sí', value: 'SI' },
        { label: 'No', value: 'NO' }
      ],
      display: true,
      validations: [Validators.required],
      row: 13,
      col: 6
    },
    {
      type: 'conditionalRadio',
      name: 'showCheckboxes',
      row: 15,
      col: 6,
      display: true,
      label: '¿Tiene alguna discapacidad?',
      options: [
        { label: 'Si', value: 'si' },
        { label: 'No', value: 'no' }
      ],
      dependentFields: {
        si: [
          {
            type: 'checkboxGroup',
            name: 'discapacidades',
            label: 'Selecciones las descapacidades',
            options: [
              { label: 'MOTRIZ', value: 1 },
              { label: 'AUDITIVA', value: 2 },
              { label: 'VISUAL', value: 3 },
              { label: 'INTELECTUAL', value: 4 },
              { label: 'MENTAL', value: 5 },
              { label: 'PSICOSOCIAL', value: 6 },
              { label: 'MÚLTIPLE', value: 7 },
              { label: 'SENSORIAL', value: 8 }
            ]
          }
        ],
        no: []
      }
    }
  ];

  constructor(
    private fb: FormBuilder,
    private datosEstaticosService: DatosEstaticosService,
    private direccionService: DireccionService,
    private tipoIdentificacionService: TipoIdentificacionService,
    private centroTrabajoService: CentroTrabajoService
  ) { }

  async ngOnInit() {
    this.parentForm = this.fb.group({});
    await this.loadDynamicOptions();
    if (this.fields) {
      this.addControlsToForm();
    }
    this.parentForm.valueChanges.subscribe(() => {
      this.formUpdated.emit(this.convertNumberFields(this.parentForm));
    });
  }

  async loadDynamicOptions() {
    const [departamentos, municipios, tipoIdentificacion, nacionalidades, profesiones] = await Promise.all([
      this.direccionService.getAllDepartments().toPromise(),
      this.direccionService.getAllMunicipios().toPromise(),
      this.tipoIdentificacionService.obtenerTiposIdentificacion().toPromise(),
      this.direccionService.getAllPaises().toPromise(),
      this.centroTrabajoService.obtenerTodasLasProfesiones().toPromise()
    ]);

    this.setFieldOptions('id_departamento_residencia', departamentos || []);
    this.setFieldOptions('id_departamento_nacimiento', departamentos || []);
    this.setFieldOptions('id_municipio_residencia', municipios || []);
    this.setFieldOptions('id_municipio_nacimiento', municipios || []);
    this.setFieldOptions('id_tipo_identificacion', tipoIdentificacion || []);
    this.setFieldOptions('id_pais_nacionalidad', nacionalidades || []);
    this.setFieldOptions('id_profesion', profesiones || []);
  }

  setFieldOptions(fieldName: string, options: any[]) {
    const field = this.fields.find(f => f.name === fieldName);
    if (field) {
      field.options = options.map(option => ({
        value: option.value || option.id_departamento || option.id_municipio || option.id_identificacion || option.id_pais || option.idProfesion,
        label: option.label || option.nombre_departamento || option.nombre_municipio || option.tipo_identificacion || option.nacionalidad || option.descripcion
      }));
    }
  }

  addControlsToForm() {
    this.fields.forEach((field: FieldConfig) => {
      const control = this.fb.control(field.value, field.validations);
      this.parentForm.addControl(field.name, control);
    });
    this.formUpdated.emit(this.convertNumberFields(this.parentForm));
    this.parentFormIsExist = true;
  }

  handleSelectChange(event: { fieldName: string, value: any }) {
    if (event.fieldName === 'id_departamento_residencia') {
      this.onDepartamentoResidenciaChange(event.value);
    }
    if (event.fieldName === 'id_departamento_nacimiento') {
      this.onDepartamentoNacimientoChange(event.value);
    }
  }

  convertNumberFields(form: FormGroup) {
    const updatedValues = { ...form.value };
    this.fields.forEach((field:any) => {
        if (field.type === 'number' && updatedValues[field.name] !== null && updatedValues[field.name] !== '') {
            updatedValues[field.name] = Number(updatedValues[field.name]);
        }
        // Asegúrate de que la conversión para 'discapacidades' esté correcta
        if (field.name === 'discapacidades' && Array.isArray(updatedValues[field.name])) {
            const selectedDisabilities:any = [];
            updatedValues[field.name].forEach((selected:any, index:any) => {
                if (selected) {
                    selectedDisabilities.push({ id_discapacidad: field.options[index].value });
                }
            });
            updatedValues[field.name] = selectedDisabilities;
        }
    });
    return updatedValues;
}




  onDatosBenChange(form: any) {
    this.formUpdated.emit(this.convertNumberFields(form));
  }

  async onDepartamentoResidenciaChange(departamentoId: number) {
    const municipios = await this.direccionService.getMunicipiosPorDepartamentoId(departamentoId).toPromise();
    this.updateFieldOptions('id_municipio_residencia', municipios || []);
    this.parentForm.get('id_municipio_residencia')?.setValue(null);
  }

  async onDepartamentoNacimientoChange(departamentoId: number) {
    const municipios = await this.direccionService.getMunicipiosPorDepartamentoId(departamentoId).toPromise();
    this.updateFieldOptions('id_municipio_nacimiento', municipios || []);
    this.parentForm.get('id_municipio_nacimiento')?.setValue(null);
  }

  updateFieldOptions(fieldName: string, options: any[]) {
    const field = this.fields.find(f => f.name === fieldName);
    if (field) {
      field.options = options.map(option => ({
        value: option.id_municipio,
        label: option.nombre_municipio
      }));
    }
  }

  handleImageCaptured(image: string) {
    this.parentForm.get('FotoPerfil')?.setValue(image);
  }
}
