import { Component, OnInit } from '@angular/core';
import { FormBuilder, FormGroup } from '@angular/forms';

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

  constructor(private fb: FormBuilder) { }

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
