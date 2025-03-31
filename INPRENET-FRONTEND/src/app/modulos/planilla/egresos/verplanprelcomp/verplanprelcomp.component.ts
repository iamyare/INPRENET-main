import { ChangeDetectorRef, Component, OnChanges, OnInit, SimpleChanges, TemplateRef, ViewChild } from '@angular/core';
import { Validators } from '@angular/forms';
import { MatDialog } from '@angular/material/dialog';
import { ToastrService } from 'ngx-toastr';
import { PlanillaService } from 'src/app/services/planilla.service';
import { FieldConfig } from 'src/app/shared/Interfaces/field-config';
import { TableColumn } from 'src/app/shared/Interfaces/table-column';
import { convertirFecha } from 'src/app/shared/functions/formatoFecha';
import { DialogDesgloseComponent } from '../dialog-desglose/dialog-desglose.component';
import { DeduccionesService } from 'src/app/services/deducciones.service';
import { DynamicDialogComponent } from 'src/app/components/dinamicos/dynamic-dialog/dynamic-dialog.component';
import { saveAs } from 'file-saver';
import { firstValueFrom } from 'rxjs';
import { DialogSuboptionsComponent } from 'src/app/modulos/afiliacion/constancias/dialog-suboptions/dialog-suboptions.component';
import { format, subMonths } from 'date-fns';

interface BenEnPreliminar {
  ID_PERSONA: number;
  ID_DETALLE_PERSONA?: number;
  ID_CAUSANTE?: number;
  ID_BENEFICIO?: number;
}

@Component({
  selector: 'app-verplanprelcomp',
  templateUrl: './verplanprelcomp.component.html',
  styleUrls: ['./verplanprelcomp.component.scss']
})
export class VerplanprelcompComponent implements OnInit, OnChanges {
  @ViewChild('confirmacionModal') confirmacionModal!: TemplateRef<any>;
  @ViewChild('confirmacionEliminarPlanillaModal') confirmacionEliminarPlanillaModal!: TemplateRef<any>;
  convertirFecha = convertirFecha;
  idPlanilla: any = "";
  dataPlan: any;
  codigoPlanilla = "";
  datosFormateados: any;
  myFormFields: FieldConfig[] = [];
  isLoading: boolean = false;

  datosTabl: any[] = [];
  myColumnsDed: TableColumn[] = [];

  verDat: boolean = false;
  ejecF: any;

  detallePlanilla: any = {};

  data: any[] = [];
  planillaSelected: any;

  mostrarBajasAltas: boolean = false;
  hayTotalNegativo: boolean = false;
  hayCodigoACHNull: boolean = false;

  constructor(
    private planillaService: PlanillaService,
    private toastr: ToastrService,
    public dialog: MatDialog,
    private deduccionSVC: DeduccionesService,
    private cdr: ChangeDetectorRef
  ) {
  }

  ngOnInit(): void {
    this.myColumnsDed = [
      { header: 'DNI', col: 'n_identificacion', isEditable: false, validationRules: [Validators.required, Validators.minLength(5)] },
      { header: 'Nombre Completo', col: 'nombre_completo', isEditable: true },
      { header: 'Banco', col: 'nombre_banco', isEditable: true },
      { header: 'Número de cuenta', col: 'num_cuenta', isEditable: true },
      { header: 'Total de Ingresos', col: 'total_beneficios', moneda: true, isEditable: true },
      { header: 'Total De Deducciones Aplicadas De INPREMA', col: 'total_deducciones_inprema', isEditable: true, moneda: true },
      { header: 'Total De Deducciones Aplicadas De Terceros', col: 'total_deducciones_terceros', isEditable: true, moneda: true },
      { header: 'Neto', col: 'total', moneda: true, isEditable: true }
    ];
  }

  ngOnChanges(changes: SimpleChanges): void {
    if (changes['codigoPlanilla'] && this.codigoPlanilla) {
      this.getPlanilla();
    }
  }

  obtenerDatosForm(event: any): any {
    this.datosFormateados = event;
  }

