import { Component, ElementRef, ViewChild } from '@angular/core';
import { ToastrService } from 'ngx-toastr';
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

  @ViewChild('fileInput') fileInput!: ElementRef;

  constructor(
    private deduccionesService: DeduccionesService,
    private toastr: ToastrService
  ) {}

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

      // Filtrar filas completamente vacías
      data = data.filter(row => Object.values(row).some(cell => cell != null && cell.toString().trim() !== ''));

      // Enviar los datos procesados y validados al backend
      this.deduccionesService.subirArchivoDeducciones(this.file!).subscribe({
        next: (response) => {
          if (typeof response === 'string') {
            response = JSON.parse(response);
          }

          // Filtrar los datos que no tuvieron errores (excluyendo los que están en failedRows)
          const failedDniList = response.failedRows?.map((row: any) => row[2]); // Recogemos los DNI de los errores

          this.datosCargados = data
            .filter((row: any) => !failedDniList?.includes(row.dni))  // Solo incluimos los que no están en failedRows
            .map((row: any) => ({
              año: row['año'],  // Columna año
              mes: row['mes'],  // Columna mes
              dni: row['dni'],  // Columna dni
              codigo_deduccion: row['codigo_deduccion'],  // Columna codigo_deduccion
              monto_total: row['monto_motal'],  // Corrigiendo el nombre a monto_total si es necesario
            }));

          console.log("Datos cargados exitosamente:", this.datosCargados);

          // Asegurarnos de que la tabla se muestre solo si hay datos cargados
          this.datosCargadosExitosamente = this.datosCargados.length > 0;

          this.toastr.success('Todos los datos se cargaron correctamente.', 'Carga exitosa');

          // Verifica si hay filas fallidas y genera el archivo Excel
          if (response && Array.isArray(response.failedRows) && response.failedRows.length > 0) {
            this.generateFailedRowsExcel(response.failedRows);
            this.toastr.warning('Algunas filas no se insertaron. Se ha descargado un archivo con los errores.', 'Advertencia');
          }

          // Limpiar el archivo después de la subida exitosa
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

          // Limpiar el archivo después de una subida fallida
          this.clearFile();
        }
      });
    };

    reader.onerror = () => {
      this.toastr.error('Ocurrió un error al leer el archivo. Asegúrate de que el formato del archivo sea correcto.', 'Error');
      this.resetState(); // Reiniciar estado en caso de error de lectura
      this.clearFile(); // Limpiar el archivo después de un error de lectura
    };

    reader.readAsBinaryString(this.file as Blob);
  }

  generateFailedRowsExcel(failedRows: any[]) {
    const headers = ['anio', 'mes', 'dni', 'codigoDeduccion', 'montoTotal', 'razón'];

    // Mapear filas a un formato de objetos con claves
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

    // Verificar si hay filas formateadas
    if (formattedRows && formattedRows.length > 0) {
      const worksheet = XLSX.utils.json_to_sheet(formattedRows, { header: headers });
      const workbook = XLSX.utils.book_new();
      XLSX.utils.book_append_sheet(workbook, worksheet, 'Deducciones Fallidas');

      // Generar y descargar el archivo Excel
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
}
