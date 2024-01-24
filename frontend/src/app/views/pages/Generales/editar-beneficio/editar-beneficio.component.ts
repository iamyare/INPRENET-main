import { Component, OnInit } from '@angular/core';
import { ValidatorFn, Validators } from '@angular/forms';
import { BeneficiosService } from 'src/app/services/beneficios.service';

@Component({
  selector: 'app-editar-beneficio',
  templateUrl: './editar-beneficio.component.html',
  styleUrl: './editar-beneficio.component.scss'
})
export class EditarBeneficioComponent implements OnInit {
  public myColumns: TableColumn[] = []
  public filas: any[] = [];
  isLoading = true;

  constructor (private svcBeneficioServ: BeneficiosService){}

  ngOnInit(): void {
    this.svcBeneficioServ.getTipoBeneficio().subscribe(
      (data) => {
        this.filas = data.map((item: any) => {
          return {
            id_beneficio: item.id_beneficio,
            nombre_planilla: item.nombre_planilla,
            descripcion_beneficio: item.descripcion_beneficio || 'No disponible',
            estado: item.estado,
            anio_duracion: item.anio_duracion,
            mes_duracion: item.mes_duracion,
            dia_duracion: item.dia_duracion,
          };
        });
        console.log(this.filas);

      },
      (error) => {
        console.error("Error al obtener datos de beneficios", error);
      }
    );

    this.myColumns = [
      { header: 'Nombre del Beneficio',
      col: "id_beneficio",
      isEditable: true,
      validationRules: [Validators.required, Validators.minLength(3)] },
      {
        header: 'Descripcion del beneficio',
         col: 'descripcion_beneficio',
         isEditable: true
      },
      {
        header: 'Prioridad',
      col: 'prioridad',
      isEditable: false
    },
      {
         header: 'estado',
      col: 'estado',
      isEditable: true
    },
      {
        header: 'año de duracion',
      col: 'anio_duracion',
      isEditable: true
    },
      {
        header: 'mes de duracion',
      col: 'mes_duracion',
      isEditable: true
    },
      {
         header: 'dia de duracion',
      col: 'dia_duracion',
      isEditable: true
    }
    ];
  }

  editar(row:any):void{
    console.log(row);
  }

  hacerAlgo(row: any) {
    // Aquí puedes agregar la lógica que necesites
    console.log('Acción del botón en la fila:', row);
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


