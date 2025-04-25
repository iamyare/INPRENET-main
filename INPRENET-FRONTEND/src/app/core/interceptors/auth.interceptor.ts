import { Injectable } from '@angular/core';
import {
  HttpRequest,
  HttpHandler,
  HttpEvent,
  HttpInterceptor,
  HttpErrorResponse,
  HttpHeaders
} from '@angular/common/http';
import { Observable, throwError, BehaviorSubject } from 'rxjs';
import { catchError, switchMap, filter, take } from 'rxjs/operators';
import { AuthService } from '../auth/auth.service'; // Importa AuthService
import { environment } from '../../../environments/environment'; // Para verificar la URL de la API

@Injectable()
export class AuthInterceptor implements HttpInterceptor {

  private isRefreshing = false;
  private refreshTokenSubject: BehaviorSubject<any> = new BehaviorSubject<any>(null);

  constructor(private authService: AuthService) {} // Inyecta AuthService

  intercept(request: HttpRequest<unknown>, next: HttpHandler): Observable<HttpEvent<unknown>> {
    // Solo intercepta las llamadas a nuestra API
    if (!request.url.startsWith(environment.API_URL)) {
        return next.handle(request);
    }

    // Obtiene el token de acceso actual
    const accessToken = this.authService.getAccessToken();

    // Si hay token, lo clona y añade el header Authorization
    if (accessToken) {
      request = this.addTokenHeader(request, accessToken);
    }

    // Envía la petición (original o clonada con token)
    return next.handle(request).pipe(
      catchError(error => {
        // Si el error es 401 (No autorizado) y NO es la ruta de login o refresh
        if (error instanceof HttpErrorResponse &&
            error.status === 401 &&
            !request.url.includes('/auth/login') &&
            !request.url.includes('/auth/refresh')) {
          // Intenta refrescar el token
          return this.handle401Error(request, next);
        }

        // Si es otro tipo de error o un 401 en login/refresh, simplemente relanza el error
        return throwError(() => error);
      })
    );
  }

  /**
   * Añade el header Authorization con el Bearer token a la petición.
   * @param request - La petición original.
   * @param token - El token de acceso.
   * @returns La nueva petición clonada con el header.
   */
  private addTokenHeader(request: HttpRequest<any>, token: string) {
    return request.clone({
      headers: request.headers.set('Authorization', `Bearer ${token}`)
    });
  }

  /**
   * Maneja los errores 401 intentando refrescar el token.
   * @param request - La petición original que falló.
   * @param next - El siguiente manejador en la cadena de interceptores.
   * @returns Observable con la petición reintentada o un error.
   */
  private handle401Error(request: HttpRequest<any>, next: HttpHandler): Observable<HttpEvent<any>> {
    // Si no se está ya refrescando el token
    if (!this.isRefreshing) {
      this.isRefreshing = true;
      this.refreshTokenSubject.next(null); // Indica inicio de refresco

      const refreshToken = this.authService.getRefreshToken();

      // Si hay refresh token, intenta el refresco
      if (refreshToken) {
        return this.authService.refreshToken().pipe(
          switchMap((newAccessToken: string | null) => {
            this.isRefreshing = false;
            if (newAccessToken) {
              this.refreshTokenSubject.next(newAccessToken); // Notifica el nuevo token
              // Clona la petición original fallida con el NUEVO token y la reintenta
              return next.handle(this.addTokenHeader(request, newAccessToken));
            } else {
              // Si refreshToken devuelve null (falló el refresco)
              this.authService.logout(); // Desloguea al usuario
              return throwError(() => new Error('La sesión ha expirado.')); // Emite error
            }
          }),
          catchError((err) => {
            // Si authService.refreshToken() lanza un error
            this.isRefreshing = false;
            this.authService.logout(); // Desloguea al usuario
            return throwError(() => err); // Relanza el error original del refresh
          })
        );
      } else {
        // Si no hay refresh token, simplemente desloguea
        this.isRefreshing = false; // Resetea el flag
        this.authService.logout();
        return throwError(() => new Error('No hay sesión activa para refrescar.'));
      }

    } else {
      // Si ya se está refrescando, espera a que refreshTokenSubject emita un nuevo token
      return this.refreshTokenSubject.pipe(
        filter(token => token !== null), // Espera hasta que haya un token (o el refresh falle y desloguee)
        take(1), // Toma el primer token emitido
        switchMap(jwt => {
          // Reintenta la petición original con el token obtenido de la espera
          return next.handle(this.addTokenHeader(request, jwt));
        }),
        catchError((err) => {
            // Si la petición reintentada falla AÚN DESPUÉS del refresh, relanza el error.
            // Podría ser un problema de permisos (403) u otro error.
            return throwError(() => err);
        })
      );
    }
  }
}
