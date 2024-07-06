import { Injectable } from '@angular/core';
export interface IChartProps {
  data?: any;
  labels?: any;
  options?: any;
  colors?: any;
  type?: any;
  legend?: any;
  [propName: string]: any;
}

@Injectable({
  providedIn: 'root'
})
export class DashboardChartsData {
  constructor() {
    this.initMainChart();
    this.initLineChart();
    this.initBarChart();
    this.initPieChart();
    this.initPolarAreaChart();
    this.initPieChartAfiliados();
  }

  public mainChart: IChartProps = {};
  public lineChart: IChartProps = {};
  public barChart: IChartProps = {};
  public pieChart: IChartProps = {};
  public polarAreaChart: IChartProps = {};
  public pieChartAfiliados: IChartProps = {};

  public random(min: number, max: number): number {
    return Math.floor(Math.random() * (max - min + 1) + min);
  }

  initMainChart(period: string = 'Mes'): void {
    const brandSuccess = '#4dbd74';
    const brandInfo = '#20a8d8';
    const brandInfoBg = 'rgba(32, 168, 216, 0.1)';
    const brandDanger = '#f86c6b';

    this.mainChart['elements'] = period === 'Mes' ? 12 : 27;
    this.mainChart['Data1'] = [];
    this.mainChart['Data2'] = [];
    this.mainChart['Data3'] = [];

    for (let i = 0; i <= this.mainChart['elements']; i++) {
      this.mainChart['Data1'].push(this.random(50, 240));
      this.mainChart['Data2'].push(this.random(20, 160));
      this.mainChart['Data3'].push(65, 110);
    }

    let labels: string[] = [];
    if (period === 'Mes') {
      labels = [
        'Enero', 'Febrero', 'Marzo', 'Abril', 'Mayo', 'Junio',
        'Julio', 'Agosto', 'Septiembre', 'Octubre', 'Noviembre', 'Diciembre'
      ];
    } else {
      const week = ['Lunes', 'Martes', 'Miércoles', 'Jueves', 'Viernes', 'Sábado', 'Domingo'];
      labels = week.concat(week, week, week);
    }

    const colors = [
      {
        backgroundColor: brandInfoBg,
        borderColor: brandInfo,
        pointHoverBackgroundColor: brandInfo,
        borderWidth: 2,
        fill: true
      },
      {
        backgroundColor: 'transparent',
        borderColor: brandSuccess,
        pointHoverBackgroundColor: '#fff'
      },
      {
        backgroundColor: 'transparent',
        borderColor: brandDanger,
        pointHoverBackgroundColor: brandDanger,
        borderWidth: 1,
        borderDash: [8, 5]
      }
    ];

    const datasets = [
      { data: this.mainChart['Data1'], label: 'Afiliados', ...colors[0] },
      { data: this.mainChart['Data2'], label: 'Jubilados', ...colors[1] },
      { data: this.mainChart['Data3'], label: 'Beneficiarios', ...colors[2] }
    ];

    const plugins = {
      legend: { display: false },
      tooltip: {
        callbacks: {
          labelColor: function(context: any) {
            return { backgroundColor: context.dataset.borderColor };
          }
        }
      }
    };

    const options = {
      maintainAspectRatio: false,
      plugins,
      scales: {
        x: { grid: { drawOnChartArea: false } },
        y: {
          beginAtZero: true,
          max: 250,
          ticks: { maxTicksLimit: 5, stepSize: Math.ceil(250 / 5) }
        }
      },
      elements: {
        line: { tension: 0.4 },
        point: { radius: 0, hitRadius: 10, hoverRadius: 4, hoverBorderWidth: 3 }
      }
    };

    this.mainChart['type'] = 'line';
    this.mainChart['options'] = options;
    this.mainChart['data'] = { datasets, labels };
  }

