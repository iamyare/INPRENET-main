import { HttpClient } from '@angular/common/http';
import { Injectable } from '@angular/core';
import { catchError, Observable, throwError } from 'rxjs';
import { environment } from 'src/environments/environment';

@Injectable({
  providedIn: 'root'
})
export class ConasaService {

  private readonly baseUrl = `${environment.API_URL}/api/conasa`;

  constructor(private http: HttpClient) { }

  obtenerCategorias(): Observable<any> {
    const url = `${this.baseUrl}/categorias`;
    return this.http.get<any>(url).pipe(
      catchError((error) => {
        console.error('Error al obtener las categorías', error);
        return throwError(error);
      })
    );
  }

  obtenerPlanes(): Observable<any> {
    const url = `${this.baseUrl}/planes`;
    return this.http.get<any>(url).pipe(
      catchError((error) => {
        console.error('Error al obtener los planes', error);
        return throwError(error);
      })
    );
  }

  manejarTransaccion(
    contratoData: {
      idPersona: number;
      idPlan: number;
      lugarCobro: string;
      fechaInicioContrato: string;
      fechaCancelacionContrato?: string;
    },
    beneficiariosData?: any[]
  ): Observable<string> {
    const url = `${this.baseUrl}/manejar-transaccion`;
    const payload = { contratoData, beneficiariosData };
    return this.http.post<string>(url, payload).pipe(
      catchError((error) => {
        console.error('Error al manejar la transacción', error);
        return throwError(error);
      })
    );
  }

  obtenerContratoYBeneficiariosPorDNI(dni: string): Observable<any> {
    const url = `${this.baseUrl}/titular/${dni}`;
    return this.http.get<any>(url).pipe(
      catchError((error) => {
        console.error(`Error al obtener contrato y beneficiarios para el DNI: ${dni}`, error);
        return throwError(error);
      })
    );
  }
  
}
