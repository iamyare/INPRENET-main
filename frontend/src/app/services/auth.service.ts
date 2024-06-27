import {HttpClient, HttpHeaders } from '@angular/common/http';
import { Injectable } from '@angular/core';
import { Observable, catchError, map, of, throwError } from 'rxjs';
import { environment } from 'src/environments/environment';
import { jwtDecode } from 'jwt-decode';
import { ToastrService } from 'ngx-toastr';
import { Router } from '@angular/router';


@Injectable({
  providedIn: 'root'
})
export class AuthService {

  constructor( private http: HttpClient,private router: Router,
    private toastr: ToastrService) {
   }

   olvidoContrasena(dto: any): Observable<{ message: string }> {
    const url = `${environment.API_URL}/api/usuario/olvido-contrasena`;
    return this.http.post<{ message: string }>(url, dto).pipe(
      catchError(this.handleError<{ message: string }>('olvidoContrasena'))
    );
  }

   clearSession(): void {
    sessionStorage.removeItem('token');
    this.router.navigate(['/login']);
    this.toastr.success('Sesión cerrada con éxito', 'Logout');
  }

  login(correo: string, contrasena: string): Observable<{ accessToken: string }> {
    const url = `${environment.API_URL}/api/usuario/login`;
    const body = { correo, contrasena };
    return this.http.post<{ accessToken: string }>(url, body).pipe(
      map(response => {
        sessionStorage.setItem('token', response.accessToken);
        return response;
      }),
      catchError(error => {
        console.error('Login failed:', error);
        this.toastr.error('Inicio de sesión fallido', 'Error');
        return throwError(error);
      })
    );
  }

  isAuthenticated(): boolean {
    return sessionStorage.getItem('token') !== null;
  }


  desactivarUsuario(idUsuario: number, fechaReactivacion: Date | null = null): Observable<{ message: string }> {
    const url = `${environment.API_URL}/api/usuario/${idUsuario}/desactivar`;
    const body = { fechaReactivacion };
    return this.http.patch<{ message: string }>(url, body).pipe(
      map(response => {
        this.toastr.success(response.message, 'Desactivación Exitosa');
        return response;
      }),
      catchError(this.handleError<{ message: string }>('desactivarUsuario'))
    );
  }

  reactivarUsuario(idUsuario: number): Observable<{ message: string }> {
    const url = `${environment.API_URL}/api/usuario/${idUsuario}/reactivar`;
    return this.http.patch<{ message: string }>(url, {}).pipe(
      map(response => {
        this.toastr.success(response.message, 'Reactivación Exitosa');
        return response;
      }),
      catchError(this.handleError<{ message: string }>('reactivarUsuario'))
    );
  }


  restablecerContrasena(token: string, nuevaContrasena: string): Observable<{ message: string }> {
    const url = `${environment.API_URL}/api/usuario/restablecer-contrasena/${token}`;
    return this.http.post<{ message: string }>(url, { nuevaContrasena }).pipe(
      catchError(this.handleError<{ message: string }>('restablecerContrasena'))
    );
  }

  obtenerPreguntasSeguridad(correo: string): Observable<string[]> {
    return this.http.get<string[]>(`${environment.API_URL}/api/usuario/preguntas-seguridad`, {
      params: { correo }
    });
  }

  obtenerPerfil(correo: string): Observable<any> {
    return this.http.get<any>(`${environment.API_URL}/api/usuario/perfil?correo=${correo}`);
  }

  cambiarContrasena(correo: string, nuevaContrasena: string): Observable<any> {
    return this.http.put<any>(`${environment.API_URL}/api/usuario/cambiar-contrasena`, { correo, nuevaContrasena });
  }


   preRegistro(datos: any): Observable<void> {
    const url = `${environment.API_URL}/api/usuario/preregistro`;
    return this.http.post<void>(url, datos).pipe(
      catchError(this.handleError<void>('preRegistro'))
    );
  }

