import { DatePipe } from '@angular/common';
import { Component, OnInit } from '@angular/core';
import { firstValueFrom } from 'rxjs';
import { DeduccionesService } from 'src/app/services/deducciones.service';
import { TableColumn } from 'src/app/views/shared/shared/Interfaces/table-column';

@Component({
  selector: 'app-ver-editar-deduccion-afil',
  templateUrl: './ver-editar-deduccion-afil.component.html',
  styleUrl: './ver-editar-deduccion-afil.component.scss'
})
export class VerEditarDeduccionAfilComponent implements OnInit{
  //Para generar tabla
  myColumns: TableColumn[] = [];
  filasT: any[] =[]
  detallesCompletos: any[] = [];

  constructor(private deduccionesService: DeduccionesService,
    private datePipe: DatePipe) {}

  ngOnInit(): void {
    this.deduccionesService.getDetallesCompletos().subscribe({
      next: (data) => {
        this.detallesCompletos = data;
      },
      error: (error) => {
        console.error('Error al obtener detalles completos:', error);
      }
    });
    this.myColumns = [
      {
        header: 'Fecha de carga',
        col : 'fecha_subida',
        isEditable: false
      },
      {
        header: 'DNI',
        col : 'dni',
        isEditable: false
      },
      {
        header: 'Institucion',
        col : 'nombre_institucion',
        isEditable: false
      },
      {
        header: 'Nombre Deduccion',
        col : 'nombre_deduccion',
        isEditable: false
      },
      {
        header: 'Año',
        col : 'anio',
        isEditable: false
      },
      {
        header: 'Mes',
        col : 'mes',
        isEditable: false
      },
      {
        header: 'Monto total',
        col : 'monto_total',
        isEditable: true
      },
    ]
  }

  //Funciones para llenar tabla
  getFilas = async () => {
    try {
      const data = await firstValueFrom(this.deduccionesService.getDetallesCompletos());

      // Mapeamos y ordenamos los datos
      this.filasT = data.map((item: any) => ({
        fecha_subida: this.datePipe.transform(item.fecha_subida, 'dd/MM/yyyy HH:mm'), // Asegúrate de que este campo esté en formato de fecha
        dni: item.dni,
        nombre_institucion: item.nombre_institucion,
        nombre_deduccion: item.nombre_deduccion,
        anio: item.anio,
        mes: item.mes,
        monto_total: item.monto_total,
        // Agrega aquí más campos si son necesarios
      })).sort((a: any, b: any) => {
        // Convertimos las fechas a objetos Date para compararlas
        const dateA = new Date(a.fecha_subida);
        const dateB = new Date(b.fecha_subida);

        // Orden descendente: el más reciente primero
        return dateB.getTime() - dateA.getTime();
      });

      return this.filasT;
    } catch (error) {
      console.error("Error al obtener los detalles completos de deducción", error);
      throw error; // Manejo del error
    }
  };



  editar = (row: any) => [

  ]

}
