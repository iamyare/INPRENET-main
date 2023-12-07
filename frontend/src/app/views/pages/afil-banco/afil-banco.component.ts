import { Component } from '@angular/core';
import { FormBuilder, FormGroup, Validators } from '@angular/forms';

@Component({
  selector: 'app-afil-banco',
  templateUrl: './afil-banco.component.html',
  styleUrl: './afil-banco.component.scss'
})
export class AfilBancoComponent {
  form: FormGroup;
  form1: FormGroup;
  form2: FormGroup;
  form3: FormGroup;

  htmlSTID: string = "Archivo de identificación"
  
  Bancos: any = [];
  tipoIdent: any = [];
  Sexo: any = [];
  estadoCivil: any = [];
  
  public archivo: any;
  
  constructor( private fb: FormBuilder) {
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

    this.form1 = this.fb.group({
     centroTrabajo: ['', [Validators.required]],
     cargo: ['', [Validators.required]],
     sectorEconomico: ['', [Validators.required]],
     actividadEconomica: ['', [Validators.required]],
     claseCliente: ['', [Validators.required]],
     sector: ['', [Validators.required]],
     numeroAcuerdo: ['', [Validators.required]],
     salarioNeto: ['', [Validators.required, Validators.pattern("\^[0-9]{1,8}([\\.][0-9]{2})")]],
     fechaIngreso: ['', [Validators.required]],
     fechaPago: ['', [Validators.required]]
    });

    this.form2 = this.fb.group({
      nombreBanco: ['', [Validators.required]],
      numeroCuenta: ['', [Validators.required]],
    });

    this.form3 = this.fb.group({
      cantReferPers: ['', [Validators.required, Validators.pattern("[0-9]*")]],
    });

    this.Bancos = [
      {
        "idBanco":1,
        "value": "Atlántida"
      },
      {
        "idBanco":2,
        "value": "BAC"
      },
      {
        "idBanco":3,
        "value": "Ficohosa"
      }
    ];
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

    const centroTrabajo = this.form1.value.centroTrabajo;
    const cargo = this.form1.value.cargo;
    const sectorEconomico = this.form1.value.sectorEconomico;
    const actividadEconomica = this.form1.value.actividadEconomica;
    const claseCliente = this.form1.value.claseCliente;
    const sector = this.form1.value.sector;
    const numeroAcuerdo = this.form1.value.numeroAcuerdo;
    const salarioNeto = this.form1.value.salarioNeto;
    const fechaIngreso = this.form1.value.fechaIngreso;
    const fechaPago = this.form1.value.fechaPago;

    const nombreBanco = this.form2.value.nombreBanco;
    const numeroCuenta = this.form2.value.numeroCuenta;

    /* this.authSvc.crearCuenta(data).subscribe((res: any) => {
      console.log(res);
      //this.fakeLoading(res);
    }); */
  }

}