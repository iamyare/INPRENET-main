import { HttpClient } from '@angular/common/http';
import { Injectable } from '@angular/core';
import { Router } from '@angular/router';
import { Observable, Subject, map, throwError } from 'rxjs';
import { environment } from 'src/environments/environment';

import { ToastrService } from 'ngx-toastr';

interface TipoBeneficio {
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
export class BeneficiosService {
  private _refresh$ = new Subject<void>();

  constructor(private toastr: ToastrService ,private http: HttpClient, private router: Router) {
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

  updateBeneficio(id: string, beneficioData: any): Observable<any> {
    return this.http.patch(`${environment.API_URL}/api/beneficio/${id}`, beneficioData);
  }

}
