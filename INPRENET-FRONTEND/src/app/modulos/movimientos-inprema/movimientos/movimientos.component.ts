import { Component, OnInit, ViewChild } from '@angular/core';
import { MatTableDataSource } from '@angular/material/table';
import { MatPaginator } from '@angular/material/paginator';
import { MatSort } from '@angular/material/sort';
import { MatDialog } from '@angular/material/dialog';
import { TransaccionesService } from 'src/app/services/transacciones.service';
import { AfiliadoService } from 'src/app/services/afiliado.service';
import { AgregarMovimientoComponent } from '../../afiliacion/gestion/agregar-movimiento/agregar-movimiento.component';

@Component({
  selector: 'app-movimientos',
  templateUrl: './movimientos.component.html',
  styleUrls: ['./movimientos.component.scss'],
})
export class MovimientosComponent implements OnInit {
  displayedColumns: string[] = ['ano', 'mes', 'monto', 'descripcion', 'fechaMovimiento', 'numeroCuenta'];
  dataSource: MatTableDataSource<any>;
  movimientosData: any = {};
  dni!: string;
  persona: any = null;
  errorMessage: string | null = null;
  idTipoCuenta: number = 2;

  @ViewChild(MatPaginator) paginator!: MatPaginator;
  @ViewChild(MatSort) sort!: MatSort;

  constructor(
    private transaccionesService: TransaccionesService,
    private afiliadoService: AfiliadoService,
    private dialog: MatDialog
  ) {
    this.dataSource = new MatTableDataSource();
  }

  ngOnInit(): void {}

  onPersonaEncontrada(persona: any): void {
    this.persona = persona;
    this.obtenerMovimientos();
  }

  obtenerMovimientos(): void {
    if (this.persona?.ID_PERSONA) {
      this.transaccionesService.obtenerMovimientos(this.persona.ID_PERSONA, this.idTipoCuenta).subscribe(
        (response) => {
          this.movimientosData = response.data;
          const movimientos = this.convertirMovimientosArray(response.data);
          this.dataSource.data = movimientos;
          this.dataSource.paginator = this.paginator;
          this.dataSource.sort = this.sort;
        },
        (error) => {
          console.error('Error al obtener movimientos:', error);
        }
      );
    } else {
      console.warn('No se encontró ID_PERSONA para obtener movimientos.');
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
                ANO: year,
                MES: month,
                MONTO: movimiento.MONTO,
                DESCRIPCION: movimiento.DESCRIPCION,
                FECHA_MOVIMIENTO: movimiento.FECHA_MOVIMIENTO,
                NUMERO_CUENTA: numeroCuenta, // Se utiliza el número de cuenta del nivel superior
                TIPO_CUENTA: tipoCuenta,     // Se utiliza el tipo de cuenta del nivel superior
              });
            });
          } else {
            console.warn(`Esperaba un arreglo en data.movimientos[${year}][${month}] pero encontré:`, yearData[month]);
          }
        }
      }
    }
    return result;
  }

  aplicarFiltro(event: Event) {
    const filterValue = (event.target as HTMLInputElement).value;
    this.dataSource.filter = filterValue.trim().toLowerCase();
  }

  descargarMovimientosPdf(): void {
    this.transaccionesService.generarMovimientosPdf(this.movimientosData).subscribe(
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

  // Método para abrir el diálogo de agregar movimiento
  openAgregarMovimientoDialog(): void {
    const dialogRef = this.dialog.open(AgregarMovimientoComponent, {
      width: '400px',
      data: { numeroCuenta: this.persona?.NUMERO_CUENTA }
    });

    dialogRef.afterClosed().subscribe(result => {
      if (result) {
        const nuevoMovimiento = {
          ANO: new Date().getFullYear().toString(),
          MES: (new Date().getMonth() + 1).toString(),
          MONTO: result.monto,
          DESCRIPCION: result.descripcion,
          FECHA_MOVIMIENTO: new Date(),
          NUMERO_CUENTA: this.persona?.NUMERO_CUENTA,
          TIPO_CUENTA: 'Nueva'
        };
        this.dataSource.data = [...this.dataSource.data, nuevoMovimiento];
      }
    });
  }
}
