import { Injectable } from '@angular/core';
import { AuthService } from './auth.service';

@Injectable({
  providedIn: 'root'
})
export class PermisosService {
  constructor(private authService: AuthService) {}

  private static permisosPorModulo: Record<string, {
    rutas: Record<string, { title: string; permisos: { role: string; module: string, permiso?: string }[] }>;
  }> = {
    MANTENIMIENTO: {
      rutas: {
        'afiliacion/mantenimiento': {
          title: 'Mantenimiento',
          permisos: [
            { role: 'ADMINISTRADOR', module: 'AFILIACION' }
          ]
        }
      }
    },
    'GESTIÓN DE PERSONAL': {
      rutas: {
        'gestion/usuarios/editar-usuarios': {
          title: 'Gestión de Usuarios',
          permisos: [
            { role: 'ADMINISTRADOR', module: 'ESCALAFON' }
          ]
        },
        'gestion/usuarios/nuevo-usuario': {
          title: 'Nuevo Usuario',
          permisos: [
            { role: 'ADMINISTRADOR', module: 'ESCALAFON' }
          ]
        }
      }
    },
    AFILIACIÓN: {
      rutas: {
        'afiliacion/nueva-afiliacion': {
          title: 'Nueva Afiliación',
          permisos: [
            { role: 'MODIFICACION AFILIACION', module: 'AFILIACION', permiso: 'editar' },
            { role: 'CONSULTA AFILIACION', module: 'AFILIACION', permiso: 'ver' },
            { role: 'ADMINISTRADOR', module: 'AFILIACION', permiso: 'editar' },
            { role: 'OFICIAL DE PLANILLA', module: 'PLANILLA', permiso: 'editar' }
          ]
        },
        'afiliacion/buscar-persona': {
          title: 'Buscar Persona',
          permisos: [
            { role: 'CONSULTA AFILIACION', module: 'AFILIACION' },
            { role: 'MODIFICACION AFILIACION', module: 'AFILIACION', permiso: 'editar' },
            { role: 'OFICIAL DE PLANILLA', module: 'PLANILLA', permiso: 'editar' },
            { role: 'ADMINISTRADOR', module: 'AFILIACION' }
          ]
        },
        'afiliacion/nuevo-centro': {
          title: 'Nuevo Centro Educativo',
          permisos: [
            { role: 'MODIFICACION AFILIACION', module: 'AFILIACION' },
            { role: 'ADMINISTRADOR', module: 'AFILIACION' }
          ]
        },
        'afiliacion/ver-datos-centro': {
          title: 'Ver Centro Educativo',
          permisos: [
            { role: 'CONSULTA AFILIACION', module: 'AFILIACION' },
            { role: 'ADMINISTRADOR', module: 'AFILIACION' }
          ]
        }
      }
    },
    BENEFICIOS: {
      rutas: {
        'planilla/Beneficios/nuevo-beneficio-afil': {
          title: 'Asignar Beneficio',
          permisos: [
            { role: 'ADMINISTRADOR', module: 'PLANILLA' },
            { role: 'OFICIAL DE PLANILLA', module: 'PLANILLA' }
          ]
        },
        'planilla/Beneficios/Ver-editar-beneficio-afil': {
          title: 'Ver Beneficios Asignados',
          permisos: [
            { role: 'OFICIAL DE PLANILLA', module: 'PLANILLA' },
            { role: 'ADMINISTRADOR', module: 'PLANILLA' },
            { role: 'CONSULTA PLANILLA', module: 'PLANILLA' }
          ]
        }
      }
    },
    PLANILLA: {
      rutas: {
        'planilla/Egresos/cargar-fallecidos': {
          title: 'Cargar Bajas (FALLECIDOS)',
          permisos: [
            { role: 'ADMINISTRADOR', module: 'PLANILLA' },
            { role: 'OFICIAL DE PLANILLA', module: 'PLANILLA' },
          ]
        },
        'planilla/Egresos/editar-banco': {
          title: 'Cambiar Cuenta Bancaria',
          permisos: [
            { role: 'BLOCK', module: 'BLOCK' },
          ]
        },
        'planilla/Egresos/proceso-planilla': {
          title: 'Proceso de Planilla',
          permisos: [
            { role: 'ADMINISTRADOR', module: 'PLANILLA' },
            { role: 'OFICIAL DE PLANILLA', module: 'PLANILLA' },
          ]
        },
        'planilla/Egresos/ver-planillas': {
          title: 'Ver Todas Las Planillas',
          permisos: [
            { role: 'ADMINISTRADOR', module: 'PLANILLA' },
            { role: 'OFICIAL DE PLANILLA', module: 'PLANILLA' },
            { role: 'CONSULTA PLANILLA', module: 'PLANILLA' },
          ]
        },
        'planilla/Egresos/documentos-planilla': {
          title: 'Generación de Documentos',
          permisos: [
            { role: 'ADMINISTRADOR', module: 'PLANILLA' },
            { role: 'OFICIAL DE PLANILLA', module: 'PLANILLA' },
          ]
        },
        'planilla/Egresos/ver_estatus_60_rentas': {
          title: '60 Rentas',
          permisos: [
            { role: 'ADMINISTRADOR', module: 'PLANILLA' },
            { role: 'CONSULTA A 60 RENTAS', module: 'PLANILLA' },
          ]
        },
        'planilla/Ingresos/planilla-colegios-privados': {
          title: 'Privados',
          permisos: [
            /* { role: 'ADMINISTRADOR', module: 'PLANILLA' },
            { role: 'OFICIAL DE PLANILLA', module: 'PLANILLA' }, */
          ]
        },
        'planilla/Ingresos/cargar-planilla-privados': {
          title: 'Privados',
          permisos: [
            /* { role: 'ADMINISTRADOR', module: 'PLANILLA' },
            { role: 'OFICIAL DE PLANILLA', module: 'PLANILLA' }, */
          ]
        },
        'planilla/Ingresos/cotizacion-aportacion': {
          title: 'Privados',
          permisos: [
            /* { role: 'ADMINISTRADOR', module: 'PLANILLA' },
            { role: 'OFICIAL DE PLANILLA', module: 'PLANILLA' }, */
          ]
        },
        'planilla/Egresos/voucher-general-mens': {
          title: 'Privados',
          permisos: [
            { role: 'ADMINISTRADOR', module: 'PLANILLA' },
            { role: 'OFICIAL DE PLANILLA', module: 'PLANILLA' },
            { role: 'CONSULTA PRESTAMOS', module: 'ESCALAFON' },
          ]
        }
      }
    },
    ESCALAFÓN: {
      rutas: {
        'escalafon/detalle-envio': {
          title: 'Detalle Envío',
          permisos: [
            { role: 'CONSULTA PRESTAMOS', module: 'ESCALAFON' },
            { role: 'ADMINISTRADOR', module: 'ESCALAFON' }
          ]
        },
        'escalafon/Ver-movimientos': {
          title: 'Ver Movimiento',
          permisos: [
            { role: 'ADMINISTRADOR', module: 'CUENTAS INPREMA' },
            { role: 'ADMINISTRADOR', module: 'ESCALAFON' }
          ]
        }
      }
    },
    CONASA: {
      rutas: {
        'conasa/ver-afiliado': {
          title: 'Buscar Afiliado',
          permisos: [
            { role: 'CONSULTA', module: 'CONASA' },
            { role: 'ADMINISTRADOR', module: 'CONASA' }
          ]
        },
        'conasa/subir-factura': {
          title: 'Subir Factura',
          permisos: [
            { role: 'CONSULTA', module: 'CONASA' },
            { role: 'ADMINISTRADOR', module: 'CONASA' }
          ]
        },
        'conasa/menu-conasa': {
          title: 'Detalle Envío',
          permisos: [
            { role: 'CONSULTA', module: 'CONASA' },
            { role: 'ADMINISTRADOR', module: 'CONASA' }
          ]
        },
        'conasa/menu-conasa/ingresar-asistencia': {
        title: 'Ingresar Asistencia',
        permisos: [
          { role: 'CONSULTA', module: 'CONASA' },
          { role: 'ADMINISTRADOR', module: 'CONASA' }
        ]
      },
      'conasa/menu-conasa/reporte-asistencias': {
        title: 'Reporte de Asistencias',
        permisos: [
          { role: 'CONSULTA', module: 'CONASA' },
          { role: 'ADMINISTRADOR', module: 'CONASA' }
        ]
      },
      'conasa/menu-conasa/anular-asistencias': {
        title: 'Anular Asistencias',
        permisos: [
          { role: 'CONSULTA', module: 'CONASA' },
          { role: 'ADMINISTRADOR', module: 'CONASA' }
        ]
      },
      'conasa/menu-conasa/modificar-asistencias': {
        title: 'Modificar Asistencias',
        permisos: [
          { role: 'CONSULTA', module: 'CONASA' },
          { role: 'ADMINISTRADOR', module: 'CONASA' }
        ]
      },
      'conasa/menu-conasa/cancelar-asistencias': {
        title: 'Cancelar Asistencias',
        permisos: [
          { role: 'CONSULTA', module: 'CONASA' },
          { role: 'ADMINISTRADOR', module: 'CONASA' }
        ]
      }
      }
    }
  };

