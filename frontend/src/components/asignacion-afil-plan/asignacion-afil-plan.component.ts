import { Component, OnInit } from '@angular/core';
import { FormBuilder, Validators } from '@angular/forms';
import { ToastrService } from 'ngx-toastr';
import { MatDialog } from '@angular/material/dialog';
import { DynamicDialogComponent } from '@docs-components/dynamic-dialog/dynamic-dialog.component';
import { AfiliadoService } from 'src/app/services/afiliado.service';
import { PlanillaService } from 'src/app/services/planilla.service';
import { FieldConfig } from 'src/app/shared/Interfaces/field-config';
import { TableColumn } from 'src/app/shared/Interfaces/table-column';
import { convertirFecha } from 'src/app/shared/functions/formatoFecha';
import { DeduccionesService } from 'src/app/services/deducciones.service';
import { BeneficiosService } from '../../app/services/beneficios.service';

@Component({
  selector: 'app-asignacion-afil-plan',
  templateUrl: './asignacion-afil-plan.component.html',
  styleUrl: './asignacion-afil-plan.component.scss'
})
export class AsignacionAfilPlanComponent implements OnInit {
  convertirFecha = convertirFecha;
  mostDet: any = false;
  dataPlan: any;
  filas: any;
  tiposPlanilla: any[] = [];
  datosFormateados: any;

  myFormFields: FieldConfig[] = [];
  myColumnsDed: TableColumn[] = [];
  datosTabl: any[] = [];

  verDat: boolean = false;
  ejecF: any;

  datosFilasDeduccion: any;
  datosFilasBeneficios: any;

  detallePlanilla: any
  constructor(
    private _formBuilder: FormBuilder,
    private planillaService: PlanillaService,
    private svcAfilServ: AfiliadoService,
    private toastr: ToastrService,
    public dialog: MatDialog,
    private deduccionesService: DeduccionesService,
    private beneficiosService: BeneficiosService
  ) {
  }

  ngOnInit(): void {
    this.myColumnsDed = [
      {
        header: 'DNI',
        col: 'dni',
        isEditable: false,
        validationRules: [Validators.required, Validators.minLength(5)]
      },
      {
        header: 'Nombre Completo',
        col: 'NOMBRE_COMPLETO',
        isEditable: true
      },
      {
        header: 'Total de Ingresos',
        col: 'Total Beneficio',
        moneda: true,
        isEditable: true
      },
      {
        header: 'Total De Deducciones Aplicadas',
        col: 'Total Deducciones',
        isEditable: true,
        moneda: true,
        validationRules: [Validators.required, Validators.pattern(/^(3[01]|[12][0-9]|0?[1-9])-(1[0-2]|0?[1-9])-\d{4} - (3[01]|[12][0-9]|0?[1-9])-(1[0-2]|0?[1-9])-\d{4}$/)]
      },
      {
        header: 'Neto',
        col: 'Total',
        moneda: true,
        isEditable: true
      },
    ];

    this.myFormFields = [
      {
        type: 'string', label: 'Código De Planilla', name: 'codigo_planilla', validations: [Validators.required], display: true
      },
    ]
  }

  /* Se ejecuta cuando un valor del formulario cambia */
  obtenerDatosForm(event: any): any {
    this.datosFormateados = event;
  }

  /* Se ejecuta cuando da click en previsualizar datos planilla */
  getPlanilla = async () => {
    try {
      this.planillaService.getPlanillaBy(this.datosFormateados.value.codigo_planilla).subscribe(
        {
          next: async (response) => {

            if (response.data) {
              this.detallePlanilla = response.data;
              const periodoInicioFormatoNuevo = this.convertirFormatoFecha(response.data.periodoInicio);
              const periodoFinalizacionFormatoNuevo = this.convertirFormatoFecha(response.data.periodoFinalizacion);
              this.datosTabl = await this.getFilas(periodoInicioFormatoNuevo, periodoFinalizacionFormatoNuevo);
              this.verDat = true;
            } else {
              this.detallePlanilla = [];
              this.datosTabl = [];
              this.toastr.error(`La planilla con el código de planilla: ${this.datosFormateados.value.codigo_planilla}  no existe `);
            }
            if (this.ejecF) {
              this.ejecF(this.datosTabl).then(() => { });
            }
          },
          error: (error) => {
            let mensajeError = 'Error desconocido al buscar la planilla';
            if (error.error && error.error.message) {
              mensajeError = error.error.message;
            } else if (typeof error.error === 'string') {
              mensajeError = error.error;
            }

            this.toastr.error(mensajeError);
          }
        }
      );

    } catch (error) {
      console.error("Error al obtener datos de Tipo Planilla", error);
    }
  };

