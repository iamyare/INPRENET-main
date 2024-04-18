import { HttpClient } from '@angular/common/http';
import { Injectable } from '@angular/core';
import { Observable, catchError, of, throwError } from 'rxjs';
import { environment } from 'src/environments/environment';

@Injectable({
  providedIn: 'root'
})
export class TransaccionesService {

  constructor(private http: HttpClient) { }

  crearMovimiento(createTransaccionesDto: any): Observable<any> {
    return this.http.post(`${environment.API_URL}/api/transacciones/crear-movimiento`, createTransaccionesDto).pipe(
      catchError(error => {
        return throwError(() => new Error('No fue posible crear el movimiento: ' + error.message));
      })
    );
  }

  obtenerTiposDeCuentaPorDNI(dni: string): Observable<any> {
    return this.http.get(`${environment.API_URL}/api/transacciones/tipos-de-cuenta/${dni}`);
  }

  obtenerMovimientosPorDNI(dni: string): Observable<any> {
    return this.http.get(`${environment.API_URL}/api/transacciones/movimientos/${dni}`).pipe(
      catchError(error => {
         if (error.status === 404) {
          return of([]);
        }
        return throwError(error);
      })
    );
  }

  obtenerTodosLosVouchers(idPersona: number): Observable<any> {
    return this.http.get(`${environment.API_URL}/api/transacciones/voucher/todos/${idPersona}`).pipe(
      catchError(error => {
        if (error.status === 404) {
          return of([]);
        }
        return throwError(() => new Error('Error al obtener vouchers: ' + error.message));
      })
    );
  }

  obtenerMovimientosPorId(idMovimientoCuenta: number, idPersona: number): Observable<any> {
    return this.http.get(`${environment.API_URL}/api/transacciones/movimientos/${idMovimientoCuenta}/${idPersona}`).pipe(
      catchError(error => {
        return throwError(() => new Error('Error al obtener detalles del movimiento: ' + error.message));
      })
    );
  }
}
