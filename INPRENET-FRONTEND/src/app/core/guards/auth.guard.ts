import { Injectable } from '@angular/core';
import {
  CanActivate,
  ActivatedRouteSnapshot,
  RouterStateSnapshot,
  UrlTree,
  Router,
} from '@angular/router';
import { Observable } from 'rxjs';
import { map, take } from 'rxjs/operators';
import { AuthService } from '../auth/auth.service'; // Importa AuthService

@Injectable({
  providedIn: 'root',
})
export class AuthGuard implements CanActivate {
  constructor(private authService: AuthService, private router: Router) {}

  canActivate(
    route: ActivatedRouteSnapshot,
    state: RouterStateSnapshot
  ): Observable<boolean | UrlTree> | Promise<boolean | UrlTree> | boolean | UrlTree {

    // Usa el observable currentUser$ del AuthService
    return this.authService.currentUser$.pipe(
      take(1), // Toma solo el valor actual
      map(user => {
        const isAuthenticated = !!user; // Verifica si hay un usuario logueado
        if (isAuthenticated) {
          // Si está autenticado, permite el acceso a la ruta
          return true;
        } else {
          // Si no está autenticado, redirige a la página de login
          console.warn('[AuthGuard] User not authenticated. Redirecting to login.');
          // Guarda la URL a la que intentaba acceder para redirigir después del login (opcional)
          // const redirectUrl = state.url;
          // Puedes pasarla como query param: this.router.createUrlTree(['/login'], { queryParams: { returnUrl: redirectUrl } })
          return this.router.createUrlTree(['/login']); // Crea un UrlTree para la redirección
        }
      })
    );

    /* Alternativa síncrona (menos reactiva, no recomendada si el estado puede cambiar):
    const isAuthenticated = this.authService.isAuthenticated();
    if (isAuthenticated) {
      return true;
    } else {
      console.warn('[AuthGuard] User not authenticated (sync check). Redirecting to login.');
      return this.router.createUrlTree(['/login']);
    }
    */
  }
}