  async getPlanilla() {
    if (!this.codigoPlanilla) {
      this.toastr.error('Debe proporcionar un código de planilla válido');
      return;
    }
    try {
      const response = await this.planillaService.getPlanillaPrelimiar(this.codigoPlanilla).toPromise();
      console.log(response);

      if (response) {
        this.detallePlanilla = { ...response };
        await this.calcularTotales(this.codigoPlanilla);
        await this.getFilas(response.codigo_planilla);
        this.cargar();

        /* this.idPlanilla = response.id_planilla; */
        this.verDat = true;
      } else {
        this.toastr.error(`La planilla con el código de planilla: ${this.codigoPlanilla} no existe`);
        this.datosTabl = [];
      }
    } catch (error) {
      console.error("Error al obtener la planilla:", error);
      this.toastr.error('Error desconocido al buscar la planilla');
    }
  }

  async calcularTotales(cod_planilla: string) {
    if (!cod_planilla) {
      this.toastr.error('Debe proporcionar un código de planilla válido');
      return;
    }

    try {
      const response = await this.planillaService.getPlanillasPreliminares(cod_planilla).toPromise();

      let totalBeneficios = 0;
      let deduccionesI = 0;
      let deduccionesT = 0;

      this.datosTabl = response.orderedResult.map((item: any) => {
        totalBeneficios += item.TOTAL_BENEFICIOS || 0;
        deduccionesI += item.TOTAL_DEDUCCIONES_INPREMA || 0;
        deduccionesT += item.TOTAL_DEDUCCIONES_TERCEROS || 0;

        return {
          id_afiliado: item.ID_PERSONA,
          dni: item.DNI,
          NOMBRE_COMPLETO: item.NOMBRE_COMPLETO,
          COD_BANCO: item.COD_BANCO,
          //ID_BANCO: item.ID_BANCO,
          TOTAL_BENEFICIOS: item.TOTAL_BENEFICIOS,
          TOTAL_DEDUCCIONES_INPREMA: item.TOTAL_DEDUCCIONES_INPREMA || 0,
          TOTAL_DEDUCCIONES_TERCEROS: item.TOTAL_DEDUCCIONES_TERCEROS || 0,
          fecha_cierre: item.fecha_cierre,
          tipo_afiliado: item.tipo_afiliado,
          total: item.TOTAL_NETO,
        };
      });

      const totalDeducciones = deduccionesI + deduccionesT;
      this.detallePlanilla.totalBeneficios = totalBeneficios;
      this.detallePlanilla.deduccionesI = deduccionesI;
      this.detallePlanilla.deduccionesT = deduccionesT;
      this.detallePlanilla.totalNeto = totalBeneficios - totalDeducciones;
      this.verDat = true;
    } catch (error) {
      console.error("Error al calcular totales", error);
      this.toastr.error('Error al calcular totales');
    }
  }

  async getFilas(cod_planilla: string) {
    if (!cod_planilla) {
      this.toastr.error('Debe proporcionar un código de planilla válido');
      return;
    }
    try {
      const result = await this.planillaService.getPlanillasPreliminares(cod_planilla).toPromise();
      this.dataPlan = result;

      if (this.dataPlan.orderedResult && this.dataPlan.orderedResult.length > 0) {
        this.datosTabl = this.dataPlan.orderedResult.map((item: any) => ({
          id_afiliado: item.ID_PERSONA,
          n_identificacion: item.N_IDENTIFICACION,
          TIPO_PERSONA: item.TIPO_PERSONA,
          nombre_completo: item.NOMBRE_COMPLETO,
          total_beneficios: item.TOTAL_BENEFICIOS,
          total_deducciones_inprema: item.TOTAL_DEDUCCIONES_INPREMA || 0,
          total_deducciones_terceros: item.TOTAL_DEDUCCIONES_TERCEROS || 0,
          total: item.TOTAL_NETO,
          correo_1: item.correo_1,
          fecha_cierre: item.fecha_cierre,
          COD_BANCO: item.COD_BANCO,
          CODIGO_ACH: item.CODIGO_ACH,
          //ID_BANCO: item.ID_BANCO,
          num_cuenta: item.NUM_CUENTA,
          nombre_banco: item.NOMBRE_BANCO,
        }));

        this.hayTotalNegativo = this.datosTabl.some(
          (item) =>
            (item.total ?? 0) <= 0
        );

        if (this.hayTotalNegativo) {
          console.log("Hay al menos un total negativo");
        } else {
          console.log("Todos los totales son positivos");
        }

        if (this.hayCodigoACHNull) {
          console.log("Hay al menos un registro que tiene banco con codigo ACH Vacio");
        } else {
          console.log("Todos los registros tienen Codigo de banco ACH");
        }

      } else {
        this.datosTabl = [];
        this.toastr.warning('No se encontraron datos para la planilla proporcionada.');
      }

      this.cdr.detectChanges();
    } catch (error) {
      console.error("Error al obtener datos de deducciones", error);
      this.toastr.error('Error al obtener datos de la planilla.');
      this.datosTabl = [];
    }
  }

