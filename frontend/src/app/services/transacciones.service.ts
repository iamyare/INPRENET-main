import { HttpClient } from '@angular/common/http';
import { Injectable } from '@angular/core';
import { Observable } from 'rxjs';
import { environment } from 'src/environments/environment';

@Injectable({
  providedIn: 'root'
})
export class TransaccionesService {

  constructor(private http: HttpClient) { }

  asignarMovimiento(datosMovimiento: any) {
    return this.http.post(`${environment.API_URL}/api/transacciones/asignar-movimiento`, datosMovimiento);
  }

  obtenerTiposDeCuentaPorDNI(dni: string): Observable<any> {
    return this.http.get(`${environment.API_URL}/api/transacciones/tipos-de-cuenta/${dni}`);
  }

  obtenerMovimientosPorDNI(dni: string): Observable<any> {
    return this.http.get(`${environment.API_URL}/api/transacciones/movimientos/${dni}`);
  }
}
