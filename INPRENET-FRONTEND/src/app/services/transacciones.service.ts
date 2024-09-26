import { HttpClient } from '@angular/common/http';
import { Injectable } from '@angular/core';
import { Observable, catchError, throwError } from 'rxjs';
import { environment } from 'src/environments/environment';

@Injectable({
  providedIn: 'root'
})
export class TransaccionesService {

  constructor(private http: HttpClient) { }

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
