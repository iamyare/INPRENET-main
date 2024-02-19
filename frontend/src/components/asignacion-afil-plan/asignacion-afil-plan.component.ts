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
export class AsignacionAfilPlanComponent implements OnInit{
  convertirFecha = convertirFecha;

  dataPlan : any;
  filas: any;
  tiposPlanilla: any[] = [];
  datosFormateados: any;

  myFormFields: FieldConfig[] = [];
  myColumnsDed: TableColumn[] = [];
  datosTabl:  any[] = [];

  verDat: boolean = false;
  ejecF: any;

  datosFilasDeduccion : any;
  datosFilasBeneficios : any;

  detallePlanilla:any
  constructor(
    private _formBuilder: FormBuilder,
    private planillaService : PlanillaService,
    private svcAfilServ: AfiliadoService,
    private toastr: ToastrService,
    public dialog: MatDialog,
    private deduccionesService : DeduccionesService,
    private beneficiosService : BeneficiosService
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
        isEditable: true
      },
      {
        header: 'Total De Deducciones Aplicadas',
        col: 'Total Deducciones',
        isEditable: true,
        validationRules: [Validators.required, Validators.pattern(/^(3[01]|[12][0-9]|0?[1-9])-(1[0-2]|0?[1-9])-\d{4} - (3[01]|[12][0-9]|0?[1-9])-(1[0-2]|0?[1-9])-\d{4}$/)]
      },
      {
        header: 'Neto',
        col: 'Total',
        isEditable: true
      },
    ];

    this.myFormFields = [
      {
        type: 'string', label: 'Código De Planilla', name: 'codigo_planilla', validations: [Validators.required]
      },
    ]
  }

  /* Se ejecuta cuando un valor del formulario cambia */
  obtenerDatosForm(event:any):any{
    this.datosFormateados = event;
  }

  /* Se ejecuta cuando da click en previsualizar datos planilla */
  getPlanilla = async () => {
    try {
      this.planillaService.getPlanillaBy(this.datosFormateados.value.codigo_planilla).subscribe(
        {
          next: async (response) => {
            if (response) {
              this.detallePlanilla = response;
              this.datosTabl = await this.getFilas(response.periodoInicio, response.periodoFinalizacion);
              this.verDat = true;

            } else {
              this.detallePlanilla = [];
              this.datosTabl = [];
              this.toastr.error(`La planilla con el código de planilla: ${this.datosFormateados.value.codigo_planilla}  no existe `);
            }
            this.ejecF(this.datosTabl).then(() => { });
          },
          error: (error) => {
            let mensajeError = 'Error desconocido al buscar la planilla';

            // Verifica si el error tiene una estructura específica
            if (error.error && error.error.message) {
              mensajeError = error.error.message;
            } else if (typeof error.error === 'string') {
              // Para errores que vienen como un string simple
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
    try {

      if (this.detallePlanilla.nombre_planilla == "COMPLEMENTARIA"){
        const data = await this.planillaService.getDatosComplementaria(periodoInicio, periodoFinalizacion).toPromise();
        this.dataPlan = data.map((item: any) => {
          return {
            id_afiliado: item.id_afiliado,
            dni: item.dni,
            NOMBRE_COMPLETO: item.NOMBRE_COMPLETO,
            periodoInicio : periodoInicio,
            periodoFinalizacion : periodoFinalizacion,
            "Total Beneficio": item["Total Beneficio"],
            "Total Deducciones": item["Total Deducciones"],
            "Total": item["Total Beneficio"] - item["Total Deducciones"],
            tipo_afiliado: item.tipo_afiliado,
            BENEFICIOSIDS: item.BENEFICIOSIDS,
            beneficiosNombres: item.beneficiosNombres,
          };
        });
      }else if (this.detallePlanilla.nombre_planilla == "ORDINARIA"){
        const data = await this.planillaService.getDatosOrdinaria(periodoInicio, periodoFinalizacion).toPromise();
        this.dataPlan = data.map((item: any) => {
          return {
            id_afiliado: item.id_afiliado,
            dni: item.dni,
            NOMBRE_COMPLETO: item.NOMBRE_COMPLETO,
            "Total Beneficio": item["Total Beneficio"],
            "Total Deducciones": item["Total Deducciones"],
            "Total": item["Total Beneficio"] - item["Total Deducciones"],
            periodoInicio : periodoInicio,
            periodoFinalizacion : periodoFinalizacion,
            tipo_afiliado: item.tipo_afiliado,
            BENEFICIOSIDS: item.BENEFICIOSIDS,
            beneficiosNombres: item.beneficiosNombres,
            DEDUCCIONESIDS: item.DEDUCCIONESIDS,
            deduccionesNombres: item.deduccionesNombres,
          };
        });
      }else if (this.detallePlanilla.nombre_planilla == "EXTRAORDINARIA"){
        const data = await this.planillaService.getDatosExtraordinaria(periodoInicio, periodoFinalizacion).toPromise();
        this.dataPlan = data.map((item: any) => {
          return {
            id_afiliado: item.id_afiliado,
            dni: item.dni,
            NOMBRE_COMPLETO: item.NOMBRE_COMPLETO,
            "Total Beneficio": item["Total Beneficio"],
            "Total Deducciones": item["Total Deducciones"],
            "Total": item["Total Beneficio"] - item["Total Deducciones"],
            periodoInicio : periodoInicio,
            periodoFinalizacion : periodoFinalizacion,
            tipo_afiliado: item.tipo_afiliado,
            BENEFICIOSIDS: item.BENEFICIOSIDS,
            beneficiosNombres: item.beneficiosNombres,
            DEDUCCIONESIDS: item.DEDUCCIONESIDS,
            deduccionesNombres: item.deduccionesNombres,
          };
        });

      }

      return this.dataPlan;
    } catch (error) {
      console.error("Error al obtener datos de deducciones", error);
      throw error;
    }
  }

  ejecutarFuncionAsincronaDesdeOtroComponente(funcion: (data:any) => Promise<void>) {
    this.ejecF = funcion;
  }

  editar = (row: any) => {}

  /* Maneja las deducciones */
  manejarAccionDos(row: any) {
    let logs: any[] = []; // Array para almacenar logs
    logs.push({ message: `DNI: ${row.dni}`, detail: row });
    logs.push({ message: `Nombre Completo: ${row.NOMBRE_COMPLETO}`, detail: row });

    const openDialog = () => this.dialog.open(DynamicDialogComponent, {
      width: '50%', // o el ancho que prefieras
      data: { logs: logs, type: 'deduccion' } // Asegúrate de pasar el 'type' adecuado
    });

    if (this.detallePlanilla.nombre_planilla === 'EXTRAORDINARIA') {
      this.deduccionesService.findInconsistentDeduccionesByAfiliado(row.id_afiliado).subscribe({

        next: (response) => {
          console.log(response);
          logs.push({ message: 'Datos De Deducciones Inconsistentes:', detail: response });
          openDialog();
        },
        error: (error) => {
          logs.push({ message: 'Error al obtener las deducciones inconsistentes:', detail: error });
          openDialog();
        }
      });

    } else if(this.detallePlanilla.nombre_planilla === 'ORDINARIA') {
      this.deduccionesService.getDetalleDeduccionesPorRango(row.id_afiliado, row.periodoInicio, row.periodoFinalizacion).subscribe({
        next: (response) => {
        console.log(response);

          logs.push({ message: 'Datos De Deducciones:', detail: response });
          openDialog();
        },
        error: (error) => {
          logs.push({ message: 'Error al obtener las deducciones:', detail: error });
          openDialog();
        }
      });

    } else if(this.detallePlanilla.nombre_planilla === 'COMPLEMENTARIA') {
      this.deduccionesService.obtenerDetallesDeduccionComplePorAfiliado(row.id_afiliado).subscribe({
        next: (response) => {
          console.log(response);
          logs.push({ message: 'Datos De Deducciones Complementarias:', detail: response });
          openDialog();
        },
        error: (error) => {
          logs.push({ message: 'Error al obtener las deducciones complementarias:', detail: error });
          openDialog();
        }
      });
    }
  }

  /* Maneja los beneficios */
  manejarAccionUno(row: any) {
    let logs: any[] = [];
    logs.push({ message: `DNI: ${row.dni}`, detail: row });
    logs.push({ message: `Nombre Completo: ${row.NOMBRE_COMPLETO}`, detail: row });

    // Función auxiliar para abrir el diálogo una vez que todos los datos están listos
    const openDialog = () => this.dialog.open(DynamicDialogComponent, {
      width: '50%',
      data: { logs: logs, type: 'beneficio' }
    });

    if (this.detallePlanilla.nombre_planilla === 'EXTRAORDINARIA') {
      this.beneficiosService.obtenerDetallesExtraordinariaPorAfil(row.id_afiliado).subscribe({
        next: (response) => {
          logs.push({ message: 'Datos De Beneficios Inconsistentes:', detail: response });
          openDialog();
        },
        error: (error) => {
          logs.push({ message: 'Error al obtener los beneficios inconsistentes:', detail: error });
          openDialog();
        }
      });

    } else if(this.detallePlanilla.nombre_planilla === 'ORDINARIA') {
      this.beneficiosService.obtenerDetallesOrdinariaBeneficioPorAfil(row.id_afiliado, row.periodoInicio, row.periodoFinalizacion).subscribe({
        next: (response) => {
          logs.push({ message: 'Datos De Beneficios: ', detail: response });
          openDialog();
        },
        error: (error) => {
          logs.push({ message: 'Error al obtener los beneficios:', detail: error });
          openDialog();
        }
      });

    } else if(this.detallePlanilla.nombre_planilla === 'COMPLEMENTARIA') {
      this.beneficiosService.obtenerDetallesBeneficioComplePorAfiliado(row.id_afiliado).subscribe({
        next: (response) => {
          logs.push({ message: 'Datos De Deducciones Complementarias:', detail: response });
          openDialog();
        },
        error: (error) => {
          logs.push({ message: 'Error al obtener las deducciones complementarias:', detail: error });
          openDialog();
        }
      });

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
      if (this.detallePlanilla.nombre_planilla === 'EXTRAORDINARIA') {
        promesas = this.datosTabl.map(row =>
          this.deduccionesService.findInconsistentDeduccionesByAfiliado(row.id_afiliado).toPromise()
            .then(deduccionesInconsistentes => deduccionesInconsistentes)
            .catch(error => {
              console.error(`Error al obtener deducciones inconsistentes para el afiliado ${row.id_afiliado}:`, error);
              return [];
            })
        );
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
      }else {
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

  async ingresarBeneficiosPlanilla(){
    let datosFilasBeneficios = [];
    let promesas:any[] = [];

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

  async actualizarBeneficios(datosFilasBeneficios:any) {
    const detallesParaActualizar = datosFilasBeneficios.map((beneficio:any) => ({
      idBeneficioPlanilla: beneficio.id_beneficio_planilla,
      codigoPlanilla: this.detallePlanilla.codigo_planilla,
      estado: 'PAGADA'
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

  async actualizarDeducciones(datosFilasDeduccion:any) {
    const detallesParaActualizar = datosFilasDeduccion.map((deduccion:any) => ({
      idDedDeduccion: deduccion.id_ded_deduccion,
      codigoPlanilla: this.detallePlanilla.codigo_planilla,
      estadoAplicacion: 'COBRADO'
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
    }if (resultados[1]?.error) {
      console.error('Se encontró un error en beneficios:', resultados[1].detalle);
    }

    if (resultados[0]?.error || resultados[1]?.error) {
      this.toastr.error('Ocurrió un error al procesar la planilla.');
    } else {
      this.toastr.success('Planilla procesada con éxito.');
    }
  }
}


/*
SELECT
    a."id_afiliado",
    a."primer_nombre" || ' ' || a."primer_apellido" AS "nombre_afiliado",
    LISTAGG(d."nombre_deduccion", ', ') WITHIN GROUP (ORDER BY d."nombre_deduccion") AS "deducciones",
    (SELECT LISTAGG(b."nombre_beneficio", ', ') WITHIN GROUP (ORDER BY b."nombre_beneficio")
     FROM "detalle_beneficio" db
     JOIN "beneficio" b ON db."id_beneficio" = b."id_beneficio"
     WHERE db."id_afiliado" = a."id_afiliado" AND db."id_planilla" = dd."id_planilla") AS "beneficios"
FROM
    "detalle_deduccion" dd
JOIN
    "deduccion" d ON dd."id_deduccion" = d."id_deduccion"
JOIN
    "afiliado" a ON dd."id_afiliado" = a."id_afiliado"
WHERE
    dd."id_planilla" = 'cb2b8882-490e-448e-a094-9da50e39f5fd'
GROUP BY
    a."id_afiliado",
    a."primer_nombre",
    a."primer_apellido";

--DESGLOSE DE BENEFICIOS
    SELECT
    a."id_afiliado",
    a."primer_nombre" || ' ' || a."primer_apellido" AS "nombre_afiliado",
    d_list."deducciones",
    b_list."beneficios"
FROM
    "afiliado" a
LEFT JOIN (
    SELECT
        dd."id_afiliado",
        LISTAGG(d."nombre_deduccion", ', ') WITHIN GROUP (ORDER BY d."nombre_deduccion") AS "deducciones"
    FROM
        "detalle_deduccion" dd
    JOIN
        "deduccion" d ON dd."id_deduccion" = d."id_deduccion"
    WHERE
        dd."id_planilla" = 'cb2b8882-490e-448e-a094-9da50e39f5fd'
    GROUP BY
        dd."id_afiliado"
) d_list ON a."id_afiliado" = d_list."id_afiliado"
LEFT JOIN (
    SELECT
        db."id_afiliado",
        LISTAGG(b."nombre_beneficio", ', ') WITHIN GROUP (ORDER BY b."nombre_beneficio") AS "beneficios"
    FROM
        "detalle_beneficio" db
    JOIN
        "beneficio" b ON db."id_beneficio" = b."id_beneficio"
    WHERE
        db."id_planilla" = 'cb2b8882-490e-448e-a094-9da50e39f5fd'
    GROUP BY
        db."id_afiliado"
) b_list ON a."id_afiliado" = b_list."id_afiliado"
WHERE
    d_list."deducciones" IS NOT NULL OR b_list."beneficios" IS NOT NULL;
*/