  ejecutarFuncionAsincronaDesdeOtroComponente(funcion: (data: any) => Promise<boolean>) {
    this.ejecF = funcion;
  }

  cargar() {
    if (this.ejecF) {
      this.ejecF(this.datosTabl).then(() => {
      });
    }
  }

  manejarAccionUno(row: any) {
    let logs: any[] = [];
    this.planillaService.getDesglosePorPersonaPlanilla(row.id_afiliado, this.codigoPlanilla).subscribe({
      next: (response) => {
        const { beneficios } = response;
        const data = beneficios;
        logs.push({ message: 'Datos De Beneficios:', detail: data || [], type: 'beneficios' });
        const dialogRef = this.dialog.open(DynamicDialogComponent, {
          width: '50%',
          data: { cod_planilla: this.codigoPlanilla, logs: logs, type: 'beneficios', mostrarAccion: true, }
        });
        dialogRef.componentInstance.deduccionEliminada.subscribe(() => {
          this.getFilas(this.codigoPlanilla).then(() => this.cargar());
        });
      },
      error: (error) => {
        console.error('Error al obtener desglose por persona', error);
        this.toastr.error('Error al obtener desglose por persona');
      }
    });
  }

  manejarAccionDos(row: any) {
    let logs: any[] = [];
    logs.push({ message: `DNI:${row.n_identificacion}`, detail: row });
    logs.push({ message: `Nombre Completo:${row.nombre_completo}`, detail: row });

    this.deduccionSVC.getDeduccionesByPersonaAndBenef(row.id_afiliado, row.ID_BENEFICIO, this.planillaSelected.id_planilla).subscribe({
      next: (response1) => {
        if (response1) {
          const data = response1;
          logs.push({ message: 'Datos De Deducciones:', detail: data || [], type: 'deducciones' });

          const dialogRef = this.dialog.open(DynamicDialogComponent, {
            width: '50%',
            data: { logs: logs, type: 'deduccion', mostrarAccion: true, }
          });
          dialogRef.componentInstance.deduccionEliminada.subscribe(() => {

            this.getFilas(this.codigoPlanilla).then(() => this.cargar());
          });
        }
      },
    });
  }

  openLogDialog(logs: any[]) {
    this.dialog.open(DialogDesgloseComponent, {
      width: '1000px',
      data: { logs }
    });
  }

  actualizarFechaCierrePlanilla(): void {
    const dialogRef = this.dialog.open(this.confirmacionModal);

    dialogRef.afterClosed().subscribe(result => {
      if (result === 'confirmar') {
        console.log('Cierre de planilla confirmado');

        const ben = this.dataPlan.resultBenEnPrel
        console.log(ben);

        // Aquí puedes implementar la lógica para cerrar la planilla.
        this.updatePlanillaACerrada(this.codigoPlanilla, ben);
      } else {
        console.log('Cierre de planilla cancelado');
      }
    });
  }


  updatePlanillaACerrada(codigo_planilla: string, benefPrelim: BenEnPreliminar[]): void {
    this.planillaService.updatePlanillaACerrada(codigo_planilla, benefPrelim).subscribe({
      next: () => {
        this.toastr.success('Estado de la planilla actualizado con éxito');
        this.detallePlanilla.estado = 'CERRADA';
        this.limpiarFormulario();
      },
      error: (error) => {
        console.error('Error al actualizar el estado de la planilla', error);
        this.toastr.error('Error al actualizar el estado de la planilla');
      }
    });
  }

  limpiarFormulario(): void {
    if (this.datosFormateados) {
      this.datosFormateados.reset();
      this.detallePlanilla = false;
    }
  }

  getElemSeleccionados(event: any) {
    this.planillaSelected = event
    this.codigoPlanilla = this.planillaSelected?.codigo_planilla;


    if (this.codigoPlanilla) {
      this.getPlanilla();
    } else {
      this.toastr.error('Debe seleccionar un código de planilla válido');
    }
  }

