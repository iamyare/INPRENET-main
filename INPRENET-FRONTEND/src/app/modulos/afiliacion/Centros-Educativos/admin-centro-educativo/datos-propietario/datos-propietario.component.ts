import { Component, Input, OnInit } from '@angular/core';
import { FormBuilder, FormControl, FormGroup, Validators } from '@angular/forms';
import { DatosEstaticosService } from 'src/app/services/datos-estaticos.service';
import { DireccionService } from 'src/app/services/direccion.service';
import { FieldConfig } from 'src/app/shared/Interfaces/field-config';
import { ValidationService } from 'src/app/shared/services/validation.service';
import { CentroEducativoService } from 'src/app/services/centro-educativo.service'; // Importar el servicio compartido

@Component({
  selector: 'app-datos-propietario',
  templateUrl: './datos-propietario.component.html',
  styleUrls: ['./datos-propietario.component.scss']
})
export class DatosPropietarioComponent implements OnInit {
  @Input() parentForm!: FormGroup;

  departamentos: any = [];
  municipios: any = [];
  
  fields: FieldConfig[] = [
    { name: 'n_identificacionPropietario', label: 'Numero de identificación', type: 'text', icon: 'badge', value: '', display: true, readOnly: false, validations: [Validators.required, Validators.min(0), this.validationService.dniValidator()], row: 1, col: 6 },
    { name: 'propietarioNombre', label: 'Nombre Completo Propietario', type: 'text', icon: 'group', value: '', display: true, readOnly: false, validations: [Validators.required, Validators.min(0), this.validationService.namesValidator()], row: 1, col: 6 },
    { name: 'propietarioColonia', label: 'Colonia / Localidad', type: 'text', icon: 'location_on', value: '', display: true, readOnly: false, validations: [Validators.required, Validators.maxLength(30), this.validationService.noSpecialCharactersOrSequencesValidator()], row: 1, col: 4 },
    { name: 'propietarioBarrio', label: 'Barrio / Avenida', type: 'text', icon: 'location_on', value: '', display: true, readOnly: false, validations: [Validators.maxLength(30), this.validationService.noSpecialCharactersOrSequencesValidator()], row: 1, col: 4 },
    { name: 'propietarioGrupo', label: 'Grupo / Calle', type: 'text', icon: 'location_on', value: '', display: true, readOnly: false, validations: [Validators.maxLength(30), this.validationService.noSpecialCharactersOrSequencesValidator()], row: 2, col: 4 },
    { name: 'propietarioCasa', label: 'N° de casa', type: 'text', icon: 'location_on', value: '', display: true, readOnly: false, validations: [Validators.maxLength(30), this.validationService.houseNumberValidator()], row: 2, col: 4 },
    { name: 'propietarioDepartamento', label: 'Departamento', type: 'dropdown', options: [], icon: 'location_on', value: '', display: true, validations: [Validators.required], row: 3, col: 4 },
    { name: 'propietarioMunicipio', label: 'Municipio', type: 'dropdown', options: [], icon: 'location_on', value: '', display: true, validations: [Validators.required], row: 3, col: 4 },
    { name: 'propietarioTelefonoCasa', label: 'Teléfono de Casa', type: 'text', icon: 'phone', value: '', display: true, readOnly: false, validations: [Validators.maxLength(200), this.validationService.phoneValidator()], row: 3, col: 4 },
    { name: 'propietarioCelular1', label: 'Celular 1', type: 'text', icon: 'phone', value: '', display: true, readOnly: false, validations: [Validators.maxLength(200), this.validationService.phoneValidator()], row: 3, col: 4 },
    { name: 'propietarioCelular2', label: 'Teléfono 2', type: 'text', icon: 'phone', value: '', display: true, readOnly: false, validations: [Validators.maxLength(200), this.validationService.phoneValidatorOptional()], row: 4, col: 4 },
    { name: 'propietarioCorreo1', label: 'Correo Electrónico 1', type: 'email', icon: 'email', value: '', display: true, readOnly: false, validations: [Validators.maxLength(200), Validators.email, this.validationService.emailValidator()], row: 4, col: 6 },
    { name: 'propietarioCorreo2', label: 'Correo Electrónico 2', type: 'email', icon: 'location_on', value: '', display: true, readOnly: false, validations: [Validators.maxLength(200), Validators.email, this.validationService.emailOptionalValidator()], row: 4, col: 6 },
    { name: 'propietarioReferencia', label: 'Otros Puntos de Referencia', type: 'text', icon: 'gavel', value: '', display: true, readOnly: false, validations: [Validators.maxLength(50), this.validationService.noSpecialCharactersOrSequencesValidator()], row: 1, col: 12 }
  ];

  constructor(
    private fb: FormBuilder,
    private datosEstaticosService: DatosEstaticosService,
    private direccionService: DireccionService,
    private validationService: ValidationService,
    private centroEducativoService: CentroEducativoService
  ) {}

  async ngOnInit() {
    if (!this.parentForm) {
      this.parentForm = this.fb.group({});
    }

    await this.loadDepartamentos();
    this.addControlsToForm();

    this.parentForm.valueChanges.subscribe(value => {
      if (this.parentForm.valid) { // Solo actualizar el servicio si el formulario es válido
        console.log('Actualizando datos del Propietario en el servicio:', value);
        this.centroEducativoService.updatePropietarioData(value); // Actualizar el servicio
      }
    });
  }

  async loadDepartamentos() {
    try {
      const departamentos = await this.datosEstaticosService.getDepartamentos();
      const departamentoField = this.fields.find(field => field.name === 'propietarioDepartamento');
      if (departamentoField) {
        departamentoField.options = departamentos;
      }
    } catch (error) {
      console.error('Error al cargar departamentos:', error);
    }
  }

  addControlsToForm() {
    if (!this.parentForm) {
      return;
    }
    this.fields.forEach(field => {
      if (!this.parentForm.contains(field.name)) {
        this.parentForm.addControl(field.name, new FormControl(field.value, field.validations));
      } else {
        const control = this.parentForm.get(field.name) as FormControl;
        control.setValue(control.value || field.value);
      }
    });
    // Emitir los valores iniciales del formulario al servicio
    this.centroEducativoService.updatePropietarioData(this.parentForm.value);
  }

  async onDepartamentoChange(departamentoId: any) {
    try {
      const municipios = await this.direccionService.getMunicipiosPorDepartamentoId(departamentoId).toPromise();
      const municipioField = this.fields.find(field => field.name === 'propietarioMunicipio');
      if (municipioField) {
        municipioField.options = municipios;
      }

      const municipioControl = this.parentForm.get('propietarioMunicipio');
      if (municipioControl) {
        municipioControl.setValue(null); // Resetear el municipio al cambiar el departamento
      }
    } catch (error) {
      console.error('Error al cargar municipios:', error);
    }
  }

  handleSelectChange(event: { fieldName: string, value: any }) {
    if (event.fieldName === 'propietarioDepartamento') {
      this.onDepartamentoChange(event.value);
    }
  }
}
