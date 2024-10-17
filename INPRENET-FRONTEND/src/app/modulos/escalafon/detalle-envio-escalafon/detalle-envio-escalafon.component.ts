import { Component } from '@angular/core';
import { TableColumn } from 'src/app/shared/Interfaces/table-column';

export interface Prestamo {
  numeroPrestamo: number;
  fechaPago: Date;
  valor: number;
}

@Component({
  selector: 'app-detalle-envio-escalafon',
  templateUrl: './detalle-envio-escalafon.component.html',
  styleUrls: ['./detalle-envio-escalafon.component.scss']
})
export class DetalleEnvioEscalafonComponent {
  prestamos: Prestamo[] = [
    { numeroPrestamo: 12345, fechaPago: new Date('2024-01-15'), valor: 1000.00 },
    { numeroPrestamo: 23456, fechaPago: new Date('2024-02-15'), valor: 1500.00 },
    { numeroPrestamo: 34567, fechaPago: new Date('2024-03-15'), valor: 2000.00 },
    { numeroPrestamo: 45678, fechaPago: new Date('2024-04-15'), valor: 2500.00 },
    { numeroPrestamo: 56789, fechaPago: new Date('2024-05-15'), valor: 3000.00 }
  ];

  columns: TableColumn[] = [
    { header: 'Número de Préstamo', col: 'numeroPrestamo' },
    { header: 'Fecha de Pago', col: 'fechaPago', customRender: (row: any) => new Date(row.fechaPago).toLocaleDateString('es-ES') },
    { header: 'Valor (L)', col: 'valor', moneda: true }
  ];

  persona: any = null;

  handlePersonaEncontrada(persona: any): void {
    this.persona = persona;
    if (persona) {
      console.log('Persona recibida en DetalleEnvioEscalafonComponent:', persona);
    } else {
      console.log('Búsqueda reseteada o persona no encontrada');
    }
  }

  getData = async (): Promise<Prestamo[]> => {
    return this.prestamos;
  }

  ejecutarFuncionAsincronaDesdeOtroComponente(funcion: (data: any) => Promise<boolean>) {
    funcion(this.prestamos).then(() => {
      console.log("Función asincrónica ejecutada con éxito");
    }).catch((error) => {
      console.error("Error al ejecutar la función asincrónica:", error);
    });
  }
}
