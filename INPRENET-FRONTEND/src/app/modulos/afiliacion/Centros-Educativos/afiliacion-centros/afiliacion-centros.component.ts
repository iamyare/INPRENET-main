//afiliacion-centros.component.ts
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

  datosGeneralesData: any = {};
  sociedadData: any = {};
  adminCentroEducativo: any = {}; 

  constructor(private fb: FormBuilder) {}

  ngOnInit(): void {
    this.initForms();
    this.setupFormListeners();
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
    
    // Configurar adminCentroEducativoForm con subgrupos para cada sección
    this.adminCentroEducativoForm = this.fb.group({
      datosAdministrador: this.fb.group({}),
      datosContador: this.fb.group({}),
      datosPropietario: this.fb.group({})
    });
  }

  setupFormListeners() {
    this.datosGeneralesForm.valueChanges.subscribe(value => {
      if (this.datosGeneralesForm.valid) {
        this.onDatosGeneralesFormUpdate(value);
      }
    });

    this.sociedadForm.valueChanges.subscribe(value => {
      if (this.sociedadForm.valid) {
        this.onSociedadFormUpdate(value);
      }
    });

    this.adminCentroEducativoForm.valueChanges.subscribe(value => {
      if (this.adminCentroEducativoForm.valid) {
        this.onAdminCentroEducativo(value);
      }
    });
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

  onAdminCentroEducativo(formValues: any): void {
    this.adminCentroEducativo = formValues;
  }

  gatherAllData(): void {
   
    const allData = {
      datosGenerales: this.datosGeneralesData,
      referencias: this.referenciasForm.value.referencias.length > 0 ? this.referenciasForm.value.referencias : [],
      sociedad: this.sociedadData,
      sociedadSocio: this.sociedadSocioForm.value.sociedadSocios.length > 0 ? this.sociedadSocioForm.value.sociedadSocios : [],
      adminCentroEducativo: {
        datosAdministrador: this.adminCentroEducativoForm.get('datosAdministrador')?.value,
        datosContador: this.adminCentroEducativoForm.get('datosContador')?.value,
        datosPropietario: this.adminCentroEducativoForm.get('datosPropietario')?.value,
      }
    };

  }

  private isFormGroupEmpty(formGroup: FormGroup): boolean {
    return Object.values(formGroup.controls).every(control => control.value === '' || control.value == null);
  }
} 