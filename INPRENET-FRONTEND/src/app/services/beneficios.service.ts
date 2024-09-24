import { HttpClient, HttpErrorResponse, HttpParams } from '@angular/common/http';
import { Injectable } from '@angular/core';
import { Observable, Subject, catchError, map, tap, throwError } from 'rxjs';
import { environment } from 'src/environments/environment';
import { ToastrService } from 'ngx-toastr';

@Injectable({
  providedIn: 'root'
})
export class BeneficiosService {
  private _refresh$ = new Subject<void>();

  constructor(private toastr: ToastrService, private http: HttpClient) {
  }

  verificarSiEsAfiliado(dni: string): Observable<boolean> {
    return this.http.get<boolean>(`${environment.API_URL}/api/beneficio-planilla/verificar-afiliado/${dni}`)
      .pipe(
        catchError((error: HttpErrorResponse) => {
          console.error('Error al verificar afiliado', error);
          return throwError(() => new Error('Error al verificar si la persona es afiliado'));
        })
      );
  }

  insertarDetallePagoBeneficio(data: {
    id_persona: number,
    id_causante: number,
    id_detalle_persona: number,
    id_beneficio: number,
    id_planilla: number,
    monto_a_pagar: number
  }): Observable<any> {
    return this.http.post(`${environment.API_URL}/api/beneficio-planilla/insertar-detalle-pago-beneficio`, data)
      .pipe(
        catchError((error: HttpErrorResponse) => {
          console.error('Error al insertar detalle del pago del beneficio', error);
          this.toastr.error('Error al insertar detalle del pago del beneficio');
          return throwError(() => new Error('Error al insertar detalle del pago del beneficio'));
        })
      );
  }

  obtenerDetallePagoConPlanilla(n_identificacion: string, causante_identificacion: string, id_beneficio: number): Observable<any> {
    const params = new HttpParams()
      .set('n_identificacion', n_identificacion)
      .set('causante_identificacion', causante_identificacion)
      .set('id_beneficio', id_beneficio);
    return this.http.get(`${environment.API_URL}/api/beneficio-planilla/detalle-pago`, { params })
      .pipe(
        catchError((error: HttpErrorResponse) => {
          const errorMessage = error.error.mensaje || 'Error al obtener detalle de pago';
          return throwError(() => new Error(errorMessage));
        })
      );
  }

  obtenerCausantesYBeneficios(dni: string): Observable<any> {
    return this.http.get(`${environment.API_URL}/api/beneficio-planilla/causante/${dni}`)
      .pipe(
        catchError((error: HttpErrorResponse) => {
          console.error('Error al obtener causantes y beneficios', error);
          this.toastr.error('Error al obtener causantes y beneficios');
          return throwError(() => new Error('Error al obtener causantes y beneficios'));
        })
      );
  }

  actualizarEstado(idPlanilla: string, nuevoEstado: string): Observable<any> {
    return this.http.patch(`${environment.API_URL}/api/beneficio-planilla/actualizar-estado/${idPlanilla}`, { nuevoEstado })
      .pipe(
        catchError(error => {
          console.error('Error al actualizar el estado', error);
          return throwError(() => new Error('Error al actualizar el estado'));
        })
      );
  }

  actualizarBeneficiosPlanillas(detalles: { idBeneficioPlanilla: string; codigoPlanilla: string; estado: string }[]): Observable<any> {
    const url = `${environment.API_URL}/api/beneficio-planilla/actualizar-beneficio-planilla`; // Asegúrate de reemplazar 'ruta-del-endpoint' con la ruta real del endpoint
    return this.http.patch(url, detalles).pipe(
      tap(() => {
        this.toastr.success('Beneficios ingresados correctamente');
      }),
      catchError(this.handleError.bind(this))
    );
  }

  obtenerTotalBeneficiosPorPlanilla(idPlanilla: string): Observable<any> {
    return this.http.get(`${environment.API_URL}/api/beneficio-planilla/total-beneficios/${idPlanilla}`).pipe(
      tap(() => {
        this.toastr.success('Total de beneficios obtenido con éxito');
      }),
      /*  catchError(this.handleError) */
    );
  }


  GetAllBeneficios(dni: string): Observable<any> {
    return this.http.get(`${environment.API_URL}/api/beneficio-planilla/obtenerTodosBeneficios/${dni}`).pipe(
      tap(() => {
        /* this.toastr.success('Total de beneficios obtenido con éxito'); */
      }),
      /* catchError(this.handleError) */
    );
  }


