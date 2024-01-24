import { Component, OnInit } from '@angular/core';
import { ValidatorFn, Validators } from '@angular/forms';
import { ToastrService } from 'ngx-toastr';
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
    private planillaService: PlanillaService,
    private toastr: ToastrService
  ){

  }

  ngOnInit(): void {
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
        validationRules: [Validators.required, Validators.minLength(5)]
      },
      {
        header: 'Descripcion',
        col: 'descripcion',
        isEditable: true
      },
      {
        header: 'Periodo',
        col: 'periodo',
        isEditable: true,
        validationRules: [Validators.required, Validators.pattern(/^(3[01]|[12][0-9]|0?[1-9])-(1[0-2]|0?[1-9])-\d{4} - (3[01]|[12][0-9]|0?[1-9])-(1[0-2]|0?[1-9])-\d{4}$/)]
      }
    ];

  }

  getFilas = async () => {
    try {
      const data = await  this.planillaService.findAllTipoPlanilla().toPromise();

      this.filas = data.map((item: any) => {
        return {
          id: item.id_tipo_planilla,
          nombre: item.nombre_planilla,
          descripcion: item.descripcion || 'No disponible', // manejo de descripciones nulas
          periodo: `${item.periodoInicio} - ${item.periodoFinalizacion}`
        };
      });

      return this.filas;
    } catch (error) {
      console.error("Error al obtener datos de beneficios", error);
      throw error; // Puedes manejar el error aquí o dejarlo para que se maneje en el componente que llama a esta función
    }
  };



  editar = (row: any) => {
    const [periodoInicio, periodoFinalizacion] = row.periodo.split(' - ');

    const tipoPlanillaData = {
      nombre_planilla: row.nombre,
      descripcion: row.descripcion,
      periodoInicio: periodoInicio.trim(),
      periodoFinalizacion: periodoFinalizacion.trim(),
    };

    this.planillaService.updateTipoPlanilla(row.id, tipoPlanillaData).subscribe(
      (response) => {
        this.toastr.success('TipoPlanilla editada con éxito');
      },
      (error) => {
        this.toastr.error('Error al actualizar TipoPlanilla');
      }
    );
  };


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
