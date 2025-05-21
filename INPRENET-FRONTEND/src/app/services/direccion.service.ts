import { HttpClient } from '@angular/common/http';
import { Injectable } from '@angular/core';
import { Observable, catchError, map, throwError } from 'rxjs';
import { environment } from 'src/environments/environment';

@Injectable({
  providedIn: 'root'
})
export class DireccionService {

  constructor(private http: HttpClient) { }

  getAldeas(): Observable<any> {
    const url = `${environment.API_URL}/api/municipio/aldeas`;
    return this.http.get<any>(url).pipe(
      map(response => response.map((item:any) => ({
        value: item.id_aldea,
        label: item.nombre_aldea,
        municipio: item.municipio?.nombre_municipio || 'Sin municipio',
        departamento: item.municipio?.departamento?.nombre_departamento || 'Sin departamento',
        estado: item.estado
      }))),

      catchError(error => {
        console.error('Error al obtener las aldeas:', error);
        return throwError(() => new Error('No se pudo obtener la lista de aldeas.'));
      })
    );
}

  getColonias(): Observable<any> {
    const url = `${environment.API_URL}/api/municipio/colonias`;
    return this.http.get<any>(url).pipe(
      map(response => response.map((item:any) => ({
        value: item.id_colonia,
        label: item.nombre_colonia,
        municipio: item.municipio?.nombre_municipio || 'Sin municipio',
        departamento: item.municipio?.departamento?.nombre_departamento || 'Sin departamento',
        estado: item.estado
      }))),

      catchError(error => {
        console.error('Error al obtener las colonias:', error);
        return throwError(() => new Error('No se pudo obtener la lista de colonias.'));
      })
    );
}

    actualizarAldea(idAldea: number, nombre?: string, estado?: 'ACTIVO' | 'INACTIVO', observacion?: string): Observable<any> {
      const url = `${environment.API_URL}/api/municipio/aldea/${idAldea}`;
      const body: any = {};
      
      if (nombre) body.nombre = nombre;
      if (estado) body.estado = estado;
      if (estado === 'INACTIVO' && observacion) {
        body.observacion = observacion;
      }

      return this.http.patch(url, body, { observe: 'response' }).pipe(
        map(response => {
          if (response.status === 204) {
            return { message: 'Aldea actualizada con éxito' };
          }
          return response.body;
        }),
        catchError(error => {
          console.error('Error al actualizar la aldea:', error);
          return throwError(() => new Error('No se pudo actualizar la aldea.'));
        })
      );
    }

    actualizarColonia(idColonia: number, nombre?: string, estado?: 'ACTIVO' | 'INACTIVO', observacion?: string): Observable<any> {
      const url = `${environment.API_URL}/api/municipio/colonia/${idColonia}`;
      const body: any = {};
      
      if (nombre) body.nombre = nombre;
      if (estado) body.estado = estado;
      if (observacion) body.observacion = observacion;
  
      return this.http.patch(url, body, { responseType: 'text' }).pipe(
          map(response => {
              return { message: response }; // 🔹 Maneja respuesta en texto plano
          }),
          catchError(error => {
              console.error('Error al actualizar la colonia:', error);
              return throwError(() => new Error('No se pudo actualizar la colonia.'));
          })
      );
  }
  
    

  crearAldea(nombreAldea: string, municipioId: number): Observable<any> {
    const url = `${environment.API_URL}/api/municipio/aldea`;
    const body = { nombre_aldea: nombreAldea, id_municipio: municipioId };

    return this.http.post(url, body).pipe(
      catchError(error => {
        console.error('Error al crear la aldea:', error);
        return throwError(() => new Error('No se pudo crear la aldea.'));
      })
    );
  }
  
  crearColonia(nombreColonia: string, municipioId: number): Observable<any> {
    const url = `${environment.API_URL}/api/municipio/colonia`;
    const body = { nombre_colonia: nombreColonia, id_municipio: municipioId };

    return this.http.post(url, body).pipe(
      catchError(error => {
        console.error('Error al crear la colonia:', error);
        return throwError(() => new Error('No se pudo crear la colonia.'));
      })
    );
  }

  getAldeasByMunicipio(municipioId: number): Observable<{ value: number, label: string }[]> {
    const url = `${environment.API_URL}/api/municipio/${municipioId}/aldeas`;
    return this.http.get<{ id_aldea: number, nombre_aldea: string }[]>(url).pipe(
      map(response => response.map(item => ({
        value: item.id_aldea,
        label: item.nombre_aldea
      }))),
      catchError(error => {
        console.error('Error al obtener las aldeas:', error);
        return [];
      })
    );
  }

  getAllDepartments(): Observable<any | void> {
    const url = `${environment.API_URL}/api/departamento`;
    return this.http.get<any>(
      url,
    ).pipe(
      map((res: any) => {
        return res;
      })
    );
  }
  getAllPaises(): Observable<any | void> {
    const url = `${environment.API_URL}/api/pais`;
    return this.http.get<any>(
      url,
    ).pipe(
      map((res: any) => {
        return res;
      })
    );
  }

  getAllMunicipios(): Observable<any | void> {
    const url = `${environment.API_URL}/api/municipio`;
    return this.http.get<any>(
      url,
    ).pipe(
      map((res: any) => {
        return res;
      })
    );
  }

  getMunicipiosPorDepartamentoId(departamentoId: number): Observable<{ value: number, label: string }[]> {
    const url = `${environment.API_URL}/api/municipio/departamento/${departamentoId}`;
    return this.http.get<any[]>(url).pipe(
      map(municipios => municipios.map(municipio => ({
        value: municipio.id_municipio,
        label: municipio.nombre_municipio
      })))
    );
  }

  getDepartamentosPorPaisId(paisId: number): Observable<any> {
    const url = `${environment.API_URL}/api/departamento/pais/${paisId}`;
    return this.http.get<any>(url);
  }

  getDepartamentoPorMunicipioId(municipioId: number): Observable<{ id_departamento: number, nombre_departamento: string }> {
    const url = `${environment.API_URL}/api/municipio/${municipioId}/departamento`;
    return this.http.get<{ id_departamento: number, nombre_departamento: string }>(url).pipe(
      map(departamento => ({
        id_departamento: departamento.id_departamento,
        nombre_departamento: departamento.nombre_departamento
      }))
    );
  }

  getColoniasPorMunicipio(municipioId: number): Observable<{ id_colonia: number, nombre_colonia: string }[]> {
    const url = `${environment.API_URL}/api/municipio/${municipioId}/colonias`;
    return this.http.get<{ id_colonia: number, nombre_colonia: string }[]>(url).pipe(
      map(colonias => colonias.map(colonia => ({
        id_colonia: colonia.id_colonia,
        nombre_colonia: colonia.nombre_colonia
      })))
    );
  }

}
