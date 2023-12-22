import { Injectable } from '@angular/core';

@Injectable({
  providedIn: 'root'
})
export class DatosEstaticosService {

  constructor() { }

  estadoCivil = [
    {
      "idEstadoCivil":1,
      "value": "CASADO/A"
    },
    {
      "idEstadoCivil":2,
      "value": "DIVORCIADO/A"
    },
    {
      "idEstadoCivil":3,
      "value": "SEPARADO/A"
    },
    {
      "idEstadoCivil":4,
      "value": "SOLTERO/A"
    },
    {
      "idEstadoCivil":5,
      "value": "UNION LIBRE"
    },
    {
      "idEstadoCivil":6,
      "value": "VIUDO/A"
    }
  ];
  representacion = [
    {
      "idRepresentacion":1,
      "value": "POR CUENTA PROPIA"
    },
    {
      "idRepresentacion":2,
      "value": "POR TERCEROS"
    }
  ];
  estado = [
    {
      "idEstado":1,
      "value": "FALLECIDO"
    },
    {
      "idEstado":2,
      "value": "ACTIVO"
    }
  ];
  Sexo = [
    {
      "idSexo":1,
      "value": "M"
    },
    {
      "idSexo":2,
      "value": "F"
    }
  ];
  tipoIdent = [
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
  tipoCotizante = [
    {
      "idCotizante":1,
      "value": "AFILIADO"
    },
    {
      "idCotizante":2,
      "value": "BENEFICIARIO"
    },
    {
      "idCotizante":3,
      "value": "AFILIADO y BENEFICIARIO"
    },
  ];

  centrosTrabajo = [
    {
      "idCentroTrabajo":1,
      "value": "INSTITUTO CENTRAL VICENTE CÁCERES"
    },
    {
      "idCentroTrabajo":2,
      "value": "IHCI"
    },
    {
      "idCentroTrabajo":3,
      "value": "UNAH"
    }
  ];
  sector = [
    {
      "idsector":1,
      "value": "JUBILADO"
    },
    {
      "idsector":2,
      "value": "PEDAGOGICO"
    },
    {
      "idsector":3,
      "value": "PRIVADO"
    },
    {
      "idsector":4,
      "value": "PROHECO"
    },
    {
      "idsector":5,
      "value": "PUBLICO"
    }
  ];
}
