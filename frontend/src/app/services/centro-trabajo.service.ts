import { Injectable } from '@angular/core';
import { Router } from '@angular/router';
import {Observable } from 'rxjs';
import { environment } from 'src/environments/environment';
import { HttpClient } from '@angular/common/http';

@Injectable({
  providedIn: 'root'
})
export class CentroTrabajoService {

  constructor(private http: HttpClient, private router: Router) { }

  obtenerTodasLasProfesiones(): Observable<any[]> {
    const url = `${environment.API_URL}/api/transacciones/profesiones`;
    return this.http.get<any[]>(url);
  }

  obtenerTodosLosCentrosTrabajo(): Observable<any[]> {
    const url = `${environment.API_URL}/api/centro-trabajo`;
    return this.http.get<any>(url);
  }

  obtenerTodosLosCentrosTrabajoPrivados(): Observable<any[]> {
    const url = `${environment.API_URL}/api/centro-trabajo/Privados`;
    return this.http.get<any[]>(url);
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
