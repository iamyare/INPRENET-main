import { Injectable } from '@angular/core';
import { HttpClient, HttpErrorResponse, HttpHeaders } from '@angular/common/http';
import { BehaviorSubject, Observable, throwError, of } from 'rxjs';
import { catchError, tap, switchMap, filter, take } from 'rxjs/operators';
import { Router } from '@angular/router';
import { environment } from '../../../environments/environment'; // Asegúrate que la ruta sea correcta

// Interfaz para la respuesta del login y refresh
interface AuthResponse {
  access_token: string;
  refresh_token: string;
}

// Interfaz simple para el usuario decodificado del token (ajusta según tu payload)
interface UserProfile {
    idUsuarioEmpresa: number;
    username: string;
    // otros campos...
}

@Injectable({
  providedIn: 'root', // Servicio disponible en toda la aplicación
})
export class AuthService {
  private apiUrl = environment.API_URL; // URL base de tu API NestJS desde environment.ts
  private readonly ACCESS_TOKEN_KEY = 'access_token';
  private readonly REFRESH_TOKEN_KEY = 'refresh_token';

  // BehaviorSubject para mantener el estado de autenticación actual
  // null si no está autenticado, UserProfile si lo está
  private currentUserSubject = new BehaviorSubject<UserProfile | null>(this.getUserFromToken());
  public currentUser$ = this.currentUserSubject.asObservable(); // Observable público del usuario

  // BehaviorSubject para manejar el refresco de token (evita múltiples llamadas simultáneas)
  private isRefreshing = false;
  private refreshTokenSubject = new BehaviorSubject<string | null>(null);

  constructor(
    private http: HttpClient,
    private router: Router
  ) {}

  /**
   * Obtiene el usuario actual (observable).
   */
  public get currentUserValue(): UserProfile | null {
    return this.currentUserSubject.value;
  }

  /**
   * Verifica si el usuario está actualmente autenticado.
   */
  public isAuthenticated(): boolean {
    return !!this.getAccessToken(); // O verifica currentUserSubject.value
  }

  /**
   * Realiza la llamada de login al backend.
   * @param credentials - Objeto con username y password.
   * @returns Observable con la respuesta de autenticación (o error).
   */
  login(credentials: { username: string; password: string }): Observable<AuthResponse> {
    return this.http.post<AuthResponse>(`${this.apiUrl}/auth/login`, credentials)
      .pipe(
        tap(response => {
          this.storeTokens(response.access_token, response.refresh_token);
          this.updateCurrentUser(); // Actualiza el BehaviorSubject
          this.logger('Login successful');
        }),
        catchError(this.handleError.bind(this)) // Manejo de errores
      );
  }

  /**
   * Realiza la llamada de logout al backend y limpia el estado local.
   */
  logout(): void {
    const accessToken = this.getAccessToken();
    if (accessToken) {
        // Llama al endpoint de logout del backend
        const headers = new HttpHeaders().set('Authorization', `Bearer ${accessToken}`);
        this.http.post<{ message: string }>(`${this.apiUrl}/auth/logout`, {}, { headers })
            .pipe(
                catchError(err => {
                    this.logger(`Logout API call failed: ${err.message}`, 'error');
                    // Continúa con el logout local incluso si la API falla
                    return of(null);
                }),
                tap(() => this.clearAuthData()) // Limpia tokens y estado local SIEMPRE
            )
            .subscribe(() => {
                this.logger('Logout successful (local state cleared)');
            });
    } else {
        // Si no hay token, solo limpia localmente
        this.clearAuthData();
    }
  }

  /**
   * Limpia los tokens almacenados y resetea el estado de autenticación.
   */
  private clearAuthData(): void {
    localStorage.removeItem(this.ACCESS_TOKEN_KEY);
    localStorage.removeItem(this.REFRESH_TOKEN_KEY);
    this.currentUserSubject.next(null); // Notifica que el usuario ya no está logueado
    this.router.navigate(['/login']); // Redirige a la página de login
    this.logger('Auth data cleared');
  }

  /**
   * Obtiene el Access Token almacenado.
   */
  getAccessToken(): string | null {
    return localStorage.getItem(this.ACCESS_TOKEN_KEY);
  }

  /**
   * Obtiene el Refresh Token almacenado.
   */
  getRefreshToken(): string | null {
    return localStorage.getItem(this.REFRESH_TOKEN_KEY);
  }

  /**
   * Almacena los tokens en localStorage.
   * @param accessToken - El token de acceso.
   * @param refreshToken - El token de refresco.
   */
  private storeTokens(accessToken: string, refreshToken: string): void {
    localStorage.setItem(this.ACCESS_TOKEN_KEY, accessToken);
    localStorage.setItem(this.REFRESH_TOKEN_KEY, refreshToken);
    this.logger('Tokens stored');
  }

