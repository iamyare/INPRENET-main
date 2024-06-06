import { Component, ViewChild, OnInit } from '@angular/core';
import { ValidatorFn, Validators } from '@angular/forms';
import { BeneficiosService } from '../../../../services/beneficios.service';
import { ToastrService } from 'ngx-toastr';
import { FieldConfig } from 'src/app/shared/Interfaces/field-config';
import { DynamicFormComponent } from '@docs-components/dynamic-form/dynamic-form.component';
@Component({
  selector: 'app-nuevo-beneficio',
  templateUrl: './nuevo-beneficio.component.html',
  styleUrl: './nuevo-beneficio.component.scss'
})
export class NuevoBeneficioComponent implements OnInit {
  @ViewChild(DynamicFormComponent) dynamicForm!: DynamicFormComponent;
  data: any
  form: any
  myFormFields: FieldConfig[] = []
  constructor(private SVCBeneficios: BeneficiosService, private toastr: ToastrService,) {
    this.precargarDatos();
  }

  precargarDatos() {
    this.myFormFields = [
      {
        type: 'text',
        label: 'Nombre de beneficio',
        name: 'nombre_beneficio',
        validations: [Validators.required],
        display: true,
        icon: 'card_giftcard',
        row: 1,
        col: 6
      },
      {
        type: 'text',
        label: 'Descripción de beneficio',
        name: 'descripcion_beneficio',
        validations: [Validators.required],
        display: true,
        icon: 'description',
        row: 1,
        col: 6
      },
      {
        type: 'dropdown',
        label: 'Periodicidad',
        name: 'periodicidad',
        validations: [Validators.required],
        options: [{ label: "VITALICIO", value: "VITALICIO" }, { label: "DEFINIDO", value: "DEFINIDO" }],
        display: true,
        icon: 'repeat',
        row: 2,
        col: 6
      },
      {
        type: 'number',
        label: 'Número de rentas máximas',
        name: 'numero_rentas_max',
        validations: [],
        display: false,
        icon: 'trending_up',
        row: 2,
        col: 6
      }
    ];

  }

  ngOnInit(): void { }

  obtenerDatos(event: any): any {
    this.form = event
    if (event.value.periodicidad == "DEFINIDO") {
      this.myFormFields[3].display = true
    } else {
      this.myFormFields[3].display = false
    }
    this.data = event;
  }

  guardarTipoBeneficio() {
    const formValues = { ...this.data.value };
    this.myFormFields.forEach(field => {
      if (field.type === 'number' && formValues[field.name] !== null && formValues[field.name] !== undefined) {
        this.data.value[field.name] = + formValues[field.name];
      }
    });

    this.SVCBeneficios.newTipoBeneficio(this.data.value).subscribe(
      {
        next: (response) => {
          this.toastr.success('tipo de beneficio creado con éxito');
          this.limpiarFormulario();
        },
        error: (error) => {
          let mensajeError = 'Error desconocido al crear tipo de beneficio';
          // Verifica si el error tiene una estructura específica
          if (error.error && error.error.message) {
            mensajeError = error.error.message;
          } else if (typeof error.error === 'string') {
            // Para errores que vienen como un string simple
            mensajeError = error.error;
          }
          this.toastr.error(mensajeError);
        }
      }
    );
  }

  limpiarFormulario(): void {
    if (this.dynamicForm) {
      this.dynamicForm.form.reset();
    }
  }
}
