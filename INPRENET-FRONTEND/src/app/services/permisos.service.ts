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

  private rolesAccesoCompletoEscalafon = ['ADMINISTRADOR', 'CONSULTA PRESTAMOS'];
  private rolesAccesoLimitadoEscalafon = ['CONSULTA ESCALAFON'];

  constructor(private authService: AuthService) { }

  tieneAccesoCompletoAfiliacion(): boolean {
    const rolesUsuario = this.authService.getUserRolesAndModules();
    return rolesUsuario.some(roleModulo =>
      roleModulo.rol === 'TODO' ||
      (
        (roleModulo.modulo === 'AFILIACION' || roleModulo.modulo === 'PLANILLA') &&
        this.rolesAccesoCompletoAfiliacion.includes(roleModulo.rol)
      )
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

  tieneAccesoCompletoEscalafon(): boolean {
    const rolesUsuario = this.authService.getUserRolesAndModules();
    return rolesUsuario.some(roleModulo =>
      roleModulo.rol === 'TODO' ||
      (roleModulo.modulo === 'ESCALAFON' &&
        this.rolesAccesoCompletoEscalafon.includes(roleModulo.rol))
    );
  }

  tieneAccesoLimitadoEscalafon(): boolean {
    const rolesUsuario = this.authService.getUserRolesAndModules();
    return rolesUsuario.some(roleModulo =>
      roleModulo.modulo === 'ESCALAFON' &&
      this.rolesAccesoLimitadoEscalafon.includes(roleModulo.rol)
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

  tieneAccesoAChildEscalafon(childTitle: string): boolean {
    if (this.tieneAccesoCompletoEscalafon()) {
      return true;
    }
    if (this.tieneAccesoLimitadoEscalafon()) {
      return ['Detalle Envío'].includes(childTitle);
    }
    return false;
  }
}
