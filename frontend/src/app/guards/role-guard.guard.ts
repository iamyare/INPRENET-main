import { Injectable } from '@angular/core';
import { CanActivate, ActivatedRouteSnapshot, Router } from '@angular/router';
import { AuthService } from '../services/auth.service';

@Injectable({
  providedIn: 'root'
})
export class RoleGuard implements CanActivate {
  constructor(private authService: AuthService, private router: Router) {}

  canActivate(route: ActivatedRouteSnapshot): boolean {
    const expectedRoles = route.data['expectedRoles'] as Array<string>;
    const userRole = this.authService.getUserRole();

    if (!expectedRoles.includes(userRole)) {
      this.router.navigate(['/404']); // Ajusta según tu necesidad
      return false;
    }

    return true;
  }
}
