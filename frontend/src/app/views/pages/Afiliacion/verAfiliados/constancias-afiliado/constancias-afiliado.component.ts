import { HttpClient } from '@angular/common/http';
import { Component, Input, SimpleChanges } from '@angular/core';
import * as pdfMake from 'pdfmake/build/pdfmake';
import * as pdfFonts from 'pdfmake/build/vfs_fonts';
import { AfiliadoService } from 'src/app/services/afiliado.service';
import { unirNombres } from 'src/app/shared/functions/formatoNombresP';

@Component({
  selector: 'app-constancias-afiliado',
  templateUrl: './constancias-afiliado.component.html',
  styleUrls: ['./constancias-afiliado.component.scss']
})
export class ConstanciasAfiliadoComponent {
  @Input() persona: any;
  unirNombres: any = unirNombres;

  constructor(
    private http: HttpClient,
    private afiliadoService: AfiliadoService
  ) {
    (pdfMake as any).vfs = pdfFonts.pdfMake.vfs;
  }

  menuItems = [
    { name: 'Generar Constancia de Renuncia CAP', action: this.generarConstanciaRenunciaCap.bind(this) },
    { name: 'Generar Constancia de Afiliación', action: this.generarConstanciaAfiliacion.bind(this) },
    { name: 'Generar Constancia de No Cotizar', action: this.generarConstanciaNoCotizar.bind(this) },
    { name: 'Generar Constancia de Débitos', action: this.generarConstanciaDebitos.bind(this) },
    { name: 'Generar Constancia de Tiempo De Cotizar Con Monto', action: this.generarConstanciaTiempoCotizarConMonto.bind(this) }
  ];

  generarNombreArchivo(tipo: string): string {
    const nombreCompleto = `${this.persona.primer_nombre}_${this.persona.primer_apellido}`;
    const fechaActual = new Date().toISOString().split('T')[0]; // Formato YYYY-MM-DD
    return `${nombreCompleto}_${fechaActual}_constancia_${tipo}.pdf`;
  }

  generarConstanciaAfiliacion() {
    const data = {
      primer_nombre: this.persona.primer_nombre,
      segundo_nombre: this.persona.segundo_nombre,
      tercer_nombre: this.persona.tercer_nombre,
      primer_apellido: this.persona.primer_apellido,
      segundo_apellido: this.persona.segundo_apellido,
      n_identificacion: this.persona.n_identificacion,
    };

    this.afiliadoService.generarConstanciaAfiliacion(data).subscribe((response: any) => {
    });

    this.afiliadoService.generarConstanciaQR(data, 'afiliacion').subscribe((blob: Blob) => {
      const downloadURL = window.URL.createObjectURL(blob);
      const link = document.createElement('a');
      link.href = downloadURL;
      link.download = this.generarNombreArchivo('afiliacion');
      link.click();
      window.URL.revokeObjectURL(downloadURL); // Liberar el objeto URL
    });
  }

  generarConstanciaRenunciaCap() {
    const data = {
      primer_nombre: this.persona.primer_nombre,
      segundo_nombre: this.persona.segundo_nombre,
      tercer_nombre: this.persona.tercer_nombre,
      primer_apellido: this.persona.primer_apellido,
      segundo_apellido: this.persona.segundo_apellido,
      n_identificacion: this.persona.n_identificacion,
    };

    this.afiliadoService.generarConstanciaRenunciaCap(data).subscribe((response: any) => {
    });

    this.afiliadoService.generarConstanciaQR(data, 'renuncia-cap').subscribe((blob: Blob) => {
      const downloadURL = window.URL.createObjectURL(blob);
      const link = document.createElement('a');
      link.href = downloadURL;
      link.download = this.generarNombreArchivo('renuncia-cap');
      link.click();
      window.URL.revokeObjectURL(downloadURL); // Liberar el objeto URL
    });
  }

  generarConstanciaNoCotizar() {
    const data = {
      primer_nombre: this.persona.primer_nombre,
      segundo_nombre: this.persona.segundo_nombre,
      tercer_nombre: this.persona.tercer_nombre,
      primer_apellido: this.persona.primer_apellido,
      segundo_apellido: this.persona.segundo_apellido,
      n_identificacion: this.persona.n_identificacion,
    };

    this.afiliadoService.generarConstanciaNoCotizar(data).subscribe((response: any) => {
    });

    this.afiliadoService.generarConstanciaQR(data, 'no-cotizar').subscribe((blob: Blob) => {
      const downloadURL = window.URL.createObjectURL(blob);
      const link = document.createElement('a');
      link.href = downloadURL;
      link.download = this.generarNombreArchivo('no-cotizar');
      link.click();
      window.URL.revokeObjectURL(downloadURL); // Liberar el objeto URL
    });
  }

  generarConstanciaDebitos() {
    const data = {
      primer_nombre: this.persona.primer_nombre,
      segundo_nombre: this.persona.segundo_nombre,
      tercer_nombre: this.persona.tercer_nombre,
      primer_apellido: this.persona.primer_apellido,
      segundo_apellido: this.persona.segundo_apellido,
      n_identificacion: this.persona.n_identificacion,
    };

    this.afiliadoService.generarConstanciaDebitos(data).subscribe((response: any) => {
    });

    this.afiliadoService.generarConstanciaQR(data, 'debitos').subscribe((blob: Blob) => {
      const downloadURL = window.URL.createObjectURL(blob);
      const link = document.createElement('a');
      link.href = downloadURL;
      link.download = this.generarNombreArchivo('debitos');
      link.click();
      window.URL.revokeObjectURL(downloadURL); // Liberar el objeto URL
    });
  }

  generarConstanciaTiempoCotizarConMonto() {
    const data = {
      primer_nombre: this.persona.primer_nombre,
      segundo_nombre: this.persona.segundo_nombre,
      tercer_nombre: this.persona.tercer_nombre,
      primer_apellido: this.persona.primer_apellido,
      segundo_apellido: this.persona.segundo_apellido,
      n_identificacion: this.persona.n_identificacion,
    };

    this.afiliadoService.generarConstanciaTiempoCotizarConMonto(data).subscribe((response: any) => {
    });

    this.afiliadoService.generarConstanciaQR(data, 'tiempo-cotizar-con-monto').subscribe((blob: Blob) => {
      const downloadURL = window.URL.createObjectURL(blob);
      const link = document.createElement('a');
      link.href = downloadURL;
      link.download = this.generarNombreArchivo('tiempo-cotizar-con-monto');
      link.click();
      window.URL.revokeObjectURL(downloadURL); // Liberar el objeto URL
    });
  }
}
