import { Component } from '@angular/core';
import { FormBuilder, FormGroup } from '@angular/forms';

@Component({
  selector: 'app-admin-centro-educativo',
  templateUrl: './admin-centro-educativo.component.html',
  styleUrls: ['./admin-centro-educativo.component.scss']
})
export class AdminCentroEducativoComponent {
  form: FormGroup;

  constructor(private fb: FormBuilder) {
    this.form = this.fb.group({
      administradorNombre: [''],
      administradorTelefono: [''],
      administradorCorreo: [''],
      contadorNombre: [''],
      contadorTelefono: [''],
      contadorCorreo: [''],
      propietarioNombre: [''],
      propietarioColonia: [''],
      propietarioBarrio: [''],
      propietarioGrupo: [''],
      propietarioCasa: [''],
      propietarioDepartamento: [''],
      propietarioTelefonoCasa: [''],
      propietarioCelular1: [''],
      propietarioCelular2: [''],
      propietarioCorreo1: [''],
      propietarioCorreo2: [''],
      propietarioReferencia: [''],
    });
  }

  onSubmit() {
    console.log(this.form.value);
  }
}
