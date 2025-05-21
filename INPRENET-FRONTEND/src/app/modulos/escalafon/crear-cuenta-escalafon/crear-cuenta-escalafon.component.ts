import { Component, EventEmitter, Input, Output } from '@angular/core';
import { FormBuilder, FormGroup, Validators } from '@angular/forms';
import { ToastrService } from 'ngx-toastr';
import { TransaccionesService } from 'src/app/services/transacciones.service';

@Component({
  selector: 'app-crear-cuenta-escalafon',
  templateUrl: './crear-cuenta-escalafon.component.html',
  styleUrls: ['./crear-cuenta-escalafon.component.scss'],
})
export class CrearCuentaEscalafonComponent {
  cuentaForm: FormGroup;
  @Output() cuentaCreada = new EventEmitter<boolean>();
  @Input() idPersona!: number;

  constructor(
    private fb: FormBuilder,
    private transaccionesService: TransaccionesService,
    private toastr: ToastrService
  ) {
    this.cuentaForm = this.fb.group({
      tipoCuenta: ['', Validators.required],
    });
  }

  onSubmit(): void {
    if (this.cuentaForm.valid) {
      const cuentaData = {
        tipo_cuenta: this.cuentaForm.value.tipoCuenta,
        creado_por: 'INPRENET',
      };
  
      this.transaccionesService.crearCuenta(this.idPersona, cuentaData).subscribe({
        next: (response) => {
          // Emitir la cuenta creada con formato esperado
          const nuevaCuenta:any = {
            numeroCuenta: response.data.numero_cuenta,
            tipoCuenta: response.data.tipo_cuenta.descripcion,
          };
  
          this.toastr.success('Cuenta creada exitosamente.', 'Éxito');
          this.cuentaCreada.emit(nuevaCuenta); // Emitir el objeto completo
          this.cuentaForm.reset();
        },
        error: (err) => {
          console.error('Error al crear la cuenta:', err);
          this.toastr.error('Ocurrió un error al crear la cuenta.', 'Error');
        },
      });
    } else {
      this.toastr.warning('Formulario inválido. Por favor revisa los campos.', 'Advertencia');
    }
  }
  
}
