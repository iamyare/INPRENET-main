import { DatePipe } from '@angular/common';
import { Component, OnInit } from '@angular/core';
import { ToastrService } from 'ngx-toastr';
import { firstValueFrom } from 'rxjs';
import { DeduccionesService } from 'src/app/services/deducciones.service';
import { TableColumn } from 'src/app/shared/Interfaces/table-column';
import { unirNombres } from '../../../../shared/functions/formatoNombresP';

@Component({
  selector: 'app-ver-editar-deduccion-afil',
  templateUrl: './ver-editar-deduccion-afil.component.html',
  styleUrl: './ver-editar-deduccion-afil.component.scss'
})
export class VerEditarDeduccionAfilComponent implements OnInit{
  unirNombres: any = unirNombres;
  //Para generar tabla
  myColumns: TableColumn[] = [];
  filasT: any[] =[]
  detallesCompletos: any[] = [];
  ejecF: any;

  constructor(private deduccionesService: DeduccionesService,
    private datePipe: DatePipe,
    private toastr: ToastrService) {}

  ngOnInit(): void {
    /* this.deduccionesService.getDetallesCompletos().subscribe({
      next: (data) => {


        this.detallesCompletos = data;
      },
      error: (error) => {
        console.error('Error al obtener detalles completos:', error);
      }
    }); */
    this.myColumns = [
      {
        header: 'Fecha aplicado',
        col : 'fecha_aplicado',
        isEditable: false
      },
      {
        header: 'DNI',
        col : 'dni',
        isEditable: true
      },
      {
        header: 'Nombre Completo',
        col : 'nombre_completo',
        isEditable: true
      },
      {
        header: 'Institucion',
        col : 'nombre_institucion',
        isEditable: true
      },
      {
        header: 'Nombre Deduccion',
        col : 'nombre_deduccion',
        isEditable: true
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
    ];

    this.getFilas().then(() => this.cargar());
  }

  //Funciones para llenar tabla
  getFilas = async () => {
    try {
      /* Falta traer datos de la planilla */
      const data = await this.deduccionesService.getDetallesCompletos().toPromise();
      this.filasT = data.map((item: any) => ({
        fecha_aplicado: this.datePipe.transform(item.fecha_aplicado, 'dd/MM/yyyy HH:mm'),
        dni: item.afiliado.dni,
        nombre_completo: this.unirNombres(item.afiliado.primer_nombre, item.afiliado.segundo_nombre, item.afiliado.primer_apellido, item.afiliado.segundo_apellido),
        nombre_institucion: item.deduccion.institucion.nombre_institucion,
        nombre_deduccion: item.deduccion.nombre_deduccion,
        anio: item.anio,
        mes: item.mes,
        monto_total: item.monto_total,
        id_ded_deduccion: item.id_ded_deduccion
      })).sort((a: any, b: any) => {
        const dateA = new Date(a.fecha_subida);
        const dateB = new Date(b.fecha_subida);

        return dateB.getTime() - dateA.getTime();
      });

      return this.filasT;
    } catch (error) {
      console.error("Error al obtener los detalles completos de deducción", error);
      throw error;
    }
  };



  editar = (row: any) => {
    console.log("Fila a editar:", row);
    console.log("ID del detalle deducción a editar:", row.id_ded_deduccion);

    const updateData = {
      dni: row.dni,
      nombre_institucion: row.nombre_institucion,
      nombre_deduccion: row.nombre_deduccion,
      monto_total: row.monto_total,
    };

    this.deduccionesService.editDetalleDeduccion(row.id_ded_deduccion, updateData).subscribe({
      next: (response) => {
        console.log('Detalle actualizado con éxito', response);
        this.toastr.success('Detalle de deducción editado con éxito');

        this.getFilas().catch((error) => {
          console.error("Error al recargar los datos de la tabla", error);
          this.toastr.error('Error al recargar los datos de la tabla');
        });
      },
      error: (error) => {
        console.error('Error actualizando el detalle de deducción', error);
        this.toastr.error('Error al actualizar el detalle de deducción');
      }
    });
  };

  ejecutarFuncionAsincronaDesdeOtroComponente(funcion: (data: any) => Promise<void>) {
    this.ejecF = funcion;
  }

  cargar() {
    if (this.ejecF) {
      this.ejecF(this.filasT).then(() => {
      });
    }
  }


}
