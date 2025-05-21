import { Component, ViewChild, TemplateRef, OnInit } from '@angular/core';
import { FormArray, FormBuilder, FormGroup, ValidationErrors } from '@angular/forms';
import { MatStepper } from '@angular/material/stepper';
import { ToastrService } from 'ngx-toastr';

@Component({
  selector: 'app-afiliar-centros',
  templateUrl: './afiliar-centros.component.html',
  styleUrls: ['./afiliar-centros.component.scss']
})
export class AfiliarCentrosComponent implements OnInit {
  @ViewChild('datosGeneralesTemplate', { static: true }) datosGeneralesTemplate!: TemplateRef<any>;
  @ViewChild('referenciasTemplate', { static: true }) referenciasTemplate!: TemplateRef<any>;
  @ViewChild('sociedadesTemplate', { static: true }) sociedadesTemplate!: TemplateRef<any>;
  @ViewChild('sociosTemplate', { static: true }) sociosTemplate!: TemplateRef<any>;
  @ViewChild('administracionTemplate', { static: true }) administracionTemplate!: TemplateRef<any>;
  @ViewChild(MatStepper) stepper!: MatStepper;

  steps: any[] = [];
  formGroup!: FormGroup;

  constructor(private fb: FormBuilder, private toastr: ToastrService) {}

  ngOnInit(): void {
    this.formGroup = this.fb.group({});
    this.steps = [
      {
        label: 'Datos Generales',
        formGroup: this.fb.group({}),
        template: this.datosGeneralesTemplate
      },
      {
        label: 'Referencias',
        formGroup: this.fb.group({}),
        template: this.referenciasTemplate
      },
      {
        label: 'Sociedades',
        formGroup: this.fb.group({}),
        template: this.sociedadesTemplate
      },
      {
        label: 'Socios',
        formGroup: this.fb.group({}),
        template: this.sociosTemplate
      },
      {
        label: 'Administración',
        formGroup: this.fb.group({}),
        template: this.administracionTemplate
      }
    ];

    this.steps.forEach((step, index) => {
      this.formGroup.addControl(`step${index}`, step.formGroup);
    });
  }

  markAllAsTouched(control: FormGroup | FormArray): void {
    Object.values(control.controls).forEach(ctrl => {
      ctrl.markAsTouched();
    });
  }

  isStepInvalid(formGroup: FormGroup): boolean {
    return formGroup.invalid && (formGroup.touched || formGroup.dirty);
  }

  onSubmit(): void {
    if (this.formGroup.valid) {
      console.log('Datos enviados correctamente:', this.formGroup.value);
      this.toastr.success('Datos enviados con éxito', 'Éxito');
    } else {
      this.toastr.warning('El formulario contiene información inválida', 'Advertencia');
      this.markAllAsTouched(this.formGroup);
    }
  }
}
