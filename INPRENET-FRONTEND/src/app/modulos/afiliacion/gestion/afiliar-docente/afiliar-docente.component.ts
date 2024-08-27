import { Component, ViewChild, TemplateRef, OnInit } from '@angular/core';
import { FormArray, FormBuilder, FormGroup } from '@angular/forms';
import { MatStepper } from '@angular/material/stepper';
import { BenefComponent } from '../benef/benef.component';
import { DatosGeneralesComponent } from '../datos-generales/datos-generales.component';

@Component({
  selector: 'app-afiliar-docente',
  templateUrl: './afiliar-docente.component.html',
  styleUrls: ['./afiliar-docente.component.scss']
})
export class AfiliarDocenteComponent implements OnInit {

  @ViewChild('datosGeneralesTemplate', { static: true }) datosGeneralesTemplate!: TemplateRef<any>;
  @ViewChild('referenciasPersonalesTemplate', { static: true }) referenciasPersonalesTemplate!: TemplateRef<any>;
  @ViewChild('colegiosMagisterialesTemplate', { static: true }) colegiosMagisterialesTemplate!: TemplateRef<any>;
  @ViewChild('bancosTemplate', { static: true }) bancosTemplate!: TemplateRef<any>;
  @ViewChild('centrosTrabajoTemplate', { static: true }) centrosTrabajoTemplate!: TemplateRef<any>;
  @ViewChild('beneficiariosTemplate', { static: true }) beneficiariosTemplate!: TemplateRef<any>;
  @ViewChild(MatStepper) stepper!: MatStepper;
  @ViewChild(BenefComponent) benefComponent!: BenefComponent;
  @ViewChild(DatosGeneralesComponent) datosGeneralesComponent!: DatosGeneralesComponent;

  steps: any[] = [];
  formGroup!: FormGroup;

  constructor(private fb: FormBuilder) {}

  ngOnInit(): void {
    this.formGroup = this.fb.group({});

    this.steps = [
      {
        label: 'Datos Generales',
        formGroup: this.fb.group({}),
        template: this.datosGeneralesTemplate
      },
      {
        label: 'Referencias Personales',
        formGroup: this.fb.group({}),
        template: this.referenciasPersonalesTemplate
      },
      {
        label: 'Colegios Magisteriales',
        formGroup: this.fb.group({}),
        template: this.colegiosMagisterialesTemplate
      },
      {
        label: 'Cuentas Bancarias',
        formGroup: this.fb.group({}),
        template: this.bancosTemplate
      },
      {
        label: 'Centros de Trabajo y Otras Fuentes de Ingreso',
        formGroup: this.fb.group({}),
        template: this.centrosTrabajoTemplate
      },
      {
        label: 'Beneficiarios',
        formGroup: this.fb.group({}),
        template: this.beneficiariosTemplate
      }
    ];

    // Asignar los subformularios al formGroup principal
    this.formGroup.addControl('datosGenerales', this.steps[0].formGroup);
    this.formGroup.addControl('referenciasPersonales', this.steps[1].formGroup);
    this.formGroup.addControl('colegiosMagisteriales', this.steps[2].formGroup);
    this.formGroup.addControl('bancos', this.steps[3].formGroup);
    this.formGroup.addControl('centrosTrabajo', this.steps[4].formGroup);
    this.formGroup.addControl('beneficiarios', this.steps[5].formGroup);
  }

  markAllAsTouched(control: FormGroup | FormArray): void {
    if (control instanceof FormGroup || control instanceof FormArray) {
      Object.values(control.controls).forEach(ctrl => {
        ctrl.markAsTouched();
        if (ctrl instanceof FormGroup || ctrl instanceof FormArray) {
          this.markAllAsTouched(ctrl);
        }
      });
    }
  }

  isStepInvalid(formGroup: FormGroup): boolean {
    return formGroup.invalid && (formGroup.touched || formGroup.dirty);
  }

  onSubmit(): void {
    this.benefComponent.transformarDiscapacidadesSeleccionadas();
    this.datosGeneralesComponent.transformarDiscapacidadesSeleccionadas();

    if (this.formGroup.valid) {
      console.log('Información enviada:', this.formGroup.value);
    } else {
      this.markAllAsTouched(this.formGroup);
      console.log('El formulario no es válido');
    }
  }
}
