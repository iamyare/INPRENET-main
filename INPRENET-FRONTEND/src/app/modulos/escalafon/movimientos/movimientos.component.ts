import { Component, OnInit, ViewChild, ChangeDetectorRef } from '@angular/core';
import { FormBuilder, FormGroup, Validators } from '@angular/forms';
import { ToastrService } from 'ngx-toastr';
import { DynamicTableComponent } from 'src/app/components/dinamicos/dynamic-table/dynamic-table.component';
import { TransaccionesService } from 'src/app/services/transacciones.service';

@Component({
  selector: 'app-movimientos',
  templateUrl: './movimientos.component.html',
  styleUrls: ['./movimientos.component.scss'],
})
export class MovimientosComponent implements OnInit {
  isLoading = false;
  mesSeleccionadoNombre: string = 'NO ESPECIFICADO';

  columns = [
    { header: 'Número Cuenta', col: 'NUMERO_CUENTA', hasFilter: true },
    { header: 'Tipo de Movimiento', col: 'TIPO_MOVIMIENTO', hasFilter: true },
    { header: 'Mes', col: 'MES', hasFilter: true },
    { header: 'Año', col: 'ANO', hasFilter: true },
    { header: 'Monto', col: 'MONTO', moneda: true, hasFilter: true },
    { header: 'Descripción', col: 'DESCRIPCION', hasFilter: true },
    { header: 'Fecha Movimiento', col: 'FECHA_MOVIMIENTO', hasFilter: true },
  ];

  movimientosData: any[] = [];
  movimientoForm: FormGroup;
  persona: any = null;
  ejecF: any;
  cuentasDisponibles: any[] = [];
  tipoCuentaSeleccionada: string | null = null;
  mostrarFormulario = false;
  mostrarFormularioMovimiento = false;
  mostrarFormularioCuenta = false;
  cuentaForm!: FormGroup;

  @ViewChild(DynamicTableComponent) dynamicTable!: DynamicTableComponent;

  meses = [
    { value: 1, viewValue: 'ENERO' },
    { value: 2, viewValue: 'FEBRERO' },
    { value: 3, viewValue: 'MARZO' },
    { value: 4, viewValue: 'ABRIL' },
    { value: 5, viewValue: 'MAYO' },
    { value: 6, viewValue: 'JUNIO' },
    { value: 7, viewValue: 'JULIO' },
    { value: 8, viewValue: 'AGOSTO' },
    { value: 9, viewValue: 'SEPTIEMBRE' },
    { value: 10, viewValue: 'OCTUBRE' },
    { value: 11, viewValue: 'NOVIEMBRE' },
    { value: 12, viewValue: 'DICIEMBRE' },
  ];

  constructor(
    private transaccionesService: TransaccionesService,
    private fb: FormBuilder,
    private cdr: ChangeDetectorRef,
    private toastr: ToastrService
  ) {
    this.movimientoForm = this.fb.group({
      monto: [null, [Validators.required, Validators.min(1)]],
      descripcion: ['', [Validators.maxLength(30)]],
      tipo: ['', Validators.required],
      numeroCuenta: ['', Validators.required],
      ano: [null, [Validators.required, Validators.min(2000), Validators.max(2100)]],
      mes: [null, Validators.required],
    });

    this.cuentaForm = this.fb.group({
      tipoCuenta: ['', Validators.required],
      numeroCuenta: ['', [Validators.required, Validators.maxLength(20)]],
    });

    this.movimientoForm.get('mes')?.valueChanges.subscribe(() => {
      this.onMesChange();
    });
  }

  ngOnInit(): void {}

  onPersonaEncontrada(persona: any): void {
    this.persona = persona;
    if (this.persona?.N_IDENTIFICACION) {
      this.getCuentasPorIdentificacion(this.persona.N_IDENTIFICACION);
    } else {
      console.warn('No se encontró el número de identificación en la persona.');
    }
  }

  async getFilas(): Promise<void> {
    if (this.persona?.ID_PERSONA) {
      this.isLoading = true;
      this.cdr.detectChanges();
  
      try {
        const response = await this.transaccionesService
          .obtenerMovimientos(this.persona.ID_PERSONA, 2)
          .toPromise();
        this.movimientosData = [...this.convertirMovimientosArray(response.data)];
      } catch (error) {
        console.error('Error al obtener movimientos:', error);
      } finally {
        this.isLoading = false;
        this.cdr.detectChanges();
      }
    } else {
      this.movimientosData = [];
    }
  }
  
