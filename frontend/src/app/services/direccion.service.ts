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
    const url = `${environment.API_URL}/direccion/provincias`;
    return this.http.get<any>(
      url,
      ).pipe(
        map((res:any) => {
          return res;
        })
      );
  }
  getAllPaises(): Observable<any | void> {
    const url = `${environment.API_URL}/direccion/paises`;
    return this.http.get<any>(
      url,
      ).pipe(
        map((res:any) => {
          return res;
        })
      );
  }
  getAllCiudades(): Observable<any | void> {
    const url = `${environment.API_URL}/direccion/ciudades`;
    return this.http.get<any>(
      url,
      ).pipe(
        map((res:any) => {
          return res;
        })
      );
  }
}
