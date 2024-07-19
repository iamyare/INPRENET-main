import { HttpClient } from '@angular/common/http';
import { Injectable } from '@angular/core';
import { Observable } from 'rxjs';
import { environment } from 'src/environments/environment';

@Injectable({
  providedIn: 'root'
})
export class AfiliacionService {

constructor(private http: HttpClient) { }

crearAfiliacion(datos: any, fotoPerfil: File): Observable<any> {
  const url = `${environment.API_URL}/api/afiliacion/crear`;
  const formData: FormData = new FormData();
  formData.append('datos', JSON.stringify(datos));
  formData.append('foto_perfil', fotoPerfil);

  return this.http.post<any>(url, formData);
}

getAllDiscapacidades(): Observable<any[]> {
  const url = `${environment.API_URL}/api/afiliacion/discapacidades`;
  return this.http.get<any[]>(url);
}

obtenerReferenciasPorIdentificacion(nIdentificacion: string): Observable<any> {
  const url = `${environment.API_URL}/api/afiliacion/referencias/${nIdentificacion}`;
  return this.http.get<any>(url);
}

inactivarReferencia(idRefPersonal: number): Observable<void> {
  const url = `${environment.API_URL}/api/afiliacion/referencia/inactivar/${idRefPersonal}`;
  return this.http.patch<void>(url, {});
}

agregarReferencias(idPersona: number, referencias: any[]): Observable<any> {
  const url = `${environment.API_URL}/api/afiliacion/agregar-referencias/${idPersona}`;
  return this.http.post<any>(url, referencias);
}

}
