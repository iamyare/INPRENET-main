import { Component, Input, OnInit } from '@angular/core';
import { FormBuilder, FormGroup } from '@angular/forms';

@Component({
  selector: 'app-admin-centro-educativo',
  templateUrl: './admin-centro-educativo.component.html',
  styleUrls: ['./admin-centro-educativo.component.scss']
})
export class AdminCentroEducativoComponent implements OnInit {
  @Input() parentForm!: FormGroup;

  constructor(private fb: FormBuilder) {}

  ngOnInit(): void {
    this.addControlsToForm();
  }

  addControlsToForm() {
    const formControls:any = {
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
    };

    for (const key in formControls) {
      if (formControls.hasOwnProperty(key)) {
        this.parentForm.addControl(key, this.fb.control(formControls[key]));
      }
    }
  }

  onSubmit() {
    //console.log(this.parentForm.value);
  }
}
