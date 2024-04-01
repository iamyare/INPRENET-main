import { Component, OnInit } from '@angular/core';
import { Validators } from '@angular/forms';
import { AfiliadoService } from 'src/app/services/afiliado.service';
import { FieldConfig } from 'src/app/shared/Interfaces/field-config';
import { TableColumn } from 'src/app/shared/Interfaces/table-column';
import { ToastrService } from 'ngx-toastr';
import { TransaccionesService } from 'src/app/services/transacciones.service';

@Component({
  selector: 'app-ver-movimientos',
  templateUrl: './ver-movimientos.component.html',
  styleUrl: './ver-movimientos.component.scss'
})
export class VerMovimientosComponent implements OnInit {
  public myFormFields: FieldConfig[] = [];
  columns: TableColumn[] = [];
  persona: any;
  movimientos: any;
  form: any
  public mostrarMovimientos: boolean = false;
  ejecF: any;
  filasT: any[] = [];


  constructor(private afiliadoService: AfiliadoService, private toastr: ToastrService,
              private transaccionesService: TransaccionesService) { }


  ngOnInit(): void {
    this.myFormFields = [
      { type: 'text', label: 'DNI de la persona', name: 'dni', validations: [Validators.required, Validators.minLength(13), Validators.maxLength(14)], display: true }
    ];

    this.columns = [
      { header: 'Fecha de Movimiento', col: 'FECHA_MOVIMIENTO', isEditable: false },
      { header: 'Monto', col: 'MONTO', isEditable: false },
      { header: 'Tipo de Movimiento', col: 'DEBITO_CREDITO_B', isEditable: false },
      { header: 'Estado', col: 'ACTIVA_B', isEditable: false },
      { header: 'Cuenta Contable', col: 'CUENTA_CONTABLE', isEditable: false },
      { header: 'Descripción Tipo de Cuenta', col: 'DESCRIPCION_TIPO_CUENTA', isEditable: false },
    ];


  }

  previsualizarInfoPersona() {
    this.mostrarMovimientos = false;

    if (this.form && this.form.value.dni) {
      this.afiliadoService.buscarMovimientosPorDNI(this.form.value.dni).subscribe({
        next: (data) => {
          if (data && data.data && data.data.persona) {
            this.persona = data.data.persona;
            this.mostrarMovimientos = true;
            this.getFilas().then(() => this.cargar());
          } else {
            this.limpiarInformacion();
            this.toastr.error('No se encontró información para el DNI ingresado.');
          }
        },
        error: (error) => {
          console.error('Error al obtener los movimientos por DNI', error);
          this.limpiarInformacion();
          this.toastr.error('Ocurrió un error al buscar la información.');
        }
      });
    } else {
      this.limpiarInformacion();
      this.toastr.error('Por favor, ingrese un DNI válido.');
    }
  }

  async obtenerDatos(event: any): Promise<any> {
    this.form = event;
  }

  getFilas = async () => {
    try {

      if (this.form && this.form.value.dni) {
        const data = await this.transaccionesService.obtenerMovimientosPorDNI(this.form.value.dni).toPromise();

        if (data.length > 0) {
          this.filasT = data.map((movimiento: any) => ({
            FECHA_MOVIMIENTO: movimiento.movimiento_FECHA_MOVIMIENTO,
            MONTO: movimiento.movimiento_MONTO,
            DEBITO_CREDITO_B: movimiento.DEBITO_CREDITO_B,
            ACTIVA_B: movimiento.ACTIVA_B,
            CUENTA_CONTABLE: movimiento.CUENTA_CONTABLE,
            DESCRIPCION_TIPO_CUENTA: movimiento.DESCRIPCION_TIPO_CUENTA,
          }));
        } else {
          this.filasT = [];
        }
      } else {
        this.filasT = [];
      }
    } catch (error) {
      this.filasT = [];
    }
    return this.filasT;
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

  limpiarInformacion() {
    this.persona = null;
    this.filasT = [];
  }
}
