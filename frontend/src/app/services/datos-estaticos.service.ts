import { Injectable } from '@angular/core';
import { AfiliadoService } from './afiliado.service';
import { DireccionService } from './direccion.service';
import { BancosService } from './bancos.service';
import { InstitucionesService } from './instituciones.service';
import { TipoIdentificacionService } from './tipo-identificacion.service';
import { Observable } from 'rxjs';
import { ColegiosMagisterialesService } from './colegios-magisteriales.service';
import { CentroTrabajoService } from './centro-trabajo.service';

@Injectable({
  providedIn: 'root'
})
export class DatosEstaticosService {
  nacionalidades: any = [];
  departamentos: any = [];
  DatosBancBen: any = [];
  Bancos: any = [];
  Instituciones: any = [];
  tipoIdent : any = [];
  profesiones: any = [];
  colegiosMagisteriales : any = []
  centrosTrabajo : any = []

  constructor( 
    private colegiosMagSVC: ColegiosMagisterialesService , private bancosService: BancosService,
    private centrosTrabSVC:CentroTrabajoService,
    private SVCInstituciones: InstitucionesService, private afiliadoService: AfiliadoService, public direccionSer: DireccionService, private tipoIdentificacionService:TipoIdentificacionService,
    private centroTrabajoService: CentroTrabajoService,
  ) {
    /* this.direccionSer.getAllCiudades().subscribe((res: any) => {});
    this.direccionSer.getAllProvincias().subscribe((res: any) => {}); */
    /*  */
    this.getInstituciones();
    this.getNacionalidad();
    this.gettipoIdent();
    this.getBancos();
    this.getColegiosMagisteriales();
    this.getAllCentrosTrabajo();
    this.getInstituciones();
    this.getProfesiones();
  }


  async gettipoIdent() {
    const response = await this.tipoIdentificacionService.obtenerTiposIdentificacion().toPromise();
    const mappedResponse = response.map((item: { id_identificacion: any; tipo_identificacion: any; }) => ({
      label: item.tipo_identificacion,
      value: item.id_identificacion
    }));


    this.tipoIdent = mappedResponse;
    return this.tipoIdent;
  }

  async getAllCentrosTrabajo() {
    const response = await this.centrosTrabSVC.obtenerTodosLosCentrosTrabajo().toPromise();
    const mappedResponse = response!.map((item: { id_centro_trabajo: any; nombre_centro_trabajo: any; }) => ({
      label: item.id_centro_trabajo,
      value: String(item.nombre_centro_trabajo)
    }));

    this.centrosTrabajo = mappedResponse;
    return this.centrosTrabajo;
  }

  async getInstituciones() {
    this.Instituciones = await this.SVCInstituciones.getInstituciones().toPromise();

    this.Instituciones.map((item: { nombre_institucion: any; id_institucion: any; }) => ({
      label: item.nombre_institucion,
      value: String(item.id_institucion)
    }));

    return this.Instituciones;
  }

  async getProfesiones() {
    try {
        const response = await this.centroTrabajoService.obtenerTodasLasProfesiones().toPromise() || [];
        this.profesiones = response.map((profesion: any) => ({
            label: profesion.idProfesion,
            value:profesion.descripcion
        }));
        return this.profesiones;
    } catch (error) {
        console.error('Error al obtener las profesiones', error);
        this.profesiones = [];
        return this.profesiones;
    }
  }

  async getNacionalidad() {
    const response = await this.direccionSer.getAllPaises().toPromise();
    this.nacionalidades = response.map((item: { nacionalidad: any; id_pais: any; }) => ({
      id_pais: item.id_pais,
      nacionalidad: item.nacionalidad
    }));
    return this.nacionalidades;
  }

  async getBancos() {
    const response = await this.bancosService.getAllBancos().toPromise();
    this.Bancos = response.data.map((item: { nombre_banco: any; cod_banco: any; }) => ({
      label: item.nombre_banco,
      value: String(item.cod_banco)
    }));
    return this.Bancos;
  }

