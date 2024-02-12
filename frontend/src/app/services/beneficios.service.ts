import { HttpClient, HttpParams } from '@angular/common/http';
import { Injectable } from '@angular/core';
import { Router } from '@angular/router';
import { Observable, Subject, catchError, map, tap, throwError } from 'rxjs';
import { environment } from 'src/environments/environment';

import { ToastrService } from 'ngx-toastr';

interface TipoBeneficio {
  nombre_beneficio: string;
  descripcion_beneficio: string;
  numero_rentas_max:number;
  estado: string;
}

@Injectable({
  providedIn: 'root'
})
export class BeneficiosService {
  private _refresh$ = new Subject<void>();

  constructor(private toastr: ToastrService ,private http: HttpClient, private router: Router) {
  }

  obtenerDetallesBeneficio(idAfiliado: string, fechaInicio: string, fechaFin: string): Observable<any> {
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

  findInconsistentBeneficiosByAfiliado(idAfiliado: string): Observable<any> {
    const url = `${environment.API_URL}/api/beneficio-planilla/inconsistencias/${idAfiliado}`;
    return this.http.get<any>(url).pipe(
      tap(data => console.log('Inconsistent Beneficios: ', data)),
      catchError(error => {
        this.toastr.error('Error al obtener los beneficios inconsistentes');
        return throwError(() => new Error('Error al obtener los beneficios inconsistentes'));
      })
    );
  }

  get refresh$(){
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

  newTipoBeneficio(TipoBeneficioData:TipoBeneficio): Observable<TipoBeneficio | void>{
    var url = `${environment.API_URL}/api/beneficio/createTipoBeneficio`;
    return this.http.post<TipoBeneficio>(
      url,
      TipoBeneficioData,
      ).pipe(
        map((res:any) => {
          return res;
        })
      )
  }

  getTipoBeneficio(): Observable<any>{
    var url= `${environment.API_URL}/api/beneficio/obtenerTiposBeneficios`;

    return this.http.get(url,
      ).pipe(
        map((res:any) => {
          return res;
        }),
      );
  }

  asigBeneficioAfil(data:TipoBeneficio): Observable<any>{
    var url= `${environment.API_URL}/api/beneficio-planilla`;

    return this.http.post<TipoBeneficio>(
      url,
      data,
      ).pipe(
        map((res:any) => {
          return res;
        })
      )
  }

  updateBeneficio(id: string, beneficioData: any): Observable<any> {
    return this.http.patch(`${environment.API_URL}/api/beneficio/${id}`, beneficioData);
  }

}
