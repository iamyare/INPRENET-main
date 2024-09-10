import { Component, ElementRef, ViewChild } from '@angular/core';
import { PlanillaService } from 'src/app/services/planilla.service'; // Ajusta la ruta según sea necesario
import { ToastrService } from 'ngx-toastr';
import * as XLSX from 'xlsx';

@Component({
  selector: 'app-actualizar-fallecidos',
  templateUrl: './actualizar-fallecidos.component.html',
  styleUrls: ['./actualizar-fallecidos.component.scss']
})
export class ActualizarFallecidosComponent {
  file: File | null = null;
  isUploading = false;
  progressValue = 0;
  datosCargados: any[] = [];

  @ViewChild('fileInput') fileInput!: ElementRef;

  constructor(
    private planillaService: PlanillaService,
    private toastr: ToastrService
  ) {}

  onFileSelected(event: any) {
    const target: DataTransfer = <DataTransfer>(event.target);
    if (target.files.length !== 1) {
      this.toastr.error('Solo se puede seleccionar un archivo a la vez.', 'Error');
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

      const data: any[] = XLSX.utils.sheet_to_json(ws, { raw: false, defval: null });

      this.planillaService.actualizarFallecidosDesdeExcel(this.file!).subscribe({
        next: () => {
          this.toastr.success('Archivo subido y datos actualizados correctamente.', 'Éxito');
          this.clearFile();
        },
        error: (error) => {
          this.toastr.error('Error al subir el archivo.', 'Error');
          console.error('Error: ', error);
          this.clearFile();
        }
      });
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
}
