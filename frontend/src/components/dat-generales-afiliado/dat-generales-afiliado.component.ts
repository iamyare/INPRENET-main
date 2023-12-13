import { ChangeDetectionStrategy, Component, EventEmitter, Input, OnInit, Output, inject } from '@angular/core';
import { CommonModule } from '@angular/common';
import { ControlContainer, FormArray, FormBuilder, FormControl, FormGroup, Validators } from '@angular/forms';
import { AfiliadoService } from 'src/app/services/afiliado.service';

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

  tipoCotizante: any = []; tipoIdent: any = []; Sexo: any = []; estadoCivil: any = [];
  
  @Input() groupName = '';
  @Output() newDatGenChange = new EventEmitter<any>()

  onDatosGenChange():void{
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
    const cotizante = this.form.value.cotizante;
    const telefono1 = this.form.value.telefono1;
    const telefono2 = this.form.value.telefono2;
    const correo1 = this.form.value.correo1;
    const correo2 = this.form.value.correo2;
    const ciudadNacimiento = this.form.value.ciudadNacimiento;
    const ciudadDomicilio = this.form.value.ciudadDomicilio;
    const direccionDetallada = this.form.value.direccionDetallada;

    const data = {
      tipoIdent : tipoIdent,
      archIdent : archIdent,
      numeroIden : numeroIden,
      primerNombre : primerNombre,
      segundoNombre : segundoNombre,
      tercerNombre : tercerNombre,
      primerApellido : primerApellido,
      segundoApellido : segundoApellido,
      fechaNacimiento : fechaNacimiento,
      cantidadDependientes : cantidadDependientes,
      cantidadHijos : cantidadHijos,
      Sexo : Sexo,
      profesion : profesion,
      estadoCivil : estadoCivil,
      representacion : representacion,
      estado : estado,
      cotizante : cotizante,
      telefono1 : telefono1,
      telefono2 : telefono2,
      coreo1 : correo1,
      coreo2 : correo2,
      ciudadNacimiento : ciudadNacimiento,
      ciudadDomicilio : ciudadDomicilio,
      direccionDetallada : direccionDetallada
    }
    this.newDatGenChange.emit(data);
  }

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
  }

  ngOnInit():void{
    this.afiliadoService.afiliadosEdit.subscribe(data => {
      this.dataEdit = data
      this.form.patchValue({
      tipoIdent: this.dataEdit.data.tipoIdent ,
      archIdent: this.dataEdit.data.ARCHIVO_IDENTIFICACION,
      numeroIden: this.dataEdit.data.numeroIden,
      primerNombre: this.dataEdit.data.PRIMER_NOMBRE,
      segundoNombre: this.dataEdit.data.SEGUNDO_NOMBRE ,
      tercerNombre: this.dataEdit.data.TERCER_NOMBRE,
      primerApellido: this.dataEdit.data.PRIMER_APELLIDO ,
      segundoApellido: this.dataEdit.data.SEGUNDO_APELLIDO ,
      fechaNacimiento: this.dataEdit.data.FECHA_NACIMIENTO,
      cantidadDependientes: this.dataEdit.data.CANTIDAD_DEPENDIENTES ,
      cantidadHijos: this.dataEdit.data.CANTIDAD_HIJOS ,
      Sexo: this.dataEdit.data.SEXO ,
      profesion: this.dataEdit.data.PROFESION ,
      estadoCivil: this.dataEdit.data.estadoCivil ,
      representacion: this.dataEdit.data.REPRESENTACION ,
      estado: this.dataEdit.data.ESTADO ,
      cotizante: this.dataEdit.data.cotizante ,
      telefono1: this.dataEdit.data.TELEFONO_1 ,
      telefono2: this.dataEdit.data.TELEFONO_2 ,
      correo1: this.dataEdit.data.CORREO_1 ,
      correo2: this.dataEdit.data.CORREO_2 ,
      ciudadDomicilio : this.dataEdit.data.ciudadDomicilio ,
      ciudadNacimiento : this.dataEdit.data.ciudadNacimiento,
      direccionDetallada : this.dataEdit.data.direccionDetallada

      });
    })
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
