import { Component, OnInit } from '@angular/core';
import { ValidatorFn, Validators } from '@angular/forms';import { ToastrService } from 'ngx-toastr';
import { DeduccionesService } from '../../../../services/deducciones.service';

@Component({
  selector: 'app-editar-tipo-deduccion',
  templateUrl: './editar-tipo-deduccion.component.html',
  styleUrl: './editar-tipo-deduccion.component.scss'
})
export class EditarTipoDeduccionComponent implements OnInit{
  public myColumns: TableColumn[] = []
  public filas: any[] = [];

  constructor (
    private deduccionesService: DeduccionesService,
    private toastr: ToastrService
    ){}

  ngOnInit(): void {
    this.myColumns = [
      { header: 'Nombre de la Deduccion',
      col: "nombre_deduccion",
      isEditable: true,
      validationRules: [Validators.required, Validators.minLength(3)] },
      {
        header: 'Descripcion del beneficio',
         col: 'descripcion_deduccion',
         isEditable: true
      },
      {
        header: 'Tipo de deduccion',
      col: 'tipo_deduccion',
      isEditable: false
    },
      {
         header: 'Prioridad',
      col: 'prioridad',
      isEditable: true
    }
    ];
  }

  getFilas = async () => {
    try {
      const data = await this.deduccionesService.getDeducciones().toPromise();

      this.filas = data.map((item: any) => {
        return {
          id: item.id_beneficio,
          nombre_deduccion: item.nombre_deduccion,
          descripcion_deduccion: item.descripcion_beneficio || 'No disponible',
          tipo_deduccion: item.tipo_deduccion,
          prioridad : item.prioridad,
        };
      });

      return this.filas;
    } catch (error) {
      console.error("Error al obtener datos de beneficios", error);
      throw error; // Puedes manejar el error aquí o dejarlo para que se maneje en el componente que llama a esta función
    }
  };

  editar = (row: any) => {

  }



}

interface TableColumn {
  header: string;
  col: string;
  customRender?: (data: any) => string;
  isButton?: boolean;
  buttonAction?: (row: any) => void;
  buttonText?: string;
  isEditable?: boolean;// Nueva propiedad
  validationRules?: ValidatorFn[];
}
