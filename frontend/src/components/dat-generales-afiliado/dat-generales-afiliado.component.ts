import { ChangeDetectionStrategy, Component, EventEmitter, Input, OnInit, Output, inject } from '@angular/core';
import { ControlContainer, FormArray, FormBuilder, FormControl, FormGroup, Validators } from '@angular/forms';
import { AfiliadoService } from 'src/app/services/afiliado.service';
import { DireccionService } from 'src/app/services/direccion.service';
import { DatosEstaticosService } from 'src/app/services/datos-estaticos.service';

export function generateAddressFormGroup(datos?: any): FormGroup {
  return new FormGroup({
    id_tipo_identificacion: new FormControl(datos?.id_tipo_identificacion, Validators.required),
    dni: new FormControl(datos?.dni, Validators.required),
    primer_nombre: new FormControl(datos?.primer_nombre, Validators.required),
    segundo_nombre: new FormControl(datos?.segundo_nombre),
    tercer_nombre: new FormControl(datos?.tercer_nombre),
    primer_apellido: new FormControl(datos?.primer_apellido, Validators.required),
    segundo_apellido: new FormControl(datos?.segundo_apellido),
    fecha_nacimiento: new FormControl(datos?.fecha_nacimiento, Validators.required),
    cantidad_dependientes: new FormControl(datos?.cantidad_dependientes, [Validators.pattern("^[0-9]+$"), Validators.required]),
    cantidad_hijos: new FormControl(datos?.cantidad_hijos, [Validators.required, Validators.pattern("^[0-9]+$")]),
    genero: new FormControl(datos?.genero, Validators.required),
    id_profesion: new FormControl(datos?.id_profesion, Validators.required),
    estado_civil: new FormControl(datos?.estado_civil, Validators.required),
    representacion: new FormControl(datos?.representacion, Validators.required),
    telefono_1: new FormControl(datos?.telefono_1, Validators.required),
    telefono_2: new FormControl(datos?.telefono_2,),
    correo_1: new FormControl(datos?.correo_1, [Validators.required, Validators.email]),
    correo_2: new FormControl(datos?.correo_2, [Validators.email]),
    direccion_residencia: new FormControl(datos?.direccion_residencia, Validators.required),
    numero_carnet: new FormControl(datos?.numero_carnet, [Validators.required]),
    id_pais: new FormControl(datos?.id_pais, Validators.required),
    id_municipio_residencia: new FormControl(datos?.id_municipio_residencia, Validators.required),
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
  municipios: any = [];
  generos: string[] = [];
  profesiones: any = [];

  tipoCotizante: any = this.datosEstaticos.tipoCotizante; tipoIdent: any = this.datosEstaticos.tipoIdent;
  estadoCivil: any = this.datosEstaticos.estadoCivil;
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
    this.cargarMunicipios();
    this.cargarProfesiones();
    this.generos = this.datosEstaticos.genero;
  }

  cargarProfesiones() {
    this.datosEstaticos.getProfesiones().then(data => {
      this.profesiones = data;
    }).catch(error => {
      console.error('Error al cargar profesiones:', error);
    });
  }


  cargarTiposIdentificacion() {
    this.datosEstaticos.gettipoIdent().then(data => {
      this.tipoIdentData = data;
    }).catch(error => {
      console.error('Error al cargar tipos de identificación:', error);
    });
  }

  cargarNacionalidades() {
    this.datosEstaticos.getNacionalidad().then(data => {
    this.nacionalidades = data;
    }).catch(error => {
      console.error('Error al cargar nacionalidades:', error);
    });
  }

  cargarMunicipios() {
    this.direccionSer.getAllMunicipios().subscribe({
      next: (data) => {
        this.municipios = data;
      },
      error: (error) => {
        console.error('Error al cargar municipios:', error);
      }
    });
  }



}
