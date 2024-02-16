import { Component, OnInit } from '@angular/core';
import { Validators } from '@angular/forms';
import { ToastrService } from 'ngx-toastr';
import { BeneficiosService } from 'src/app/services/beneficios.service';
import { TableColumn } from 'src/app/shared/Interfaces/table-column';

@Component({
  selector: 'app-editar-beneficio',
  templateUrl: './editar-beneficio.component.html',
  styleUrls: ['./editar-beneficio.component.scss']
})
export class EditarBeneficioComponent implements OnInit {
  public myColumns: TableColumn[] = [];
  public filas: any[] = [];
  ejecF: any;

  constructor(
    private svcBeneficioServ: BeneficiosService,
    private toastr: ToastrService
  ) {}

  ngOnInit(): void {
    this.myColumns = [
      {
        header: 'Nombre del Beneficio',
        col: 'nombre_beneficio',
        isEditable: true,
        validationRules: [Validators.required, Validators.minLength(3)]
      },
      {
        header: 'Descripción del beneficio',
        col: 'descripcion_beneficio',
        isEditable: true
      },
      {
        header: 'Periodicidad',
        col: 'periodicidad',
        isEditable: true
      },
      {
        header: 'Número máximo de rentas',
        col: 'numero_rentas_max',
        isEditable: true
      },
    ];

    this.getFilas().then(() => this.cargar());
  }

  editar = (row: any) => {
    const beneficioData = {
      nombre_beneficio: row.nombre_beneficio,
      descripcion_beneficio: row.descripcion_beneficio,
      numero_rentas_max: row.numero_rentas_max,
      periodicidad: row.periodicidad,
    };

    this.svcBeneficioServ.updateBeneficio(row.id, beneficioData).subscribe(
      response => {
        this.toastr.success('Beneficio editado con éxito');
      },
      error => {
        this.toastr.error('Error al actualizar el beneficio');
      }
    );
  };

  async getFilas() {
    try {
      const data = await this.svcBeneficioServ.getTipoBeneficio().toPromise();
      this.filas = data.map((item: any) => ({
        id: item.id_beneficio,
        nombre_beneficio: item.nombre_beneficio,
        descripcion_beneficio: item.descripcion_beneficio || 'No disponible',
        numero_rentas_max: item.numero_rentas_max,
        periodicidad: item.periodicidad,
      }));
    } catch (error) {
      this.toastr.error('Error al cargar los beneficios');
      console.error('Error al obtener datos de beneficios', error);
    }
  }

  hacerAlgo(row: any) {
    console.log('Acción del botón en la fila:', row);
  }

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
