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
export class NuevoBeneficioComponent implements OnInit{
  @ViewChild(DynamicFormComponent) dynamicForm!: DynamicFormComponent;
  data:any

  myFormFields:FieldConfig[] = []
  constructor(private SVCBeneficios:BeneficiosService, private toastr: ToastrService ,){}

  ngOnInit(): void {
    /* SI SE MUEVE LA FILA Periodo hay que cambiar la posicion en la funcion obtenerDatos */
    this.myFormFields = [
      { type: 'text', label: 'Nombre de beneficio', name: 'nombre_beneficio', validations: [Validators.required], display:true },
      { type: 'text', label: 'Descripción de beneficio', name: 'descripcion_beneficio', validations: [Validators.required], display:true},
      { type: 'dropdown', label: 'Periodicidad', name: 'periodicidad', validations: [Validators.required], options:[{label:"VITALICIO", value:"VITALICIO"}, {label:"DEFINIDO", value:"DEFINIDO"}] , display:true},
      { type: 'number', label: 'Número de rentas máximas', name: 'numero_rentas_max', validations: [], display:false},
    ];
  }

  obtenerDatos(event:any):any{
    if (event.value.periodicidad == "Definido"){
      this.myFormFields[3].display = true
    }else {
      this.myFormFields[3].display = false
    }
    this.data = event;
  }

  guardarTipoBeneficio(){
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
