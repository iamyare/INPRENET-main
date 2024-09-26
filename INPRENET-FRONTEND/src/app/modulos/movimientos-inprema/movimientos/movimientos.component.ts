import { Component, ViewChild, AfterViewInit } from '@angular/core';
import { MatPaginator } from '@angular/material/paginator';
import { MatTableDataSource } from '@angular/material/table';
import { TransaccionesService } from 'src/app/services/transacciones.service';
import { FormControl } from '@angular/forms';

@Component({
  selector: 'app-movimientos',
  templateUrl: './movimientos.component.html',
  styleUrls: ['./movimientos.component.scss'],
})
export class MovimientosComponent implements AfterViewInit {
  movimientos = new MatTableDataSource<any>();
  total = 0;
  displayedcolumns: string[] = ['NUMERO_CUENTA', 'MONTO', 'FECHA_MOVIMIENTO', 'TIPO_MOVIMIENTO', 'DEBITO_CREDITO_B', 'TIPO_CUENTA_DESCRIPCION'];
  dni = '';
  searchControl = new FormControl('');
  isLoading = false; // Variable para manejar el estado de carga

  @ViewChild(MatPaginator) paginator!: MatPaginator;

  constructor(private transaccionesService: TransaccionesService) {}

  ngAfterViewInit() {
    this.movimientos.paginator = this.paginator;

    // Escucha los cambios en el campo de búsqueda
    this.searchControl.valueChanges.subscribe((value) => {
      this.buscarMovimientos(this.dni, 10, 0, value || '');
    });
  }

  buscarMovimientos(dni: string, limit = 10, offset = 0, search = ''): Promise<any[]> {
    this.dni = dni;
    this.isLoading = true; // Activar spinner
    return new Promise((resolve, reject) => {
      this.transaccionesService
        .obtenerVouchersDeMovimientos(dni, limit, offset, search)
        .subscribe(
          (data) => {
            this.total = data.total;
            this.isLoading = false; // Desactivar spinner al recibir datos
            resolve(data.movimientos);
          },
          (error) => {
            console.error('Error fetching data:', error);
            this.isLoading = false; // Desactivar spinner en caso de error
            reject(error);
          }
        );
    });
  }

  onSearchResult(result: any) {
    this.movimientos.data = result;
  }

  changePage(event: any) {
    const offset = event.pageIndex * event.pageSize;
    const limit = event.pageSize;
    const search = this.searchControl.value || '';
    this.buscarMovimientos(this.dni, limit, offset, search).then((result) => {
      this.onSearchResult(result);
    });
  }
}
