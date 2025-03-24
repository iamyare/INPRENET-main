import { Component, OnInit } from '@angular/core';
import { ToastrService } from 'ngx-toastr';
import { PlanillaService } from 'src/app/services/planilla.service';
import { TableColumn } from 'src/app/shared/Interfaces/table-column';
import { Estatus60Rentas} from './p_60_rentas.interface';

@Component({
  selector: 'app-p-60-rentas',
  templateUrl: './p-60-rentas.component.html',
  styleUrl: './p-60-rentas.component.scss'
})

export class P60RentasComponent implements OnInit {

  public myColumns: TableColumn[] = [];
  private executeFunction?: (data: Estatus60Rentas[]) => Promise<boolean>;
  estatus60Rentas: Estatus60Rentas[] = [];
  persona: any = null;

  constructor(private obtenerEstatus60Rentas: PlanillaService, private toastr: ToastrService) {}

  ngOnInit(): void {
    // Definir las columnas de la tabla
    this.myColumns = [
      { header: 'Índice', col: 'index' },  // Columna para el índice
      { header: 'Número de Identidad', col: 'dni'},
      { header: 'Primer Nombre', col: 'primer_nombre'},
      { header: 'Segundo Nombre', col: 'segundo_nombre'},
      { header: 'Primer Apellido', col: 'primer_apellido'},
      { header: 'Segundo Apellido', col: 'segundo_apellido'},
      { header: 'Estatus', col: 'estatus'},
      { header: 'lote', col: 'lote'},    
      { header: 'Teléfono', col: 'telefonico'}    
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
      this.executeFunction(this.estatus60Rentas).then(() => { });
    }
  }

  async getFilas(): Promise<void> {
    if (this.persona) {
      try {
        // Obtener los datos de estatus usando el servicio
        const data = await this.obtenerEstatus60Rentas.    obtenerEstatus(this.persona.N_IDENTIFICACION).toPromise();

        // Mapear los datos y agregar el índice, ANIO y MES
        const filas: Estatus60Rentas[] = data!.map((item: any, index: number) => {
          return {
            index: index + 1,  // Asignar índice a partir de 1
            dni: item.dni || 'DNI no disponible',
            primer_nombre: item.primer_nombre || 'Primer Nombre no disponible',
            segundo_nombre: item.segundo_nombre || 'Segundo Nombre no disponible',
            primer_apellido: item.primer_apellido || 'Primer Apellido no disponible',
            segundo_apellido: item.segundo_apellido || 'Segundo Apellido no disponible',
            estatus: item.estatus || 'Estatus no disponible',
            lote: item.lote || 'Lote no disponible',
            telefonico: item.telefonico || 'Teléfono no disponible',
          };
        });

        // Actualizar la lista de Estatus
        this.estatus60Rentas = filas;

    
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

  getData = async (): Promise<Estatus60Rentas[]> => {
    return this.estatus60Rentas;
  }

  ejecutarFuncionAsincronaDesdeOtroComponente(funcion: (data: Estatus60Rentas[]) => Promise<boolean>) {
    this.executeFunction = funcion;
  }
}

