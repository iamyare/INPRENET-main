import { Component } from '@angular/core';
import { ConasaService } from '../../../services/conasa.service';

@Component({
  selector: 'app-reporte-asistencias',
  templateUrl: './reporte-asistencias.component.html',
  styleUrls: ['./reporte-asistencias.component.scss']
})
export class ReporteAsistenciasComponent {
  menuTitle: string = 'Reporte De Asistencias';
  fechaInicio: string | null = null;
  fechaFin: string | null = null;
  botonDeshabilitado: boolean = true;

  constructor(private conasaService: ConasaService) {}

  onFechaInicioChange(event: any) {
    this.fechaInicio = this.formatearFecha(event.value);
  }

  onFechaFinChange(event: any) {
    this.fechaFin = this.formatearFecha(event.value);
  }

  private formatearFecha(fecha: Date): string {
    const dia = fecha.getDate().toString().padStart(2, '0');
    const mes = (fecha.getMonth() + 1).toString().padStart(2, '0');
    const ano = fecha.getFullYear();
    return `${dia}/${mes}/${ano}`;
  }

  validarFechas(): void {
    if (this.fechaInicio && this.fechaFin) {
      const fechaInicioDate = new Date(this.fechaInicio);
      const fechaFinDate = new Date(this.fechaFin);
      this.botonDeshabilitado = fechaInicioDate > fechaFinDate;
    } else {
      this.botonDeshabilitado = true;
    }
  }
  
  descargarAfiliadosPorPeriodo(): void {
    if (!this.fechaInicio || !this.fechaFin) {
      alert('Por favor, selecciona ambas fechas.');
      return;
    }
    const fechaInicioFormatted = new Date(this.fechaInicio).toLocaleDateString('es-ES', {
      day: '2-digit',
      month: '2-digit',
      year: 'numeric',
    });
    const fechaFinFormatted = new Date(this.fechaFin).toLocaleDateString('es-ES', {
      day: '2-digit',
      month: '2-digit',
      year: 'numeric',
    });
    this.conasaService.descargarAfiliadosPorPeriodoExcel(fechaInicioFormatted, fechaFinFormatted).subscribe({
      next: (response) => {
        const blob = new Blob([response], { type: 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet' });
        const url = window.URL.createObjectURL(blob);
        const link = document.createElement('a');
        link.href = url;
        link.download = `Afiliados_${fechaInicioFormatted}_a_${fechaFinFormatted}.xlsx`;
        link.click();
        window.URL.revokeObjectURL(url);
      },
      error: (err) => {
        console.error('Error al descargar el archivo:', err);
        alert('Hubo un error al intentar descargar el archivo.');
      },
    });
  }
  
  descargarBeneficiarios() {
    this.conasaService.descargarBeneficiariosExcel().subscribe({
      next: (response) => this.descargarArchivo(response, 'beneficiarios.xlsx'),
      error: (error) => console.error('Error al descargar el archivo de beneficiarios:', error)
    });
  }

  private descargarArchivo(data: Blob, nombreArchivo: string) {
    const url = window.URL.createObjectURL(data);
    const link = document.createElement('a');
    link.href = url;
    link.download = nombreArchivo;
    link.click();
    window.URL.revokeObjectURL(url);
  }
}
