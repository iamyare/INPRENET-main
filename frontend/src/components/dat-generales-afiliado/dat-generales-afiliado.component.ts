import { ChangeDetectionStrategy, Component, EventEmitter, Input, OnInit, Output, inject } from '@angular/core';
import { ControlContainer, FormArray, FormBuilder, FormControl, FormGroup, Validators } from '@angular/forms';
import { AfiliadoService } from 'src/app/services/afiliado.service';
import { DireccionService } from 'src/app/services/direccion.service';
import { DatosEstaticosService } from 'src/app/services/datos-estaticos.service';

export function generateAddressFormGroup(datos?: any): FormGroup {
  return new FormGroup({
    tipoIdent: new FormControl(datos?.tipoIdent, Validators.required),
    numeroIden: new FormControl(datos?.numeroIden, Validators.required),
    primerNombre: new FormControl(datos?.primerNombre, Validators.required),
    segundoNombre: new FormControl(datos?.segundoNombre),
    tercerNombre: new FormControl(datos?.tercerNombre),
    primerApellido: new FormControl(datos?.primerApellido, Validators.required),
    segundoApellido: new FormControl(datos?.segundoApellido),
    fechaNacimiento: new FormControl(datos?.fechaNacimiento, Validators.required),
    cantidadDependientes: new FormControl(datos?.cantidadDependientes, [Validators.pattern("([1-9]+([0-9])?)"), Validators.required]),
    cantidadHijos: new FormControl(datos?.cantidadHijos, [Validators.required, Validators.pattern("([1-9]+([0-9])?)")]),
    Sexo: new FormControl(datos?.Sexo, Validators.required),
    profesion: new FormControl(datos?.profesion, Validators.required),
    estadoCivil: new FormControl(datos?.estadoCivil, Validators.required),
    representacion: new FormControl(datos?.representacion, Validators.required),
    estado: new FormControl(datos?.estado, Validators.required),
    cotizante: new FormControl(datos?.cotizante, Validators.required),
    telefono1: new FormControl(datos?.telefono1, Validators.required),
    telefono2: new FormControl(datos?.telefono2,),
    correo1: new FormControl(datos?.correo1, [Validators.required, Validators.email]),
    correo2: new FormControl(datos?.correo2, [Validators.email]),
    ciudadNacimiento: new FormControl(datos?.ciudadNacimiento, Validators.required),
    ciudadDomicilio: new FormControl(datos?.ciudadDomicilio, Validators.required),
    direccionDetallada: new FormControl(datos?.direccionDetallada, Validators.required),
    colegioMagisterial: new FormControl(datos?.colegioMagisterial, [Validators.required]),
    numeroCarnet: new FormControl(datos?.numeroCarnet, [Validators.required]),
    nacionalidad: new FormControl(datos?.nacionalidad, Validators.required),
    municipioResidencia: new FormControl(datos?.municipioResidencia, Validators.required),
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
export class DatGeneralesAfiliadoComponent implements OnInit {
  public archivo: any;
  public dataEdit: any;

  tipoIdentData: any = [];
  nacionalidades: any = [];

  tipoCotizante: any = this.datosEstaticos.tipoCotizante; tipoIdent: any = this.datosEstaticos.tipoIdent;
  Sexo: any = this.datosEstaticos.Sexo; estadoCivil: any = this.datosEstaticos.estadoCivil;
  representacion: any = this.datosEstaticos.representacion; estado: any = this.datosEstaticos.estado;


  @Input() groupName = '';
  @Output() newDatBenChange = new EventEmitter<any>()
  formArchivos: any;
  minDate: Date;

  onDatosBenChange(fecha: any) {
    this.newDatBenChange.emit(fecha._model.selection);
  }

  constructor(private fb: FormBuilder, private afiliadoService: AfiliadoService, public direccionSer: DireccionService, private datosEstaticos: DatosEstaticosService) {
    const currentYear = new Date();
    this.minDate = new Date(currentYear.getFullYear(), currentYear.getMonth(), currentYear.getDate(), currentYear.getHours(), currentYear.getMinutes(), currentYear.getSeconds());
  }

  ngOnInit(): void {
    this.cargarTiposIdentificacion();
    this.cargarNacionalidades();
  }

  cargarTiposIdentificacion() {
    this.datosEstaticos.gettipoIdent().then(data => {
      this.tipoIdentData = data;
    }).catch(error => {
      console.error('Error al cargar tipos de identificación:', error);
    });
  }

  cargarNacionalidades() {
    this.datosEstaticos.getNacioalidad().then(data => {
    this.nacionalidades = data;
    }).catch(error => {
      console.error('Error al cargar nacionalidades:', error);
    });
  }


  /* prueba(e:any){
    return e._model.selection
  } */

}
