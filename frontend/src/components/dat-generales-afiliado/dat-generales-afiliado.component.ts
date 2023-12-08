import { Component, Input, OnInit, Output } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormArray, FormBuilder, FormControl, FormGroup, Validators } from '@angular/forms';

@Component({
  selector: 'app-dat-generales-afiliado',
  templateUrl: './dat-generales-afiliado.component.html',
  styleUrl: './dat-generales-afiliado.component.scss'
})
export class DatGeneralesAfiliadoComponent implements OnInit{
  @Input()
  cargo: string = "";
  
  @Output()
  value:string = "Hola";

  form: FormGroup;
  
  htmlSTID: string = "Archivo de identificación"
  public archivo: any;
  
  tipoIdent: any = []; Sexo: any = []; estadoCivil: any = [];

  constructor( private fb: FormBuilder) {
    console.log(this.cargo);
    
    this.form = this.fb.group({
      tipoIdent: ['', [Validators.required]],
      archIdent: ['', [Validators.required]],
      numeroIden: ['', [Validators.required]],
      primerNombre: ['', [Validators.required]],
      segundoNombre: ['', [Validators.required]],
      tercerNombre: ['', [Validators.required]],
      primerApellido: ['', [Validators.required]],
      segundoApellido: ['', [Validators.required]],
      fechaNacimiento: ['', [Validators.required]],
      cantidadDependientes: ['', [Validators.required, Validators.pattern("[0-9]*")]],
      cantidadHijos: ['', [Validators.required, Validators.pattern("[0-9]*")]],
      Sexo: ['', [Validators.required]],
      profesion: ['', [Validators.required]],
      estadoCivil: ['', [Validators.required]],
      representacion: ['', [Validators.required]],
      estado: ['', [Validators.required]],
      telefono1: ['', [Validators.required]],
      telefono2: ['', [Validators.required]],
      correo1: ['', [Validators.required, Validators.email]],
      correo2: ['', [Validators.required, Validators.email]],
    });

    this.estadoCivil = [
      {
        "idEstadoCivil":1,
        "value": "Casado/a"
      },
      {
        "idEstadoCivil":2,
        "value": "Divorciado/a"
      },
      {
        "idEstadoCivil":3,
        "value": "Separado/a"
      },
      {
        "idEstadoCivil":4,
        "value": "Soltero/a"
      },
      {
        "idEstadoCivil":5,
        "value": "Union Libre"
      },
      {
        "idEstadoCivil":6,
        "value": "Viudo/a"
      }
    ];
    this.Sexo = [
      {
        "idBanco":1,
        "value": "M"
      },
      {
        "idBanco":2,
        "value": "F"
      }
    ];
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
        "value": "NÚMERO LICENCIA"
      },
      {
        "idIdentificacion":5,
        "value": "RTN"
      },
    ];
  }

  ngOnInit():void{
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

  enviar(){
    const tipoIdent = this.form.value.tipoIdent;
    const archIdent = this.form.value.archIdent;
    const numeroIden = this.form.value.numeroIden;
    const primerNombre = this.form.value.primerNombre;
    const segundoNombre = this.form.value.segundoNombre;
    const tercerNombre = this.form.value.tercerNombre;
    const primerApellido = this.form.value.primerApellido;
    const segundoApellido = this.form.value.segundoApellido;
    const fechaNacimiento = this.form.value.fechaNacimiento;
    const cantidadDependientes = this.form.value.cantidadDependientes;
    const cantidadHijos = this.form.value.cantidadHijos;
    const Sexo = this.form.value.Sexo;
    const profesion = this.form.value.profesion;
    const estadoCivil = this.form.value.estadoCivil;
    const representacion = this.form.value.representacion;
    const estado = this.form.value.estado;
    const telefono1 = this.form.value.telefono1;
    const telefono2 = this.form.value.telefono2;
    const coreo1 = this.form.value.coreo1;
    const coreo2 = this.form.value.coreo2;
    
    /* this.authSvc.crearCuenta(data).subscribe((res: any) => {
      console.log(res);
      //this.fakeLoading(res);
    }); */
  }


}
