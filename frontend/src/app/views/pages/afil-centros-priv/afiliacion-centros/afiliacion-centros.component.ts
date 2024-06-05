import { Component, OnInit } from '@angular/core';
import { FormBuilder, FormGroup } from '@angular/forms';
import { FieldConfig } from 'src/app/shared/Interfaces/field-config';

@Component({
  selector: 'app-afiliacion-centros',
  templateUrl: './afiliacion-centros.component.html',
  styleUrls: ['./afiliacion-centros.component.scss']
})
export class AfiliacionCentrosComponent implements OnInit {
  steps = [
    { label: 'Datos Generales De Centros', isActive: true },
    { label: 'Referencias Bancarias Y Comerciales', isActive: false },
    { label: 'Sociedades', isActive: false },
    { label: 'Socios', isActive: false },
    { label: 'Administración del Centro Educativo', isActive: false },
    { label: 'Declaración de Persona Políticamente Expuesta', isActive: false },
    { label: 'Finalizar', isActive: false },
  ];

  activeStep = 0;

  datosGeneralesForm!: FormGroup;
  referenciasForm!: FormGroup;
  sociedadForm!: FormGroup;
  sociedadSocioForm!: FormGroup;
  adminCentroEducativoForm!: FormGroup;

  datosGeneralesData: any = {}; // Variable para almacenar los datos del formulario de datos generales
  sociedadData: any = {}; // Variable para almacenar los datos del formulario de sociedad

  fieldsStep5: FieldConfig[] = [
    {
      name: 'pep_declaration',
      label: '¿Alguno de los socios o propietario ha desempeñado o ha desempeñado un cargo público?',
      type: 'radio',
      options: [
        { label: 'Sí', value: 'si' },
        { label: 'No', value: 'no' }
      ],
      value: '',
      display: true,
      validations: [],
      row: 1,
      col: 12
    },
    {
      name: 'pep_nombre_apellidos',
      label: 'Nombre y Apellidos',
      type: 'text',
      value: '',
      display: false,
      validations: [],
      row: 2,
      col: 6
    },
    {
      name: 'pep_cargo_desempenado',
      label: 'Cargo Desempeñado',
      type: 'text',
      value: '',
      display: false,
      validations: [],
      row: 2,
      col: 6
    },
    {
      name: 'pep_periodo',
      label: 'Periodo',
      type: 'text',
      value: '',
      display: false,
      validations: [],
      row: 3,
      col: 6
    },
    {
      name: 'pep_otras_referencias',
      label: 'Otras Referencias',
      type: 'text',
      value: '',
      display: false,
      validations: [],
      row: 3,
      col: 6
    },
    {
      name: 'docente_deducciones',
      label: 'HA REALIZADO DEDUCCIONES DE COTIZACIONES A LOS DOCENTES QUE TRABAJAN EN LA INSTITUCIÓN:',
      type: 'radio',
      options: [
        { label: 'Sí', value: 'si' },
        { label: 'No', value: 'no' }
      ],
      value: '',
      display: true,
      validations: [],
      row: 4,
      col: 12
    }
  ];

  constructor(private fb: FormBuilder) {}

  ngOnInit(): void {
    this.initForms();
  }

  initForms() {
    this.datosGeneralesForm = this.fb.group({});
    this.referenciasForm = this.fb.group({
      referencias: this.fb.array([])
    });
    this.sociedadForm = this.fb.group({});
    this.sociedadSocioForm = this.fb.group({
      sociedadSocios: this.fb.array([])
    });
    this.adminCentroEducativoForm = this.fb.group({});
  }

  handleStepChange(index: number): void {
    this.activeStep = index;
  }

  onDatosBenChange(formValues: any): void {
    this.updateFieldVisibility(formValues.pep_declaration);
  }

  updateFieldVisibility(pepDeclarationValue: string): void {
    const fieldsToUpdate = ['pep_nombre_apellidos', 'pep_cargo_desempenado', 'pep_periodo', 'pep_otras_referencias'];
    this.fieldsStep5.forEach(field => {
      if (fieldsToUpdate.includes(field.name)) {
        field.display = pepDeclarationValue === 'si';
      }
    });
  }

  onDatosGeneralesFormUpdate(formValues: any): void {
    this.datosGeneralesData = formValues;
  }

  onSociedadFormUpdate(formValues: any): void {
    this.sociedadData = formValues;
  }

  gatherAllData(): void {
    const allData = {
      datosGenerales: this.datosGeneralesData,
      referencias: this.referenciasForm.value.referencias.length > 0 ? this.referenciasForm.value.referencias : [],
      sociedad: this.sociedadData,
      sociedadSocio: this.sociedadSocioForm.value.sociedadSocios.length > 0 ? this.sociedadSocioForm.value.sociedadSocios : [],
      adminCentroEducativo: this.isFormGroupEmpty(this.adminCentroEducativoForm) ? {} : this.adminCentroEducativoForm.value
    };
    console.log('Datos Completos:', allData);
  }

  private isFormGroupEmpty(formGroup: FormGroup): boolean {
    return Object.values(formGroup.controls).every(control => control.value === '' || control.value == null);
  }
}
