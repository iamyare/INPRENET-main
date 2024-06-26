import { Injectable } from '@angular/core';
import { AfiliadoService } from './afiliado.service';
import { DireccionService } from './direccion.service';
import { BancosService } from './bancos.service';
import { TipoIdentificacionService } from './tipo-identificacion.service';
import { ColegiosMagisterialesService } from './colegios-magisteriales.service';
import { CentroTrabajoService } from './centro-trabajo.service';
import { HttpClient } from '@angular/common/http';
import { TransaccionesService } from './transacciones.service';
import { AuthService } from './auth.service';

@Injectable({
  providedIn: 'root'
})
export class DatosEstaticosService {
  nacionalidades: any = [];
  departamentos: any = [];
  DatosBancBen: any = [];
  Bancos: any = [];
  tipoIdent: any = [];
  tipoCuenta: any = [];
  profesiones: any = [];
  colegiosMagisteriales: any = [];
  centrosTrabajo: any = [];
  municipios: any = [];
  tiposMovimientos: any = [];
  estados: any = [];
  tipoRol: any = [];
  centrosTrabajoTipoE: any = [];

  constructor(
    private colegiosMagSVC: ColegiosMagisterialesService,
    private bancosService: BancosService,
    private centrosTrabSVC: CentroTrabajoService,
    private afiliadoService: AfiliadoService,
    public direccionSer: DireccionService,
    private tipoIdentificacionService: TipoIdentificacionService,
    private centroTrabajoService: CentroTrabajoService,
    private transaccionesSVC: TransaccionesService,
    private http: HttpClient,
    private authService: AuthService
  ) {
    this.getNacionalidad();
    this.gettipoIdent();
    this.getTipoCuenta();
    this.getTipoMovimientos();
    this.getBancos();
    this.getColegiosMagisteriales();
    this.getAllCentrosTrabajo();
    this.getCentrosTrabajoTipoE();
    this.getProfesiones();
    this.getMunicipios();
    this.getDepartamentos();
  }


  async getEstados() {
    const response = await this.afiliadoService.getAllEstados().toPromise();
    this.estados = response.map((estado: { codigo: any; Descripcion: any; }) => ({
      label: estado.Descripcion,
      value: estado.codigo
    }));

    return this.estados;
  }

  async getCentrosTrabajoTipoE() {
    try {
      const response: any = await this.centroTrabajoService.obtenerCentrosTrabajoTipoE().toPromise();
      this.centrosTrabajoTipoE = response.map((item: { id_centro_trabajo: any; nombre_centro_trabajo: any; }) => ({
        label: item.nombre_centro_trabajo,
        value: item.id_centro_trabajo
      }));
      return this.centrosTrabajoTipoE;
    } catch (error) {
      console.error('Error al obtener los centros de trabajo tipo E:', error);
      this.centrosTrabajoTipoE = [];
      return this.centrosTrabajoTipoE;
    }
  }

  async getDepartamentos(): Promise<any[]> {
    try {
      const response = await this.direccionSer.getAllDepartments().toPromise();
      this.departamentos = response.map((item: { id_departamento: any; nombre_departamento: any; }) => ({
        label: item.nombre_departamento,
        value: item.id_departamento
      }));
      return this.departamentos;
    } catch (error) {
      console.error('Error al obtener los departamentos:', error);
      this.departamentos = [];
      return this.departamentos;
    }
  }



  gettipoIdent = async () => {
    const response = await this.tipoIdentificacionService.obtenerTiposIdentificacion().toPromise();
    const mappedResponse = response.map((item: { id_identificacion: any; tipo_identificacion: any; }) => ({
      label: item.tipo_identificacion,
      value: item.id_identificacion
    }));

    this.tipoIdent = mappedResponse;
    return this.tipoIdent;
  }

  async getTipoCuenta() {
    const response = await this.afiliadoService.obtenerTiposCuentas().toPromise();
    const mappedResponse = response.data.map((item: { NUMERO_CUENTA: any; DESCRIPCION: any; }) => ({
      label: item.DESCRIPCION,
      value: item.NUMERO_CUENTA
    }));

    this.tipoCuenta = mappedResponse;
    return this.tipoCuenta;
  }

  async getTipoMovimientos() {
    const response = await this.transaccionesSVC.obtenerTipoMovimientos().toPromise();

    const mappedResponse = response.map((item: { ID_TIPO_MOVIMIENTO: any; DESCRIPCION: any; }) => ({
      label: item.DESCRIPCION,
      value: item.DESCRIPCION
    }));

    this.tiposMovimientos = mappedResponse;
    return this.tiposMovimientos;
  }

  async getAllCentrosTrabajo() {
    try {
      const response = await this.centrosTrabSVC.obtenerTodosLosCentrosTrabajo().toPromise();
      if (response) {
        const mappedResponse = response.map((item) => ({
          label: item.nombre_centro_trabajo,
          value: String(item.id_centro_trabajo),
          sector: item.sector_economico,
        }));
        this.centrosTrabajo = mappedResponse;
      }
    } catch (error) {
      console.error('Error al obtener los centros de trabajo:', error);
    }
  }

