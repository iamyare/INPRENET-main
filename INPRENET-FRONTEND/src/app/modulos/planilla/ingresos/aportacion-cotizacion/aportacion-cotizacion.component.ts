import { Component } from '@angular/core';

@Component({
  selector: 'app-aportacion-cotizacion',
  templateUrl: './aportacion-cotizacion.component.html',
  styleUrls: ['./aportacion-cotizacion.component.scss']
})
export class AportacionCotizacionComponent {
  // Estructura para guardar las aportaciones y cotizaciones por año
  dataByYear: { [year: number]: { aportaciones: any[], cotizaciones: any[] } } = {};
  currentYear: number = new Date().getFullYear();

  // Inicializar datos para el año actual
  constructor() {
    this.initializeYear(this.currentYear);
  }

  // Inicializar datos para un año específico si no existen
  initializeYear(year: number) {
    if (!this.dataByYear[year]) {
      this.dataByYear[year] = {
        aportaciones: [],
        cotizaciones: []
      };
    }
  }

  // Agregar aportación para un año específico
  addAportacion(year: number, tipo: string, porcentaje: string, descripcion: string) {
    this.initializeYear(year);
    const parsedPorcentaje = parseFloat(porcentaje);
    if (!isNaN(parsedPorcentaje)) {
      this.dataByYear[year].aportaciones.push({ tipo, porcentaje: parsedPorcentaje, descripcion });
    }
  }

  // Agregar cotización para un año específico
  addCotizacion(year: number, tipo: string, porcentaje: string, descripcion: string) {
    this.initializeYear(year);
    const parsedPorcentaje = parseFloat(porcentaje);
    if (!isNaN(parsedPorcentaje)) {
      this.dataByYear[year].cotizaciones.push({ tipo, porcentaje: parsedPorcentaje, descripcion });
    }
  }

  // Obtener los datos de aportaciones y cotizaciones para un año
  getYearData(year: number) {
    this.initializeYear(year); // Garantiza que los datos del año están inicializados
    return this.dataByYear[year] || { aportaciones: [], cotizaciones: [] };
  }


  // Cambiar el año en la vista
  setYear(year: number) {
    this.currentYear = year;
    this.initializeYear(year);
  }
}
