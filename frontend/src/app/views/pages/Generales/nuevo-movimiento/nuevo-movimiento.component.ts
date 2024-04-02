import { Component, OnInit } from '@angular/core';
import { Validators } from '@angular/forms';
import { FieldConfig } from 'src/app/shared/Interfaces/field-config';
import { TransaccionesService } from '../../../../services/transacciones.service';
import { ToastrService } from 'ngx-toastr';

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


  constructor(private transaccionesService: TransaccionesService, private toastr: ToastrService,) { }

  ngOnInit(): void {
    this.myFormFields = [
      { type: 'dropdown', label: 'Seleccione el tipo de movimiento', name: 'DEBITO_CREDITO_B', validations: [Validators.required], options: [{ label: "DEBITO", value: "D" }, { label: "CREDITO", value: "C" }], display: true },
      { type: 'text', label: 'Descripción', name: 'DESCRIPCION', validations: [Validators.required], display: true },
      { type: 'text', label: 'Descripción corta', name: 'DESCRIPCION_CORTA', validations: [Validators.required], display: true },
      { type: 'text', label: 'Cuenta Contable', name: 'CUENTA_CONTABLE', validations: [Validators.required], display: true },
      { type: 'number', label: 'Monto', name: 'MONTO', validations: [], display: true },
      { type: 'text', label: 'Justificacion', name: 'JUSTIFICACION', validations: [Validators.required], display: true },
    ];
  }

  onSubmit() {
    this.obtenerTiposDeCuentaPorDNI(this.dni);
    this.datosEncontrados = true;
  }

  obtenerTiposDeCuentaPorDNI(dni: string) {
    this.transaccionesService.obtenerTiposDeCuentaPorDNI(dni).subscribe({
      next: (response) => {
        this.datosTabla = response.data; // Asegúrate de que la respuesta tiene la estructura correcta
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
      dni: this.dni,
      NUMERO_CUENTA: this.elementoSeleccionado,
      datosMovimiento: {
        MONTO: this.form.value.MONTO,
        DESCRIPCION: this.form.value.JUSTIFICACION,
        CREADA_POR: 'Oscar'
      },
      datosTipoMovimiento: {
        DEBITO_CREDITO_B: this.form.value.DEBITO_CREDITO_B,
        DESCRIPCION: this.form.value.DESCRIPCION,
        DESCRIPCION_CORTA: this.form.value.DESCRIPCION_CORTA,
        CUENTA_CONTABLE: this.form.value.CUENTA_CONTABLE
      }
    };


    this.transaccionesService.asignarMovimiento(datosMovimiento).subscribe({
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



}
