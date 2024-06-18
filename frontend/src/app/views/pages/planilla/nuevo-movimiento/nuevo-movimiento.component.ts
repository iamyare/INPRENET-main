import { Component, OnInit } from '@angular/core';
import { Validators } from '@angular/forms';
import { FieldConfig } from 'src/app/shared/Interfaces/field-config';
import { TransaccionesService } from '../../../../services/transacciones.service';
import { ToastrService } from 'ngx-toastr';
import { AfiliadoService } from 'src/app/services/afiliado.service';
import { DatosEstaticosService } from 'src/app/services/datos-estaticos.service';

@Component({
  selector: 'app-nuevo-movimiento',
  templateUrl: './nuevo-movimiento.component.html',
  styleUrl: './nuevo-movimiento.component.scss'
})
export class NuevoMovimientoComponent implements OnInit {

  myFormFields: FieldConfig[] = [];
  form: any;

  dni: string = '';
  datosTabla: any[] = [];
  columnasMostradas: string[] = ['NUMERO_CUENTA', 'DESCRIPCION'];
  datosEncontrados: boolean = false;
  elementoSeleccionado?: any;
  persona: any;
  tiposMovimientos: any


  constructor(private transaccionesService: TransaccionesService,
    private toastr: ToastrService,
    private afiliadoService: AfiliadoService,
    private datosEstaticosSVC: DatosEstaticosService,
  ) {

  }

  ngOnInit(): void {
    this.datosEstaticosSVC.getTipoMovimientos().then((value) => {
      this.myFormFields = [
        {
          type: 'dropdown',
          label: 'Tipo de movimiento',
          name: 'tipoMovimientoDescripcion',
          validations: [Validators.required],
          display: true,
          icon: 'notes',
          options: value
        },
        {
          type: 'text',
          label: 'Descripción',
          name: 'DESCRIPCION',
          validations: [Validators.required],
          display: true,
          icon: 'notes'
        },
        {
          type: 'number',
          label: 'Monto',
          name: 'MONTO',
          validations: [Validators.required, Validators.min(1)],
          display: true,
          icon: 'attach_money'
        }
      ];
    })

  }

  onSubmit() {
    this.obtenerTiposDeCuentaPorDNI(this.dni);
    this.datosEncontrados = true;
  }

  previsualizarInfoPersona() {

    if (this.dni) {
      this.afiliadoService.buscarMovimientosPorDNI(this.dni).subscribe({
        next: (data) => {
          if (data && data.data && data.data.persona) {
            this.persona = data.data.persona;
          } else {
            this.toastr.error('No se encontró información para el DNI ingresado.');
          }
        },
        error: (error) => {
          console.error('Error al obtener los movimientos por DNI', error);
          this.toastr.error('Ocurrió un error al buscar la información.');
        }
      });
    } else {
      this.toastr.error('Por favor, ingrese un DNI válido.');
    }
  }

  obtenerTiposDeCuentaPorDNI(dni: string) {
    this.previsualizarInfoPersona()
    this.transaccionesService.obtenerTiposDeCuentaPorDNI(dni).subscribe({
      next: (response) => {
        this.datosTabla = response.data;
        this.datosEncontrados = true;
      },
      error: (error) => {
        console.error('Error al obtener los tipos de cuenta:', error);
        const errorMessage = error.error.message || 'No se pudo obtener los tipos de cuenta para el DNI proporcionado.';
        this.toastr.error(errorMessage, 'Error');
        this.datosTabla = [];
        this.datosEncontrados = false;
      }
    });
  }


  async obtenerDatos(event: any): Promise<any> {
    this.form = event;
  }

  seleccionarFila(fila: any) {
    this.elementoSeleccionado = fila;
  }
  ;



  guardarMovimiento() {
    if (!this.elementoSeleccionado) {
      this.toastr.error('Por favor, seleccione un número de cuenta.', 'Error');
      return;
    }

    const datosMovimiento = {
      numeroCuenta: this.elementoSeleccionado.NUMERO_CUENTA,
      descripcion: this.form.value.DESCRIPCION,
      monto: this.form.value.MONTO,
      tipoMovimientoDescripcion: this.form.value.tipoMovimientoDescripcion
    };

    this.transaccionesService.crearMovimiento(datosMovimiento).subscribe({
      next: (response) => {
        this.toastr.success('Movimiento asignado con éxito.', 'Operación Exitosa');
        this.datosTabla = [];
        this.datosEncontrados = false;
        this.form.reset();
        this.dni = '';
      },
      error: (error) => {
        this.toastr.error('Error al asignar el movimiento.', 'Operación Fallida');
        console.error('Error al asignar el movimiento:', error);
      }
    });
  }

  puedeCrearMovimiento(): boolean {
    return !!this.dni &&
      !!this.elementoSeleccionado?.NUMERO_CUENTA &&
      !!this.form?.value.DESCRIPCION &&
      this.form.value.MONTO > 0;
  }


}
