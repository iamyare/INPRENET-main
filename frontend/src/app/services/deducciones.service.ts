import { Injectable } from '@angular/core';
import { HttpClient, HttpErrorResponse, HttpParams } from '@angular/common/http';
import { Observable, catchError, map, tap, throwError } from 'rxjs';
import { environment } from 'src/environments/environment';
import { ToastrService } from 'ngx-toastr';

@Injectable({
  providedIn: 'root'
})
export class DeduccionesService {

  constructor(private toastr: ToastrService ,private http: HttpClient) { }

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

      ingresarDeduccionPlanilla(detalles: { idDedDeduccion: string; codigoPlanilla: string; estadoAplicacion: string }[]): Observable<any> {
        const url = `${environment.API_URL}/api/detalle-deduccion/actualizar-deduccion-planilla`; // Asegúrate de usar la URL correcta
        return this.http.patch(url, detalles).pipe(
          tap(() => {
            this.toastr.success('Deducciones ingresadas correctamente');
          }),
          catchError(this.handleError)
        );
      }



      obtenerDetallesDeduccionComplePorAfiliado(idAfiliado: string): Observable<any> {
        const params = new HttpParams().set('idAfiliado', idAfiliado);
        return this.http.get<any>(`${environment.API_URL}/api/detalle-deduccion/detallesDeducc-complementaria-afiliado`, { params }).pipe(
          catchError(this.handleError)
        );
      }

      getDetalleDeduccionesPorRango(idAfiliado: string, fechaInicio: string, fechaFin: string): Observable<any> {
        // Configurar los parámetros
        let params = new HttpParams()
          .set('idAfiliado', idAfiliado)
          .set('fechaInicio', fechaInicio)
          .set('fechaFin', fechaFin);

        return this.http.get<any>(`${environment.API_URL}/api/detalle-deduccion/rango-deducciones`, { params }).pipe(
          catchError(this.handleError)
        );
      }

      findInconsistentDeduccionesByAfiliado(idAfiliado: string): Observable<any> {
        const url = `${environment.API_URL}/api/detalle-deduccion/inconsistencias/${idAfiliado}`;

        return this.http.get<any>(url).pipe(
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
