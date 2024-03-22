import { Injectable } from '@angular/core';
import { Router } from '@angular/router';
import { map, Observable } from 'rxjs';
import { environment } from 'src/environments/environment';
import { HttpClient } from '@angular/common/http';

@Injectable({
  providedIn: 'root'
})
export class CentroTrabajoService {

  constructor(private http: HttpClient, private router: Router) { }

  getCentrosTrabajo(): Observable<any | void> {
    const url = `${environment.API_URL}/centrosTrabajo`;
    return this.http.get<any>(
      url,
    ).pipe(
      map((res: any) => {
        return res;
      })
    );
  }

  agregarCentroTrabajo(nuevoCentro: any): Observable<any> {
    const url = `${environment.API_URL}/centrosTrabajo/nuevoCentro`;
    return this.http.post<any>(url, nuevoCentro);
  }

  buscarCentroTrabajoPorNombre(nombre: string): Observable<any> {
    const url = `${environment.API_URL}/centrosTrabajo/obtenerCentro`;
    return this.http.post<any>(url, { nombre });
  }
}
