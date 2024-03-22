import { Component, OnInit } from '@angular/core';
import { Validators } from '@angular/forms';
import { FieldConfig } from 'src/app/shared/Interfaces/field-config';
import { TableColumn } from 'src/app/shared/Interfaces/table-column';

@Component({
  selector: 'app-ver-movimientos',
  templateUrl: './ver-movimientos.component.html',
  styleUrl: './ver-movimientos.component.scss'
})
export class VerMovimientosComponent implements OnInit {
  public myFormFields: FieldConfig[] = [];
  columns: TableColumn[] = [];
  persona: any;
  form: any
  public monstrarMovimientos: boolean = false;

  ngOnInit(): void {
    this.myFormFields = [
      { type: 'text', label: 'DNI de la persona', name: 'dni', validations: [Validators.required, Validators.minLength(13), Validators.maxLength(14)], display: true }
    ];

    this.columns = [
      {
        header: 'Monto',
        col: 'movimiento_MONTO',
      },
      {
        header: 'Fecha de movimiento',
        col: 'movimiento_FECHA_MOVIMIENTO',
      },
      {
        header: 'Cuenta Contable',
        col: 'CUENTA_CONTABLE',
      },
      {
        header: 'Tipo de Cuenta',
        col: 'DESCRIPCION_TIPO_CUENTA',
      },
      {
        header: 'Tipo de Transacción',
        col: 'DEBITO_CREDITO_B',
      },
      {
        header: 'Estado',
        col: 'ACTIVA_B',
      }
    ];
  }

  previsualizarInfoPersona() {
    this.monstrarMovimientos = true;
    this.getFilas().then(() => this.cargar());
  }

  async obtenerDatos(event: any): Promise<any> {
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
