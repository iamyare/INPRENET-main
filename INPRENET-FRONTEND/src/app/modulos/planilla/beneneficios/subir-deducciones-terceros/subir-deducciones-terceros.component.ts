import { Component, ElementRef, ViewChild } from '@angular/core';
import { ToastrService } from 'ngx-toastr';
import { CentroTrabajoService } from 'src/app/services/centro-trabajo.service';
import { DeduccionesService } from 'src/app/services/deducciones.service';
import * as XLSX from 'xlsx';

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

  constructor(
    private deduccionesService: DeduccionesService,
    private toastr: ToastrService,
    private centrosTrabajoService: CentroTrabajoService
  ) {}

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
      this.deduccionesService.subirArchivoDeducciones(this.file!).subscribe({
        next: (response) => {
          if (typeof response === 'string') {
            response = JSON.parse(response);
          }
          const failedDniList = response.failedRows?.map((row: any) => row[2]);

          this.datosCargados = data
            .filter((row: any) => !failedDniList?.includes(row.dni))
            .map((row: any) => ({
              año: row['año'],
              mes: row['mes'],
              dni: row['dni'],
              codigo_deduccion: row['codigo_deduccion'],
              monto_total: row['monto_motal'],
            }));
          this.datosCargadosExitosamente = this.datosCargados.length > 0;

          this.toastr.success('Todos los datos se cargaron correctamente.', 'Carga exitosa');
          if (response && Array.isArray(response.failedRows) && response.failedRows.length > 0) {
            this.generateFailedRowsExcel(response.failedRows);
            this.toastr.warning('Algunas filas no se insertaron. Se ha descargado un archivo con los errores.', 'Advertencia');
          }
          this.clearFile();
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
        anio: row[0],
        mes: row[1],
        dni: row[2],
        codigoDeduccion: row[3],
        montoTotal: row[4],
        razón: row[5]
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
        this.centrosTrabajo = response;
        console.log(response);

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
    }

    this.deduccionesService.obtenerDetallesDeduccionPorCentro(this.centroSeleccionado.id_centro_trabajo, this.deduccionSeleccionada).subscribe({
      next: (detalles) => {
        this.detallesDeduccion = detalles;
      },
      error: (error) => {
        console.error('Error al obtener detalles de deducción:', error);
      }
    });
  }

  exportarAExcel() {
    if (!this.detallesDeduccion.length) {
      this.toastr.warning('No hay detalles de deducción para exportar.', 'Advertencia');
      return;
    }
    const ws: XLSX.WorkSheet = XLSX.utils.json_to_sheet(this.detallesDeduccion);
    const wb: XLSX.WorkBook = XLSX.utils.book_new();
    XLSX.utils.book_append_sheet(wb, ws, 'Detalles Deducción');
    XLSX.writeFile(wb, 'detalles_deduccion.xlsx');
  }

  eliminarDatos() {
    if (!this.centroSeleccionado || !this.deduccionSeleccionada) {
      this.toastr.error('Debe seleccionar un centro de trabajo y una deducción antes de eliminar.', 'Error');
      return;
    }

    this.deduccionesService.eliminarDetallesDeduccionPorCentro(this.centroSeleccionado.id_centro_trabajo, this.deduccionSeleccionada).subscribe({
      next: () => {
        this.toastr.success('Datos de deducción eliminados correctamente.');
        this.detallesDeduccion = [];
      },
      error: (error) => {
        this.toastr.error('Error al eliminar los datos de deducción.', 'Error');
      }
    });
  }
}
