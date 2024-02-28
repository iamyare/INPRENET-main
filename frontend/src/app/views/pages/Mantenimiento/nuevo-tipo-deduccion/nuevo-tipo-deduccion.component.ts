import { Component, OnInit, ViewChild } from '@angular/core';
import { ValidatorFn, Validators } from '@angular/forms';
import { DeduccionesService } from 'src/app/services/deducciones.service';
import { ToastrService } from 'ngx-toastr';
import { FieldConfig } from 'src/app/shared/Interfaces/field-config';
import { DynamicFormComponent } from '@docs-components/dynamic-form/dynamic-form.component';
import { InstitucionesService } from 'src/app/services/instituciones.service';
import { DatosEstaticosService } from '../../../../services/datos-estaticos.service';
@Component({
  selector: 'app-nuevo-tipo-deduccion',
  templateUrl: './nuevo-tipo-deduccion.component.html',
  styleUrl: './nuevo-tipo-deduccion.component.scss'
})
export class NuevoTipoDeduccionComponent implements OnInit {
  data:any
  myFormFields: FieldConfig[] = []
  Instituciones: any = this.datosEstaticosService.Instituciones;

  @ViewChild(DynamicFormComponent) dynamicForm!: DynamicFormComponent;

  constructor(private SVCDeduccion:DeduccionesService, private datosEstaticosService:DatosEstaticosService, private toastr: ToastrService, private SVCInstituciones:InstitucionesService ){}

  ngOnInit(): void {

    this.SVCInstituciones.getInstituciones().subscribe(
      {
        next: (response) => {
          this.Instituciones = response;
          const nuevoArreglo = this.Instituciones.map((item: { nombre_institucion: any; id_institucion: any; }) => ({
            label: item.nombre_institucion,
            value: String(item.id_institucion)
          }));
          this.myFormFields = [
            { type: 'text', label: 'Nombre', name: 'nombre_deduccion', validations: [Validators.required] , display:true},
            { type: 'text', label: 'Descripción', name: 'descripcion_deduccion', validations: [Validators.required] , display:true},
            { type: 'dropdown', label: 'Institución', name: 'nombre_institucion',
            options: nuevoArreglo,
            validations: [Validators.required], display:true
            },
            { type: 'number', label: 'Código de deducción', name: 'codigo_deduccion', validations: [Validators.required], display:true },
            { type: 'number', label: 'Prioridad', name: 'prioridad', validations: [Validators.required] , display:true},
          ];

        },
        error: (error) => {
          let mensajeError = 'Error desconocido al crear tipo de deduccion';
          if (error.error && error.error.message) {
            mensajeError = error.error.message;
          } else if (typeof error.error === 'string') {
            mensajeError = error.error;
          }

          this.toastr.error(mensajeError);
        }
      }
      );




  }

  obtenerDatos(event:any):any{
    this.data = event;
  }

  guardarTipoDeduccion():any{

    console.log(this.data.value);
    this.SVCDeduccion.newTipoDeduccion(this.data.value).subscribe(

      {
        next: (response) => {

          this.toastr.success('tipo de deduccion creado con éxito');
          this.limpiarFormulario()
        },
        error: (error) => {
          let mensajeError = 'Error desconocido al crear tipo de deduccion';
          if (error.error && error.error.message) {
            mensajeError = error.error.message;
          } else if (typeof error.error === 'string') {
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
