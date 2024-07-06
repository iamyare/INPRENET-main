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

  crearDesdeExcel(data: any): Observable<any> {
    return this.http.post(`${environment.API_URL}/api/detalle-deduccion/crearDeExcel`, data);
  }

  actualizarEstadoDeduccion(idPlanilla: string, nuevoEstado: string): Observable<any> {
    return this.http.patch(`${environment.API_URL}/api/detalle-deduccion/actualizar-estado/${idPlanilla}`, { nuevoEstado })
      .pipe(
        tap(_ => this.toastr.success('Estado de deducción actualizado con éxito')),
        catchError(error => {
          console.error('Error al actualizar el estado de la deducción', error);
          this.toastr.error('Error al actualizar el estado de la deducción');
          return throwError(() => new Error('Error al actualizar el estado de la deducción'));
        })
      );
  }

  obtenerTotalDeduccionesPorPlanilla(idPlanilla: string): Observable<any> {
    return this.http.get(`${environment.API_URL}api/detalle-deduccion/total-deducciones/${idPlanilla}`).pipe(
      tap(() => {
        this.toastr.success('Total de beneficios obtenido con éxito');
      }),
      catchError(this.handleError)
    );
  }

  buscarDeduccionesPorDni(dni: string): Observable<any> {
    return this.http.get(`${environment.API_URL}/api/detalle-deduccion/por-dni/${dni}`).pipe(
      catchError(this.handleError)
    );
  }

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

      newDeduccionTipoPlanilla(TipoDeduccion:any): Observable<any | void>{
        var url = `${environment.API_URL}/api/deduccion/dedTipoPLanilla`;
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

  getDeducciones(): Observable<any>{
    var url= `${environment.API_URL}/api/deduccion`;

    return this.http.get(url,
      ).pipe(
        map((res:any) => {
          return res;
        }),
        );
  }

  getDeduccionesByEmpresa(nombre_institucion:string): Observable<any>{
    var url= `${environment.API_URL}/api/deduccion/byNameInst/${nombre_institucion}`;

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
