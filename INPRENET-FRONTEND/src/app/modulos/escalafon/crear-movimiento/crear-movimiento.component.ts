import { Component, EventEmitter, Input, Output } from '@angular/core';
import { FormBuilder, FormGroup, Validators } from '@angular/forms';
import { TransaccionesService } from 'src/app/services/transacciones.service';
import { ToastrService } from 'ngx-toastr';

@Component({
  selector: 'app-crear-movimiento',
  templateUrl: './crear-movimiento.component.html',
  styleUrls: ['./crear-movimiento.component.scss'],
})
export class CrearMovimientoComponent {
  @Input() cuentasDisponibles: any[] = [];
  @Input() meses: any[] = [];
  @Input() tipoCuentaSeleccionada: string | null = null;
  @Output() movimientoCreado = new EventEmitter<any>();
  @Output() cerrarFormulario = new EventEmitter<void>();

  movimientoForm: FormGroup;
  mesSeleccionadoNombre: string = 'NO ESPECIFICADO';

  constructor(
    private fb: FormBuilder,
    private transaccionesService: TransaccionesService,
    private toastr: ToastrService
  ) {
    this.movimientoForm = this.fb.group({
      monto: [null, [Validators.required, Validators.min(0)]],
      descripcion: ['', [Validators.maxLength(30),Validators.required]],
      tipo: ['', Validators.required],
      numeroCuenta: ['', Validators.required],
      ano: [null, [Validators.required, Validators.min(2000), Validators.max(2100)]],
      mes: [null, Validators.required],
    });

    this.movimientoForm.get('mes')?.valueChanges.subscribe(() => {
      this.onMesChange();
    });
  }

  onSubmit(): void {
    if (this.movimientoForm.valid) {
      const movimientoData = {
        numeroCuenta: this.movimientoForm.value.numeroCuenta,
        monto: this.movimientoForm.value.monto,
        descripcion: this.movimientoForm.value.descripcion || '',
        tipoMovimientoDescripcion: this.movimientoForm.value.tipo,
        ANO: this.movimientoForm.value.ano,
        MES: Number(this.movimientoForm.value.mes), // Convertir MES a número
      };
  
      console.log('Datos enviados al backend:', movimientoData);
  
      this.transaccionesService.crearMovimiento(movimientoData).subscribe({
        next: (response) => {
          this.toastr.success('Movimiento creado exitosamente.', 'Éxito');
          this.movimientoCreado.emit(response); // Emite el movimiento creado
          this.movimientoForm.reset();
        },
        error: (error) => {
          console.error('Error al crear movimiento:', error);
          this.toastr.error('Ocurrió un error al crear el movimiento.', 'Error');
        },
      });
    }
  }
  
  
  onNumeroCuentaChange(event: Event): void {
    const inputElement = event.target as HTMLSelectElement;
    const numeroCuenta = inputElement.value;
    const cuentaSeleccionada = this.cuentasDisponibles.find(
      (cuenta) => cuenta.numeroCuenta === numeroCuenta
    );
    this.tipoCuentaSeleccionada = cuentaSeleccionada ? cuentaSeleccionada.tipoCuenta : null;
  }

  onMesChange(): void {
    const mesValue = this.movimientoForm.get('mes')?.value;
    this.mesSeleccionadoNombre = this.getMesNombre(mesValue);
  }

  getMesNombre(mesValue: number | null): string {
    if (mesValue === null || mesValue === undefined) {
      return 'NO ESPECIFICADO';
    }
    const mes = this.meses.find((m) => m.value === +mesValue);
    return mes ? mes.viewValue : 'NO ESPECIFICADO';
  }
}
