import { HttpEventType } from '@angular/common/http';
import { Component, ElementRef, Input, ViewChild } from '@angular/core';
import { ToastrService } from 'ngx-toastr';
import { CentroTrabajoService } from 'src/app/services/centro-trabajo.service';
import { DeduccionesService } from 'src/app/services/deducciones.service';
import * as XLSX from 'xlsx';
import { AuthService } from '../../../../services/auth.service';

@Component({
  selector: 'app-subir-deducciones-terceros',
  templateUrl: './subir-deducciones-terceros.component.html',
  styleUrls: ['./subir-deducciones-terceros.component.scss']
})
export class SubirDeduccionesTercerosComponent {
  file: File | null = null;
  isUploading = false;
  progressValue = 0;
  datosCargados: any[] = [];
  datosCargadosExitosamente: boolean = false;
  centrosTrabajo: any[] = [];
  centroSeleccionado: any = null;
  codigoCentroSeleccionado: string | null = null;
  detallesDeduccion: any[] = [];
  deduccionesCentro: any[] = [];
  deduccionSeleccionada: number | null = null;

  @ViewChild('fileInput') fileInput!: ElementRef;
  @Input() tipoDeduccion: any;
  @Input() id_planilla: any;
  @Input() idTipoPlanilla: any;
  @Input() tipo_planilla: any;

  constructor(
    private deduccionesService: DeduccionesService,
    private AuthService: AuthService,
    private toastr: ToastrService,
    private centrosTrabajoService: CentroTrabajoService
  ) { }

  ngOnInit(): void {
    this.obtenerCentrosTrabajo();

  }

  onFileSelected(event: any) {
    const target: DataTransfer = <DataTransfer>(event.target);
    if (target.files.length !== 1) {
      console.error('Cannot use multiple files');
      return;
    }
    this.file = target.files[0];
  }

  clearFile() {
    this.file = null;
    this.progressValue = 0;
    if (this.fileInput && this.fileInput.nativeElement) {
      this.fileInput.nativeElement.value = '';
    }
  }

  startUpload() {
    if (!this.file) {
      this.toastr.error('No se seleccionó ningún archivo.', 'Error');
      return;
    }

    this.isUploading = true;
    this.progressValue = 0;

    const reader: FileReader = new FileReader();

    reader.onload = (e: any) => {
      const bstr: string = e.target.result;
      const wb: XLSX.WorkBook = XLSX.read(bstr, { type: 'binary' });
      const wsname: string = wb.SheetNames[0];
      const ws: XLSX.WorkSheet = wb.Sheets[wsname];
      let data: any[] = XLSX.utils.sheet_to_json(ws, { raw: false, defval: null });
      data = data.filter(row => Object.values(row).some(cell => cell != null && cell.toString().trim() !== ''));
      this.AuthService.onApiRequestStart();
      this.deduccionesService.subirArchivoDeducciones(this.idTipoPlanilla, this.id_planilla, this.file!).subscribe({
        next: (event) => {
          if (event.type === HttpEventType.UploadProgress && event.total) {
            const progress = Math.round(100 * (event.loaded / (event.total || 1)));
            this.progressValue = Math.min(progress, 99);  // Progreso hasta 99%
          } else if (event.type === HttpEventType.Response) {
            this.progressValue = 100;
            this.AuthService.onApiRequestEnd();
            // El archivo se ha subido completamente, procesamos la respuesta del servidor
            let response = event.body;
            if (typeof response === 'string') {
              response = JSON.parse(response);
            }

            const failedDniList = response.failedRows?.map((row: any) => row[2]);

            this.datosCargados = data
              .filter((row: any) => !failedDniList?.includes(row.dni))
              .map((row: any) => ({
                año: row['anio'],
                mes: row['mes'],
                dni: row['dni'],
                codigo_deduccion: row['codigoDeduccion'],
                monto_total: row['montoTotal'],
              }));
            this.datosCargadosExitosamente = this.datosCargados.length > 0;

            this.toastr.success('Todos los datos se cargaron correctamente.', 'Carga exitosa');
            if (response && Array.isArray(response.failedRows) && response.failedRows.length > 0) {
              this.generateFailedRowsExcel(response.failedRows);
              this.toastr.warning('Algunas filas no se insertaron. Se ha descargado un archivo con los errores.', 'Advertencia');
            }
            this.clearFile();
          }
        },
        error: (error) => {
          this.datosCargadosExitosamente = false;
          this.toastr.error('Error al cargar los datos.', 'Error de carga');

          if (error.error && error.error.details) {
            error.error.details.forEach((detail: any) => {
              this.toastr.error(`Detalle: ${detail.message}`, 'Error Detallado');
            });
          } else {
            this.toastr.error(error.message || 'Ocurrió un error desconocido.', 'Error');
          }
          this.clearFile();
        }
      });
    };

    reader.onerror = () => {
      this.toastr.error('Ocurrió un error al leer el archivo. Asegúrate de que el formato del archivo sea correcto.', 'Error');
      this.resetState();
      this.clearFile();
    };

    reader.readAsBinaryString(this.file as Blob);
  }

  generateFailedRowsExcel(failedRows: any[]) {
    const headers = ['anio', 'mes', 'dni', 'codigoDeduccion', 'montoTotal', 'razón'];
    const formattedRows = failedRows.map(row => {
      return {
        anio: row.anio,
        mes: row.mes,
        dni: row.dni,
        codigoDeduccion: row.codigoDeduccion,
        montoTotal: row.montoTotal,
        razón: row.error
      };
    });
    if (formattedRows && formattedRows.length > 0) {
      const worksheet = XLSX.utils.json_to_sheet(formattedRows, { header: headers });
      const workbook = XLSX.utils.book_new();
      XLSX.utils.book_append_sheet(workbook, worksheet, 'Deducciones Fallidas');
      XLSX.writeFile(workbook, 'deducciones_fallidas.xlsx');
    } else {
      console.error("No hay filas fallidas para generar el archivo.");
    }
  }

