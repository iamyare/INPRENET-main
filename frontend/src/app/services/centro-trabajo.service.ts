import { Injectable } from '@angular/core';
import { Router } from '@angular/router';
import { Observable } from 'rxjs';
import { environment } from 'src/environments/environment';
import { HttpClient, HttpHeaders } from '@angular/common/http';

@Injectable({
  providedIn: 'root'
})
export class CentroTrabajoService {

  constructor(private http: HttpClient, private router: Router) { }

  actualizarEmpleado(id: number, datos: any, archivos: { archivoIdentificacion?: File; fotoEmpleado?: File }): Observable<any> {
    const formData = new FormData();
    formData.append('nombreEmpleado', datos.nombreEmpleado);
    formData.append('correo_1', datos.correo_1);
    formData.append('estado', datos.estado);
    formData.append('nombrePuesto', datos.nombrePuesto);
    formData.append('telefono_1', datos.telefono_1);
    formData.append('telefono_2', datos.telefono_2);
    formData.append('numero_identificacion', datos.numero_identificacion);

    if (archivos.archivoIdentificacion) {
      formData.append('archivoIdentificacion', archivos.archivoIdentificacion);
    }
    if (archivos.fotoEmpleado) {
      formData.append('fotoEmpleado', archivos.fotoEmpleado);
    }

    return this.http.put(`${environment.API_URL}/api/centro-trabajo/actualizar/${id}`, formData);
  }


  obtenerCentrosTrabajoTipoE(): Observable<any[]> {
    const url = `${environment.API_URL}/api/centro-trabajo/tipo-e`;
    return this.http.get<any[]>(url);
  }

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


  findBy(content: string): Observable<any> {
    const url = `${environment.API_URL}/api/centro-trabajo/findBy/${content}`;
    return this.http.get<any[]>(url);
  }

  getCentroTrabajoById(id: number): Observable<any> {
    const url = `${environment.API_URL}/api/centro-trabajo/${id}`;
    return this.http.get<any>(url);
  }

  getAllCentrosTrabajo(): Observable<any> {
    const url = `${environment.API_URL}/api/transacciones/getAllCentrosTrabajo`;
    return this.http.get<any[]>(url);
  }

  getAllReferenciasByCentro(idCentro: number): Observable<any> {
    const url = `${environment.API_URL}/api/centro-trabajo/getAllReferenciasByCentro/${idCentro}`;
    return this.http.get<any[]>(url);
  }
}
