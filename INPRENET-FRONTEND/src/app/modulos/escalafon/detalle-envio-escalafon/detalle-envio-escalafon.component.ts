import { Component, OnInit } from '@angular/core';
import { TableColumn } from 'src/app/shared/Interfaces/table-column';
import { EscalafonService } from 'src/app/services/escalafon.service';
import { ToastrService } from 'ngx-toastr'; // Importar si estás usando Toastr para notificaciones

export interface Prestamo {
  index: number;  // Nuevo campo para el índice
  dni: string;
  numero_prestamo: number;
  cuota: number;
  anio: number;
  mes: number;
}

@Component({
  selector: 'app-detalle-envio-escalafon',
  templateUrl: './detalle-envio-escalafon.component.html',
  styleUrls: ['./detalle-envio-escalafon.component.scss']
})
export class DetalleEnvioEscalafonComponent implements OnInit {

  public myColumns: TableColumn[] = [];
  private executeFunction?: (data: Prestamo[]) => Promise<boolean>;
  prestamos: Prestamo[] = [];
  persona: any = null;
  totalCuotas: number = 0;  // Para sumar las cuotas

  constructor(private obtenerDeduccionEscalafon: EscalafonService, private toastr: ToastrService) {}

  ngOnInit(): void {
    // Definir las columnas de la tabla
    this.myColumns = [
      { header: 'Índice', col: 'index' },  // Columna para el índice
      { header: 'Número de Identidad', col: 'dni' },
      { header: 'Número de Préstamo', col: 'numero_prestamo' },
      { header: 'Cuota (L)', col: 'cuota', moneda: true },
      { header: 'Año', col: 'anio' },  // Nueva columna para el año
      { header: 'Mes', col: 'mes' }    // Nueva columna para el mes
    ];
  }

  handlePersonaEncontrada(persona: any): void {
    this.persona = persona;
    if (persona) {
      this.getFilas().then(() => this.cargar());
    }
  }

  cargar(): void {
    if (this.executeFunction) {
      this.executeFunction(this.prestamos).then(() => { });
    }
  }

  async getFilas(): Promise<void> {
    if (this.persona) {
      try {
        // Obtener los datos de préstamos usando el servicio
        const data = await this.obtenerDeduccionEscalafon.obtenerPrestamos(this.persona.N_IDENTIFICACION).toPromise();

        // Mapear los datos y agregar el índice, ANIO y MES
        const filas: Prestamo[] = data!.map((item: any, index: number) => {
          return {
            index: index + 1,  // Asignar índice a partir de 1
            dni: item.dni || 'DNI no disponible',
            numero_prestamo: item.numero_prestamo || 'Número de préstamo no disponible',
            cuota: item.cuota || 0,
            anio: item.anio || 'Año no disponible',   // Asignar año si está disponible
            mes: item.mes || 'Mes no disponible'      // Asignar mes si está disponible
          };
        });

        // Actualizar la lista de préstamos
        this.prestamos = filas;

        // Calcular la suma total de cuotas
        this.totalCuotas = this.prestamos.reduce((acc, prestamo) => acc + prestamo.cuota, 0);

        if (this.executeFunction) {
          this.executeFunction(filas);
        }
      } catch (error) {
        this.toastr.error('Error al cargar los datos de los beneficiarios');
        console.error('Error al obtener datos de los beneficiarios', error);
      }
    } else {
      console.log('No se ha seleccionado ninguna persona');
    }
  }

  getData = async (): Promise<Prestamo[]> => {
    return this.prestamos;
  }

  ejecutarFuncionAsincronaDesdeOtroComponente(funcion: (data: Prestamo[]) => Promise<boolean>) {
    this.executeFunction = funcion;
  }
}
