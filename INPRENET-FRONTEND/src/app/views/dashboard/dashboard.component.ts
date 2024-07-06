import { Component, OnInit } from '@angular/core';
import * as L from 'leaflet';
import { DashboardChartsData, IChartProps } from './dashboard-charts-data';

@Component({
  selector: 'app-dashboard',
  templateUrl: './dashboard.component.html',
  styleUrls: ['./dashboard.component.scss']
})
export class DashboardComponent implements OnInit {
  public mainChart: IChartProps = {};
  public lineChart: IChartProps = {};
  public barChart: IChartProps = {};
  public pieChart: IChartProps = {};
  public pieChartAfiliados: IChartProps = {};
  public polarAreaChart: IChartProps = {};
  private map: L.Map | undefined;

  constructor(private chartsData: DashboardChartsData) {}

  ngOnInit(): void {
    this.mainChart = this.chartsData.mainChart;
    this.initMap();
    this.lineChart = this.chartsData.lineChart;
    this.barChart = this.chartsData.barChart;
    this.pieChart = this.chartsData.pieChart;
    this.pieChartAfiliados = this.chartsData.pieChartAfiliados;
    this.polarAreaChart = this.chartsData.polarAreaChart;
  }

  private initMap(): void {
    // Configurar la ruta de las imágenes de los iconos
    L.Icon.Default.mergeOptions({
      iconRetinaUrl: 'assets/images/marker-icon-2x.png',
      iconUrl: 'assets/images/marker-icon.png',
      shadowUrl: 'assets/images/marker-shadow.png'
    });

    this.map = L.map('map').setView([14.5, -86.5], 7); // Coordenadas centradas en Honduras

    L.tileLayer('https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png', {
      attribution: '&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors'
    }).addTo(this.map);

    // Datos de ejemplo de afiliados por departamento
    const afiliadosData: { [key: string]: number } = {
      'Atlántida': 800,
      'Choluteca': 600,
      'Colón': 500,
      'Comayagua': 700,
      'Copán': 450,
      'Cortés': 1000,
      'El Paraíso': 650,
      'Francisco Morazán': 1500,
      'Gracias a Dios': 300,
      'Intibucá': 400,
      'Islas de la Bahía': 350,
      'La Paz': 370,
      'Lempira': 410,
      'Ocotepeque': 360,
      'Olancho': 500,
      'Santa Bárbara': 520,
      'Valle': 430,
      'Yoro': 490,
      // Agrega los demás departamentos si es necesario
    };

    // Coordenadas aproximadas de los departamentos
    const departamentosCoords: { [key: string]: [number, number] } = {
      'Atlántida': [15.7, -86.9],
      'Choluteca': [13.3, -87.2],
      'Colón': [15.6, -85.3],
      'Comayagua': [14.5, -87.6],
      'Copán': [14.9, -88.9],
      'Cortés': [15.5, -88.0],
      'El Paraíso': [13.9, -86.6],
      'Francisco Morazán': [14.1, -87.2],
      'Gracias a Dios': [15.0, -83.3],
      'Intibucá': [14.3, -88.2],
      'Islas de la Bahía': [16.3, -86.5],
      'La Paz': [14.2, -87.7],
      'Lempira': [14.8, -88.6],
      'Ocotepeque': [14.4, -89.2],
      'Olancho': [14.6, -85.9],
      'Santa Bárbara': [14.9, -88.2],
      'Valle': [13.5, -87.6],
      'Yoro': [15.1, -87.1],
      // Agrega las coordenadas de los demás departamentos si es necesario
    };

    // Añadir marcadores al mapa
    for (const departamento in afiliadosData) {
      if (afiliadosData.hasOwnProperty(departamento)) {
        const coords = departamentosCoords[departamento];
        const afiliados = afiliadosData[departamento];
        L.marker(coords).addTo(this.map)
          .bindPopup(`${departamento}: ${afiliados} afiliados`);
      }
    }
  }
}