  private initLineChart(): void {
    this.lineChart = {
      type: 'line',
      data: {
        labels: ['January', 'February', 'March', 'April', 'May', 'June', 'July'],
        datasets: [
          {
            label: 'My First dataset',
            backgroundColor: 'rgba(220, 220, 220, 0.2)',
            borderColor: 'rgba(220, 220, 220, 1)',
            data: [65, 59, 80, 81, 56, 55, 40]
          },
          {
            label: 'My Second dataset',
            backgroundColor: 'rgba(151, 187, 205, 0.2)',
            borderColor: 'rgba(151, 187, 205, 1)',
            data: [28, 48, 40, 19, 86, 27, 90]
          }
        ]
      },
      options: {
        responsive: true,
        scales: {
          x: { grid: { drawOnChartArea: false } },
          y: { beginAtZero: true }
        }
      }
    };
  }

  private initPieChart(): void {
    this.pieChart = {
      type: 'pie',
      data: {
        labels: ['Docentes Activos', 'Jubilados y Pensionados'],
        datasets: [
          {
            data: [67701, 20994],
            backgroundColor: ['#59d3f6', '#f7e06e'], // Colores más modernos
            borderWidth: 2, // Ancho del borde de cada segmento
            borderColor: '#ffffff', // Color del borde (blanco)
            hoverBorderColor: '#000000', // Color del borde al pasar el mouse (negro)
            hoverBorderWidth: 2 // Ancho del borde al pasar el mouse
          }
        ]
      },
      options: {
        responsive: true,
        plugins: {
          tooltip: {
            padding: 10,
            cornerRadius: 5,
            backgroundColor: '#ffffff',
            titleFont: {
              size: 14
            },
            bodyFont: {
              size: 12
            }
          },
          legend: {
            position: 'bottom',
            labels: {
              padding: 20,
              boxWidth: 15
            }
          }
        }
      }
    };
  }

  private initPieChartAfiliados(): void {
    this.pieChartAfiliados = {
      type: 'pie',
      data: {
        labels: ['Femenino', 'Masculino'],
        datasets: [
          {
            data: [67701, 20994],
            backgroundColor: ['#f45c30', '#fbbeac'],
            borderWidth: 2,
            borderColor: '#ffffff',
            hoverBorderColor: '#000000',
            hoverBorderWidth: 2,
            // Añadir propiedad `color` para cambiar el color del texto
            color: '#ffffff'  // Color del texto en blanco
          }
        ]
      },
      options: {
        responsive: true,
        plugins: {
          tooltip: {
            padding: 10,
            cornerRadius: 5,
            backgroundColor: '#ffffff',
            titleFont: {
              size: 20
            },
            bodyFont: {
              size: 12,
              color: '#fff'
            }
          },
          legend: {
            position: 'bottom',
            labels: {
              padding: 20,
              boxWidth: 15,
              font: {
                color: '#ffffff' // Cambiar color de las letras a blanco
              }
            }
          }
        }
      }
    };
  }

  private initPolarAreaChart(): void {
    this.polarAreaChart = {
      type: 'polarArea',
      data: {
        labels: ['Red', 'Green', 'Yellow', 'Grey', 'Blue'],
        datasets: [
          {
            data: [11, 16, 7, 3, 14],
            backgroundColor: ['#FF6384', '#4BC0C0', '#FFCE56', '#E7E9ED', '#36A2EB']
          }
        ]
      },
      options: {
        responsive: true,
        scale: {
          ticks: { beginAtZero: true }
        }
      }
    };
  }

  private initBarChart(): void {
    this.barChart = {
      type: 'bar',
      data: {
        labels: ['Docentes Activos', 'Jubilados y Pensionados'],
        datasets: [
          {
            label: 'Cantidad de Personas',
            data: [67701, 20994],
            backgroundColor: ['#FF6384', '#FFCE56']
          }
        ]
      },
      options: {
        responsive: true,
        scales: {
          y: {
            beginAtZero: true
          }
        }
      }
    };
  }
}