  getFilas = async (periodoInicio: string, periodoFinalizacion: string) => {
    const serviceCalls:any = {
      "ORDINARIA - AFILIADO": this.planillaService.getPlanillaOrdinariaAfiliados,
      "ORDINARIA - BENEFICIARIO": this.planillaService.getPlanillaOrdinariaBeneficiarios,
      "COMPLEMENTARIA - AFILIADO": this.planillaService.getPlanillaComplementariaAfiliados,
      "COMPLEMENTARIA - BENEFICIARIO": this.planillaService.getPlanillaComplementariaBeneficiarios,
    };

    const mapData = (item:any) => ({
      dni: item.DNI,
      NOMBRE_COMPLETO: item.NOMBRE_COMPLETO,
      periodoInicio: periodoInicio,
      periodoFinalizacion: periodoFinalizacion,
      "Total Beneficio": item["Total Beneficio"],
      "Total Deducciones": item["Total Deducciones"],
      "Total": item["Total Beneficio"] - item["Total Deducciones"],
    });

    try {
      const serviceName = this.detallePlanilla.tipoPlanilla.nombre_planilla;
      const serviceFunction = serviceCalls[serviceName];

      if (serviceFunction) {
        const data = await serviceFunction.bind(this.planillaService)(periodoInicio, periodoFinalizacion).toPromise();
        this.dataPlan = data.data.map(mapData);
      } else {
        console.error('Servicio no definido para el tipo de planilla:', serviceName);
      }
      console.log(this.dataPlan);
      return this.dataPlan;

    } catch (error) {
      console.error("Error al obtener datos de deducciones", error);
      throw error;
    }
  }

  ejecutarFuncionAsincronaDesdeOtroComponente(funcion: (data: any) => Promise<void>) {
    this.ejecF = funcion;
  }

  editar = (row: any) => { }

  /* Maneja los beneficios */
  manejarAccionUno(row: any) {
    let logs: any[] = [];
    logs.push({ message: `DNI: ${row.dni}`, detail: null  });
    logs.push({ message: `Nombre Completo: ${row.NOMBRE_COMPLETO}`, detail: null  });

    const openDialog = (beneficios:any) => {
      logs.push({ message: 'Datos De Beneficio:', detail: beneficios });
      this.dialog.open(DynamicDialogComponent, {
        width: '50%',
        data: { logs: logs, type: 'beneficio' }
      });
    };

    const handleError = (error:any) => {
      logs.push({ message: 'Error al obtener los beneficios:', detail: error });
      openDialog([]);
    };

    const mapBeneficios = (response:any) => {
      return response.data.map((b:any) => ({
        NOMBRE_BENEFICIO: b.NOMBRE_BENEFICIO,
        MontoAPagar: b.MontoAPagar
      }));
    };

    const serviceActions:any = {
      "ORDINARIA - AFILIADO": this.planillaService.getPagoBeneficioOrdiAfil.bind(this.planillaService),
      "ORDINARIA - BENEFICIARIO": this.planillaService.getPagoBeneficioOrdiBenef.bind(this.planillaService),
      "COMPLEMENTARIA - AFILIADO": this.planillaService.getPagoBeneficioCompleAfil.bind(this.planillaService),
      "COMPLEMENTARIA - BENEFICIARIO": this.planillaService.getPagoBeneficioCompleBenef.bind(this.planillaService),
    };

    const tipoPlanilla = this.detallePlanilla.tipoPlanilla.nombre_planilla;
    const serviceCall = serviceActions[tipoPlanilla];

    if (serviceCall) {
      serviceCall(row.dni, row.periodoInicio, row.periodoFinalizacion).subscribe({
        next: (response:any) => openDialog(mapBeneficios(response)),
        error: handleError
      });
    } else {
      console.error('No existe una acción para este tipo de planilla:', tipoPlanilla);
    }
  }

