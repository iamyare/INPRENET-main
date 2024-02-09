import { Injectable } from '@angular/core';
import { HttpClient, HttpErrorResponse, HttpParams } from '@angular/common/http';
import { Observable, catchError, map, tap, throwError } from 'rxjs';
import { environment } from 'src/environments/environment';

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

      findByDates(fechaInicio: string, fechaFin: string, idAfiliado: number): Observable<any> {
        const params = new HttpParams()
          .set('fechaInicio', fechaInicio)
          .set('fechaFin', fechaFin)
          .set('idAfiliado', idAfiliado.toString());

        return this.http.get(`${environment.API_URL}/api/detalle-deduccion/por-fecha`, { params }).pipe(
          catchError(this.handleError)
        );
      }


      findInconsistentDeduccionesByAfiliado(idAfiliado: string): Observable<any> {
        const url = `${environment.API_URL}/api/detalle-deduccion/inconsistencias/${idAfiliado}`;

        return this.http.get<any>(url).pipe(
          tap(data => console.log('Inconsistent Deducciones: ', data)),
          catchError(this.handleError)
        );
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

      editDetalleDeduccion(id: string, updateData: any): Observable<any> {
        const url = `${environment.API_URL}/api/detalle-deduccion/${id}/edit`; // Asegúrate de que esta sea la ruta correcta
        return this.http.patch(url, updateData).pipe(
          catchError(this.handleError)
        );
      }

  private handleError(error: HttpErrorResponse) {
    // Aquí podrías manejar mejor el error, por ejemplo, mostrando un mensaje al usuario.
    console.error('An error occurred:', error.error);
    return throwError(() => new Error('Something bad happened; please try again later.'));
  }
}

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
