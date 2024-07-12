import { Component, OnInit } from '@angular/core';
import { FormBuilder, FormGroup } from '@angular/forms';

@Component({
  selector: 'app-afiliacion-docentes',
  templateUrl: './afiliacion-docentes.component.html',
  styleUrls: ['./afiliacion-docentes.component.scss']
})
export class AfiliacionDocentesComponent implements OnInit {
  steps = [
    { label: 'Datos Generales Del Docente', isActive: true },
    { label: 'Colegio Magisterial', isActive: false },
    { label: 'Datos Cuentas Bancarias', isActive: false },
    { label: 'Centros De Trabajo', isActive: false },
    { label: 'Finalizar', isActive: false },
  ];

  activeStep = 0;

  datosGeneralesForm!: FormGroup;
  colegioMagisterialForm!: FormGroup;
  bancosForm!: FormGroup;
  centrosTrabajoForm!: FormGroup;

  datosGeneralesData: any = {};
  colegioMagisterialData: any = {};
  bancosData: any = {};
  centrosTrabajoData: any = {};
  otrasFuentesIngresoData: any = {};

  constructor(private fb: FormBuilder) { }

  ngOnInit(): void {
    this.initForms();
  }

  initForms() {
    this.datosGeneralesForm = this.fb.group({});
    this.colegioMagisterialForm = this.fb.group({});
    this.bancosForm = this.fb.group({});
    this.centrosTrabajoForm = this.fb.group({});
  }

  handleStepChange(index: number): void {
    this.activeStep = index;
  }

  onDatosGeneralesFormUpdate(formValues: any): void {
    this.datosGeneralesData = formValues;
  }

  onColegioMagisterialFormUpdate(formValues: any): void {
    this.colegioMagisterialData = formValues;
  }

  onBancosFormUpdate(formValues: any): void {
    this.bancosData = formValues;
  }

  onCentrosTrabajoFormUpdate(formValues: any): void {
    this.centrosTrabajoData = formValues.value.trabajo;
  }

  onOtrasFuentesIngresoChange(formValues: any): void {
    this.otrasFuentesIngresoData = formValues.value;
  }

  gatherAllData(): void {
    const allData = {
      datosGenerales: this.datosGeneralesData,
      colegioMagisterial: this.colegioMagisterialData,
      bancos: this.bancosData,
      centrosTrabajo: this.centrosTrabajoData,
      otrasFuentesIngreso: this.otrasFuentesIngresoData
    };
    console.log('Datos Completos:', allData);
  }
}
