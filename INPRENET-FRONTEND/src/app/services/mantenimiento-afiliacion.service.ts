import { HttpClient } from '@angular/common/http';
import { Injectable } from '@angular/core';
import { Observable } from 'rxjs';
import { environment } from 'src/environments/environment';

@Injectable({
  providedIn: 'root'
})
export class MantenimientoAfiliacionService {

  constructor(private http: HttpClient) { }

  // Métodos para Discapacidades

  getAllDiscapacidades(): Observable<any[]> {
    const url = `${environment.API_URL}/api/mantenimiento-afiliacion/discapacidades/listar`;
    return this.http.get<any[]>(url);
  }

  getDiscapacidadById(id: number): Observable<any> {
    const url = `${environment.API_URL}/api/mantenimiento-afiliacion/discapacidades/detalle/${id}`;
    return this.http.get<any>(url);
  }

  createDiscapacidad(datos: any): Observable<any> {
    const url = `${environment.API_URL}/api/mantenimiento-afiliacion/discapacidades/crear`;
    return this.http.post<any>(url, datos);
  }

  updateDiscapacidad(id: number, datos: any): Observable<any> {
    const url = `${environment.API_URL}/api/mantenimiento-afiliacion/discapacidades/actualizar/${id}`;
    return this.http.put<any>(url, datos);
  }

  // Métodos para Profesiones

  getAllProfesiones(): Observable<any[]> {
    const url = `${environment.API_URL}/api/mantenimiento-afiliacion/profesiones/listar`;
    return this.http.get<any[]>(url);
  }

  getProfesionById(id: number): Observable<any> {
    const url = `${environment.API_URL}/api/mantenimiento-afiliacion/profesiones/detalle/${id}`;
    return this.http.get<any>(url);
  }

  createProfesion(datos: any): Observable<any> {
    const url = `${environment.API_URL}/api/mantenimiento-afiliacion/profesiones/crear`;
    return this.http.post<any>(url, datos);
  }

  updateProfesion(id: number, datos: any): Observable<any> {
    const url = `${environment.API_URL}/api/mantenimiento-afiliacion/profesiones/actualizar/${id}`;
    return this.http.put<any>(url, datos);
  }

  // Métodos para Colegios Magisteriales

  getAllColegios(): Observable<any[]> {
    const url = `${environment.API_URL}/api/mantenimiento-afiliacion/colegios/listar`;
    return this.http.get<any[]>(url);
  }

  getColegioById(id: number): Observable<any> {
    const url = `${environment.API_URL}/api/mantenimiento-afiliacion/colegios/detalle/${id}`;
    return this.http.get<any>(url);
  }

  createColegio(datos: any): Observable<any> {
    const url = `${environment.API_URL}/api/mantenimiento-afiliacion/colegios/crear`;
    return this.http.post<any>(url, datos);
  }

  updateColegio(id: number, datos: any): Observable<any> {
    const url = `${environment.API_URL}/api/mantenimiento-afiliacion/colegios/actualizar/${id}`;
    return this.http.put<any>(url, datos);
  }

  // Métodos para Bancos

  getAllBancos(): Observable<any[]> {
    const url = `${environment.API_URL}/api/mantenimiento-afiliacion/bancos/listar`;
    return this.http.get<any[]>(url);
  }

  getBancoById(id: number): Observable<any> {
    const url = `${environment.API_URL}/api/mantenimiento-afiliacion/bancos/detalle/${id}`;
    return this.http.get<any>(url);
  }

  createBanco(datos: any): Observable<any> {
    const url = `${environment.API_URL}/api/mantenimiento-afiliacion/bancos/crear`;
    return this.http.post<any>(url, datos);
  }

  updateBanco(id: number, datos: any): Observable<any> {
    const url = `${environment.API_URL}/api/mantenimiento-afiliacion/bancos/actualizar/${id}`;
    return this.http.put<any>(url, datos);
  }

  // Métodos para Jornadas

  getAllJornadas(): Observable<any[]> {
    const url = `${environment.API_URL}/api/mantenimiento-afiliacion/jornadas/listar`;
    return this.http.get<any[]>(url);
  }

  getJornadaById(id: number): Observable<any> {
    const url = `${environment.API_URL}/api/mantenimiento-afiliacion/jornadas/detalle/${id}`;
    return this.http.get<any>(url);
  }

  createJornada(datos: any): Observable<any> {
    const url = `${environment.API_URL}/api/mantenimiento-afiliacion/jornadas/crear`;
    return this.http.post<any>(url, datos);
  }

  updateJornada(id: number, datos: any): Observable<any> {
    const url = `${environment.API_URL}/api/mantenimiento-afiliacion/jornadas/actualizar/${id}`;
    return this.http.put<any>(url, datos);
  }

  // Métodos para Niveles Educativos

  getAllNivelesEducativos(): Observable<any[]> {
    const url = `${environment.API_URL}/api/mantenimiento-afiliacion/niveles-educativos/listar`;
    return this.http.get<any[]>(url);
  }

  getNivelEducativoById(id: number): Observable<any> {
    const url = `${environment.API_URL}/api/mantenimiento-afiliacion/niveles-educativos/detalle/${id}`;
    return this.http.get<any>(url);
  }

  createNivelEducativo(datos: any): Observable<any> {
    const url = `${environment.API_URL}/api/mantenimiento-afiliacion/niveles-educativos/crear`;
    return this.http.post<any>(url, datos);
  }

  updateNivelEducativo(id: number, datos: any): Observable<any> {
    const url = `${environment.API_URL}/api/mantenimiento-afiliacion/niveles-educativos/actualizar/${id}`;
    return this.http.put<any>(url, datos);
  }
}