  /**
   * Intenta refrescar el Access Token usando el Refresh Token.
   * Maneja la lógica para evitar múltiples llamadas simultáneas.
   * @returns Observable con el nuevo Access Token o null si falla.
   */
  refreshToken(): Observable<string | null> {
    const refreshToken = this.getRefreshToken();
    if (!refreshToken) {
      this.logger('No refresh token available', 'warn');
      this.clearAuthData(); // Limpia si no hay refresh token
      return of(null); // Emite null si no hay refresh token
    }

    // Si ya se está refrescando, espera a que termine y devuelve el nuevo token
    if (this.isRefreshing) {
      return this.refreshTokenSubject.pipe(
        filter(token => token !== null), // Espera hasta que refreshTokenSubject tenga un valor
        take(1) // Toma solo el primer valor emitido
      );
    } else {
      this.isRefreshing = true;
      this.refreshTokenSubject.next(null); // Indica que el proceso de refresco ha comenzado

      return this.http.post<AuthResponse>(`${this.apiUrl}/auth/refresh`, { refreshToken })
        .pipe(
          tap((response) => {
            this.storeTokens(response.access_token, response.refresh_token);
            this.updateCurrentUser(); // Actualiza el usuario con el nuevo token
            this.refreshTokenSubject.next(response.access_token); // Emite el nuevo token para los que esperan
            this.logger('Token refreshed successfully');
          }),
          catchError((error) => {
            this.isRefreshing = false; // Asegura resetear el flag en caso de error
            this.logger('Failed to refresh token', 'error', error);
            this.clearAuthData(); // Limpia todo si el refresh falla (token inválido, expirado, etc.)
            return throwError(() => new Error('Failed to refresh token')); // Relanza el error
          }),
          // Asegura que isRefreshing se ponga en false cuando la operación termine (éxito o error manejado)
          // Usamos switchMap para devolver un observable que emita el token o null
          switchMap((response) => {
              this.isRefreshing = false;
              return of(response.access_token); // Devuelve el nuevo access token
          })
        );
    }
  }

  /**
   * Decodifica el JWT para obtener el payload (simple decodificación, sin validación).
   * @param token - El token JWT.
   * @returns El payload decodificado o null si falla.
   */
   private decodeToken(token: string): any | null {
    try {
      // Decodifica la parte del payload (segunda parte del token)
      const payload = JSON.parse(atob(token.split('.')[1]));
      return payload;
    } catch (e) {
      this.logger('Failed to decode token', 'error', e);
      return null;
    }
  }

  /**
   * Obtiene los datos del usuario desde el token almacenado.
   * @returns UserProfile o null.
   */
  private getUserFromToken(): UserProfile | null {
      const token = this.getAccessToken();
      if (!token) return null;

      const payload = this.decodeToken(token);
      if (!payload || !payload.sub || !payload.username) { // Verifica campos esperados
          this.logger('Invalid token payload', 'warn');
          this.clearAuthData(); // Limpia si el token es inválido
          return null;
      }

      // Verifica si el token ha expirado (campo 'exp' está en segundos)
      if (payload.exp && Date.now() >= payload.exp * 1000) {
          this.logger('Access token expired (checked locally)', 'warn');
          // No limpiamos aquí, dejamos que el interceptor maneje el refresh
          return null; // Considera el token expirado
      }

      // Mapea el payload a tu interfaz UserProfile
      const user: UserProfile = {
          idUsuarioEmpresa: payload.sub,
          username: payload.username,
          // Mapea otros campos si los añadiste al payload
      };
      return user;
  }

  /**
   * Actualiza el BehaviorSubject currentUserSubject con la información del token actual.
   */
  private updateCurrentUser(): void {
      const user = this.getUserFromToken();
      this.currentUserSubject.next(user);
  }


  /**
   * Manejador de errores centralizado para las llamadas HTTP.
   * @param error - El objeto HttpErrorResponse.
   * @returns Un Observable que emite un error.
   */
  private handleError(error: HttpErrorResponse): Observable<never> {
    let errorMessage = 'Ocurrió un error desconocido.';
    if (error.error instanceof ErrorEvent) {
      // Error del lado del cliente o de red
      errorMessage = `Error: ${error.error.message}`;
    } else {
      // El backend devolvió un código de error
      // El cuerpo de la respuesta puede contener pistas sobre lo que salió mal
      errorMessage = `Código ${error.status}: ${error.error?.message || error.statusText}`;
      if (error.status === 401) {
          // Podríamos manejar el 401 aquí también, pero el interceptor es mejor lugar
          // this.logout(); // O intentar refresh si no es error de credenciales
          errorMessage = 'No autorizado o credenciales inválidas.';
      } else if (error.status === 403) {
          errorMessage = 'No tienes permiso para realizar esta acción.';
      }
    }
    this.logger(errorMessage, 'error', error);
    // Devuelve un observable con un error user-facing
    return throwError(() => new Error(errorMessage));
  }

  /**
   * Helper simple para logging.
   */
  private logger(message: string, level: 'log' | 'warn' | 'error' = 'log', data?: any): void {
      const logPrefix = '[AuthService]';
      if (level === 'error') {
          console.error(`${logPrefix} ${message}`, data || '');
      } else if (level === 'warn') {
          console.warn(`${logPrefix} ${message}`, data || '');
      } else {
          // Solo loguea en desarrollo para no llenar la consola en producción
          if (!environment.API_URL) {
              console.log(`${logPrefix} ${message}`, data || '');
          }
      }
  }
}
