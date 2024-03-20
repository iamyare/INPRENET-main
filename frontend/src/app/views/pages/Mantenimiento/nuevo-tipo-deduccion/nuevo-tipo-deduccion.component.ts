import { Component, OnInit, ViewChild } from '@angular/core';
import { ValidatorFn, Validators } from '@angular/forms';
import { DeduccionesService } from 'src/app/services/deducciones.service';
import { ToastrService } from 'ngx-toastr';
import { FieldConfig } from 'src/app/shared/Interfaces/field-config';
import { DynamicFormComponent } from '@docs-components/dynamic-form/dynamic-form.component';
import { InstitucionesService } from 'src/app/services/instituciones.service';
import { DatosEstaticosService } from '../../../../services/datos-estaticos.service';
import { PlanillaService } from 'src/app/services/planilla.service';
@Component({
  selector: 'app-nuevo-tipo-deduccion',
  templateUrl: './nuevo-tipo-deduccion.component.html',
  styleUrl: './nuevo-tipo-deduccion.component.scss'
})
export class NuevoTipoDeduccionComponent implements OnInit {
  data:any
  myFormFields: FieldConfig[] = []
  temp: any[] = []

  institucionesOpc: any[] = [];

  Instituciones: any = this.datosEstaticosService.Instituciones;
  @ViewChild(DynamicFormComponent) dynamicForm!: DynamicFormComponent;

  constructor(private SVCDeduccion:DeduccionesService, private datosEstaticosService:DatosEstaticosService, private toastr: ToastrService, private SVCInstituciones:InstitucionesService){
    this.obtenerDatos1();
  }

  ngOnInit(): void {}

  getInstituciones = async () => {
    try {
      const instituciones = await this.SVCInstituciones.getInstituciones().toPromise();

      instituciones.map((item: any) => {
        this.institucionesOpc.push({ label: `${item.nombre_institucion}`, value: `${item.nombre_institucion}` })
      });

    } catch (error) {
      console.error('Error al obtener las instituciones:', error);
    }
  };

  obtenerDatos1 = async () => {
    this.getInstituciones()
    this.myFormFields = [
      { type: 'text', label: 'Nombre', name: 'nombre_deduccion', validations: [Validators.required] , display: true},
      { type: 'text', label: 'Descripción', name: 'descripcion_deduccion', validations: [Validators.required] , display: true},
      { type: 'number', label: 'Código de deducción', name: 'codigo_deduccion', validations: [Validators.required], display: true },
      { type: 'number', label: 'Prioridad', name: 'prioridad', validations: [Validators.required] , display: true},
      {
        type: 'dropdown', label: 'Institución', name: 'nombre_institucion',
        options: this.institucionesOpc,
        validations: [Validators.required], display: true
      },
    ];
  }

  obtenerDatos(event:any):any{
    this.data = event;
  }

  guardarTipoDeduccion():any{
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
