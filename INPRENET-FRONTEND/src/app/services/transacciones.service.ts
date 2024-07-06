import { HttpClient } from '@angular/common/http';
import { Injectable } from '@angular/core';
import { Observable, catchError, of, throwError } from 'rxjs';
import { environment } from 'src/environments/environment';

@Injectable({
  providedIn: 'root'
})
export class TransaccionesService {

  constructor(private http: HttpClient) { }

  obtenerVouchersDeMovimientos(dni: string): Observable<any> {
    return this.http.get(`${environment.API_URL}/api/transacciones/voucher/${dni}`).pipe(
      catchError(error => throwError(() => new Error('Error al obtener los vouchers de movimientos: ' + error.message)))
    );
  }

  obtenerTipoMovimientos(): Observable<any> {
    return this.http.get(`${environment.API_URL}/api/transacciones/tipoMovimientos`).pipe(
      catchError(error => throwError(() => new Error('Error al obtener los tiposMovimientos: ' + error.message)))
    );
  }

  obtenerVoucherMovimientoEspecifico(dni: string, idMovimientoCuenta: number): Observable<any> {
    return this.http.get(`${environment.API_URL}/api/transacciones/voucherEspecifico/${dni}/${idMovimientoCuenta}`).pipe(
      catchError(error => throwError(() => new Error('Error al obtener el voucher de movimiento específico: ' + error.message)))
    );
  }

  crearMovimiento(datosMovimiento: any): Observable<any> {
    return this.http.post(`${environment.API_URL}/api/transacciones/crear-movimiento`, datosMovimiento).pipe(
      catchError(error => throwError(() => new Error('Error al crear el movimiento: ' + error.message)))
    );
  }

  obtenerTiposDeCuentaPorDNI(dni: string): Observable<any> {
    return this.http.get(`${environment.API_URL}/api/transacciones/tipos-de-cuenta/${dni}`);
  }

  crearCuenta(idPersona: number, datos: any): Observable<any> {
    return this.http.post(`${environment.API_URL}/api/transacciones/crear-cuenta/${idPersona}`, datos);
  }

  desactivarCuenta(numCuenta: string, datosGenerales: any): Observable<any> {
    return this.http.put(`${environment.API_URL}/api/transacciones/desactivarCuenta/${numCuenta}`, datosGenerales);
  }

  ActivarCuenta(numCuenta: string, datosGenerales: any): Observable<any> {
    return this.http.put(`${environment.API_URL}/api/transacciones/ActivarCuenta/${numCuenta}`, datosGenerales);
  }


}


/* obtenerMovimientosPorDNI(dni: string): Observable<any> {
    return this.http.get(`${environment.API_URL}/api/transacciones/movimientos/${dni}`).pipe(
      catchError(error => {
         if (error.status === 404) {
          return of([]);
        }
        return throwError(error);
      })
    );
  } */

/* obtenerTodosLosVouchers(idPersona: number): Observable<any> {
  return this.http.get(`${environment.API_URL}/api/transacciones/voucher/todos/${idPersona}`).pipe(
    catchError(error => {
      if (error.status === 404) {
        return of([]);
      }
      return throwError(() => new Error('Error al obtener vouchers: ' + error.message));
    })
  );
} */

/* obtenerMovimientosPorId(idMovimientoCuenta: number, idPersona: number): Observable<any> {
  return this.http.get(`${environment.API_URL}/api/transacciones/movimientos/${idMovimientoCuenta}/${idPersona}`).pipe(
    catchError(error => {
      return throwError(() => new Error('Error al obtener detalles del movimiento: ' + error.message));
    })
  );
} */
