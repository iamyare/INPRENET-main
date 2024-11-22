export interface MenuItem {
  title: string;
  icon: string;
  route?: string;
  children?: MenuItem[];
}

export interface Section {
  name: string;
  items: MenuItem[];
}

export const MENU_CONFIG: Section[] = [
  {
    name: 'GESTIÓN DE PERSONAL',
    items: [
      {
        title: 'USUARIOS',
        icon: 'group',
        children: [
          { title: 'Gestión de Usuarios', route: 'gestion/usuarios/editar-usuarios', icon: 'manage_accounts' },
          { title: 'Nuevo Usuario', route: 'gestion/usuarios/nuevo-usuario', icon: 'person_add' },
        ],
      },
    ],
  },
  {
    name: 'AFILIACIÓN',
    items: [
      {
        title: 'AFILIACIÓN',
        icon: 'person',
        children: [
          { title: 'Nueva Afiliación', route: 'afiliacion/nueva-afiliacion', icon: 'person_add' },
          { title: 'Buscar Persona', route: 'afiliacion/buscar-persona', icon: 'search' },
          { title: 'Nuevo Centro Educativo', route: 'afiliacion/nuevo-centro', icon: 'school' },
          { title: 'Ver Centro Educativo', route: 'afiliacion/ver-datos-centro', icon: 'visibility' },
        ],
      },
    ],
  },
  {
    name: 'BENEFICIOS',
    items: [
      {
        title: 'GESTIÓN DE BENEFICIOS',
        icon: 'money',
        children: [
          { title: 'Asignar Beneficio', route: 'planilla/Beneficios/nuevo-beneficio-afil', icon: 'assignment_turned_in' },
          { title: 'Ver Beneficios Asignados', route: 'planilla/Beneficios/Ver-editar-beneficio-afil', icon: 'list_alt' },
          { title: 'Crear Beneficio', route: 'planilla/Beneficios/nuevo-beneficio', icon: 'add_circle' },
          { title: 'Editar Beneficio', route: 'planilla/Beneficios/editar-beneficio', icon: 'edit' },
          { title: 'Crear Tipo Deducción', route: 'planilla/Beneficios/crear-tipo-deduccion', icon: 'post_add' },
          { title: 'Editar Tipo Deducción', route: 'planilla/Beneficios/editar-tipo-deduccion', icon: 'edit_note' },
        ],
      },
      /* {
        title: 'GESTIÓN DE DEDUCCIONES',
        icon: 'money',
        children: [
          { title: 'Asignar Deduccion', route: 'planilla/Deducciones/nueva-deduccion-afil', icon: 'remove_circle' },
          { title: 'Ver Deducciones Asignadas', route: 'planilla/Deducciones/ver-editar-deduccion-afil', icon: 'visibility' },
        ],
      }, */
    ],
  },
  {
    name: 'PLANILLA',
    items: [
      {
        title: 'EGRESOS',
        icon: 'money_off',
        children: [
          { title: 'Cargar Bajas (FALLECIDOS)', route: 'planilla/Egresos/cargar-fallecidos', icon: 'person_remove' },
          { title: 'Proceso de Planilla', route: 'planilla/Egresos/proceso-planilla', icon: 'work' },
          { title: 'Ver Todas Las Planillas', route: 'planilla/Egresos/ver-planillas', icon: 'list_alt' },
          { title: 'Generación de documentos', route: 'planilla/Egresos/documentos-planilla', icon: 'picture_as_pdf' },
          { title: '60 Rentas', route: 'planilla/Egresos/ver_estatus_60_rentas', icon: 'history' },
          { title: 'voucher mensual', route: 'planilla/Egresos/voucher-general-mens', icon: 'history' },

        ],
      },
      {
        title: 'INGRESOS',
        icon: 'money',
        children: [
          { title: 'Privados', route: 'planilla/Ingresos/planilla-colegios-privados', icon: 'business' },
          { title: 'Cotizaciones/Aportaciones', route: 'planilla/Ingresos/cotizacion-aportacion', icon: 'business' },
        ],
      },
    ],
  },
  {
    name: 'CUENTAS INPREMA',
    items: [
      {
        title: 'Movimientos de cuentas',
        icon: 'money',
        children: [
          { title: 'Ver movimiento', route: 'cuentas/Movimientos/Ver-movimientos', icon: 'business' },
        ],
      },
    ],
  },
  {
    name: 'ESCALAFÓN',
    items: [
      {
        title: 'GESTIÓN DE ESCALAFÓN',
        icon: 'grading',
        children: [
          { title: 'Detalle Envío', route: 'escalafon/detalle-envio', icon: 'description' },
        ],
      },
    ],
  },
  {
    name: 'MANTENIMIENTO',
    items: [
      {
        title: 'MANTENIMIENTO',
        icon: 'build',
        children: [
          { title: 'AFILIACIÓN', route: 'afiliacion/mantenimiento', icon: 'build' },
        ],
      },
    ],
  },
];