  cancelUpload() {
    this.isUploading = false;
    this.progressValue = 0;
    if (this.fileInput && this.fileInput.nativeElement) {
      this.fileInput.nativeElement.value = '';
    }
  }

  resetState() {
    this.isUploading = false;
    this.progressValue = 0;
    this.file = null;
    if (this.fileInput && this.fileInput.nativeElement) {
      this.fileInput.nativeElement.value = '';
    }
  }

  obtenerCentrosTrabajo() {
    this.centrosTrabajoService.obtenerCentrosTrabajoTipoE().subscribe({
      next: (response) => {
        if (this.tipoDeduccion == 'INPREMA') {
          this.centrosTrabajo = response.filter(item => item.id_centro_trabajo === 1);
        } else if (this.tipoDeduccion == 'TERCEROS') {
          this.centrosTrabajo = response.filter(item => item.id_centro_trabajo !== 1);
        }
      },
      error: (error) => {
        this.toastr.error('Error al obtener los centros de trabajo', 'Error');
      }
    });
  }

  onCentroSeleccionadoChange(event: any) {
    const idCentro = event.value;
    this.centroSeleccionado = this.centrosTrabajo.find(centro => centro.id_centro_trabajo === idCentro);
    this.deduccionesCentro = this.centroSeleccionado?.deduccion || [];
    this.detallesDeduccion = [];
  }

  onDeduccionSeleccionadaChange(event: any) {
    this.deduccionSeleccionada = event.value;
    if (!this.centroSeleccionado || !this.deduccionSeleccionada) {
      this.toastr.error('Debe seleccionar un centro de trabajo y una deducción.', 'Error');
      return;
    } else if (!this.id_planilla) {
      this.toastr.error('Debe seleccionar una planilla', 'Error');
      return;
    } else {
      this.deduccionesService.obtenerDetallesDeduccionPorCentro(this.id_planilla, this.centroSeleccionado.id_centro_trabajo, this.deduccionSeleccionada).subscribe({
        next: (detalles) => {
          if (detalles.length > 0) {
            this.detallesDeduccion = detalles;
          } else {
            this.toastr.warning('No hay registros para la planilla, centro de trabajo y tipo de decuccion seleccionada', 'Advertencia');
          }
        },
        error: (error) => {
          console.error('Error al obtener detalles de deducción:', error);
        }
      });
    }
  }

  exportarAExcel() {
    if (!this.detallesDeduccion.length) {
      this.toastr.warning('No hay detalles de deducción para exportar.', 'Advertencia');
      return;
    }
    const dataToExport = this.detallesDeduccion.map(detalle => ({
      año: detalle.ANIO,
      mes: detalle.MES,
      dni: detalle.N_IDENTIFICACION,
      codigo_deduccion: detalle.CODIGO_DEDUCCION,
      monto_motal: detalle.MONTO_TOTAL
    }));
    const ws: XLSX.WorkSheet = XLSX.utils.json_to_sheet(dataToExport);
    const wb: XLSX.WorkBook = XLSX.utils.book_new();
    XLSX.utils.book_append_sheet(wb, ws, 'Detalles Deducción');
    XLSX.writeFile(wb, 'detalles_deduccion.xlsx');
  }

  eliminarDatos() {
    if (!this.centroSeleccionado || !this.deduccionSeleccionada) {
      this.toastr.error('Debe seleccionar un centro de trabajo y una deducción antes de eliminar.', 'Error');
      return;
    }
    if (!this.id_planilla) {
      this.toastr.error('Debe proporcionar un ID de planilla válido.', 'Error');
      return;
    }
    this.deduccionesService.eliminarDetallesDeduccionPorCentro(
      this.centroSeleccionado.id_centro_trabajo,
      this.deduccionSeleccionada,
      this.id_planilla
    ).subscribe({
      next: () => {
        this.toastr.success('Datos de deducción eliminados correctamente.');
        this.detallesDeduccion = [];
      },
      error: (error) => {
        this.toastr.error('Error al eliminar los datos de deducción.', 'Error');
      }
    });
  }

  downloadExample() {
    let encabezados: string[] = []
    // Define los encabezados del archivo CSV
    if (this.tipoDeduccion == 'INPREMA') {
      encabezados = ["anio", "mes", "dni", "codigoDeduccion", "montoTotal", "N_PRESTAMO_INPREMA", "TIPO_PRESTAMO_INPREMA"];
    } else if (this.tipoDeduccion == 'TERCEROS') {
      encabezados = ["anio", "mes", "dni", "codigoDeduccion", "montoTotal"];
    }

    // Convierte los encabezados y los datos en formato CSV con punto y coma como separador
    const filas = [
      encabezados.join(";"),
    ].join("\n");

    // Crea un Blob con el contenido CSV
    const blob = new Blob([filas], { type: "text/csv;charset=utf-8;" });

    // Crea un enlace de descarga para el archivo CSV
    const enlace = document.createElement("a");
    const url = URL.createObjectURL(blob);
    enlace.href = url;
    enlace.download = "reporte_deducciones.csv";

    // Simula un clic en el enlace para iniciar la descarga
    enlace.style.display = "none";
    document.body.appendChild(enlace);
    enlace.click();

    // Limpia el DOM
    document.body.removeChild(enlace);
    URL.revokeObjectURL(url);
  }


}
