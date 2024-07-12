import { Component, EventEmitter, Input, OnInit, Output } from '@angular/core';
import { AbstractControl, FormArray, FormBuilder, FormGroup, Validators } from '@angular/forms';
import { DireccionService } from 'src/app/services/direccion.service';
import { FormStateService } from 'src/app/services/form-state.service';
import { FieldArrays } from 'src/app/shared/Interfaces/field-arrays';

@Component({
  selector: 'app-otras-fuentes-ingreso',
  templateUrl: './otras-fuentes-ingreso.component.html',
  styleUrls: ['./otras-fuentes-ingreso.component.scss']
})
export class OtrasFuentesIngresoComponent implements OnInit {
  @Input() parentForm!: FormGroup;
  @Output() onOtrasFuentesIngresoChange = new EventEmitter<FormGroup>();

  departamentos: any = [];
  municipios: any = [];
  private formKey = 'FormOtrasFuentesIngreso';

  fields: FieldArrays[] = [
    { name: 'actividad_economica', label: 'Actividad Económica', icon: 'business', layout: { row: 0, col: 4 }, type: 'select', value: '', options: [{ label: "SECRETARIO GENERAL", value: "SECRETARIO GENERAL" }], validations: [] },
    { name: 'monto_ingreso', label: 'Monto De Ingreso', layout: { row: 0, col: 4 }, type: 'number', value: '', validations: [] },
    { name: 'observacion', label: 'Observación', icon: 'visibility', layout: { row: 0, col: 4 }, type: 'text', value: '', validations: [Validators.required, Validators.maxLength(14), Validators.minLength(14), Validators.pattern('^[0-9]{14}$')] },
  ];

  constructor(
    private fb: FormBuilder,
    private direccionService: DireccionService,
    private formStateService: FormStateService
  ) { }

  ngOnInit(): void {
    this.initForm();
    this.loadDepartamentos();
  }

  private initForm(): void {
    let existingForm = this.formStateService.getForm(this.formKey);
    if (existingForm) {
      this.parentForm = existingForm;
    } else {
      this.parentForm = this.fb.group({
        sociedadSocios: this.fb.array([])
      });
    }

    this.parentForm.valueChanges.subscribe(() => {
      this.onOtrasFuentesIngresoChange.emit(this.parentForm);
    });
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
      actividad_economica: ['', Validators.required],
      monto_ingreso: ['', Validators.required],
      observacion: ['', [Validators.required, Validators.maxLength(14), Validators.minLength(14), Validators.pattern('^[0-9]{14}$')]],
    });

    this.sociedadSocios.push(sociedadSocioGroup);

    this.onDatosOtrasFuentesIngreso();
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
    this.onDatosOtrasFuentesIngreso();
  }

  asFormGroup(control: AbstractControl): FormGroup {
    return control as FormGroup;
  }

  onDatosOtrasFuentesIngreso() {
    this.formStateService.setForm(this.formKey, this.parentForm);
    this.onOtrasFuentesIngresoChange.emit(this.parentForm);
  }
}
