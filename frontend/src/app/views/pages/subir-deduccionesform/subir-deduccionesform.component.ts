import { Component } from '@angular/core';
import { FormBuilder, FormGroup } from '@angular/forms';
import { generateFormArchivo } from '@docs-components/botonarchivos/botonarchivos.component';

@Component({
  selector: 'app-subir-deduccionesform',
  templateUrl: './subir-deduccionesform.component.html',
  styleUrl: './subir-deduccionesform.component.scss'
})
export class SubirDeduccionesformComponent {
  form: FormGroup;

  constructor(private fb: FormBuilder){
     form: FormGroup;this.form = this.fb.group({
      Archivos: generateFormArchivo(),})
  }
}
