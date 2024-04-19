import { HttpClient } from '@angular/common/http';
import { Injectable } from '@angular/core';
import { Observable, map } from 'rxjs';
import { environment } from 'src/environments/environment';

@Injectable({
  providedIn: 'root'
})
export class DireccionService {

  constructor(private http: HttpClient) { }

  getAllProvincias(): Observable<any | void> {
    const url = `${environment.API_URL}/api/direccion/provincias`;
    return this.http.get<any>(
      url,
      ).pipe(
        map((res:any) => {
          return res;
        })
      );
  }
  getAllPaises(): Observable<any | void> {
    const url = `${environment.API_URL}/api/pais`;
    return this.http.get<any>(
      url,
      ).pipe(
        map((res:any) => {
          return res;
        })
      );
  }
  getAllCiudades(): Observable<any | void> {
    const url = `${environment.API_URL}/api/municipio`;
    return this.http.get<any>(
      url,
      ).pipe(
        map((res:any) => {
          return res;
        })
      );
  }

  getMunicipiosPorDepartamentoId(departamentoId: number): Observable<any> {
    const url = `${environment.API_URL}/api/municipio/departamento/${departamentoId}`;
    return this.http.get<any>(url);
  }

  getDepartamentosPorPaisId(paisId: number): Observable<any> {
    const url = `${environment.API_URL}/api/departamento/pais/${paisId}`;
    return this.http.get<any>(url);
  }
}