  obtenerDetallesOrdinariaBeneficioPorAfil(idAfiliado: string, fechaInicio: string, fechaFin: string): Observable<any> {
    // Construir los parámetros de la solicitud HTTP
    const params = new HttpParams()
      .set('idAfiliado', idAfiliado)
      .set('fechaInicio', fechaInicio)
      .set('fechaFin', fechaFin);

    // Realizar la solicitud GET
    return this.http.get<any>(`${environment.API_URL}/api/beneficio-planilla/rango-beneficios`, { params }).pipe(
      tap(() => {
        this._refresh$.next();
      }),
      catchError(error => {
        this.toastr.error('Hubo un error al obtener los detalles de los beneficios', 'Error');
        return throwError(() => new Error('Error al obtener los detalles de los beneficios'));
      })
    );
  }

  obtenerTipoBeneficioByTipoPersona(tipoPers: string): Observable<any> {

    return this.http.get<any>(
      `${environment.API_URL}/api/beneficio-planilla/obtenerTipoBeneficioByTipoPersona/${tipoPers}`,
    )
  }

  obtenerDetallesBeneficioComplePorAfiliado(idAfiliado: string): Observable<any> {
    const params = new HttpParams().set('idAfiliado', idAfiliado);
    return this.http.get<any>(`${environment.API_URL}/api/beneficio-planilla/detallesBene-complementaria-afiliado`, { params }).pipe(
      tap(() => {
        this._refresh$.next();
      }),
      /* catchError(this.handleError) */
    );
  }

  obtenerDetallesExtraordinariaPorAfil(idAfiliado: string): Observable<any> {
    const url = `${environment.API_URL}/api/beneficio-planilla/inconsistencias/${idAfiliado}`;
    return this.http.get<any>(url).pipe(
      tap(() => {
        this._refresh$.next();
      }),
      catchError(error => {
        this.toastr.error('Error al obtener los beneficios inconsistentes');
        return throwError(() => new Error('Error al obtener los beneficios inconsistentes'));
      })
    );
  }

  get refresh$() {
    return this._refresh$;
  }

  /*   private handlerError2(err:any): Observable<never>{
      let errorMessage = 'An error ocurred retrieving data';
      if(err){
        errorMessage = `Error: ${err.error.err.err.sqlMessage}`;
      }
      this.toastr.error(`${errorMessage}`, 'Error');
      return throwError(errorMessage);
    } */

  newTipoBeneficio(TipoBeneficioData: TipoBeneficio): Observable<TipoBeneficio | void> {
    var url = `${environment.API_URL}/api/beneficio/createTipoBeneficio`;
    return this.http.post<TipoBeneficio>(
      url,
      TipoBeneficioData,
    ).pipe(
      map((res: any) => {
        return res;
      })
    )
  }

  getTipoBeneficio(): Observable<any> {
    var url = `${environment.API_URL}/api/beneficio/obtenerTiposBeneficios`;

    return this.http.get(url,
    ).pipe(
      map((res: any) => {
        return res;
      }),
    );
  }

  asigBeneficioAfil(datos: TipoBeneficio, itemSeleccionado: any, idAfiliadoPadre?: string): Observable<any> {
    if (idAfiliadoPadre) {
      var url = `${environment.API_URL}/api/beneficio-planilla/nuevoDetalle/${idAfiliadoPadre}`;
    } else {
      var url = `${environment.API_URL}/api/beneficio-planilla/nuevoDetalle`;
    }

    return this.http.post<TipoBeneficio>(
      url,
      { datos, itemSeleccionado },
    ).pipe(
      map((res: any) => {
        return res;
      })
    )
  }

  updateBeneficio(id: string, beneficioData: any): Observable<any> {
    return this.http.patch(`${environment.API_URL}/api/beneficio/${id}`, beneficioData);
  }

  cargarBeneficiosRecient(): Observable<TipoBeneficio | void> {
    var url = `${environment.API_URL}/api/beneficio-planilla/cargarDetBen`;
    return this.http.get<any>(
      url,
    ).pipe(
      map((res: any) => {
        return res;
      })
    )
  }

  eliminarBenPlan(data: any): Observable<TipoBeneficio | void> {
    return this.http.patch<any>(
      `${environment.API_URL}/api/beneficio-planilla/eliminar-ben-plan`,
      { data }
    ).pipe(
      map((res: any) => {
        return res;
      })
    )
  }

  private handleError(error: HttpErrorResponse) {
    // Maneja el error como prefieras, por ejemplo, mostrando una notificación
    this.toastr.error(error.message, 'Error');
    return throwError(() => new Error(error.message));
  }

}

interface TipoBeneficio {
  nombre_beneficio: string;
  descripcion_beneficio: string;
  numero_rentas_max: number;
  estado: string;
}
