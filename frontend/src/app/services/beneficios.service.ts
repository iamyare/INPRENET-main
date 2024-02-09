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

  findInconsistentBeneficiosByAfiliado(idAfiliado: string): Observable<any> {
    const url = `${environment.API_URL}/beneficio-planilla/inconsistencias/${idAfiliado}`;
    return this.http.get<any>(url).pipe(
      tap(data => console.log('Inconsistent Beneficios: ', data)),
      catchError(error => {
        this.toastr.error('Error al obtener los beneficios inconsistentes');
        return throwError(() => new Error('Error al obtener los beneficios inconsistentes'));
      })
    );
  }

  // Método para consumir findByDateRange
  findByDateRange(fechaInicio: string, fechaFin: string, idAfiliado: string): Observable<any> {
    const params = new HttpParams()
      .set('fechaInicio', fechaInicio)
      .set('fechaFin', fechaFin);
    const url = `${environment.API_URL}/beneficio-planilla/por-rango-fecha/${idAfiliado}`;
    return this.http.get<any>(url, { params }).pipe(
      tap(data => console.log('Beneficios por rango de fechas: ', data)),
      catchError(error => {
        this.toastr.error('Error al obtener los beneficios por rango de fechas');
        return throwError(() => new Error('Error al obtener los beneficios por rango de fechas'));
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
