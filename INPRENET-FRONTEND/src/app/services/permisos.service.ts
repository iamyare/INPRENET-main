import { Injectable } from '@angular/core';
import { AuthService } from './auth.service';

@Injectable({
  providedIn: 'root'
})
export class PermisosService {
  private rolesAccesoCompletoAfiliacion = ['MODIFICACION AFILIACION', 'OFICIAL DE PLANILLA', 'ADMINISTRADOR'];
  private rolesAccesoLimitadoAfiliacion = ['CONSULTA AFILIACION', 'ADMINISTRADOR'];

  private rolesAccesoCompletoPlanilla = ['OFICIAL DE PLANILLA', 'ADMINISTRADOR'];
  private rolesAccesoLimitadoPlanilla = ['CONSULTA PLANILLA', 'ADMINISTRADOR'];

  constructor(private authService: AuthService) { }

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
      (roleModulo.modulo === 'AFILIACION') &&
      this.rolesAccesoLimitadoAfiliacion.includes(roleModulo.rol)
    );
  }

  tieneAccesoCompletoPlanilla(): boolean {
    const rolesUsuario = this.authService.getUserRolesAndModules();
    return rolesUsuario.some(roleModulo =>
      roleModulo.rol === 'TODO' ||
      (roleModulo.modulo === 'PLANILLA' &&
        this.rolesAccesoCompletoPlanilla.includes(roleModulo.rol))
    );
  }

  tieneAccesoLimitadoPlanilla(): boolean {
    const rolesUsuario = this.authService.getUserRolesAndModules();
    return rolesUsuario.some(roleModulo =>
      roleModulo.modulo === 'PLANILLA' &&
      this.rolesAccesoLimitadoPlanilla.includes(roleModulo.rol)
    );
  }

  tieneAccesoAChildAfiliacion(childTitle: string): boolean {
    if (this.tieneAccesoCompletoPlanilla()) {
      return true;
    }
    if (this.tieneAccesoLimitadoAfiliacion()) {
      return ['Buscar Persona', 'Ver Centro Educativo'].includes(childTitle);
    }
    if (childTitle === 'Cambiar Cuenta Bancaria') {
      return ['Cambiar Cuenta Bancaria'].includes(childTitle);
    }

    return false;
  }

  tieneAccesoAChilPlanilla(childTitle: string): boolean {
    if (this.tieneAccesoCompletoPlanilla()) {
      return true;
    }
    if (this.tieneAccesoLimitadoPlanilla()) {
      return ['Proceso de Planilla', 'Ver Planillas'].includes(childTitle);
    }
    return false;
  }
}
