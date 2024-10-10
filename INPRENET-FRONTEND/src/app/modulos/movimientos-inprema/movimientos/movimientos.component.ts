import { Component, OnInit, ViewChild } from '@angular/core';
import { MatTableDataSource } from '@angular/material/table';
import { MatPaginator } from '@angular/material/paginator';
import { MatSort } from '@angular/material/sort';
import { TransaccionesService } from 'src/app/services/transacciones.service';
import { AfiliadoService } from 'src/app/services/afiliado.service';

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

  constructor(private transaccionesService: TransaccionesService, private afiliadoService: AfiliadoService) {
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
    for (const year in data) {
      if (data.hasOwnProperty(year)) {
        for (const month in data[year]) {
          if (data[year].hasOwnProperty(month) && Array.isArray(data[year][month])) {
            data[year][month].forEach((movimiento: any) => {
              result.push(movimiento);
            });
          } else {
            console.warn(`Esperaba un arreglo en data[${year}][${month}] pero encontré:`, data[year][month]);
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
}