  convertirMovimientosArray(data: any): any[] {
    const result: any[] = [];
    const tipoCuenta = data.tipoCuenta;
    const numeroCuenta = data.numeroCuenta;

    for (const year in data.movimientos) {
      if (data.movimientos.hasOwnProperty(year)) {
        const yearData = data.movimientos[year];

        for (const month in yearData) {
          if (yearData.hasOwnProperty(month) && Array.isArray(yearData[month])) {
            yearData[month].forEach((movimiento: any) => {
              result.push({
                ID_MOVIMIENTO_CUENTA: movimiento.ID_MOVIMIENTO_CUENTA,
                ANO: year,
                MES: month,
                MONTO: movimiento.MONTO,
                DESCRIPCION: movimiento.DESCRIPCION,
                FECHA_MOVIMIENTO: movimiento.FECHA_MOVIMIENTO,
                NUMERO_CUENTA: numeroCuenta,
                TIPO_CUENTA: tipoCuenta,
                TIPO_MOVIMIENTO : movimiento.tipoMovimiento
              });
            });
          }
        }
      }
    }
    return result;
  }

  eliminarMovimiento(movimiento: any): void {
    this.transaccionesService.eliminarMovimiento(movimiento.ID_MOVIMIENTO_CUENTA).subscribe(
      () => {
        this.movimientosData = this.movimientosData.filter(m => m.ID_MOVIMIENTO_CUENTA !== movimiento.ID_MOVIMIENTO_CUENTA);
        if (this.dynamicTable) {
          this.dynamicTable.ejecutarFuncionAsincrona(this.movimientosData);
        }
      },
      (error) => {
        console.error('Error al eliminar el movimiento:', error);
      }
    );
  }

  descargarMovimientosPdf(): void {
    const data: any = {
      movimientos: {},
      tipoCuenta: this.movimientosData[0]?.TIPO_CUENTA || 'N/A',
      numeroCuenta: this.movimientosData[0]?.NUMERO_CUENTA || 'N/A',
      PRIMER_NOMBRE: this.persona?.PRIMER_NOMBRE || '',
      SEGUNDO_NOMBRE: this.persona?.SEGUNDO_NOMBRE || '',
      PRIMER_APELLIDO: this.persona?.PRIMER_APELLIDO || '',
      SEGUNDO_APELLIDO: this.persona?.SEGUNDO_APELLIDO || '',
      N_IDENTIFICACION: this.persona?.N_IDENTIFICACION || 'N/A',
    };

    this.movimientosData.forEach((mov) => {
      const year = mov.ANO;
      const month = mov.MES;

      if (!data.movimientos[year]) {
        data.movimientos[year] = {};
      }
      if (!data.movimientos[year][month]) {
        data.movimientos[year][month] = [];
      }
      data.movimientos[year][month].push({
        MONTO: mov.MONTO,
        DESCRIPCION: mov.DESCRIPCION,
        FECHA_MOVIMIENTO: mov.FECHA_MOVIMIENTO,
      });
    });

    this.transaccionesService.generarMovimientosPdf(data).subscribe(
      (pdfBlob) => {
        const blob = new Blob([pdfBlob], { type: 'application/pdf' });
        const url = window.URL.createObjectURL(blob);
        const a = document.createElement('a');
        a.href = url;
        a.download = 'movimientos.pdf';
        a.click();
        window.URL.revokeObjectURL(url);
      },
      (error) => {
        console.error('Error al descargar el PDF:', error);
      }
    );
  }

  ejecutarFuncionAsincronaDesdeOtroComponente(funcion: (data: any) => Promise<boolean>): void {
    this.ejecF = funcion;
  }

  onSubmitMovimiento(): void {
    if (this.movimientoForm.valid) {
      console.log('Datos enviados desde el formulario:', this.movimientoForm.value);
  
      const now = new Date();
      const nuevoMovimiento = {
        numeroCuenta: this.movimientoForm.value.numeroCuenta,
        monto: this.movimientoForm.value.monto,
        descripcion: this.movimientoForm.value.descripcion,
        tipoMovimientoDescripcion: this.movimientoForm.value.tipo,
        ANO: this.movimientoForm.value.ano,
        MES: this.movimientoForm.value.mes,
      };

      console.log(nuevoMovimiento);
      
  
      /* this.transaccionesService.crearMovimiento(nuevoMovimiento).subscribe(
        (response) => {
          console.log('Respuesta del servidor:', response);
  
          const formattedMovimiento = {
            ANO: nuevoMovimiento.ANO,
            MES: nuevoMovimiento.MES,
            MONTO: nuevoMovimiento.monto,
            DESCRIPCION: nuevoMovimiento.descripcion,
            FECHA_MOVIMIENTO: now,
            NUMERO_CUENTA: nuevoMovimiento.numeroCuenta,
            TIPO_CUENTA: this.movimientoForm.value.tipoCuenta,
          };
          this.movimientosData = [...this.movimientosData, formattedMovimiento];
          if (this.ejecF) {
            this.ejecF(this.movimientosData).then(() => {
              console.log('Tabla actualizada.');
            });
          }
          this.movimientoForm.reset();
        },
        (error) => {
          console.error('Error al crear el movimiento:', error);
        }
      ); */
    } else {
      console.error('Formulario inválido. Revisa los campos obligatorios.');
    }
  }
  