  /* Maneja las deducciones */
  manejarAccionDos(row: any) {
    let logs: any[] = [];
    logs.push({ message: `DNI: ${row.dni}`, detail: null  });
    logs.push({ message: `Nombre Completo: ${row.NOMBRE_COMPLETO}`, detail: null  });

    const openDialog = (deducciones:any) => {
      logs.push({ message: 'Datos De Deduccion:', detail: deducciones });
      this.dialog.open(DynamicDialogComponent, {
        width: '50%',
        data: { logs: logs, type: 'deduccion' }
      });
    };

    const handleError = (error:any) => {
      logs.push({ message: 'Error al obtener las deducciones:', detail: error });
      openDialog([]);
    };

    const mapDeducciones = (response:any) => {
      return response.data.map((b:any) => ({
        NOMBRE_DEDUCCION: b.NOMBRE_DEDUCCION,
        MontoAplicado: b.MontoAplicado
      }));
    };

    const serviceActions:any = {
      "ORDINARIA - AFILIADO": this.planillaService.getPagoDeduccionesOrdiAfil.bind(this.planillaService),
      "ORDINARIA - BENEFICIARIO": this.planillaService.getPagoDeduccionesOrdiBenef.bind(this.planillaService),
      "COMPLEMENTARIA - AFILIADO": this.planillaService.getPagoDeduccionesCompleAfil.bind(this.planillaService),
      "COMPLEMENTARIA - BENEFICIARIO": this.planillaService.getPagoDeduccionesCompleBenef.bind(this.planillaService),
    };

    const tipoPlanilla = this.detallePlanilla.tipoPlanilla.nombre_planilla;
    const serviceCall = serviceActions[tipoPlanilla];

    if (serviceCall) {
      serviceCall(row.dni, row.periodoInicio, row.periodoFinalizacion).subscribe({
        next: (response:any) => openDialog(mapDeducciones(response)),
        error: handleError
      });
    } else {
      console.error('No existe una acción para este tipo de planilla:', tipoPlanilla);
    }
  }



  openLogDialog(logs: any[]) {
    this.dialog.open(DynamicDialogComponent, {
      width: '1000px',
      data: { logs }
    });
  }

  async ingresarDeduccionesPlanilla() {
    let datosFilasDeduccion = [];

    try {
      let promesas: any[] = []
      if (this.detallePlanilla.nombre_planilla) {
      } else if (this.detallePlanilla.nombre_planilla === 'ORDINARIA') {
        promesas = this.datosTabl.map(row =>
          this.deduccionesService.getDetalleDeduccionesPorRango(row.id_afiliado, row.periodoInicio, row.periodoFinalizacion).toPromise()
            .then(deduccionesOrdinaria => deduccionesOrdinaria)
            .catch(error => {
              console.error(`Error al obtener detalles de deduccion para el afiliado ${row.id_afiliado}:`, error);
              return [];
            })
        );
      } else if (this.detallePlanilla.nombre_planilla === 'COMPLEMENTARIA') {
        promesas = this.datosTabl.map(row =>
          this.deduccionesService.obtenerDetallesDeduccionComplePorAfiliado(row.id_afiliado).toPromise()
            .then(deduccionesComplementarios => deduccionesComplementarios)
            .catch(error => {
              console.error(`Error al obtener detalles de deduccion complementaria para el afiliado ${row.id_afiliado}:, error`);
              return [];
            })
        );
      } else {
        datosFilasDeduccion = [...this.datosTabl];
      }

      const resultados = await Promise.all(promesas);
      datosFilasDeduccion = resultados.flat();
      await this.actualizarDeducciones(datosFilasDeduccion);

    } catch (error) {
      console.error("Error al procesar todas las filas:", error);
    }

    return this.datosFilasDeduccion;
  }

