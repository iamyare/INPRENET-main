import { HttpClient, HttpHeaders } from '@angular/common/http';
import { Injectable } from '@angular/core';
import { Observable, catchError, throwError } from 'rxjs';
import { environment } from 'src/environments/environment';

@Injectable({
  providedIn: 'root'
})
export class TransaccionesService {

  constructor(private http: HttpClient) { }
  crearMovimiento(movimientoData: any): Observable<any> {
    const url = `${environment.API_URL}/api/transacciones/crear-movimiento`;
    return this.http.post(url, movimientoData).pipe(
      catchError(error => {
        console.error('Error al crear movimiento:', error);
        return throwError(() => new Error('Error al crear movimiento: ' + error.message));
      })
    );
  }


  crearCuenta(idPersona: number, cuentaData: any): Observable<any> {
    return this.http.post(`${environment.API_URL}/api/transacciones/crear-cuenta/${idPersona}`, cuentaData);
  }

  obtenerCuentasPorIdentificacion(nIdentificacion: string): Observable<any> {
    const url = `${environment.API_URL}/api/transacciones/cuentas/${nIdentificacion}`;
    return this.http.get<any>(url).pipe(
      catchError(error => throwError(() => new Error('Error al obtener cuentas: ' + error.message)))
    );
  }

  eliminarMovimiento(idMovimiento: number): Observable<any> {
    const url = `${environment.API_URL}/api/transacciones/eliminar-movimiento/${idMovimiento}`;
    return this.http.delete<any>(url).pipe(
      catchError(error => throwError(() => new Error('Error al eliminar el movimiento: ' + error.message)))
    );
  }

  generarMovimientosPdf(data: any): Observable<Blob> {
    const url = `${environment.API_URL}/api/documents/movimientos-pdf`;
    const headers = new HttpHeaders().set('Content-Type', 'application/json');

    return this.http.post(url, data, { headers, responseType: 'blob' }).pipe(
      catchError(error => throwError(() => new Error('Error al generar PDF de movimientos: ' + error.message)))
    );
  }

  obtenerMovimientos(idPersona: number, idTipoCuenta: number): Observable<any> {
    const url = `${environment.API_URL}/api/persona/${idPersona}/movimientos-ordenados/${idTipoCuenta}`;
    return this.http.get<any>(url).pipe(
      catchError(error => throwError(() => new Error('Error al obtener movimientos: ' + error.message)))
    );
  }

  obtenerVouchersDeMovimientos(dni: string, limit: number, offset: number, search: string): Observable<any> {
    const url = `${environment.API_URL}/api/transacciones/vouchers?dni=${dni}&limit=${limit}&offset=${offset}&search=${search}`;
    return this.http.get<any>(url);
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

  desactivarCuenta(numCuenta: string, datosGenerales: any): Observable<any> {
    return this.http.put(`${environment.API_URL}/api/transacciones/desactivarCuenta/${numCuenta}`, datosGenerales);
  }

  ActivarCuenta(numCuenta: string, datosGenerales: any): Observable<any> {
    return this.http.put(`${environment.API_URL}/api/transacciones/ActivarCuenta/${numCuenta}`, datosGenerales);
  }


}
