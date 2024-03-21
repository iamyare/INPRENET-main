import { Component, OnInit } from '@angular/core';
import { Validators } from '@angular/forms';
import { FieldConfig } from 'src/app/shared/Interfaces/field-config';

@Component({
  selector: 'app-nuevo-movimiento',
  templateUrl: './nuevo-movimiento.component.html',
  styleUrl: './nuevo-movimiento.component.scss'
})
export class NuevoMovimientoComponent implements OnInit{

  myFormFields:FieldConfig[] = []
  form:any;

  ngOnInit(): void {
    /* SI SE MUEVE LA FILA Periodo hay que cambiar la posicion en la funcion obtenerDatos */
    this.myFormFields = [
      { type: 'text', label: 'Seleccione el tipo de movimiento', name: 'DEBITO_CREDITO_B', validations: [Validators.required], display:true },
      { type: 'text', label: 'Descripción', name: 'DESCRIPCION', validations: [Validators.required], display:true},
      { type: 'text', label: 'Descripción corta', name: 'DESCRIPCION_CORTA', validations: [Validators.required], display:true},
      { type: 'text', label: 'Cuenta Contable', name: 'CUENTA_CONTABLE', validations: [Validators.required], display:true},
      { type: 'number', label: 'Monto', name: 'MONTO', validations: [], display:true},
      { type: 'text', label: 'Justificacion', name: 'JUSTIFICACION', validations: [Validators.required], display:true},
    ];
  }

  async obtenerDatos(event:any):Promise<any>{
    this.form = event;
  }

  guardarMovimiento(){
    console.log(this.form.value);

  }

}
