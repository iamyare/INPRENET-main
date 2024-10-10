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
    name: 'MANTENIMIENTO',
    items: [
      {
        title: 'MANTENIMIENTO',
        icon: 'build',
        children: [
          { title: 'Mantenimiento', route: 'afiliacion/mantenimiento', icon: 'build' },
        ],
      },
    ],
  },
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
          { title: 'Asignar beneficio', route: 'planilla/Beneficios/nuevo-beneficio-afil', icon: 'add_box' },
          { title: 'Ver Beneficios Asignados', route: 'planilla/Beneficios/Ver-editar-beneficio-afil', icon: 'visibility' },
        ],
      },
      {
        title: 'GESTIÓN DE DEDUCCIONES',
        icon: 'money',
        children: [
          { title: 'Asignar Deduccion', route: 'planilla/Deducciones/nueva-deduccion-afil', icon: 'remove_circle' },
          { title: 'Ver Deducciones Asignadas', route: 'planilla/Deducciones/ver-editar-deduccion-afil', icon: 'visibility' },
        ],
      },
    ],
  },
  {
    name: 'PLANILLA',
    items: [
      {
        title: 'EGRESOS',
        icon: 'money_off',
        children: [
          { title: 'Proceso de Planilla', route: 'planilla/Egresos/proceso-planilla', icon: 'post_add' },
          { title: 'Ver Planillas', route: 'planilla/Egresos/ver-planillas', icon: 'receipt' },
          { title: 'Generación de documentos', route: 'planilla/Egresos/documentos-planilla', icon: 'description' },
          { title: 'Cambiar Banco', route: 'planilla/Egresos/editar-banco', icon: 'description' },
        ],
      },
      {
        title: 'INGRESOS',
        icon: 'money',
        children: [
          { title: 'Privados', route: 'planilla/Ingresos/planilla-colegios-privados', icon: 'business' },
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
  }
];
