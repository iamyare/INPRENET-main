import { ChangeDetectorRef, Component, OnChanges, OnInit, SimpleChanges } from '@angular/core';
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
import * as XLSX from 'xlsx';
import { saveAs } from 'file-saver';

@Component({
  selector: 'app-verplanprelcomp',
  templateUrl: './verplanprelcomp.component.html',
  styleUrls: ['./verplanprelcomp.component.scss']
})
export class VerplanprelcompComponent implements OnInit, OnChanges {
  convertirFecha = convertirFecha;
  idPlanilla: any = "";
  dataPlan: any;
  codigoPlanilla = "";
  datosFormateados: any;
  myFormFields: FieldConfig[] = [];

  datosTabl: any[] = [];
  myColumnsDed: TableColumn[] = [];

  verDat: boolean = false;
  ejecF: any;

  detallePlanilla: any = {};

  data: any[] = [];
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

      if (response) {
        this.detallePlanilla = { ...response };
        await this.calcularTotales(this.codigoPlanilla);
        await this.getFilas(response.codigo_planilla);
        this.cargar();

        this.idPlanilla = response.id_planilla;
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

      this.datosTabl = response.map((item: any) => {
        totalBeneficios += item.TOTAL_BENEFICIOS || 0;
        deduccionesI += item.TOTAL_DEDUCCIONES_INPREMA || 0;
        deduccionesT += item.TOTAL_DEDUCCIONES_TERCEROS || 0;

        return {
          id_afiliado: item.ID_PERSONA,
          dni: item.DNI,
          NOMBRE_COMPLETO: item.NOMBRE_COMPLETO,
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
      this.dataPlan = await this.planillaService.getPlanillasPreliminares(cod_planilla).toPromise();

      if (this.dataPlan && this.dataPlan.length > 0) {
        this.datosTabl = this.dataPlan.map((item: any) => ({
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
          num_cuenta: item.NUM_CUENTA,
          nombre_banco: item.NOMBRE_BANCO,
        }));
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
        console.log(response);

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

    this.deduccionSVC.getDeduccionesByPersonaAndBenef(row.id_afiliado, row.ID_BENEFICIO, this.idPlanilla).subscribe({
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
    this.updatePlanillaACerrada(this.codigoPlanilla);
  }

  updatePlanillaACerrada(codigo_planilla: string): void {
    this.planillaService.updatePlanillaACerrada(codigo_planilla).subscribe({
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
    this.codigoPlanilla = event.codigo_planilla;
    if (this.codigoPlanilla) {
      this.getPlanilla();
    } else {
      this.toastr.error('Debe seleccionar un código de planilla válido');
    }
  }

  async descargarExcelCompleto(): Promise<void> {
    if (!this.datosTabl || this.datosTabl.length === 0) {
        this.toastr.warning('No hay datos disponibles para exportar');
        return;
    }

    try {
        const beneficios = [];
        const deduccionesTerceros: any = [];
        const deduccionesInprema: any = [];

        // Iterar sobre cada afiliado y obtener los datos
        for (const row of this.datosTabl) {
            // Obtener beneficios
            const responseBeneficios = await this.planillaService.getDesglosePorPersonaPlanilla(row.id_afiliado, this.codigoPlanilla).toPromise();
            if (responseBeneficios && responseBeneficios.beneficios && responseBeneficios.beneficios.length > 0) {
                beneficios.push(
                    ...responseBeneficios.beneficios.map((beneficio: any) => ({
                        n_identificacion: row.n_identificacion, // Identificación de la persona
                        CODIGO_BENEFICIO: beneficio.ID_BENEFICIO, // Renombrar ID_BENEFICIO
                        MontoAPagar: beneficio.MontoAPagar ? parseFloat(beneficio.MontoAPagar) : 0,
                        NOMBRE_BENEFICIO: beneficio.NOMBRE_BENEFICIO,
                        NOMBRE_BANCO: row.nombre_banco, // Banco de la persona
                        NUM_CUENTA: row.num_cuenta, // Número de cuenta de la persona
                    }))
                );
            }

            // Obtener deducciones
            const responseDeducciones = await this.deduccionSVC.getDeduccionesByPersonaAndBenef(row.id_afiliado, row.ID_BENEFICIO, this.idPlanilla).toPromise();
            if (responseDeducciones && responseDeducciones.length > 0) {
                responseDeducciones.forEach((deduccion: any) => {
                    const deduccionData = {
                        n_identificacion: row.n_identificacion, // Identificación de la persona
                        MontoAplicado: deduccion.MontoAplicado ? parseFloat(deduccion.MontoAplicado) : 0,
                        NOMBRE_DEDUCCION: deduccion.NOMBRE_DEDUCCION,
                        NOMBRE_INSTITUCION: deduccion.NOMBRE_INSTITUCION,
                    };

                    if (deduccion.NOMBRE_INSTITUCION === 'INPREMA') {
                        deduccionesInprema.push(deduccionData);
                    } else {
                        deduccionesTerceros.push(deduccionData);
                    }
                });
            }
        }

        // Verificar si hay datos para exportar
        if (beneficios.length === 0 && deduccionesTerceros.length === 0 && deduccionesInprema.length === 0) {
            this.toastr.warning('No se encontraron datos para exportar');
            return;
        }

        // Crear las hojas del Excel
        const beneficiosSheet = XLSX.utils.json_to_sheet(beneficios);
        const deduccionesTercerosSheet = XLSX.utils.json_to_sheet(deduccionesTerceros);
        const deduccionesInpremaSheet = XLSX.utils.json_to_sheet(deduccionesInprema);

        // Aplica formato numérico a las columnas de montos
        const applyNumberFormat = (sheet: XLSX.WorkSheet, columns: string[]) => {
            const range = XLSX.utils.decode_range(sheet['!ref'] || '');
            columns.forEach((column) => {
                for (let row = range.s.r + 1; row <= range.e.r; row++) {
                    const cellAddress = XLSX.utils.encode_cell({ r: row, c: XLSX.utils.decode_col(column) });
                    const cell = sheet[cellAddress];
                    if (cell && typeof cell.v === 'number') {
                        cell.t = 'n'; // Tipo numérico
                        cell.z = '#,##0.00'; // Formato numérico
                    }
                }
            });
        };

        applyNumberFormat(beneficiosSheet, ['C']); // Columna C es "MontoAPagar" en beneficios
        applyNumberFormat(deduccionesTercerosSheet, ['B']); // Columna B es "MontoAplicado" en deducciones terceros
        applyNumberFormat(deduccionesInpremaSheet, ['B']); // Columna B es "MontoAplicado" en deducciones INPREMA

        const workbook: XLSX.WorkBook = {
            Sheets: {
                'Beneficios': beneficiosSheet,
                'Deducciones Terceros': deduccionesTercerosSheet,
                'Deducciones INPREMA': deduccionesInpremaSheet,
            },
            SheetNames: ['Beneficios', 'Deducciones Terceros', 'Deducciones INPREMA'],
        };

        // Generar el archivo Excel
        const excelBuffer: any = XLSX.write(workbook, {
            bookType: 'xlsx',
            type: 'array',
        });

        const data: Blob = new Blob([excelBuffer], { type: 'application/octet-stream' });
        saveAs(data, `PlanillaCompleta_${this.codigoPlanilla}.xlsx`);
        this.toastr.success('Archivo Excel completo generado con éxito');
    } catch (error) {
        console.error('Error al generar el archivo Excel completo:', error);
        this.toastr.error('Ocurrió un error al generar el archivo Excel');
    }
}




}
