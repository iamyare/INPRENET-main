import { Component } from '@angular/core';
import { FormBuilder, FormGroup } from '@angular/forms';
import { generateFormArchivo } from '@docs-components/botonarchivos/botonarchivos.component';

@Component({
  selector: 'app-subir-deducciones',
  templateUrl: './subir-deducciones.component.html',
  styleUrl: './subir-deducciones.component.scss'
})
export class SubirDeduccionesComponent {
  form: FormGroup;
  datosA:boolean = false
  datosTable:boolean = false;
  constructor ( private fb: FormBuilder){
    this.form = this.fb.group({
      Archivos: generateFormArchivo(),
      Arch: "",
      isChecked: [false]
    });
  }

  ngOnInit() {
    this.form = this.fb.group({
      Archivos: generateFormArchivo(),
      Arch: "",
      isChecked: [false] // Inicializa el estado del mat-slide-toggle
    });
  }

  onChangeToggle() {
    // Acciones cuando el estado del mat-slide-toggle cambia
    /* console.log('Estado del toggle:', this.form.get('isChecked')?.value); */
    // Otras acciones según el valor de this.form.get('isChecked').value
  }
  setEstadoDatGen(e:any){
    this.datosA = true
    this.datosTable = false
  }
  setEstadoTable(e:any){
    this.datosTable = true
    this.datosA = false
  }
}