  async descargarExcelCompleto(): Promise<void> {
    if (!this.planillaSelected) {
      this.toastr.warning('Debe seleccionar una planilla válida antes de descargar el reporte.');
      return;
    }

    /* this.isLoading = true; */

    try {
      // Siempre envía el estado 1 al método del servicio
      const response: any = await firstValueFrom(
        this.planillaService.exportarDetallesCompletosExcel(this.planillaSelected.id_planilla, 1)
      );

      const blob = new Blob([response], {
        type: 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet',
      });

      const nombreArchivo = `PlanillaCompleta_${this.planillaSelected.id_planilla}.xlsx`;
      saveAs(blob, nombreArchivo);

      this.toastr.success('Archivo Excel completo generado y descargado con éxito');
    } catch (error) {
      console.error('Error al descargar el Excel completo:', error);
      this.toastr.error('Ocurrió un error al descargar el archivo Excel');
    } finally {
      this.isLoading = false;
    }
  }

  async descargarExcelPorPlanilla() {
    if (!this.planillaSelected) {
      this.toastr.warning('Debe seleccionar una planilla válida antes de descargar el reporte.');
      return;
    }
    /* this.isLoading = true; */
    try {
      const response: any = await this.planillaService.descargarReporteDetallePagoPreliminar(this.planillaSelected.id_planilla).toPromise();
      const blob = new Blob([response], { type: 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet' });
      saveAs(blob, `Detalle_Pago_Planilla_${this.planillaSelected.id_planilla}.xlsx`);
      this.toastr.success('Archivo Excel descargado con éxito');
    } catch (error) {
      console.error('Error al descargar el Excel:', error);
      this.toastr.error('Error al descargar el archivo Excel');
    }
    finally {
      this.isLoading = false;
    }
  }

  async descargarReporteCompleto() {
    if (!this.planillaSelected) {
      this.toastr.warning('Debe seleccionar una planilla válida antes de descargar el reporte.');
      return;
    }
    /* this.isLoading = true; */
    try {
      const response: any = await this.planillaService.descargarReporteCompleto(this.planillaSelected.id_planilla, this.planillaSelected.idTipoPlanilla).toPromise();
      const blob = new Blob([response], { type: 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet' });
      saveAs(blob, `Reporte_Completo_Planilla_${this.planillaSelected.id_planilla}.xlsx`);
      this.toastr.success('Archivo Excel descargado con éxito');
    } catch (error) {
      console.error('Error al descargar el Excel:', error);
      this.toastr.error('Error al descargar el archivo Excel');
    }
    finally {
      this.isLoading = false;
    }
  }

  async descargarReporteBeneficioAfiliado() {
    if (!this.planillaSelected) {
      this.toastr.warning('Debe seleccionar una planilla válida antes de descargar el reporte.');
      return;
    }
    /* this.isLoading = true; */
    try {
      if (this.planillaSelected.idTipoPlanilla == 3 || this.planillaSelected.idTipoPlanilla == 4) {
        const response: any = await this.planillaService.descargarReporteBeneficioAfiliado(this.planillaSelected.id_planilla, this.planillaSelected.idTipoPlanilla).toPromise();
        const blob = new Blob([response], { type: 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet' });
        saveAs(blob, `REGISTROS_COMPLEMENTARIA_BENEFICIARIOS.xlsx`);
        this.toastr.success('Archivo Excel descargado con éxito');
      } else {
        this.toastr.warning("solo puede obtener este reporte para planillas complementarias")
      }
    } catch (error) {
      console.error('Error al descargar el Excel:', error);
      this.toastr.error('Error al descargar el archivo Excel');
    }
    finally {
      this.isLoading = false;
    }
  }

  confirmarEliminarPlanilla(): void {
    const dialogRef = this.dialog.open(this.confirmacionEliminarPlanillaModal);

    dialogRef.afterClosed().subscribe(result => {
      if (result === 'confirmar') {
        console.log('Cierre de planilla confirmado');
        // Aquí puedes implementar la lógica para cerrar la planilla.
        this.eliminarPlanillaPrelByIdPlanilla(this.codigoPlanilla);
      } else {
        console.log('Cierre de planilla cancelado');
      }
    });
  }

  async eliminarPlanillaPrelByIdPlanilla(codigoPlanilla: string) {
    if (!this.planillaSelected) {
      this.toastr.warning('Debe seleccionar una planilla para poderla eliminar.');
      return;
    }
    this.isLoading = true;
    let data = { codigoPlanilla: codigoPlanilla, id_planilla: this.planillaSelected.id_planilla }
    try {
      const response: any = await this.planillaService.eliminarPlanillaPrelByIdPlanilla(data.id_planilla).toPromise();
      this.toastr.success(`Planilla con codigo ${codigoPlanilla} Eliminada con éxito`);
    } catch (error) {
      console.error(`Error al Eliminar la planilla ${codigoPlanilla}`, error);
    } finally {
      this.isLoading = false;
    }
  }


  openDynamicDialogBajas() {
    const dialogRef = this.dialog.open(DialogSuboptionsComponent, {
      width: '400px',
      data: {
        options: ['Generar Reporte de bajas'],
        params: [
          { key: 'fecha_anterior', label: 'Seleccione la fecha anterior', type: 'date' },
          { key: 'fecha_reporte', label: 'Seleccione la fecha reporte', type: 'date' }
        ]
      }
    });

    dialogRef.afterClosed().subscribe((result: any) => {

      if (result) {
        this.bajas();
      }
    });
  }

  openDynamicDialogAltas() {
    const dialogRef = this.dialog.open(DialogSuboptionsComponent, {
      width: '400px',
      data: {
        options: ['Generar Reporte de Altas'],
        params: [
          { key: 'fecha_anterior', label: 'Seleccione la fecha anterior', type: 'date' },
          { key: 'fecha_reporte', label: 'Seleccione la fecha reporte', type: 'date' }
        ]
      }
    });

    dialogRef.afterClosed().subscribe((result: any) => {

      if (result) {
        this.altas();
      }
    });
  }


  bajas() {

    const fechaActual = new Date();

    // Obtener el mes y año de inicio del mes anterior
    const fechaAnterior = subMonths(fechaActual, 1);
    const mes_inicio_ant = format(fechaAnterior, "MM");
    const anio_inicio_ant = format(fechaAnterior, "yyyy");

    // Obtener el mes y año de finalización del mes actual
    const mes_finalizacion_act = format(fechaActual, "MM");
    const anio_finalizacion_act = format(fechaActual, "yyyy");

    this.planillaService.obtenerBajasPorPeriodoExcel(mes_inicio_ant, anio_inicio_ant, mes_finalizacion_act, anio_finalizacion_act).subscribe({
      next: (response) => {
        const blob = new Blob([response], { type: 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet' });
        const url = window.URL.createObjectURL(blob);
        const link = document.createElement('a');
        link.href = url;
        link.download = `Bajas.xlsx`;
        link.click();
        window.URL.revokeObjectURL(url);
      },
      error: (err) => {
        console.error('Error al descargar el archivo:', err);
        alert('Hubo un error al intentar descargar el archivo.');
      },
    });
  }

  altas() {
    const fechaActual = new Date();

    // Obtener el mes y año de inicio del mes anterior
    const fechaAnterior = subMonths(fechaActual, 1);
    const mes_finalizacion_act = format(fechaAnterior, "MM");
    const anio_finalizacion_act = format(fechaAnterior, "yyyy");

    // Obtener el mes y año de finalización del mes actual
    const mes_inicio_ant = format(fechaActual, "MM");
    const anio_inicio_ant = format(fechaActual, "yyyy");

    this.planillaService.obtenerAltaPorPeriodoExcel(mes_inicio_ant, anio_inicio_ant, mes_finalizacion_act, anio_finalizacion_act).subscribe({
      next: (response) => {
        const blob = new Blob([response], { type: 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet' });
        const url = window.URL.createObjectURL(blob);
        const link = document.createElement('a');
        link.href = url;
        link.download = `Altas.xlsx`;
        link.click();
        window.URL.revokeObjectURL(url);
      },
      error: (err) => {
        console.error('Error al descargar el archivo:', err);
        alert('Hubo un error al intentar descargar el archivo.');
      },
    });
  }

  getPlanillasActivas(event: any) {
    console.log(event);
    this.mostrarBajasAltas = true
  }

}