  async ingresarBeneficiosPlanilla() {
    let datosFilasBeneficios = [];
    let promesas: any[] = [];

    try {

      if (this.detallePlanilla.nombre_planilla === 'EXTRAORDINARIA') {
        promesas = this.datosTabl.map(row =>
          this.beneficiosService.obtenerDetallesExtraordinariaPorAfil(row.id_afiliado).toPromise()
            .then(beneficiosInconsistentes => beneficiosInconsistentes)
            .catch(error => {
              console.error(`Error al obtener beneficios inconsistentes para el afiliado ${row.id_afiliado}:`, error);
              return [];
            })
        );
      } else if (this.detallePlanilla.nombre_planilla === 'ORDINARIA') {
        promesas = this.datosTabl.map(row =>
          this.beneficiosService.obtenerDetallesOrdinariaBeneficioPorAfil(row.id_afiliado, row.periodoInicio, row.periodoFinalizacion).toPromise()
            .then(beneficiosOrdinaria => beneficiosOrdinaria)
            .catch(error => {
              console.error(`Error al obtener detalles de deduccion para el afiliado ${row.id_afiliado}:`, error);
              return [];
            })
        );
      } else if (this.detallePlanilla.nombre_planilla === 'COMPLEMENTARIA') {
        promesas = this.datosTabl.map(row =>
          this.beneficiosService.obtenerDetallesBeneficioComplePorAfiliado(row.id_afiliado).toPromise()
            .then(beneficiosComplementarios => beneficiosComplementarios)
            .catch(error => {
              console.error(`Error al obtener detalles de deduccion complementaria para el afiliado ${row.id_afiliado}:`, error);
              return [];
            })
        );
      } else {
        this.datosFilasBeneficios = [...this.datosTabl];
      }

      const resultados = await Promise.all(promesas);
      datosFilasBeneficios = resultados.flat();
      await this.actualizarBeneficios(datosFilasBeneficios);

    } catch (error) {
      console.error("Error al procesar todas las filas:", error);
    }

    return datosFilasBeneficios;
  }

  async actualizarBeneficios(datosFilasBeneficios: any) {
    const detallesParaActualizar = datosFilasBeneficios.map((beneficio: any) => ({
      idBeneficioPlanilla: beneficio.id_beneficio_planilla,
      codigoPlanilla: this.detallePlanilla.codigo_planilla,
      estado: 'EN PRELIMINAR'
    }));

    if (detallesParaActualizar.length > 0) {
      try {
        const resultadosActualizacionBeneficios = await this.beneficiosService.actualizarBeneficiosPlanillas(detallesParaActualizar).toPromise();
        console.log('Resultados de la actualización:', resultadosActualizacionBeneficios);
      } catch (errorActualizacion) {
        console.error('Error al actualizar beneficios y planillas:', errorActualizacion);
      }
    }
  }

  async actualizarDeducciones(datosFilasDeduccion: any) {
    const detallesParaActualizar = datosFilasDeduccion.map((deduccion: any) => ({
      idDedDeduccion: deduccion.id_ded_deduccion,
      codigoPlanilla: this.detallePlanilla.codigo_planilla,
      estadoAplicacion: 'EN PRELIMINAR'
    }));


    if (detallesParaActualizar.length > 0) {
      try {
        const resultadosActualizacionDeducciones = await this.deduccionesService.ingresarDeduccionPlanilla(detallesParaActualizar).toPromise();
        console.log('Resultados de la actualización:', resultadosActualizacionDeducciones);
      } catch (errorActualizacion) {
        console.error('Error al actualizar beneficios y planillas:', errorActualizacion);
      }
    }
  }

  async procesarPlanilla() {

    let resultados: any[] = []

    resultados = await Promise.all([

      this.ingresarDeduccionesPlanilla().catch(error => {
        console.error('Error en ingresarDeduccionesPlanilla:', error);
        return { error: true, message: 'Falló ingresarDeduccionesPlanilla', detalle: error };
      }),

      this.ingresarBeneficiosPlanilla().catch(error => {
        console.error('Error en ingresarBeneficiosPlanilla:', error);
        return { error: true, message: 'Falló ingresarBeneficiosPlanilla', detalle: error };
      })

    ]);

    if (resultados[0].error) {
      console.error('Se encontró un error en deducciones:', resultados[0].detalle);
    } if (resultados[1]?.error) {
      console.error('Se encontró un error en beneficios:', resultados[1].detalle);
    }

    if (resultados[0]?.error || resultados[1]?.error) {
      this.toastr.error('Ocurrió un error al procesar la planilla.');
    } else {
      this.toastr.success('Planilla procesada con éxito.');
    }
  }

  cargarBeneficiosRecient() {
    this.beneficiosService.cargarBeneficiosRecient().subscribe({
      next: (response: any) => {
        if (response){
          let temp = response.Registros;
          this.mostDet = true
        }
      },
      error: (error) => {
        console.log(error);
      }
    });
  }

  convertirFormatoFecha(fecha: string): string {
    return fecha.replace(/-/g, '.');
  }
}