  async getColegiosMagisteriales() {
    const response = await this.colegiosMagSVC.getAllColegiosMagisteriales().toPromise();

    this.colegiosMagisteriales = response.data.map((item: { idColegio: any; descripcion: any; }) => ({
      label: item.idColegio,
      value: String(item.descripcion)
    }));
    return this.colegiosMagisteriales;
  }

  estadoCivil = [
    {
      "idEstadoCivil": 1,
      "value": "CASADO/A"
    },
    {
      "idEstadoCivil": 2,
      "value": "DIVORCIADO/A"
    },
    {
      "idEstadoCivil": 3,
      "value": "SEPARADO/A"
    },
    {
      "idEstadoCivil": 4,
      "value": "SOLTERO/A"
    },
    {
      "idEstadoCivil": 5,
      "value": "UNION LIBRE"
    },
    {
      "idEstadoCivil": 6,
      "value": "VIUDO/A"
    }
  ];
  tiposPlanilla = [
    {
      "idTipoPlanilla": 1,
      "value": "EGRESO"
    },
    {
      "idTipoPlanilla": 2,
      "value": "INGRESO"
    },
  ];
  representacion = [
    {
      "idRepresentacion": 1,
      "value": "POR CUENTA PROPIA"
    },
    {
      "idRepresentacion": 2,
      "value": "POR TERCEROS"
    }
  ];
  estado = [
    {
      "idEstado": 1,
      "value": "FALLECIDO"
    },
    {
      "idEstado": 2,
      "value": "ACTIVO"
    },
    {
      "idEstado": 3,
      "value": "INACTIVO"
    }
  ];
  genero = [
    "MASCULINO",
    "FEMENINO",
    "NO BINARIO",
    "OTRO"
  ];
  /* tipoIdent = [
    {
      "idIdentificacion": 1,
      "value": "DNI"
    },
    {
      "idIdentificacion": 2,
      "value": "PASAPORTE"
    },
    {
      "idIdentificacion": 3,
      "value": "CARNET RESIDENCIA"
    },
    {
      "idIdentificacion": 4,
      "value": "NÚMERO LICENCIA"
    },
    {
      "idIdentificacion": 5,
      "value": "RTN"
    },
  ]; */
  tipoCotizante = [
    {
      "idCotizante": 1,
      "value": "AFILIADO"
    },
    {
      "idCotizante": 2,
      "value": "BENEFICIARIO"
    },
    {
      "idCotizante": 3,
      "value": "AFILIADO y BENEFICIARIO"
    },
    {
      "idEstado": 4,
      "value": "JUBILADO"
    }
  ];


  sector = [
    {
      "idsector": 1,
      "value": "JUBILADO"
    },
    {
      "idsector": 2,
      "value": "PEDAGOGICO"
    },
    {
      "idsector": 3,
      "value": "PRIVADO"
    },
    {
      "idsector": 4,
      "value": "PROHECO"
    },
    {
      "idsector": 5,
      "value": "PUBLICO"
    }
  ];

  tipoRol = [
    {
      "idRol": 2,
      "value": "JEFE DE AREA"
    },
    {
      "idRol": 3,
      "value": "OFICIAL"
    },
    {
      "idRol": 4,
      "value": "AUXILIAR"
    },
  ]

  tiposPlanillasPrivadas = [
    {
      ID_TIPO_PLANILLA: 1,
      NOMBRE_PLANILLA: "PLANILLA ORDINARIA"
    },
    {
      ID_TIPO_PLANILLA: 2,
      NOMBRE_PLANILLA: "PLANILLA DECIMO TERCERO"
    },
    {
      ID_TIPO_PLANILLA: 3,
      NOMBRE_PLANILLA: "PLANILLA DECIMO CUARTO"
    },
  ];
}
