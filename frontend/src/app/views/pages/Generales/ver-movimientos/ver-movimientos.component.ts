import { Component, OnInit } from '@angular/core';
import { Validators } from '@angular/forms';
import { FieldConfig } from 'src/app/shared/Interfaces/field-config';
import { TableColumn } from 'src/app/shared/Interfaces/table-column';

@Component({
  selector: 'app-ver-movimientos',
  templateUrl: './ver-movimientos.component.html',
  styleUrl: './ver-movimientos.component.scss'
})
export class VerMovimientosComponent implements OnInit{

  public myFormFields: FieldConfig[] = [];
  columns: TableColumn[] = [];
  persona:any;
  form:any
  public monstrarMovimientos: boolean = false;

  ngOnInit(): void {
    this.myFormFields = [
      { type: 'text', label: 'DNI de la persona', name: 'dni', validations: [Validators.required, Validators.minLength(13), Validators.maxLength(14)], display:true }
    ];

    this.columns = [
      {
        header: 'Tipo De Movimiento',
        col : 'nombre_beneficio',
      },
      {
        header: 'Tipo de Cuenta',
        col : 'periodicidad',
      },
      {
        header: 'Tipo Transaccion',
        col : 'numero_rentas_max',
      },
      {
        header: 'Descripcion',
        col : 'periodoInicio',
      },
      {
        header: 'Descripcion Corta',
        col : 'periodoFinalizacion',
      },
      {
        header: 'Cuenta Contable',
        col : 'monto_por_periodo',
      },
      {
        header: 'Monto',
        col : 'monto_total',
      },
      {
        header: 'Justificacion',
        col : 'monto_total',
      },
      {
        header: 'Fecha de movimiento',
        col : 'monto_total',
      },
    ];
  }

  previsualizarInfoPersona(){
    this.monstrarMovimientos = true;
    this.getFilas().then(() => this.cargar());
  }

  async obtenerDatos(event:any):Promise<any>{
    this.form = event;
  }

  getFilas = async () => {
    try {

    } catch (error) {
      console.error("Error al obtener los detalles completos de deducción", error);
      throw error;
    }
  };

  cargar() {
    /* if (this.ejecF) {
      this.ejecF(this.filasT).then(() => {
      });
    } */
  }


}
