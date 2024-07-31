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

      // Validar que no haya columnas vacías
      let errorDetails: { row: number; columns: string[] }[] = [];
      data.forEach((row, rowIndex) => {
        const emptyColumns = Object.keys(row).filter(key => {
          const value = row[key];
          return value == null || value.toString().trim() === '';
        });

        if (emptyColumns.length > 0) {
          errorDetails.push({ row: rowIndex + 1, columns: emptyColumns });
        }
      });

      if (errorDetails.length > 0) {
        const errorMessage = errorDetails.map(error => `Error en la fila ${error.row}: las columnas ${error.columns.join(', ')} están vacías.`).join(' ');
        this.toastr.error(errorMessage, 'Error en la carga');
        this.resetState();
        return;
      }

      // Enviar datos procesados y validados al backend
      this.deduccionesService.subirArchivoDeducciones(this.file!).subscribe({
        next: (response) => {
          console.log('Datos insertados exitosamente:', response);
          this.datosCargados = data; // Guardar los datos cargados exitosamente
          this.datosCargadosExitosamente = true;
          this.toastr.success('Todos los datos se cargaron correctamente.', 'Carga exitosa');
          this.resetState(); // Reiniciar estado después de la carga exitosa
        },
        error: (error) => {
          this.datosCargadosExitosamente = false;
          this.toastr.error('Error al cargar los datos.', 'Error de carga');
          this.resetState(); // Reiniciar estado en caso de error

          if (error.error && error.error.details) {
            error.error.details.forEach((detail: any) => {
              this.toastr.error(`Detalle: ${detail.message}`, 'Error Detallado');
            });
          } else {
            this.toastr.error(error.message || 'Ocurrió un error desconocido.', 'Error');
          }
        }
      });
    };

    reader.onerror = () => {
      this.toastr.error('Ocurrió un error al leer el archivo. Asegúrate de que el formato del archivo sea correcto.', 'Error');
      this.resetState(); // Reiniciar estado en caso de error de lectura
    };

    reader.readAsBinaryString(this.file as Blob);
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
    this.datosCargados = [];
    if (this.fileInput && this.fileInput.nativeElement) {
      this.fileInput.nativeElement.value = '';
    }
  }
}
