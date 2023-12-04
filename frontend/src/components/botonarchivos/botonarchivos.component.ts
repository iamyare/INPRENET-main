import { Component } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormBuilder, FormGroup, Validators } from '@angular/forms';

@Component({
  selector: 'app-botonarchivos',
  templateUrl: './botonarchivos.component.html',
  styleUrl: './botonarchivos.component.scss'
})
export class BotonarchivosComponent {
  form: FormGroup;
  htmlSTID: string = "Archivo de identificación"
  public archivo: any;

  constructor( private fb: FormBuilder) {
  
    this.form = this.fb.group({
     archivo: ['', [Validators.required]],
   });
  }

  onFileSelected(event: any) {
    const file = event.target.files[0];
    const fileSize = event.target.files[0].size / 1024 / 1024;

    if (file) {
        if (fileSize > 3) {
            //this.toastr.error('El archivo no debe superar los 3MB', 'Error');
            this.htmlSTID = "Identificación";
            this.form.reset();
        } else {
            this.archivo = file
            this.htmlSTID = event.target.files[0].name;
        }
    }
  }
}
