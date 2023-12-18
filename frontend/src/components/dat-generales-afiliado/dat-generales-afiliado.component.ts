import { ChangeDetectionStrategy, Component, EventEmitter, Input, OnInit, Output, inject } from '@angular/core';
import { CommonModule } from '@angular/common';
import { ControlContainer, FormArray, FormBuilder, FormControl, FormGroup, Validators } from '@angular/forms';
import { AfiliadoService } from 'src/app/services/afiliado.service';
import formatoFechaResol   from '../../app/models/fecha';

export function generateAddressFormGroup(): FormGroup {
  return new FormGroup({
    tipoIdent: new FormControl('', Validators.required),
    archIdent: new FormControl('', Validators.required),
    numeroIden: new FormControl('', Validators.required),
    primerNombre: new FormControl('', Validators.required),
    segundoNombre: new FormControl('', Validators.required),
    tercerNombre: new FormControl('', Validators.required),
    primerApellido: new FormControl('', Validators.required),
    segundoApellido: new FormControl('', Validators.required),
    fechaNacimiento: new FormControl('', Validators.required),
    cantidadDependientes: new FormControl('', Validators.required),
    cantidadHijos: new FormControl('', Validators.required),
    Sexo: new FormControl('', Validators.required),
    profesion: new FormControl('', Validators.required),
    estadoCivil: new FormControl('', Validators.required),
    representacion: new FormControl('', Validators.required),
    estado: new FormControl(''),
    cotizante: new FormControl(''),
    telefono1: new FormControl(''),
    telefono2: new FormControl(''),
    correo1: new FormControl(''),
    correo2: new FormControl(''),
    ciudadNacimiento: new FormControl(''),
    ciudadDomicilio: new FormControl(''),
    direccionDetallada: new FormControl(''),
  });
}

@Component({
  selector: 'app-dat-generales-afiliado',
  templateUrl: './dat-generales-afiliado.component.html',
  styleUrl: './dat-generales-afiliado.component.scss',
  changeDetection: ChangeDetectionStrategy.OnPush,
  viewProviders: [
    {
      provide: ControlContainer,
      useFactory: () =>
        inject(ControlContainer, { skipSelf: true, host: true }),
    },
  ],
})
export class DatGeneralesAfiliadoComponent implements OnInit{
  form: FormGroup;

  htmlSTID: string = "Archivo de identificación"
  public archivo: any;

  public dataEdit:any;

  tipoCotizante: any = []; tipoIdent: any = []; Sexo: any = []; estadoCivil: any = []; paises: any = []; departamentos: any = [];
  representacion: any = [];
  estado: any = [];
  @Input() groupName = '';

  constructor( private fb: FormBuilder, private afiliadoService: AfiliadoService) {
    this.form = this.fb.group({
      tipoIdent: new FormControl('', Validators.required),
      archIdent: new FormControl('', Validators.required),
      numeroIden: new FormControl('', Validators.required),
      primerNombre: new FormControl('', Validators.required),
      segundoNombre: new FormControl('', Validators.required),
      tercerNombre: new FormControl('', Validators.required),
      primerApellido: new FormControl('', Validators.required),
      segundoApellido: new FormControl('', Validators.required),
      fechaNacimiento: new FormControl('', Validators.required),
      cantidadDependientes: new FormControl('', Validators.required),
      cantidadHijos: new FormControl('', Validators.required),
      Sexo: new FormControl('', Validators.required),
      profesion: new FormControl('', Validators.required),
      estadoCivil: new FormControl('', Validators.required),
      representacion: new FormControl('', Validators.required),
      estado: new FormControl(''),
      cotizante: new FormControl(''),
      telefono1: new FormControl(''),
      telefono2: new FormControl(''),
      correo1: new FormControl(''),
      correo2: new FormControl(''),
      ciudadNacimiento: new FormControl(''),
      ciudadDomicilio: new FormControl(''),
      direccionDetallada: new FormControl(''),
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
    this.representacion = [
      {
        "idRepresentacion":1,
        "value": "POR CUENTA PROPIA"
      },
      {
        "idRepresentacion":2,
        "value": "POR TERCEROS"
      }
    ];
    this.estado = [
      {
        "idEstado":1,
        "value": "FALLECIDO"
      },
      {
        "idEstado":2,
        "value": "ACTIVO"
      }
    ];
    this.Sexo = [
      {
        "idSexo":1,
        "value": "M"
      },
      {
        "idSexo":2,
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
    this.tipoCotizante = [
      {
        "idCotizante":1,
        "value": "Afiliado"
      },
      {
        "idCotizante":2,
        "value": "Beneficiario"
      },
      {
        "idCotizante":3,
        "value": "Afiliado y Beneficiario"
      },
    ];
    this.departamentos = [
      {
        "idDepartamento":1,
        "value": "Francisco Morazan"
      },
      {
        "idDepartamento":2,
        "value": "Olancho"
      },
      {
        "idDepartamento":3,
        "value": "Choluteca"
      },
    ];
    this.paises = [
      {
        "idPais":1,
        "value": "Honduras"
      },
      {
        "idPais":2,
        "value": "El Salvador"
      },
      {
        "idPais":3,
        "value": "Costa Rica"
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

}
