import { Component } from '@angular/core';
import { ToastrService } from 'ngx-toastr';
import { DomSanitizer, SafeResourceUrl } from '@angular/platform-browser';
import { ConasaService } from '../../../services/conasa.service';

@Component({
  selector: 'app-subir-factura',
  templateUrl: './subir-factura.component.html',
  styleUrls: ['./subir-factura.component.scss'],
})
export class SubirFacturaComponent {
  tipoFactura!: number;
  periodoFactura!: string;
  archivoPdf!: File;
  archivoInvalido: boolean = false;
  previewUrl: SafeResourceUrl | null = null; // URL segura para previsualización
  regexPeriodo = '^\\d{4}-\\d{2}$'; // Expresión regular para validar AAAA-MM

  constructor(
    private conasaService: ConasaService,
    private toastr: ToastrService,
    private sanitizer: DomSanitizer
  ) {}

  onFileSelected(event: Event): void {
    const input = event.target as HTMLInputElement;
    if (input?.files && input.files.length > 0) {
      const file = input.files[0];
      if (file.type !== 'application/pdf') {
        this.archivoInvalido = true;
        this.archivoPdf = undefined as unknown as File; // Limpiar el archivo cargado
        this.previewUrl = null; // Limpiar la previsualización
        return;
      }
      this.archivoPdf = file;
      this.archivoInvalido = false;

      // Crear una URL segura para previsualizar el archivo PDF
      const reader = new FileReader();
      reader.onload = () => {
        this.previewUrl = this.sanitizer.bypassSecurityTrustResourceUrl(reader.result as string);
      };
      reader.readAsDataURL(file);
    }
  }

  isPeriodoValido(): boolean {
    const regex = new RegExp(this.regexPeriodo);
    return regex.test(this.periodoFactura);
  }

  limpiarFormulario(): void {
    this.tipoFactura = undefined as unknown as number;
    this.periodoFactura = '';
    this.archivoPdf = undefined as unknown as File;
    this.archivoInvalido = false;
    this.previewUrl = null;
  }

  onSubmit(): void {
    if (!this.tipoFactura || !this.isPeriodoValido() || this.archivoInvalido || !this.archivoPdf) {
      this.toastr.warning('Por favor, verifica todos los campos antes de continuar.', 'Advertencia');
      return;
    }

    this.conasaService.subirFactura(this.tipoFactura, this.periodoFactura, this.archivoPdf).subscribe({
      next: (response) => {
        this.toastr.success('Factura subida exitosamente.', 'Éxito');
        console.log('Respuesta del servidor:', response);

        // Limpiar el formulario después de guardar
        this.limpiarFormulario();
      },
      error: (err) => {
        this.toastr.error('Error al subir la factura.', 'Error');
        console.error(err);
      },
    });
  }
}
