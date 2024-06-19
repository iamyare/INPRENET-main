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
      const link = document.createElement('a');
      link.href = window.URL.createObjectURL(blob);
      link.download = 'constancia_afiliacion_qr.pdf';
      link.click();
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
      const link = document.createElement('a');
      link.href = window.URL.createObjectURL(blob);
      link.download = 'constancia_renuncia_cap_qr.pdf';
      link.click();
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
      const link = document.createElement('a');
      link.href = window.URL.createObjectURL(blob);
      link.download = 'constancia_no_cotizar_qr.pdf';
      link.click();
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
      const link = document.createElement('a');
      link.href = window.URL.createObjectURL(blob);
      link.download = 'constancia_debitos_qr.pdf';
      link.click();
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
      const link = document.createElement('a');
      link.href = window.URL.createObjectURL(blob);
      link.download = 'constancia_tiempo_cotizar_con_monto_qr.pdf';
      link.click();
    });
  }
}
