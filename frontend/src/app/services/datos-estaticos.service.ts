import { Injectable } from '@angular/core';
import { AfiliadoService } from './afiliado.service';
import { DireccionService } from './direccion.service';
import { BancosService } from './bancos.service';
import { DeduccionesService } from './deducciones.service';
import { InstitucionesService } from './instituciones.service';
import { TipoIdentificacionService } from './tipo-identificacion.service';

@Injectable({
  providedIn: 'root'
})
export class DatosEstaticosService {
  nacionalidades: any = [];
  departamentos: any = [];
  DatosBancBen: any = [];
  Bancos: any = [];
  Instituciones: any = [];
  tipoIdent : any = []

  constructor(private SVCInstituciones: InstitucionesService, private afiliadoService: AfiliadoService, public direccionSer: DireccionService, private bancosService: BancosService, private tipoIdentificacionService:TipoIdentificacionService) {
    /* this.direccionSer.getAllCiudades().subscribe((res: any) => {});
    this.direccionSer.getAllProvincias().subscribe((res: any) => {}); */
    /*  */
    this.getInstituciones();
    this.getNacioalidad();
  }

  async gettipoIdent() {
    const response = await this.tipoIdentificacionService.obtenerTiposIdentificacion().toPromise();
    const mappedResponse = response.map((item: { id_identificacion: any; tipo_identificacion: any; }) => ({
      label: item.tipo_identificacion,
      value: String(item.id_identificacion)
    }));

    this.tipoIdent = mappedResponse;
    return this.tipoIdent;
  }

  async getInstituciones() {
    this.Instituciones = await this.SVCInstituciones.getInstituciones().toPromise();

    this.Instituciones.map((item: { nombre_institucion: any; id_institucion: any; }) => ({
      label: item.nombre_institucion,
      value: String(item.id_institucion)
    }));
  }

  async getNacioalidad() {
    const response = await this.direccionSer.getAllPaises().toPromise();
    this.nacionalidades = response.map((item: { nacionalidad: any; id_pais: any; }) => ({
      label: item.nacionalidad,
      value: String(item.id_pais)
    }));
    return this.nacionalidades;
  }

  async getBancos() {
    const response = await this.bancosService.getAllBancos().toPromise();
    this.Bancos = response.map((item: { nombre_banco: any; cod_banco: any; }) => ({
      label: item.nombre_banco,
      value: String(item.cod_banco)
    }));
    return this.Bancos;
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
  Sexo = [
    {
      "idSexo": 1,
      "value": "M"
    },
    {
      "idSexo": 2,
      "value": "F"
    }
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

  centrosTrabajo = [
    {
      "idCentroTrabajo": 1,
      "value": "INSTITUTO CENTRAL VICENTE CÁCERES"
    },
    {
      "idCentroTrabajo": 2,
      "value": "IHCI"
    },
    {
      "idCentroTrabajo": 3,
      "value": "UNAH"
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

