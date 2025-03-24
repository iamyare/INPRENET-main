import { Component, OnInit, ViewChild } from '@angular/core';
import { MatPaginator } from '@angular/material/paginator';
import { MatTableDataSource } from '@angular/material/table';

@Component({
  selector: 'app-aportacion-cotizacion',
  templateUrl: './aportacion-cotizacion.component.html',
  styleUrls: ['./aportacion-cotizacion.component.scss']
})
export class AportacionCotizacionComponent implements OnInit {
  @ViewChild(MatPaginator) paginator!: MatPaginator;
  displayedColumns: string[] = ['year', 'sector', 'sueldoMin', 'sueldoMax', 'cotizacionMin', 'cotizacionMax', 'aportacionMin', 'aportacionMax', 'porcentajeCotizacion', 'porcentajeAportacion'];
  dataSource = new MatTableDataSource<any>([]);
  dataByYear: { 
    [year: number]: { 
      parametros: { tipo: string, porcentaje: number, sector: string }[],
      tablaDatos: { sueldoMin: number, sueldoMax: number, cotizacionMin: number, cotizacionMax: number, aportacionMin: number, aportacionMax: number, porcentaje: string, sector: string }[]
    } 
  } = {};

  constructor() {
    this.initializeYears(); // Inicializa datos de prueba
  }

  ngOnInit() {
    this.loadData();
  }

  loadData() {
    this.dataSource.data = [
      { year: 2024, sector: 'Público', sueldoMin: "22,500.00", sueldoMax: "68,000.00", cotizacionMin: "1,800.00", cotizacionMax: "9,700.00", aportacionMin: "1,200.00", aportacionMax: "4,800.00", porcentajeCotizacion: '3.50%', porcentajeAportacion: '4.00%' },
      { year: 2024, sector: 'Privado', sueldoMin: "22,800.00", sueldoMax: "79,500.00", cotizacionMin: "2,500.00", cotizacionMax: "9,400.00", aportacionMin: "1,300.00", aportacionMax: "4,900.00", porcentajeCotizacion: '4.00%', porcentajeAportacion: '4.50%' },
      { year: 2023, sector: 'Público', sueldoMin: "24,000.00", sueldoMax: "67,500.00", cotizacionMin: "1,950.00", cotizacionMax: "9,300.00", aportacionMin: "1,250.00", aportacionMax: "4,600.00", porcentajeCotizacion: '4.50%', porcentajeAportacion: '5.00%' },
      { year: 2023, sector: 'Privado', sueldoMin: "21,000.00", sueldoMax: "77,000.00", cotizacionMin: "2,300.00", cotizacionMax: "9,600.00", aportacionMin: "1,400.00", aportacionMax: "4,700.00", porcentajeCotizacion: '5.00%', porcentajeAportacion: '5.50%' },
      { year: 2022, sector: 'Público', sueldoMin: "23,500.00", sueldoMax: "67,000.00", cotizacionMin: "1,900.00", cotizacionMax: "9,100.00", aportacionMin: "1,150.00", aportacionMax: "4,500.00", porcentajeCotizacion: '4.00%', porcentajeAportacion: '4.50%' },
      { year: 2022, sector: 'Privado', sueldoMin: "22,000.00", sueldoMax: "76,000.00", cotizacionMin: "2,250.00", cotizacionMax: "9,400.00", aportacionMin: "1,350.00", aportacionMax: "4,600.00", porcentajeCotizacion: '4.75%', porcentajeAportacion: '5.25%' }
    ];
  }

  initializeYears() {
    const years = [2020, 2021, 2022, 2023, 2024];

    for (let year of years) {
      this.initializeYear(year);
    }
  }

  initializeYear(year: number) {
    if (!this.dataByYear[year]) {
      this.dataByYear[year] = {
        parametros: [],
        tablaDatos: [
          {
            sector: "Público",
            sueldoMin: this.getRandomValue(18000, 25000),
            sueldoMax: this.getRandomValue(65000, 80000),
            cotizacionMin: this.getRandomValue(1500, 3000),
            cotizacionMax: this.getRandomValue(7000, 12000),
            aportacionMin: this.getRandomValue(500, 1500),
            aportacionMax: this.getRandomValue(3000, 5000),
            porcentaje: `${this.getRandomValue(3, 10).toFixed(2)}%`
          },
          {
            sector: "Privado",
            sueldoMin: this.getRandomValue(18000, 25000),
            sueldoMax: this.getRandomValue(65000, 80000),
            cotizacionMin: this.getRandomValue(1500, 3000),
            cotizacionMax: this.getRandomValue(7000, 12000),
            aportacionMin: this.getRandomValue(500, 1500),
            aportacionMax: this.getRandomValue(3000, 5000),
            porcentaje: `${this.getRandomValue(3, 10).toFixed(2)}%`
          }
        ]
      };
    }
  }

  addParametro(year: number, tipo: string, porcentaje: string, sector: string) {
    this.initializeYear(year);
    const parsedPorcentaje = parseFloat(porcentaje);
    if (!isNaN(parsedPorcentaje)) {
      this.dataByYear[year].parametros.push({ tipo, porcentaje: parsedPorcentaje, sector });
    }
  }

  getAllYears() {
    return Object.keys(this.dataByYear)
      .map(Number) // Convierte las claves a números
      .sort((a, b) => b - a);
  }

  getRandomValue(min: number, max: number): number {
    return Math.floor(Math.random() * (max - min + 1)) + min;
  }
}
