import { HttpClient } from '@angular/common/http';
import { Injectable } from '@angular/core';
import { catchError, Observable, of, throwError } from 'rxjs';
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
  return this.http.get<any>(url).pipe(
    catchError((error) => {
      if (error.status === 404) {
        // Maneja el caso de que no se encuentren referencias devolviendo un array vacío y no propagando el error
        return of([]);
      } else {
        // Lanza el error para otros casos
        return throwError(() => error);
      }
    })
  );
}

inactivarReferencia(idRefPersonal: number): Observable<void> {
  const url = `${environment.API_URL}/api/afiliacion/referencia/inactivar/${idRefPersonal}`;
  return this.http.patch<void>(url, {});
}

agregarReferencias(idPersona: number, referencias: any[]): Observable<any> {
  const url = `${environment.API_URL}/api/afiliacion/agregar-referencias/${idPersona}`;
  return this.http.post<any>(url, referencias);
}

asignarBancosAPersona(idPersona: number, bancos: any[]): Observable<any> {
  const url = `${environment.API_URL}/api/afiliacion/asignar-bancos/${idPersona}`;
  return this.http.post<any>(url, bancos).pipe(
    catchError(error => {
      console.error('Error asignando bancos a persona:', error);
      return throwError(() => new Error('Error al asignar bancos'));
    })
  );
}

}
