import {HttpClient, HttpHeaders } from '@angular/common/http';
import { Injectable } from '@angular/core';
import { Observable, catchError, map, of } from 'rxjs';
import { environment } from 'src/environments/environment';
import { jwtDecode } from 'jwt-decode';


@Injectable({
  providedIn: 'root'
})
export class AuthService {

  constructor( private http: HttpClient) {
   }


   logout(): Observable<void> {
    const url = `${environment.API_URL}/api/usuario/logout`;
    const token = localStorage.getItem('token');
    const headers = new HttpHeaders().set('Authorization', `Bearer ${token}`);

    return this.http.post<void>(url, {}, { headers }).pipe(
      map(() => {
        this.clearToken();
      })
    );
  }

  verificarEstadoSesion(): Observable<{ sesionActiva: boolean }> {
    const url = `${environment.API_URL}/api/usuario/verificarEstado`;
    const token = localStorage.getItem('token');
    const headers = new HttpHeaders().set('Authorization', `Bearer ${token}`);
    return this.http.get<{ sesionActiva: boolean }>(url, { headers });
  }

  preRegistro(datos: any): Observable<void> {
    const url = `${environment.API_URL}/api/usuario/preregistro`;
    return this.http.post<void>(url, datos).pipe(
      catchError(this.handleError<void>('preRegistro'))
    );
  }

  completarRegistro(token: string, datos: any, archivo: File): Observable<void> {
    const url = `${environment.API_URL}/api/usuario/completar-registro?token=${token}`;
    const formData = new FormData();
    formData.append('datos', JSON.stringify(datos));
    formData.append('archivo_identificacion', archivo);

    return this.http.post<void>(url, formData).pipe(
      catchError(this.handleError<void>('completarRegistro'))
    );
  }

  login(correo: string, contrasena: string): Observable<{ accessToken: string }> {
    const url = `${environment.API_URL}/api/usuario/login`;
    const body = { correo, contrasena };
    return this.http.post<{ accessToken: string }>(url, body).pipe(
      map(response => {
        localStorage.setItem('token', response.accessToken);
        return response;
      }),
      catchError(this.handleError<{ accessToken: string }>('login'))
    );
  }

  getRolesByEmpresa(idEmpresa: number): Observable<any> {
    const url = `${environment.API_URL}/api/usuario/roles?idEmpresa=${idEmpresa}`;
    const token = localStorage.getItem('token');
    const headers = new HttpHeaders().set('Authorization', `Bearer ${token}`);
    return this.http.get<any>(url, { headers }).pipe(
      catchError(this.handleError<any>('getRolesByEmpresa'))
    );
  }

  getIdEmpresaFromToken(): number | null {
    const token = localStorage.getItem('token');
    if (token) {
      const decodedToken: any = jwtDecode(token);
      return decodedToken.idEmpresa;
    }
    return null;
  }

  clearToken(): void {
    localStorage.removeItem('token');
  }

   loginPrivada(email: string, password: string): Observable<{ access_token: string }> {
    const url = `${environment.API_URL}/api/usuario/loginPrivada`;
    return this.http.post<{ access_token: string }>(url, { email, contrasena: password });
  }

  createPrivada(data: any): Observable<any> {
    const url = `${environment.API_URL}/api/usuario/crear`;
    return this.http.post<any>(url, data);
  }

  /* login(email: string, password: string): Observable<{ token: string }> {
    const url = `${environment.API_URL}/api/usuario/auth/login`;
    return this.http.post<{ token: string }>(url, { correo: email, contrasena: password });
  } */

  saveToken(token: string): void {
    localStorage.setItem('token', token);
  }

  getUserRole() {
    const token = localStorage.getItem('token');
    if (!token) return '';

    try {
      const decodedToken: any = jwtDecode(token);
      const role = decodedToken.rol
      return role || '';
    } catch (error) {
      console.error('Error decoding token:', error);
      return '';
    }
  }


  crearCuenta(data:any): Observable<any>{
    var url = `${environment.API_URL}/api/usuario/auth/signup`;
    return this.http.post<any>(
      url,
      data,
      ).pipe(
        map((res:any) => {
          return res;
        }),
      )
  }

  confirmarYActualizarSeguridad(data: any): Observable<any> {
    const url = `${environment.API_URL}/api/usuario/auth/confirm`;
    return this.http.patch<any>(url, data).pipe(
      map((res: any) => {
        return res;
      }),
    );
  }

  getRolesExceptAdmin(): Observable<any[]> {
    const url = `${environment.API_URL}/api/usuario/roles`;
    return this.http.get<any[]>(url).pipe(
      map((roles: any[]) => roles.filter(role => role.nombre_rol !== 'ADMINISTRADOR')),
      catchError(error => {
        console.error('Error fetching roles:', error);
        return of([]);
      })
    );
  }

  private handleError<T>(operation = 'operation', result?: T) {
    return (error: any): Observable<T> => {
      console.error(`${operation} failed: ${error.message}`);
      return of(result as T);
    };
  }

}
