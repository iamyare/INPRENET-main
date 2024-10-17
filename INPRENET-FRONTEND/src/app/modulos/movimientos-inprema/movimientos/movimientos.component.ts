import { Component, OnInit } from '@angular/core';
import { FormBuilder, FormGroup, Validators } from '@angular/forms';
import { TransaccionesService } from 'src/app/services/transacciones.service';
import { TableColumn } from 'src/app/shared/Interfaces/table-column';

@Component({
  selector: 'app-movimientos',
  templateUrl: './movimientos.component.html',
  styleUrls: ['./movimientos.component.scss'],
})
export class MovimientosComponent implements OnInit {
  columns: TableColumn[] = [
    { header: 'Año', col: 'ANO' },
    { header: 'Mes', col: 'MES' },
    { header: 'Monto', col: 'MONTO', moneda: true },
    { header: 'Descripción', col: 'DESCRIPCION' },
    { header: 'Fecha Movimiento', col: 'FECHA_MOVIMIENTO', customRender: (row: any) => new Date(row.FECHA_MOVIMIENTO).toLocaleDateString('es-ES') },
    { header: 'Número Cuenta', col: 'NUMERO_CUENTA' }
  ];

  movimientosData: any[] = [];
  movimientoForm: FormGroup;
  persona: any = null;
  ejecF: any;

  constructor(
    private transaccionesService: TransaccionesService,
    private fb: FormBuilder
  ) {

    this.movimientoForm = this.fb.group({
      tipoCuenta: ['', Validators.required],
      monto: [null, [Validators.required, Validators.min(1)]],
      descripcion: ['', [Validators.required, Validators.maxLength(30)]],
      tipo: ['', Validators.required],
      numeroCuenta: ['', Validators.required],
      ano: [null, [Validators.required, Validators.min(2000), Validators.max(2100)]],
      mes: [null, Validators.required]
    });
  }

  ngOnInit(): void { }

  onPersonaEncontrada(persona: any): void {
    this.persona = persona;

    this.getFilas();
  }

  async getFilas(): Promise<void> {
    if (this.persona?.ID_PERSONA) {
      try {
        const response = await this.transaccionesService.obtenerMovimientos(this.persona.ID_PERSONA, 2).toPromise();
        this.movimientosData = this.convertirMovimientosArray(response.data);
        if (this.ejecF) {
          this.ejecF(this.movimientosData);
        }
      } catch (error) {
        console.error('Error al obtener movimientos:', error);
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
              });
            });
          }
        }
      }
    }
    return result;
  }

  onSubmitMovimiento(): void {
    if (this.movimientoForm.valid) {
      const now = new Date();
      const nuevoMovimiento = {
        numeroCuenta: this.movimientoForm.value.numeroCuenta,
        monto: this.movimientoForm.value.monto,
        descripcion: this.movimientoForm.value.descripcion,
        tipoMovimientoDescripcion: this.movimientoForm.value.tipo,
        ANO: this.movimientoForm.value.ano,
        MES: this.movimientoForm.value.mes
      };

      if (!nuevoMovimiento.numeroCuenta) {
        console.error('El número de cuenta no está definido. Asegúrate de que se ha cargado la información de la persona.');
        return;
      }

      this.transaccionesService.crearMovimiento(nuevoMovimiento).subscribe(
        (response) => {
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
      );
    }
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
      N_IDENTIFICACION: this.persona?.N_IDENTIFICACION || 'N/A'
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
        FECHA_MOVIMIENTO: mov.FECHA_MOVIMIENTO
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

  ejecutarFuncionAsincronaDesdeOtroComponente(funcion: (data: any) => Promise<boolean>) {
    this.ejecF = funcion;
  }

  meses = [
    { value: 1, viewValue: 'Enero' },
    { value: 2, viewValue: 'Febrero' },
    { value: 3, viewValue: 'Marzo' },
    { value: 4, viewValue: 'Abril' },
    { value: 5, viewValue: 'Mayo' },
    { value: 6, viewValue: 'Junio' },
    { value: 7, viewValue: 'Julio' },
    { value: 8, viewValue: 'Agosto' },
    { value: 9, viewValue: 'Septiembre' },
    { value: 10, viewValue: 'Octubre' },
    { value: 11, viewValue: 'Noviembre' },
    { value: 12, viewValue: 'Diciembre' }
  ];


  eliminarMovimiento(movimiento: any): void {
    this.transaccionesService.eliminarMovimiento(movimiento.ID_MOVIMIENTO_CUENTA).subscribe(
      () => {
        this.movimientosData = this.movimientosData.filter(m => m.ID_MOVIMIENTO_CUENTA !== movimiento.ID_MOVIMIENTO_CUENTA);
        if (this.ejecF) {
          this.ejecF(this.movimientosData).then(() => {
          });
        }
      },
      (error) => {
        console.error('Error al eliminar el movimiento:', error);
      }
    );
  }




}
