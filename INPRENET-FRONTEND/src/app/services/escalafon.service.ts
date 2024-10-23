import { HttpClient } from '@angular/common/http';
import { Injectable } from '@angular/core';
import { Observable, catchError, throwError } from 'rxjs';
import { environment } from 'src/environments/environment';
import { Prestamo } from 'src/app/modulos/escalafon/detalle-envio-escalafon/detalle-envio-escalafon.component';

@Injectable({
  providedIn: 'root'
})
export class EscalafonService {

  constructor(private http: HttpClient) { }

  // Método para obtener deducciones por DNI
  obtenerDeduccionEscalafon(DNI: number): Observable<any> {
    const url = `${environment.API_URL}/api/escalafon/${DNI}/deducciones`;
    return this.http.get<any>(url).pipe(
      catchError((error) => {
        console.error(`Error al obtener las deducciones de escalafón para el DNI ${DNI}:`, error);
        return throwError(() => new Error('No se pudieron obtener las deducciones. Inténtelo más tarde.'));
      })
    );
  }

  // Método para obtener los préstamos desde la tabla NET_DETALLE_ENVIO_ESCALAFON
  obtenerPrestamos(dni: string): Observable<Prestamo[]> {
    const url = `${environment.API_URL}/api/escalafon/prestamos/${dni}`; // Ajusta la URL según tu API
    return this.http.get<Prestamo[]>(url).pipe(
      catchError((error) => {
        console.error(`Error al obtener los préstamos para el DNI ${dni}:`, error);
        return throwError(() => new Error('No se pudieron obtener los préstamos. Inténtelo más tarde.'));
      })
    );
  }
}
