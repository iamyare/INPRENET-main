import { HttpClient } from '@angular/common/http';
import { Injectable } from '@angular/core';
import { catchError, Observable, of, throwError } from 'rxjs';
import { environment } from 'src/environments/environment';

@Injectable({
  providedIn: 'root'
})
export class AfiliacionService {

  constructor(private http: HttpClient) { }

  buscarPersonaPorNombresYApellidos(terminos: string): Observable<any> {
    const url = `${environment.API_URL}/api/afiliacion/buscar-por-nombres-apellidos`;
    return this.http.get<any>(url, { params: { terminos } }).pipe(
      catchError((error) => {
        console.error('Error al buscar personas por nombres y apellidos', error);
        return throwError(error);
      })
    );
  }

  eliminarCargoPublico(idCargoPublico: number): Observable<void> {
    const url = `${environment.API_URL}/api/afiliacion/cargos-publicos/${idCargoPublico}`;
    return this.http.delete<void>(url).pipe(
      catchError((error) => {
        console.error('Error al eliminar el cargo público', error);
        return throwError(error);
      })
    );
  }

  crearDiscapacidades(idPersona: number, discapacidades: any): Observable<void> {
    const url = `${environment.API_URL}/api/afiliacion/${idPersona}/discapacidades`;
    return this.http.post<void>(url, discapacidades).pipe(
      catchError((error) => {
        console.error('Error al crear discapacidades', error);
        return throwError(error);
      })
    );
  }

  eliminarDiscapacidad(idPersona: number, tipoDiscapacidad: string): Observable<void> {
    const url = `${environment.API_URL}/api/afiliacion/${idPersona}/discapacidades/${tipoDiscapacidad}`;
    return this.http.delete<void>(url).pipe(
      catchError((error) => {
        console.error('Error al eliminar la discapacidad', error);
        return throwError(error);
      })
    );
  }

  actualizarPeps(pepsData: any[]): Observable<any> {
    const url = `${environment.API_URL}/api/afiliacion/actualizar-peps`;
    return this.http.put<any>(url, pepsData).pipe(
      catchError((error) => {
        console.error('Error al actualizar los PEPs', error);
        return throwError(error);
      })
    );
  }

  eliminarFamiliar(idPersona: number, idFamiliar: number): Observable<any> {
    const url = `${environment.API_URL}/api/afiliacion/${idPersona}/familiares/${idFamiliar}`;
    return this.http.delete<any>(url).pipe(
      catchError((error) => {
        console.error('Error al eliminar el familiar', error);
        return throwError(error);
      })
    );
  }

  obtenerFamiliares(idPersona: number): Observable<any> {
    const url = `${environment.API_URL}/api/afiliacion/${idPersona}/familiares`;
    return this.http.get<any>(url).pipe(
      catchError((error) => {
        console.error('Error al obtener los familiares', error);
        return throwError(error);
      })
    );
  }

  crearPeps(idPersona: number, pepsData: any[]): Observable<any> {
    const url = `${environment.API_URL}/api/afiliacion/persona/${idPersona}/peps`;
    return this.http.post<any>(url, pepsData).pipe(
      catchError((error) => {
        console.error('Error al crear los PEPs', error);
        return throwError(error);
      })
    );
  }

  crearFamilia(idPersona: number, familiares: any[]): Observable<any> {
    const url = `${environment.API_URL}/api/afiliacion/persona/${idPersona}/familia`;
    return this.http.post<any>(url, familiares).pipe(
      catchError((error) => {
        console.error('Error al crear la familia', error);
        return throwError(error);
      })
    );
  }

  actualizarConyuge(n_identificacion: string, datos: any): Observable<any> {
    const url = `${environment.API_URL}/api/afiliacion/conyuge/${n_identificacion}`;
    return this.http.patch<any>(url, datos).pipe(
      catchError((error) => {
        console.error('Error al actualizar la información del cónyuge', error);
        return throwError(error);
      })
    );
  }

  obtenerConyugePorIdentificacion(n_identificacion: string): Observable<any> {
    const url = `${environment.API_URL}/api/afiliacion/conyuge/${n_identificacion}`;
    return this.http.get<any>(url).pipe(
      catchError((error) => {
        console.error('Error al obtener la información del cónyuge', error);
        return throwError(error);
      })
    );
  }

  eliminarOtraFuenteIngreso(id: number): Observable<any> {
    const url = `${environment.API_URL}/api/afiliacion/otra-fuente-ingreso/${id}`;
    return this.http.delete<any>(url).pipe(
      catchError((error) => {
        console.error('Error al eliminar la fuente de ingreso', error);
        return throwError(error);
      })
    );
  }

  editarOtraFuenteIngreso(id: number, datos: any): Observable<any> {
    const url = `${environment.API_URL}/api/afiliacion/otra-fuente-ingreso/${id}`;
    return this.http.patch<any>(url, datos).pipe(
      catchError((error) => {
        console.error('Error al editar la fuente de ingreso', error);
        return throwError(error);
      })
    );
  }

  crearAfiliacion(datos: any, fotoPerfil: File, fileIden?: File): Observable<any> {
    const url = `${environment.API_URL}/api/afiliacion/crear`;
    const formData: FormData = new FormData();

    formData.append('datos', JSON.stringify(datos));
    formData.append('foto_perfil', fotoPerfil);

    if (fileIden) {
      formData.append('file_ident', fileIden);
    }

    if (datos.beneficiarios) {
      datos.beneficiarios.forEach((persona: any, index: Number) => {
        formData.append(`file_identB[${persona.persona.n_identificacion}]`, persona.persona.archivo_identificacion);
      });
    }

    //return this.http.get<any[]>(url);
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
