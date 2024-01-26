import { Injectable } from '@angular/core';
import { HttpClient, HttpErrorResponse } from '@angular/common/http';
import { Observable, catchError, map, tap, throwError } from 'rxjs';
import { environment } from 'src/environments/environment';

/* Pendiente */
interface TipoDeduccion {
  nombre_beneficio: string;
  descripcion_beneficio: string;
  estado: string;
  prioridad?: any;
  anio_duracion: number;
  mes_duracion: number;
  dia_duracion: number;
  periodoInicio: string;
}

@Injectable({
  providedIn: 'root'
})
export class DeduccionesService {

  constructor(private http: HttpClient) { }

  newTipoDeduccion(TipoDeduccion:any): Observable<any | void>{
    var url = `${environment.API_URL}/api/deduccion`;
    return this.http.post<any>(
      url,
      TipoDeduccion,
      ).pipe(
        map((res:any) => {
          return res;
        })
      )
  }

  /* getDetalleDeduccion(): Observable<any> {
    return this.http.get<any>(this.baseUrl + 'detalle-deduccion');
  } */

  getDeducciones(): Observable<any>{
    var url= `${environment.API_URL}/api/deduccion`;

    return this.http.get(url,
      ).pipe(
        map((res:any) => {
          return res;
        }),
      );
  }

  getDetalleDeduccion(): Observable<any>{
    var url= `${environment.API_URL}/api/deduccion`;

    return this.http.get(url,
      ).pipe(
        map((res:any) => {
          return res;
        }),
      );
  }

  getDetallesCompletos(): Observable<any> {
    const url = `${environment.API_URL}/api/detalle-deduccion/detalles-completos`;
    return this.http.get<any>(url);
  }

  createDetalleDeduccion(detalleDeduccion: any): Observable<any> {
    const url = `${environment.API_URL}/api/detalle-deduccion`;
    return this.http.post<any>(url, detalleDeduccion);
  }

  updateDeduccion(id: string, deduccionData: any): Observable<any> {
    return this.http.patch(`${environment.API_URL}/api/deduccion/${id}`, deduccionData);
  }

  uploadDetalleDeduccion(file: File): Observable<any> {
    const formData: FormData = new FormData();
    formData.append('excel', file, file.name);

    const url = `${environment.API_URL}/api/detalle-deduccion/upload`;

    return this.http.post<any>(url, formData).pipe(
      tap(res => console.log('Server Response:', res)),
      catchError(this.handleError)
    );
  }

  private handleError(error: HttpErrorResponse) {
    // Aquí podrías manejar mejor el error, por ejemplo, mostrando un mensaje al usuario.
    console.error('An error occurred:', error.error);
    return throwError(() => new Error('Something bad happened; please try again later.'));
  }
}
