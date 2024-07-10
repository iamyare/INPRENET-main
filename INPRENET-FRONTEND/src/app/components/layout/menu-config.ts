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
        title: 'PERSONAS',
        icon: 'person',
        children: [
          { title: 'Nuevo Afiliado', route: '/afiliacion/nuevo-afiliado', icon: 'person_add' },
          { title: 'Buscar Persona', route: '/afiliacion/buscar-persona', icon: 'search' },
          { title: 'Nuevo Centro Educativo', route: '/afiliacion/nuevo-centro', icon: 'school' },
          { title: 'Ver Centro Educativo', route: '/afiliacion/ver-datos-centro', icon: 'visibility' },
        ],
      },
    ],
  },
  {
    name: 'PLANILLA',
    items: [
      {
        title: 'EGRESOS',
        icon: 'attach_money',
        children: [
          { title: 'Nueva Planilla', route: '/planilla/nueva-planilla', icon: 'post_add' },
          { title: 'Ver Planillas', route: '/planilla/ver-planillas', icon: 'receipt' },
        ],
      },
      {
        title: 'INGRESOS',
        icon: 'attach_money',
        children: [
          { title: 'Privados', route: '/planilla/planilla-colegios-privados', icon: 'receipt' },
        ],
      },
    ],
  },
  {
    name: 'GESTIÓN DE PERSONAL',
    items: [
        {
            title: 'USUARIOS',
            icon: 'group',  // Icono más adecuado para usuarios
            children: [
                { title: 'Gestión de Usuarios', route: '/gestion/editar-usuarios', icon: 'manage_accounts' },
                { title: 'Nuevo Usuario', route: '/gestion/nuevo-usuario', icon: 'person_add' },
            ],
        },
    ],
}
];
