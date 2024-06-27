import { Injectable } from '@angular/core';
import { CanActivate, ActivatedRouteSnapshot, Router } from '@angular/router';
import { AuthService } from '../services/auth.service';

@Injectable({
  providedIn: 'root'
})
export class RoleGuard implements CanActivate {
  constructor(private authService: AuthService, private router: Router) {}

  canActivate(route: ActivatedRouteSnapshot): boolean {
    const expectedRolesModules = route.data['expectedRolesModules'] as Array<{ role?: string, module?: string }>;
    const rolesModulos = this.authService.getUserRolesAndModules();

    const hasAccess = expectedRolesModules.some(expected => {
      if (expected.role && expected.module) {
        return rolesModulos.some((rm:any) => rm.rol === expected.role && rm.modulo === expected.module);
      } else if (expected.role) {
        return rolesModulos.some((rm:any) => rm.rol === expected.role);
      } else if (expected.module) {
        return rolesModulos.some((rm:any) => rm.modulo === expected.module);
      }
      return false;
    });

    if (!hasAccess) {
      this.router.navigate(['/dashboard']);
      return false;
    }

    return true;
  }
}
