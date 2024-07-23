import { ChangeDetectionStrategy, Component, EventEmitter, Input, OnInit, Output } from '@angular/core';
import { FormArray, FormBuilder, FormControl, FormGroup, Validators } from '@angular/forms';
import { CentroTrabajoService } from 'src/app/services/centro-trabajo.service';
import { DatosEstaticosService } from 'src/app/services/datos-estaticos.service';
import { DireccionService } from 'src/app/services/direccion.service';
import { FieldConfig } from 'src/app/shared/Interfaces/field-config';

@Component({
  selector: 'app-admin-centro-educativo',
  templateUrl: './admin-centro-educativo.component.html',
  styleUrls: ['./admin-centro-educativo.component.scss'],
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class AdminCentroEducativoComponent implements OnInit {
  @Input() parentForm!: FormGroup;
  @Input() datosGen!: any;
  @Input() datosPropietario!: FormGroup;
  @Input() datosAdministrador!: FormGroup;
  @Input() datosContador!: FormGroup;
  @Output() formUpdated = new EventEmitter<any>();

  departamentos: any = [];
  municipios: any = [];
  parentFormIsExist: boolean = false;

  constructor(private fb: FormBuilder, private datosEstaticosService: DatosEstaticosService, private direccionService: DireccionService, private centroTrabajoSVC: CentroTrabajoService) { }


  fields: FieldConfig[] = [
    {
      name: 'administradorNombre',
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
      name: 'administradorTelefono',
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
      name: 'administradorCorreo',
      label: 'Departamento',
      type: 'dropdown',
      row: 2,
      col: 6,
      display: true,
      options: [],
      validations: [Validators.required]
    },
    {
      name: 'contadorNombre',
      label: 'Municipio',
      type: 'dropdown',
      row: 2,
      col: 6,
      display: true,
      options: [],
      validations: [Validators.required]
    },
    {
      name: 'contadorTelefono',
      label: 'Sector Económico',
      type: 'dropdown',
      row: 3,
      col: 4,
      display: true,
      options: [{ label: 'PUBLICO', value: 'PUBLICO' }, { label: 'PEGAGOGICO', value: 'PEGAGOGICO' }, { label: 'PRIVADO', value: 'PRIVADO' }, { label: 'PROHECO', value: 'PROHECO' }, { label: 'ADMINISTRATIVO', value: 'ADMINISTRATIVO' }],
      validations: [Validators.required]
    },
    {
      name: 'contadorCorreo',
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
      name: 'propietarioNombre',
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
      name: 'propietarioColonia',
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
      name: 'propietarioBarrio',
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
      name: 'propietarioGrupo',
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
      name: 'propietarioCasa',
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
      name: 'propietarioDepartamento',
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
      name: 'propietarioMunicipio',
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
      name: 'propietarioTelefonoCasa',
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
      name: 'propietarioCelular1',
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
      name: 'propietarioCelular2',
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
      name: 'propietarioCorreo1',
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
      name: 'propietarioCorreo2',
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
      name: 'propietarioReferencia',
      label: 'Número de Acuerdo',
      type: 'text',
      icon: 'gavel',
      value: '',
      display: true,
      readOnly: false,
      validations: [Validators.maxLength(50)],
      row: 8,
      col: 3
    },
  ];


  async ngOnInit() {
    this.parentForm = this.fb.group({});
    await this.loadDepartamentos();

    if (this.fields) {
      this.addControlsToForm();
    }
    this.parentForm.valueChanges.subscribe(value => {
      /* this.formUpdated.emit(this.convertNumberFields(value)); */
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


  async onDatosPropietarioFormUpdate(formData: FormGroup): Promise<void> {
    this.handleSearchResultProp(formData);
  }

  async handleSearchResultProp(formData: FormGroup): Promise<void> {
    this.datosPropietario = formData;

  }

  async onDatosAdministradorFormUpdate(formData: FormGroup): Promise<void> {
    this.handleSearchResultAdm(formData);
  }

  handleSearchResultAdm(formData: FormGroup) {
    this.datosAdministrador = formData
  }

  async onDatosContadorFormUpdate(formData: FormGroup): Promise<void> {
    this.handleSearchResultCont(formData);
  }

  handleSearchResultCont(form: any) {
    this.datosContador = form
  }

}
