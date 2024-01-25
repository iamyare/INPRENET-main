import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable, map } from 'rxjs';
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

  createDetalleDeduccion(detalleDeduccion: any): Observable<any> {
    const url = `${environment.API_URL}/api/detalle-deduccion`;
    return this.http.post<any>(url, detalleDeduccion);
  }

  updateDeduccion(id: string, deduccionData: any): Observable<any> {
    return this.http.patch(`${environment.API_URL}/api/deduccion/${id}`, deduccionData);
  }
}
