import { HttpClient, HttpHeaders } from '@angular/common/http';
import { Injectable, NgZone } from '@angular/core';
import { Observable, catchError, map, of, throwError } from 'rxjs';
import { jwtDecode } from 'jwt-decode';
import { ToastrService } from 'ngx-toastr';
import { Router } from '@angular/router';
import { environment } from '../../environments/environment';
import { AuthResponse, LoginResponse, RefreshTokenResponse } from '../core/interfaces/auth.interfaces';


@Injectable({
  providedIn: 'root'
})
export class AuthService {
  private timeout: any;
  private readonly idleTime: number = 30 * 60 * 1000;

  constructor(
    private http: HttpClient,
    private router: Router,
    private toastr: ToastrService,
    private ngZone: NgZone
  ) {
    this.startIdleWatch();
    this.resetIdleTimer();
  }

  private apiRequestsCount: number = 0;
  private idleTimeout: any;

  recuperarContrasena(email: string): Observable<any> {
    const url = `${environment.API_URL}/api/usuario/olvido-contrasena`;
    return this.http.post(url, { email }).pipe(
      map((response) => {
        this.toastr.success('Se ha enviado un enlace para restablecer la contraseña a su correo.');
        return response;
      }),
      catchError((error) => {
        if (error.status === 404 && error.error?.message === 'Usuario no encontrado') {
          this.toastr.error('El correo ingresado no está registrado en el sistema.', 'Error');
        } else if (error.status === 400) {
          this.toastr.error('Hubo un error en la solicitud. Verifique la información ingresada.', 'Error');
        } else {
          console.error('Error al intentar recuperar contraseña:', error);
          this.toastr.error('No se pudo enviar el enlace de restablecimiento. Inténtelo más tarde.', 'Error');
        }
        return throwError(() => error);
      })
    );
  }


  restablecerContrasena(token: string, nuevaContrasena: string): Observable<any> {
    const url = `${environment.API_URL}/api/usuario/restablecer-contrasena/${token}`;
    return this.http.post(url, { nuevaContrasena }).pipe(
      map(response => {
        this.toastr.success('Contraseña restablecida correctamente.');
        return response;
      }),
      catchError(error => {
        console.error('Error al restablecer la contraseña:', error);
        this.toastr.error('No se pudo restablecer la contraseña. Inténtelo más tarde.');
        return throwError(error);
      })
    );
  }

  actualizarEmpleado(idEmpleado: number, formData: FormData): Observable<any> {
    const url = `${environment.API_URL}/api/usuario/actualizar-informacion-empleado/${idEmpleado}`;
    return this.http.patch(url, formData).pipe(
      catchError(error => {
        console.error('Error al actualizar los datos del empleado:', error);
        return throwError(error);
      })
    );
  }

  public startIdleWatch(): void {
    ['mousemove', 'keydown', 'wheel', 'touchmove', 'click'].forEach(event => {
      window.addEventListener(event, () => this.resetIdleTimer());
    });
    this.resetIdleTimer();
  }

  private resetIdleTimer(): void {
    clearTimeout(this.timeout);
    if (this.apiRequestsCount === 0) {
      this.timeout = setTimeout(() => {
        console.log('Sesión cerrada por inactividad');
        this.handleIdleTimeout();
      }, this.idleTime);
    }
  }

  // Incrementar el contador cuando se inicia una petición API
  public onApiRequestStart(): void {
    this.apiRequestsCount++;
    clearTimeout(this.idleTimeout); // Pausar el temporizador de inactividad mientras hay solicitudes
  }

  // Decrementar el contador cuando una petición API termina
  public onApiRequestEnd(): void {
    this.apiRequestsCount--;
    if (this.apiRequestsCount === 0) {
      this.resetIdleTimer(); // Reiniciar el temporizador cuando no hay solicitudes pendientes
    }
  }

  private handleIdleTimeout(): void {
    this.ngZone.run(() => {
      const token = sessionStorage.getItem('token');
      if (token) {
        this.logout();
      }
    });
  }

  login(correo: string, contrasena: string): Observable<LoginResponse> {
    const url = `${environment.API_URL}/api/usuario/login`;
    const body = { correo, contrasena };
    return this.http.post<LoginResponse>(url, body).pipe(
      map(response => {
        this.toastr.success('Inicio de sesión exitoso');
        sessionStorage.setItem('token', response.accessToken);
        sessionStorage.setItem('refresh_token', response.refreshToken);
        return response;
      }),
      catchError(error => {
        console.error('Login failed:', error);
        this.toastr.error('Inicio de sesión fallido', 'Error');
        return throwError(() => error);
      })
    );
  }
refreshToken(refreshToken: string): Observable<RefreshTokenResponse> {
  return this.http.post<RefreshTokenResponse>(`${environment.API_URL}/api/auth/refresh`, { refreshToken }).pipe(
    map(response => {
      sessionStorage.setItem('token', response.accessToken);
      sessionStorage.setItem('refresh_token', response.refreshToken);
      return response;
    }),
    catchError(error => {
      console.error('Token refresh failed:', error);
      this.logout();
      return throwError(() => error);
    })
  );
}

logout(): void {
  const token = sessionStorage.getItem('token');
  if (token) {
    // Intentar cerrar sesión en el servidor
    this.http.post(`${environment.API_URL}/api/auth/logout`, {}).pipe(
      catchError(error => {
        console.error('Error durante el logout:', error);
        return of(null);
      })
    ).subscribe(() => {
      this.clearSession();
    });
  } else {
    this.clearSession();
  }
}

private clearSession(): void {
  sessionStorage.removeItem('token');
  sessionStorage.removeItem('refresh_token');
  this.toastr.info('Sesión cerrada');
  this.router.navigate(['/']);
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

  completarRegistro(token: string, datos: any, archivoIdentificacion?: File, fotoEmpleado?: File): Observable<void> {
    const url = `${environment.API_URL}/api/usuario/completar-registro?token=${token}`;
    const formData = new FormData();
    formData.append('datos', JSON.stringify(datos));
    if (archivoIdentificacion) {
      formData.append('archivo_identificacion', archivoIdentificacion);
    }
    if (fotoEmpleado) {
      formData.append('foto_empleado', fotoEmpleado);
    }
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

  getUsuarioAutenticado(): { nombre: string, correo: string } | null {
    const token = sessionStorage.getItem('token');
    if (!token) return null;

    try {
        const decodedToken: any = jwtDecode(token);
        return {
            nombre: decodedToken.nombreEmpleado,
            correo: decodedToken.correo
        };
    } catch (error) {
        console.error('Error al decodificar el token', error);
        return null;
    }
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

  saveToken(token: string): void {
    localStorage.setItem('token', token);
  }

  getUserRolesAndModules(): { rol: string, modulo: string }[] {
    const token = sessionStorage.getItem('token');
    if (!token) return [];

    try {
      const decodedToken: any = jwtDecode(token);
      return decodedToken.rolesModulos || [];
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


  crearCuenta(data: any): Observable<any> {
    var url = `${environment.API_URL}/api/usuario/auth/signup`;
    return this.http.post<any>(
      url,
      data,
    ).pipe(
      map((res: any) => {
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
