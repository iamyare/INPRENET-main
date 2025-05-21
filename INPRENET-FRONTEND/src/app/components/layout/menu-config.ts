export interface MenuItem {
  title: string;
  icon: string;
  route?: string;
  action?: string;
  children?: MenuItem[];
  isCustomReset?: boolean;
}

export interface Section {
  name: string;
  items: MenuItem[];
}

export const MENU_CONFIG: Section[] = [
  {
    name: 'CARNETIZACION',
    items: [
      {
        title: 'Prueba',
        icon: 'group',
        children: [
          { title: 'Prueba', route: 'rnp/prueba-vida', icon: 'manage_accounts' }
        ],
      },
    ],
  },
  {
    name: 'DOCUMENTOS',
    items: [
      {
        title: 'REPORTES',
        icon: 'group',
        children: [
          { title: 'Menu', route: 'documentos/menu-documentos', icon: 'manage_accounts' }
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
    name: 'AFILIACIONES',
    items: [
      {
        title: 'DOCENTES',
        icon: 'person',
        children: [
          { title: 'Nueva Afiliación', route: 'afiliacion/nueva-afiliacion', icon: 'person_add' },
          {
            title: 'Buscar Persona',
            route: 'afiliacion/buscar-persona',
            icon: 'person_search',
            isCustomReset: true
          },
          { title: 'Constancias', route: 'afiliacion/constancias-afiliados', icon: 'description' },
          { title: 'huella', route: 'afiliacion/huella', icon: 'description' }
        ],
      },
      {
        title: 'CENTROS EDUCATIVOS',
        icon: 'school',
        children: [
          { title: 'Nuevo Centro Educativo', route: 'afiliacion/nuevo-centro', icon: 'add_business' },
          { title: 'Ver Centro Educativo', route: 'afiliacion/ver-datos-centro', icon: 'domain' },
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
          { title: 'voucher mensual', route: 'planilla/Egresos/voucher-general-mens', icon: 'credit_card' },
          { title: 'Planillas Definitivas', route: 'planilla/Egresos/planilla-definitivas', icon: 'file_copy' },

        ],
      },
      {
        title: 'INGRESOS',
        icon: 'money',
        children: [
          { title: 'Privados', route: 'planilla/Ingresos/planilla-colegios-privados', icon: 'business' },
          { title: 'Privados', route: 'planilla/Ingresos/cargar-planilla-privados', icon: 'business' },
          { title: 'Cotizaciones/Aportaciones', route: 'planilla/Ingresos/cotizacion-aportacion', icon: 'business' },
        ],
      },
    ],
  },
  {
    name: 'CONASA',
    items: [
      {
        title: 'GESTION CONASA',
        icon: 'engineering',
        children: [
          { title: 'Buscar Afiliado', route: 'conasa/ver-afiliado', icon: 'person_search' },
          { title: 'Gestion De Contratos', route: 'conasa/menu-conasa', icon: 'description' },
          { title: 'Menu de Facturas', route: 'conasa/menu-facturas-conasa', icon: 'description' },
          { title: 'Consultas Medicas', route: 'conasa/ver-consultas-medicas', icon: 'description' },
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
      {
        title: 'Movimientos de cuentas',
        icon: 'money',
        children: [
          { title: 'Ver movimiento', route: 'escalafon/Ver-movimientos', icon: 'business' },
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