  static getExpectedRolesForRoute(module: keyof typeof PermisosService.permisosPorModulo, route: string) {
    return PermisosService.permisosPorModulo[module]?.rutas[route]?.permisos || [];
  }

  userHasAccess(module: string, route: string): boolean {
    const rolesForRoute = PermisosService.getExpectedRolesForRoute(module, route);
    const userRolesAndModules = this.authService.getUserRolesAndModules();
    const hasGlobalAccess = userRolesAndModules.some(userRole => userRole.rol === 'TODO' && userRole.modulo === 'TODO');
    if (hasGlobalAccess) {
      return true;
    }
    return userRolesAndModules.some(userRole =>
      rolesForRoute.some(role =>
        role.role.toLowerCase().trim() === userRole.rol.toLowerCase().trim() &&
        role.module.toLowerCase().trim() === userRole.modulo.toLowerCase().trim()
      )
    );
  }

  getTitleForRoute(module: string, route: string): string | null {
    return PermisosService.permisosPorModulo[module]?.rutas[route]?.title || null;
  }

  userHasPermission(module: string, route: string, permiso: string): boolean {
    const rolesForRoute = PermisosService.getExpectedRolesForRoute(module, route);
    const userRolesAndModules = this.authService.getUserRolesAndModules();
    const hasGlobalAccess = userRolesAndModules.some(userRole =>
      userRole.rol === 'TODO' && userRole.modulo === 'TODO'
    );
    if (hasGlobalAccess) {
      return true;
    }
    return userRolesAndModules.some(userRole =>
      rolesForRoute.some(role =>
        role.role.toLowerCase().trim() === userRole.rol.toLowerCase().trim() &&
        role.module.toLowerCase().trim() === userRole.modulo.toLowerCase().trim() &&
        (role.permiso === permiso || role.permiso === 'todos')
      )
    );
  }

}
