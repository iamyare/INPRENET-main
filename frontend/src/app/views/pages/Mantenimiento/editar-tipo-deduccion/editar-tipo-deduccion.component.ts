import { Component, OnInit } from '@angular/core';
import { ValidatorFn, Validators } from '@angular/forms';import { ToastrService } from 'ngx-toastr';
import { DeduccionesService } from '../../../../services/deducciones.service';
import { TableColumn } from 'src/app/shared/Interfaces/table-column';

@Component({
  selector: 'app-editar-tipo-deduccion',
  templateUrl: './editar-tipo-deduccion.component.html',
  styleUrl: './editar-tipo-deduccion.component.scss'
})
export class EditarTipoDeduccionComponent implements OnInit{
  public myColumns: TableColumn[] = []
  public filas: any[] = [];
  ejecF: any;

  constructor (
    private deduccionesService: DeduccionesService,
    private toastr: ToastrService
    ){}

  ngOnInit(): void {
    this.myColumns = [
      { header: 'Nombre de la Deducción',
      col: "nombre_deduccion",
      isEditable: true,
      validationRules: [Validators.required, Validators.minLength(3)]
     },
      {
        header: 'Descripcion de la deducción',
         col: 'descripcion_deduccion',
         isEditable: true
      },
      {
        header: 'Nombre Institución',
      col: 'nombre_institucion',
      isEditable: true,
      validationRules: [Validators.required, Validators.minLength(3)]
    },
      {
      header: 'Prioridad',
      col: 'prioridad',
      isEditable: true,
      validationRules: [Validators.required, Validators.pattern(/^[0-9]+$/)]
    }
    ];

    this.getFilas().then(() => this.cargar());
  }

  getFilas = async () => {
    try {
      const data = await this.deduccionesService.getDeducciones().toPromise();
      this.filas = data.map((item: any) => {
        return {
          id: item.id_deduccion,
          nombre_institucion: item.nombre_institucion,
          nombre_deduccion: item.nombre_deduccion,
          descripcion_deduccion: item.descripcion_deduccion || 'No disponible',
          tipo_deduccion: item.tipo_deduccion,
          prioridad : item.prioridad,
        };
      });

      return this.filas;
    } catch (error) {
      console.error("Error al obtener datos de Deducciones", error);
      throw error; // Puedes manejar el error aquí o dejarlo para que se maneje en el componente que llama a esta función
    }
  };

  editar = (row: any) => {

    const deduccionData = {
      nombre_deduccion: row.nombre_deduccion,
      descripcion_deduccion: row.descripcion_deduccion,
      tipo_deduccion: row.tipo_deduccion,
      prioridad: row.prioridad,

    }

    this.deduccionesService.updateDeduccion(row.id, deduccionData).subscribe(
      (response) => {
        this.toastr.success('Deduccion editada con éxito');
      },
      (error) => {
        this.toastr.error('Error al actualizar Deduccion');
      }
    );
  };

  ejecutarFuncionAsincronaDesdeOtroComponente(funcion: (data: any) => Promise<void>) {
    this.ejecF = funcion;
  }

  cargar() {
    if (this.ejecF) {
      this.ejecF(this.filas).then(() => {
      });
    }
  }
}