  onAddButtonClicked(): void {
    console.log('Botón agregar clickeado');
  }
  
  onDelete(row: any): void {
    console.log('Eliminar:', row);
  }

  getCuentasPorIdentificacion(nIdentificacion: string): void {
    this.isLoading = true;
    this.cdr.detectChanges();
    this.transaccionesService.obtenerCuentasPorIdentificacion(nIdentificacion).subscribe({
      next: (response) => {
        if (response.cuentas && response.cuentas.length > 0) {
          this.cuentasDisponibles = response.cuentas.map((cuenta: any) => ({
            numeroCuenta: cuenta.numeroCuenta,
            tipoCuenta: cuenta.tipoCuenta.descripcion,
          }));
          this.getFilas();
        } else {
          this.cuentasDisponibles = [];
          this.movimientosData = [];
          console.warn('No se encontraron cuentas para la persona.');
        }
      },
      error: (error) => {
        console.error('Error al obtener cuentas:', error);
        this.isLoading = false;
        this.cdr.detectChanges();
      },
      complete: () => {
        if (!this.isLoading) {
          this.cdr.detectChanges();
        }
      },
    });
  }
  
  onNumeroCuentaChange(event: Event): void {
    const inputElement = event.target as HTMLSelectElement;
    const numeroCuenta = inputElement.value;
    const cuentaSeleccionada = this.cuentasDisponibles.find(
      (cuenta) => cuenta.numeroCuenta === numeroCuenta
    );
    this.tipoCuentaSeleccionada = cuentaSeleccionada ? cuentaSeleccionada.tipoCuenta : null;
  }  

  getMesNombre(mesValue: number | null): string {
    if (mesValue === null || mesValue === undefined) {
      return 'NO ESPECIFICADO';
    }
    const mes = this.meses.find((m) => m.value === +mesValue);
    return mes ? mes.viewValue : 'NO ESPECIFICADO';
  }
  
  isAnyFieldFilled(): boolean {
    return Object.values(this.movimientoForm.controls).some(
      (control) => control.value && control.value !== ''
    );
  }

  toggleFormulario(): void {
    if (this.mostrarFormulario) {
      this.movimientoForm.reset(); 
    }
    this.mostrarFormulario = !this.mostrarFormulario;
  }

  onMesChange(): void {
    const mesValue = this.movimientoForm.get('mes')?.value;
    this.mesSeleccionadoNombre = this.getMesNombre(mesValue);
  }
  
  toggleFormularioMovimiento(): void {
    this.mostrarFormularioMovimiento = !this.mostrarFormularioMovimiento;
    if (this.mostrarFormularioMovimiento) {
      this.mostrarFormularioCuenta = false;
      this.movimientoForm.reset();
    }
  }

  toggleFormularioCuenta(): void {
    this.mostrarFormularioCuenta = !this.mostrarFormularioCuenta;
    if (this.mostrarFormularioCuenta) {
      this.mostrarFormularioMovimiento = false;
    }
  }

  onCuentaCreada(nuevaCuenta: any): void {
    if (nuevaCuenta) {
      const cuentaFormateada = {
        numeroCuenta: nuevaCuenta.numeroCuenta,
        tipoCuenta: nuevaCuenta.tipoCuenta,
      };
      this.cuentasDisponibles = [...this.cuentasDisponibles, cuentaFormateada];
      this.movimientoForm.get('numeroCuenta')?.setValue(cuentaFormateada.numeroCuenta);
    }
  }

  onMovimientoCreado(movimiento: any): void {
    const nuevoMovimiento = {
      ...movimiento,
      NUMERO_CUENTA: movimiento.cuentaPersona.NUMERO_CUENTA, 
      TIPO_MOVIMIENTO: movimiento.tipoMovimiento.DESCRIPCION, 
    };
    this.movimientosData = [...this.movimientosData, nuevoMovimiento];
    this.cdr.detectChanges();
    this.toastr.success('Movimiento creado exitosamente.', 'Éxito');
    this.toggleFormularioMovimiento(); 
  }
  
}
  

