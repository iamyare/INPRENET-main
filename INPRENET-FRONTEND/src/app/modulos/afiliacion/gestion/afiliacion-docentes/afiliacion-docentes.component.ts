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
    { label: 'Referencias Personales / Familiares', isActive: false },
    { label: 'Beneficiarios', isActive: false },
    { label: 'Finalizar', isActive: false },
  ];

  activeStep = 0;

  datosGeneralesForm!: FormGroup;
  colegioMagisterialForm!: FormGroup;
  bancosForm!: FormGroup;
  centrosTrabajoForm!: FormGroup;
  otrasFuentesIngresoForm!: FormGroup;
  refPersForm!: FormGroup;
  benefForm!: FormGroup;

  datosGeneralesData: any = {};
  colegioMagisterialData: any = {};
  bancosData: any = {};
  centrosTrabajoData: any = {};
  otrasFuentesIngresoData: any = {};
  refPersData: any = {};
  benefData: any = {};

  constructor(private fb: FormBuilder) {
    this.datosGeneralesForm = this.fb.group({});
    this.colegioMagisterialForm = this.fb.group({});
    this.bancosForm = this.fb.group({});
    this.centrosTrabajoForm = this.fb.group({});
    this.refPersForm = this.fb.group({});
    this.benefForm = this.fb.group({});
  }

  ngOnInit(): void {
    this.initForms();
  }

  initForms() {
    this.datosGeneralesForm = this.fb.group({});
    this.colegioMagisterialForm = this.fb.group({});
    this.bancosForm = this.fb.group({});
    this.centrosTrabajoForm = this.fb.group({});
    this.otrasFuentesIngresoForm = this.fb.group({
      sociedadSocios: this.fb.array([])
    });
    this.refPersForm = this.fb.group({
      refpers: this.fb.array([])
    });
    this.benefForm = this.fb.group({
      beneficiarios: this.fb.array([])
    });
  }

  handleDatosGeneralesChange(data: any): void {
    this.datosGeneralesData = data;
  }

  handleOtrasFuentesIngreso(otrasFuentesData: any): void {
    this.otrasFuentesIngresoData = otrasFuentesData;
  }

  handleDatosPuestTrab(data: any): void {
    this.centrosTrabajoData = data;
  }

  handleRefPersData(data: any): void {
    this.refPersData = data;
  }

  handleBenefData(data: any): void {
    this.benefData = data;
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
      datosGenerales: this.datosGeneralesData.refpers,
      colegioMagisterial: this.colegioMagisterialData,
      bancos: this.bancosData.banco,
      centrosTrabajo: this.centrosTrabajoData.trabajo,
      otrasFuentesIngreso: this.otrasFuentesIngresoData.sociedadSocios,
      referenciasPersonales: this.refPersData.refpers,
      beneficiarios: this.benefData.value.beneficiario
    };
    console.log('Datos Completos:', allData);
  }
}
