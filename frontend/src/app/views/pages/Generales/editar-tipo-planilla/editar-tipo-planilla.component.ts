import { Component, OnInit } from '@angular/core';
import { ValidatorFn, Validators } from '@angular/forms';
import { PlanillaService } from 'src/app/services/planilla.service';

@Component({
  selector: 'app-editar-tipo-planilla',
  templateUrl: './editar-tipo-planilla.component.html',
  styleUrl: './editar-tipo-planilla.component.scss'
})
export class EditarTipoPlanillaComponent implements OnInit{
  myColumns: TableColumn[] = [];
  filas: any[] =[];
  isLoading = true;

  constructor(
    private planillaService: PlanillaService
  ){

  }

  ngOnInit(): void {
    this.planillaService.findAllTipoPlanilla().subscribe(
      (data) => {
        // Mapeo de datos a la estructura de filas
        this.filas = data.map((item: any) => {
          return {
            id: item.id_tipo_planilla,
            nombre: item.nombre_planilla,
            descripcion: item.descripcion || 'No disponible', // manejo de descripciones nulas
            periodo: `${item.periodoInicio} - ${item.periodoFinalizacion}`
          };
        });

        console.log('Datos mapeados para las filas:', this.filas);
      },
      (error) => {
        console.error('Error al obtener datos:', error);
      }
    );

    // Definir las columnas
    this.myColumns = [
      {
        header: 'ID',
        col: 'id',
        isEditable: false
      },
      {
        header: 'Nombre de planilla',
        col: 'nombre',
        isEditable: true,
        validationRules: [Validators.required, Validators.minLength(3)]
      },
      {
        header: 'Descripcion',
        col: 'descripcion',
        isEditable: true
      },
      {
        header: 'Periodo',
        col: 'periodo',
        isEditable: true
      }
    ];

  }

  editar(row:any){
    console.log('accion del boton en la fila', row);

  }
}


interface TableColumn {
  header: string;
  col: string;
  customRender?: (data: any) => string;
  isButton?: boolean;
  buttonAction?: (row: any) => void;
  buttonText?: string;
  isEditable?: boolean; // Nueva propiedad
  validationRules?: ValidatorFn[];
}



/*  {
      header: 'Acciones',
      col: 'acciones',
      isButton: true,
      buttonText: 'Hacer algo',
      buttonAction: (row) => this.hacerAlgo(row)
    } */
