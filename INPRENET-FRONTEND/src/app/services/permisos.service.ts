import { Injectable } from '@angular/core';
import { AuthService } from './auth.service';

@Injectable({
  providedIn: 'root'
})
export class PermisosService {
  private rolesAccesoCompletoAfiliacion = ['MODIFICACION AFILIACION', 'ADMINISTRADOR'];
  private rolesAccesoLimitadoAfiliacion = ['CONSULTA AFILIACION'];

  constructor(private authService: AuthService) {}

  tieneAccesoCompletoAfiliacion(): boolean {
    const rolesUsuario = this.authService.getUserRolesAndModules();
    return rolesUsuario.some(roleModulo =>
      roleModulo.rol === 'TODO' ||
      (roleModulo.modulo === 'AFILIACION' &&
      this.rolesAccesoCompletoAfiliacion.includes(roleModulo.rol))
    );
  }

  tieneAccesoLimitadoAfiliacion(): boolean {
    const rolesUsuario = this.authService.getUserRolesAndModules();
    return rolesUsuario.some(roleModulo =>
      roleModulo.modulo === 'AFILIACION' &&
      this.rolesAccesoLimitadoAfiliacion.includes(roleModulo.rol)
    );
  }

  tieneAccesoAChildAfiliacion(childTitle: string): boolean {
    if (this.tieneAccesoCompletoAfiliacion()) {
      return true;
    }
    if (this.tieneAccesoLimitadoAfiliacion()) {
      return ['Buscar Persona', 'Ver Centro Educativo'].includes(childTitle);
    }

    return false;
  }
}
