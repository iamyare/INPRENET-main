import { Component } from '@angular/core';
import { Validators } from '@angular/forms';
import { FieldConfig } from 'src/app/shared/Interfaces/field-config';

@Component({
  selector: 'app-cambio-estado-tipo-per',
  templateUrl: './cambio-estado-tipo-per.component.html',
  styleUrl: './cambio-estado-tipo-per.component.scss'
})
export class CambioEstadoTipoPerComponent {
  Actualizar() {
    throw new Error('Method not implemented.');
  }
  form: any
  public myFormFields: FieldConfig[] = []
  tiposPersona: any[] = [
    { ID_TIPO_PERSONA: 1, TIPO_PERSONA: 'AFILIADO' },
    { ID_TIPO_PERSONA: 2, TIPO_PERSONA: 'JUBILADO' },
    { ID_TIPO_PERSONA: 3, TIPO_PERSONA: 'PENSIONADO' },
    { ID_TIPO_PERSONA: 5, TIPO_PERSONA: 'VOLUNTARIO' }
  ];


  ngOnInit(): void {
    this.myFormFields = [
      { type: 'dropdown', label: 'Tipo de regimen', name: 'regimen', options: [{ label: "dsadsa", value: "dsad" }], validations: [Validators.required], display: true },
      { type: 'dropdown', label: 'Tipo de persona', name: 'tipoPersona', options: [{ label: "dsad", value: "asdad" }], validations: [Validators.required], display: true },
      { type: 'dropdown', label: 'Estado Afiliado', name: 'estado', options: [{ label: "das", value: "dasd" }], validations: [Validators.required], display: true }
    ];
  }

  async obtenerDatos(event: any): Promise<any> {
    this.form = event;
  }

}
