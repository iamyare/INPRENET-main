import {HttpClient } from '@angular/common/http';
import { Injectable } from '@angular/core';
import { Observable, map } from 'rxjs';
import { environment } from 'src/environments/environment';
import { jwtDecode } from 'jwt-decode';


@Injectable({
  providedIn: 'root'
})
export class AuthService {

  constructor( private http: HttpClient) {
   }

   loginPrivada(email: string, password: string): Observable<{ access_token: string }> {
    const url = `${environment.API_URL}/api/usuario/loginPrivada`;
    return this.http.post<{ access_token: string }>(url, { email, contrasena: password });
  }

  createPrivada(data: any): Observable<any> {
    const url = `${environment.API_URL}/api/usuario/crear`;
    return this.http.post<any>(url, data);
  }

  login(email: string, password: string): Observable<{ token: string }> {
    const url = `${environment.API_URL}/api/usuario/auth/login`;
    return this.http.post<{ token: string }>(url, { correo: email, contrasena: password });
  }

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

}
