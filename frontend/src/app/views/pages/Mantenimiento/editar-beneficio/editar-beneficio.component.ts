import { Component, OnInit } from '@angular/core';
import { ValidatorFn, Validators } from '@angular/forms';
import { ToastrService } from 'ngx-toastr';
import { BeneficiosService } from 'src/app/services/beneficios.service';

@Component({
  selector: 'app-editar-beneficio',
  templateUrl: './editar-beneficio.component.html',
  styleUrl: './editar-beneficio.component.scss'
})
export class EditarBeneficioComponent implements OnInit {
  public myColumns: TableColumn[] = []
  public filas: any[] = [];

  constructor (
    private svcBeneficioServ: BeneficiosService,
    private toastr: ToastrService
    ){}

  ngOnInit(): void {
    this.myColumns = [
      {
        header: 'Nombre del Beneficio',
        col: "nombre_beneficio",
        isEditable: true,
        validationRules: [Validators.required, Validators.minLength(3)]
      },
      {
        header: 'Descripcion del beneficio',
        col: 'descripcion_beneficio',
        isEditable: true
      },
      {
      header: 'estado',
      col: 'estado',
      isEditable: true
    },
      {
      header: 'numero_rentas_max',
      col: 'numero_rentas_max',
      isEditable: true
    },
    ];
  }

  editar = (row: any) => {

    const beneficioData = {
      nombre_beneficio: row.nombre_beneficio,
      descripcion_beneficio: row.descripcion_beneficio,
      numero_rentas_max: row.numero_rentas_max,
      estado: row.estado,

    }

    this.svcBeneficioServ.updateBeneficio(row.id, beneficioData).subscribe(
      (response) => {
        this.toastr.success('Beneficio editado con éxito');
      },
      (error) => {
        this.toastr.error('Error al actualizar Beneficio');
      }
    );
  };

  getFilas = async () => {
    try {
      const data = await this.svcBeneficioServ.getTipoBeneficio().toPromise();

      this.filas = data.map((item: any) => {
        return {
          id: item.id_beneficio,
          nombre_beneficio: item.nombre_beneficio,
          descripcion_beneficio: item.descripcion_beneficio || 'No disponible',
          numero_rentas_max: item.numero_rentas_max ,
          estado: item.estado
        };
      });

      return this.filas;
    } catch (error) {
      console.error("Error al obtener datos de beneficios", error);
      throw error; // Puedes manejar el error aquí o dejarlo para que se maneje en el componente que llama a esta función
    }
  };

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