  preRegistroAdmin(datos: any): Observable<void> {
    const url = `${environment.API_URL}/api/usuario/preregistro-admin`;
    return this.http.post<void>(url, datos).pipe(
      catchError(this.handleError<void>('preRegistroAdmin'))
    );
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



  completarRegistro(token: string, datos: any, archivoIdentificacion: File, fotoEmpleado: File): Observable<void> {
    const url = `${environment.API_URL}/api/usuario/completar-registro?token=${token}`;
    const formData = new FormData();
    formData.append('datos', JSON.stringify(datos));
    formData.append('archivo_identificacion', archivoIdentificacion);
    formData.append('foto_empleado', fotoEmpleado);

    return this.http.post<void>(url, formData).pipe(
      catchError(this.handleError<void>('completarRegistro'))
    );
  }


  obtenerUsuarioPorModuloYCentroTrabajo(modulo: string, idCentroTrabajo: number): Observable<any[]> {
    const url = `${environment.API_URL}/api/usuario/modulo-centro-trabajo?modulos=${modulo}&idCentroTrabajo=${idCentroTrabajo}`;
    return this.http.get<any[]>(url).pipe(
      catchError(error => {
        console.error('Error en obtenerUsuarioPorModuloYCentroTrabajo:', error);
        return of([]);
      })
    );
  }

  obtenerRolesPorModulo(modulo: string): Observable<any[]> {
    const url = `${environment.API_URL}/api/usuario/roles-modulos/${modulo}`;
    return this.http.get<any[]>(url).pipe(
      catchError(this.handleError<any[]>('obtenerRolesPorModulo', []))
    );
  }


  getRolesModulos(): { rol: string, modulo: string }[] {
    const token = sessionStorage.getItem('token');
    if (token) {
      const decodedToken: any = jwtDecode(token);
      return decodedToken.rolesModulos || [];
    }
    return [];
  }


  getRolesByEmpresa(idEmpresa: number): Observable<any> {
    const url = `${environment.API_URL}/api/usuario/roles?idEmpresa=${idEmpresa}`;
    const token = localStorage.getItem('token');
    const headers = new HttpHeaders().set('Authorization', `Bearer ${token}`);
    return this.http.get<any>(url, { headers }).pipe(
      catchError(this.handleError<any>('getRolesByEmpresa'))
    );
  }

  obtenerModulosPorCentroTrabajo(idCentroTrabajo: number): Observable<any[]> {
    return this.http.get<any[]>(`${environment.API_URL}/api/usuario/modulos-centro-trabajo/${idCentroTrabajo}`).pipe(
      catchError((error) => {
        console.error('Error al obtener los módulos:', error);
        return [];
      })
    );
  }

  obtenerCorreoDelToken(): string | null {
    const token = sessionStorage.getItem('token');
    if (token) {
      const decodedToken: any = jwtDecode(token);
      return decodedToken.correo;
    }
    return null;
  }

  getIdEmpresaFromToken(): number | null {
    const token = sessionStorage.getItem('token');
    if (token) {
      const decodedToken: any = jwtDecode(token);
      return decodedToken.idCentroTrabajo || null;
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

  getUserRolesAndModules() {
    const token = sessionStorage.getItem('token');
    if (!token) return [];

    try {
      const decodedToken: any = jwtDecode(token);
      const rolesModulos = decodedToken.rolesModulos || [];
      return rolesModulos;
    } catch (error) {
      console.error('Error decoding token:', error);
      return [];
    }
  }

  getUserProfile(): Observable<any> {
    const url = `${environment.API_URL}/api/usuario/perfil`;
    const token = sessionStorage.getItem('token');

    if (!token) {
      console.error('Token no encontrado en sessionStorage');
      return of(null);
    }

    const decodedToken = this.decodeToken(token);

    if (!decodedToken) {
      console.error('Error decodificando el token');
      return of(null);
    }

    const correo = decodedToken.correo;
    const headers = new HttpHeaders().set('Authorization', `Bearer ${token}`);

    return this.http.get<any>(`${url}?correo=${correo}`, { headers }).pipe(
      map(profile => {
        if (profile.empleadoCentroTrabajo.empleado.foto_empleado) {
          profile.empleadoCentroTrabajo.empleado.foto_empleado = this.bufferToBase64(profile.empleadoCentroTrabajo.empleado.foto_empleado.data);
        }
        return profile;
      }),
      catchError(error => {
        console.error('Error obteniendo el perfil del usuario', error);
        return of(null);
      })
    );
  }

  bufferToBase64(buffer: ArrayBuffer): string {
    let binary = '';
    const bytes = new Uint8Array(buffer);
    const len = bytes.byteLength;
    for (let i = 0; i < len; i++) {
      binary += String.fromCharCode(bytes[i]);
    }
    return window.btoa(binary);
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

  /* getRolesExceptAdmin(): Observable<any[]> {
    const url = `${environment.API_URL}/api/usuario/roles`;
    return this.http.get<any[]>(url).pipe(
      map((roles: any[]) => roles.filter(role => role.nombre_rol !== 'ADMINISTRADOR')),
      catchError(error => {
        console.error('Error fetching roles:', error);
        return of([]);
      })
    );
  } */

  getToken(): string {
    return localStorage.getItem('token') || ''; // O como estés almacenando el token
  }

  decodeToken(token: string): any {
    try {
      return jwtDecode(token);
    } catch (error) {
      console.error('Error decoding token', error);
      return null;
    }
  }

  getCentroTrabajoId(): number | null {
    const token = this.getToken();
    const decodedToken = this.decodeToken(token);
    return decodedToken ? decodedToken.idCentroTrabajo : null;
  }

  private handleError<T>(operation = 'operation', result?: T) {
    return (error: any): Observable<T> => {
      console.error(`${operation} failed: ${error.message}`);
      this.toastr.error(`Error en ${operation}: ${error.message}`, 'Error');
      return of(result as T);
    };
  }

}
