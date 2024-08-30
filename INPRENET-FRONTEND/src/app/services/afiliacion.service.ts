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
        return of([]);
      } else {
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

asignarCentrosTrabajoAPersona(idPersona: number, centrosTrabajo: any[]): Observable<any> {
  const url = `${environment.API_URL}/api/afiliacion/asignar-centros-trabajo/${idPersona}`;
  return this.http.post<any>(url, centrosTrabajo).pipe(
    catchError(error => {
      console.error('Error asignando centros de trabajo a persona:', error);
      return throwError(() => new Error('Error al asignar centros de trabajo'));
    })
  );
}

asignarColegiosAPersona(idPersona: number, colegios: any[]): Observable<any> {
  const url = `${environment.API_URL}/api/afiliacion/asignar-colegios/${idPersona}`;
  return this.http.post<any>(url, colegios).pipe(
    catchError(error => {
      console.error('Error asignando colegios magisteriales a persona:', error);
      return throwError(() => new Error('Error al asignar colegios magisteriales'));
    })
  );
}

asignarFuentesIngresoAPersona(idPersona: number, fuentesIngreso: any[]): Observable<any> {
  const url = `${environment.API_URL}/api/afiliacion/asignar-fuentes-ingreso/${idPersona}`;
  return this.http.post<any>(url, fuentesIngreso).pipe(
    catchError(error => {
      console.error('Error asignando fuentes de ingreso a persona:', error);
      return throwError(() => new Error('Error al asignar fuentes de ingreso'));
    })
  );
}

asignarBeneficiariosAPersona(idPersona: number, idDetallePersona: number, beneficiarios: any[]): Observable<any> {
  const url = `${environment.API_URL}/api/afiliacion/asignar-beneficiarios/${idPersona}/${idDetallePersona}`;
  return this.http.post<any>(url, beneficiarios).pipe(
    catchError(error => {
      console.error('Error asignando beneficiarios a persona:', error);
      return throwError(() => new Error('Error al asignar beneficiarios'));
    })
  );
}

}
