import { ChangeDetectionStrategy, Component, EventEmitter, Input, OnInit, Output, inject } from '@angular/core';
import { ControlContainer, FormArray, FormBuilder, FormControl, FormGroup, Validators } from '@angular/forms';
import { AfiliadoService } from 'src/app/services/afiliado.service';
import { DireccionService } from 'src/app/services/direccion.service';
import { DatosEstaticosService } from 'src/app/services/datos-estaticos.service';

export function generateAddressFormGroup(): FormGroup {
  return new FormGroup({
    tipoIdent: new FormControl('', Validators.required),
    numeroIden: new FormControl('',  Validators.required),
    primerNombre: new FormControl('',  Validators.required),
    segundoNombre: new FormControl('' ),
    tercerNombre: new FormControl('' ),
    primerApellido: new FormControl('',  Validators.required),
    segundoApellido: new FormControl('' ),
    fechaNacimiento: new FormControl('',  Validators.required ),
    cantidadDependientes: new FormControl('',  [Validators.pattern("([1-9]+([0-9])?)"),Validators.required]),
    cantidadHijos: new FormControl('',  [Validators.required, Validators.pattern("([1-9]+([0-9])?)")]),
    Sexo: new FormControl('',  Validators.required),
    profesion: new FormControl('',  Validators.required),
    estadoCivil: new FormControl('',  Validators.required),
    representacion: new FormControl('',  Validators.required),
    estado: new FormControl('', Validators.required),
    cotizante: new FormControl('', Validators.required),
    telefono1: new FormControl('', Validators.required),
    telefono2: new FormControl('', ),
    correo1: new FormControl('', [Validators.required, Validators.email]),
    correo2: new FormControl('', [ Validators.email]),
    ciudadNacimiento: new FormControl('', Validators.required),
    ciudadDomicilio: new FormControl('', Validators.required),
    direccionDetallada: new FormControl('', Validators.required),
    colegioMagisterial: new FormControl('', [Validators.required]),
    numeroCarnet: new FormControl('', [Validators.required]),
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
  public archivo: any;
  public dataEdit:any;

  tipoCotizante: any = this.datosEstaticos.tipoCotizante; tipoIdent: any = this.datosEstaticos.tipoIdent; 
  Sexo: any = this.datosEstaticos.Sexo; estadoCivil: any = this.datosEstaticos.estadoCivil; 
  representacion: any = this.datosEstaticos.representacion; estado: any = this.datosEstaticos.estado;
  
  paises: any = []; departamentos: any = [];

  @Input() groupName = '';
  @Output() newDatBenChange = new EventEmitter<any>()
  formArchivos:any;
  minDate: Date;
  
  onDatosBenChange(fecha:any){
    this.newDatBenChange.emit(fecha._model.selection);
  }
  constructor( private fb: FormBuilder, private afiliadoService: AfiliadoService, private direccionSer: DireccionService, private datosEstaticos: DatosEstaticosService) {
    const currentYear = new Date();
    this.minDate = new Date(currentYear.getFullYear(), currentYear.getMonth(), currentYear.getDate(),  currentYear.getHours(), currentYear.getMinutes(), currentYear.getSeconds());

    console.log(this.minDate);
        
    this.direccionSer.getAllCiudades().subscribe((res: any) => {
    });
    this.direccionSer.getAllPaises().subscribe((res: any) => {
      this.departamentos = res.paises
      this.paises = res.paises
    });
    this.direccionSer.getAllProvincias().subscribe((res: any) => {
    });
  }
  
  ngOnInit():void{}

  /* prueba(e:any){ 
    console.log(e);
    return e._model.selection
  } */

}