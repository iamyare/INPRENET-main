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

  tipoCotizante: any = this.datosEstaticos.tipoCotizante; tipoIdent: any = this.datosEstaticos.tipoIdent;
  Sexo: any = this.datosEstaticos.Sexo; estadoCivil: any = this.datosEstaticos.estadoCivil;
  representacion: any = this.datosEstaticos.representacion; estado: any = this.datosEstaticos.estado;

  paises: any = this.datosEstaticos.paises; departamentos: any = this.datosEstaticos.departamentos;

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
    this.direccionSer.getAllCiudades().subscribe((res: any) => { });
    this.direccionSer.getAllProvincias().subscribe((res: any) => { });
    this.direccionSer.getAllPaises().subscribe((res: any) => {
      this.departamentos = res.paises
      this.paises = res.paises
    });
  }

  /* prueba(e:any){
    return e._model.selection
  } */

}
