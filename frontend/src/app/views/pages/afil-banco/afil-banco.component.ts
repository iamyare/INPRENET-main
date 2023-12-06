import { Component } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormBuilder, FormGroup, Validators } from '@angular/forms';

@Component({
  selector: 'app-afil-banco',
  templateUrl: './afil-banco.component.html',
  styleUrl: './afil-banco.component.scss'
})
export class AfilBancoComponent {
  form: FormGroup;

  htmlSTID: string = "Archivo de identificación"
  public archivo: any;
  tipoIdent: any = [];
  tipoRol: any = [];

  constructor( private fb: FormBuilder,
    //private authSvc: AuthService
    ) {

    this.form = this.fb.group({
     fileID: ['', [Validators.required]],
     correo: ['', [Validators.required, Validators.email]],
     rol: ['', [Validators.required]],
     tipoIdent: ['', [Validators.required]],
     numeroIden: ['', [Validators.required]],
     nombrecomp: ['', [Validators.required]],
   });

   this.tipoIdent = [
     {
       "idIdentificacion":1,
       "value": "DNI"
     },
     {
       "idIdentificacion":2,
       "value": "PASAPORTE"
     },
     {
       "idIdentificacion":3,
       "value": "CARNET RESIDENCIA"
     },
     {
       "idIdentificacion":4,
       "value": "NUMERO LICENCIA"
     },
     {
       "idIdentificacion":5,
       "value": "RTN"
     },
   ];
   this.tipoRol = [
     {
       "idRol":1,
       "value": "ADMINISTRADOR"
     },
     {
       "idRol":2,
       "value": "OFICIAL DE OPERACION"
     },
     {
       "idRol":3,
       "value": "CONTADOR"
     },
     {
       "idRol":4,
       "value": "AUXILIAR"
     },
   ]
  }

  onFileSelected(event: any) {
    const file = event.target.files[0];
    const fileSize = event.target.files[0].size / 1024 / 1024;

    if (file) {
        if (fileSize > 7000) {
            //this.toastr.error('El archivo no debe superar los 3MB', 'Error');
            this.htmlSTID = "Identificación";
            this.form.reset();
        } else {
            this.archivo = file
            this.htmlSTID = event.target.files[0].name;
        }
    }
  }

  crearCuenta(){
    const correo = this.form.value.correo;
    const rol = this.form.value.rol;
    const tipoIdentificacion = this.form.value.tipoIdent;
    const numeroIdentificacion = this.form.value.numeroIden;
    const nombrecomp = this.form.value.nombrecomp;
    const fileID = this.form.value.fileID;

    const data = {
      'correo' : correo,
      'nombreRol' : rol,
      'tipoIdentificacion' : tipoIdentificacion,
      'numeroIdentificacion' : numeroIdentificacion,
      'nombre' : nombrecomp,
      'archivoidentificacion' :  "this.archivo"
    }

    console.log(data);

    /* this.authSvc.crearCuenta(data).subscribe((res: any) => {
      console.log(res);

      //this.fakeLoading(res);
    }); */
  }

}