  async getProfesiones() {
    try {
      const response = await this.centroTrabajoService.obtenerTodasLasProfesiones().toPromise() || [];
      this.profesiones = response.map((profesion: any) => ({
        label: profesion.descripcion,
        value: profesion.idProfesion
      }));
      return this.profesiones;
    } catch (error) {
      console.error('Error al obtener las profesiones', error);
      this.profesiones = [];
      return this.profesiones;
    }
  }

  async getNacionalidad() {
    try {
      const response = await this.direccionSer.getAllPaises().toPromise();
      this.nacionalidades = response.map((item: { nacionalidad: string; id_pais: number; }) => ({
        value: item.id_pais,
        label: item.nacionalidad
      }));
      return this.nacionalidades;
    } catch (error) {
      console.error('Error al obtener nacionalidades:', error);
      this.nacionalidades = [];
      return this.nacionalidades;
    }
  }
  async getMunicipios() {
    try {
      const response = await this.direccionSer.getAllMunicipios().toPromise();
      this.municipios = response.map((item: { id_municipio: any; nombre_municipio: any; }) => ({
        value: item.id_municipio,
        label: String(item.nombre_municipio)
      }));
      return this.municipios;
    } catch (error) {
      this.municipios = []
      return this.municipios;
    }
  }

  async getBancos() {
    const response = await this.bancosService.getAllBancos().toPromise();
    this.Bancos = response.data.map((item: { nombre_banco: any; id_banco: any; }) => ({
      label: item.nombre_banco,
      value: String(item.id_banco)
    }));

    return this.Bancos;
  }

  async getColegiosMagisteriales() {
    const response = await this.colegiosMagSVC.getAllColegiosMagisteriales().toPromise();

    this.colegiosMagisteriales = response.data.map((item: { idColegio: any; descripcion: any; }) => ({
      label: String(item.descripcion),
      value: item.idColegio,
    }));
    return this.colegiosMagisteriales;
  }

  tipoPersona = [
    {
      "value": 1,
      "label": "AFILIADO"
    },
    {
      "value": 2,
      "label": "BENEFICIARIO"
    }
  ]

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
      "value": 'POR CUENTA PROPIA',
      "label": "POR CUENTA PROPIA"
    },
    {
      "value": "POR TERCEROS",
      "label": "POR TERCEROS"
    }
  ];

  genero = [
    {
      "value": "MASCULINO",
      "label": "MASCULINO"
    },
    {
      "value": "FEMENINO",
      "label": "FEMENINO"
    },
    {
      "value": "NO BINARIO",
      "label": "NO BINARIO"
    },
    {
      "value": "OTRO",
      "label": "OTRO"
    }
  ];

  sexo = [
    {
      "value": "F",
      "label": "FEMENINO"
    },
    {
      "value": "M",
      "label": "MASCULINO"
    },
  ];

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

  tiposPlanillasPrivadas = [
    {
      ID_TIPO_PLANILLA: 1,
      NOMBRE_PLANILLA: "PLANILLA ORDINARIA"
    },
    {
      ID_TIPO_PLANILLA: 2,
      NOMBRE_PLANILLA: "PLANILLA DÉCIMO TERCERO"
    },
    {
      ID_TIPO_PLANILLA: 3,
      NOMBRE_PLANILLA: "PLANILLA DÉCIMO CUARTO"
    },
  ];

  parentesco = [
    { value: "CÓNYUGE", label: "CÓNYUGE" },
    { value: "ABUELA MATERNA", label: "ABUELA MATERNA" },
    { value: "ABUELA PATERNA", label: "ABUELA PATERNA" },
    { value: "ABUELO MATERNO", label: "ABUELO MATERNO" },
    { value: "ABUELO PATERNO", label: "ABUELO PATERNO" },
    { value: "CUÑADA", label: "CUÑADA" },
    { value: "CUÑADO", label: "CUÑADO" },
    { value: "ESPOSA", label: "ESPOSA" },
    { value: "ESPOSO", label: "ESPOSO" },
    { value: "HERMANA", label: "HERMANA" },
    { value: "HERMANO", label: "HERMANO" },
    { value: "HIJA", label: "HIJA" },
    { value: "HIJO", label: "HIJO" },
    { value: "MADRE", label: "MADRE" },
    { value: "NIETA", label: "NIETA" },
    { value: "NIETO", label: "NIETO" },
    { value: "NUERA", label: "NUERA" },
    { value: "PADRE", label: "PADRE" },
    { value: "PRIMA", label: "PRIMA" },
    { value: "PRIMO", label: "PRIMO" },
    { value: "SOBRINA", label: "SOBRINA" },
    { value: "SOBRINO", label: "SOBRINO" },
    { value: "SUEGRA", label: "SUEGRA" },
    { value: "SUEGRO", label: "SUEGRO" },
    { value: "TÍA MATERNA", label: "TÍA MATERNA" },
    { value: "TÍA PATERNA", label: "TÍA PATERNA" },
    { value: "TÍO MATERNO", label: "TÍO MATERNO" },
    { value: "TÍO PATERNO", label: "TÍO PATERNO" },
    { value: "YERNO", label: "YERNO" }
  ];
}
