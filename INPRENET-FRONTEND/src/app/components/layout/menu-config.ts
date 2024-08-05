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
    name: 'AFILIACION',
    items: [
      {
        title: 'AFILIACION',
        icon: 'person',
        children: [
          { title: 'Nueva Afiliacion', route: 'afiliacion/nueva-afiliacion', icon: 'person_add' },
          { title: 'Buscar Persona', route: 'afiliacion/buscar-persona', icon: 'search' },
          { title: 'Nuevo Centro Educativo', route: 'afiliacion/nuevo-centro', icon: 'school' },
          { title: 'Ver Centro Educativo', route: 'afiliacion/ver-datos-centro', icon: 'visibility' },
          { title: 'Mantenimiento', route: 'afiliacion/mantenimiento', icon: 'build' },
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
          { title: 'Nueva Planilla', route: 'planilla/proceso-planilla', icon: 'post_add' },
          { title: 'Ver Planillas', route: 'planilla/ver-planillas', icon: 'receipt' },
          { title: 'Generacion de documentos', route: 'planilla/documentos-planilla', icon: 'description' },
        ],
      },
      {
        title: 'INGRESOS',
        icon: 'money',
        children: [
          { title: 'Privados', route: 'planilla/planilla-colegios-privados', icon: 'business' },
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
          { title: 'Gestión de Usuarios', route: 'gestion/editar-usuarios', icon: 'manage_accounts' },
          { title: 'Nuevo Usuario', route: 'gestion/nuevo-usuario', icon: 'person_add' },
        ],
      },
    ],
  },
  {
    name: 'BENEFICIOS',
    items: [
      {
        title: 'GESTION DE BENEFICIOS',
        icon: 'card_giftcard',
        children: [
          { title: 'Asignar beneficio', route: 'planilla/Beneficios/nuevo-beneficio-afil', icon: 'add_box' },
          { title: 'Ver Beneficios Asignados', route: 'planilla/Beneficios/Ver-editar-beneficio-afil', icon: 'visibility' },
          { title: 'Asignar Deduccion', route: 'planilla/Deducciones/nueva-deduccion-afil', icon: 'remove_circle' },
          { title: 'Ver Deducciones Asignadas', route: 'planilla/Deducciones/ver-editar-deduccion-afil', icon: 'visibility' },
        ],
      },
    ],
  },
];
