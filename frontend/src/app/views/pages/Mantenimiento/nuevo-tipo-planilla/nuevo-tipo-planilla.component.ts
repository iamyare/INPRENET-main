import { Component, ViewChild, OnInit } from '@angular/core';
import { ValidatorFn, Validators } from '@angular/forms';
import { DynamicFormComponent } from '@docs-components/dynamic-form/dynamic-form.component';
import { ToastrService } from 'ngx-toastr';
import { DatosEstaticosService } from 'src/app/services/datos-estaticos.service';
import { PlanillaService } from 'src/app/services/planilla.service';
import { FieldConfig } from 'src/app/shared/Interfaces/field-config';

@Component({
  selector: 'app-nuevo-tipo-planilla',
  templateUrl: './nuevo-tipo-planilla.component.html',
  styleUrl: './nuevo-tipo-planilla.component.scss'
})
export class NuevoTipoPlanillaComponent {
  @ViewChild(DynamicFormComponent) dynamicForm!: DynamicFormComponent;
  form: any;
  myFormFields!: FieldConfig[];
  constructor(
    private planillaService: PlanillaService,
    private toastr: ToastrService,
    private datosEstaticosService: DatosEstaticosService
  ) {
    this.precargarDatos()
  }

  precargarDatos() {
    this.myFormFields = [
      {
        type: 'text',
        label: 'Nombre de planilla',
        name: 'nombre_planilla',
        validations: [Validators.required, Validators.maxLength(50)],
        display: true,
        icon: 'library_books',
        row: 1,
        col: 4
      },
      {
        type: 'dropdown',
        label: 'Clase Planilla',
        name: 'clase_planilla',
        validations: [Validators.required],
        options: this.getTipoPlanillas(),
        display: true,
        icon: 'category',
        row: 1,
        col: 4
      },
      {
        type: 'text',
        label: 'Descripción de planilla',
        name: 'descripcion',
        validations: [Validators.required],
        display: true,
        icon: 'add_notes',
        row: 1,
        col: 4
      }
    ];
  }

  getTipoPlanillas(): any {
    const tiposPlanilla: any = this.datosEstaticosService.tiposPlanilla;
    let tem: any[] = [];

    tiposPlanilla.map((item: any) => {
      tem.push({ label: `${item.value}`, value: `${item.value}` })
    });

    return tem;
  }

  obtenerDatos(event: any): any {
    this.form = event;
  }

  insertarDatos(): void {
    this.planillaService.createTipoPlanilla(this.form.value).subscribe({
      next: (response) => {
        this.toastr.success('TipoPlanilla creada con éxito');
        this.limpiarFormulario();
      },
      error: (error) => {
        let mensajeError = 'Error desconocido al crear TipoPlanilla';

        if (error.error && error.error.message) {
          mensajeError = error.error.message;
        } else if (typeof error.error === 'string') {
          mensajeError = error.error;
        }

        this.toastr.error(mensajeError);
      }
    });
  }

  limpiarFormulario(): void {
    if (this.dynamicForm) {
      this.dynamicForm.form.reset();
    }
  }
}
