import { Injectable } from '@angular/core';
import { CanActivate, ActivatedRouteSnapshot, Router } from '@angular/router';
import { AuthService } from '../services/auth.service';
import { ToastrService } from 'ngx-toastr';

@Injectable({
  providedIn: 'root'
})
export class RoleGuard implements CanActivate {
  constructor(
    private authService: AuthService,
    private router: Router,
    private toastr: ToastrService
  ) {}

  canActivate(route: ActivatedRouteSnapshot): boolean {
    const expectedRolesModules = route.data['expectedRolesModules'] as Array<{ role?: string, module?: string }>;
    const rolesModulos = this.authService.getUserRolesAndModules();
    const hasGlobalAccess = rolesModulos.some((rm: any) => rm.rol === 'TODO' && rm.modulo === 'TODO');
    if (hasGlobalAccess) {
      return true;
    }
    const hasAccess = expectedRolesModules.some(expected => {
      if (expected.role && expected.module) {
        return rolesModulos.some((rm: any) => rm.rol === expected.role && rm.modulo === expected.module);
      } else if (expected.role) {
        return rolesModulos.some((rm: any) => rm.rol === expected.role);
      } else if (expected.module) {
        return rolesModulos.some((rm: any) => rm.modulo === expected.module);
      }
      return false;
    });

    if (!hasAccess) {
      this.router.navigate(['/auth/login']);
      this.toastr.warning('Acceso denegado. Redirigiendo al inicio de sesión.', 'Advertencia', {
        timeOut: 3000,
        positionClass: 'toast-top-center'
      });
      return false;
    }

    return true;
  }

}
