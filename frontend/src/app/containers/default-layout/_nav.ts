import { INavData } from '@coreui/angular';

export const navItems: INavData[] = [
  {
    title: true,
    name: 'Menú Mantenimiento'
  },
  {
    name: 'Beneficio',
    iconComponent: { name: 'cilMoney' },
    url: '/base',
    children: [
      {
        name: 'Nuevo Beneficio',
        url: '/Beneficio/nuevo-beneficio',
      },
      {
        name: 'Editar Beneficios',
        url: '/Beneficio/editar-beneficio',
      },
    ]
  },
  {
    name: 'Deducción',
    iconComponent: { name: 'cilMoney' },
    url: '/base',
    children: [
      {
        name: 'Nueva Deducción',
        url: '/Deduccion/nuevo-tipo-deduccion',
      },
      {
        name: 'Editar Deducción',
        url: '/Deduccion/editar-tipo-deduccion',
      },
    ]
  },
  {
    name: 'Tipo Planilla',
    iconComponent: { name: 'cilSpreadsheet' },
    url: '/base',
    children: [
      {
        name: 'Nuevo Tipo Planilla',
        url: '/Tipo-Planilla/nuevo-tipo-planilla',
      },
      {
        name: 'Editar Tipo Planilla',
        url: '/Tipo-Planilla/editar-tipo-planilla',
      },
    ]
  },
  {
    title: true,
    name: 'Gestión De Personal'
  },
  {
    name: 'Gestión',
    iconComponent: { name: 'cilMoney' },
    children: [
      {
        name: 'Gestión de usuarios',
        url: '/Gestion/editar-usuarios',
      },
      {
        name: 'Nuevo usuario',
        url: '/Gestion/nuevo-usuario',
      },
    ]
  },
  {
    title: true,
    name: 'Menú Principal'
  },
  {
    name: 'Afiliación',
    iconComponent: { name: 'cil-people' },
    url: '/base',
    children: [
      {
        name: 'Nuevo Afiliado',
        url: 'Afiliado/nuevo-afiliado',
      },
      {
        name: 'Ver Datos Afiliados',
        url: '/Afiliado/ver-datos-afiliado',
      },
      {
        name: 'Nuevo Centro Educativo',
        url: 'Afiliado/nuevo-centro',
      },
      {
        name: 'Ver Centro Educativo',
        url: 'Afiliado/ver-datos-centro',
      },
    ]
  },
  {
    name: 'Beneficios',
    iconComponent: { name: 'cilSpreadsheet' },
    url: '/base',
    children: [
      {
        url: 'Afiliado/Beneficios/nuevo-beneficio-afil',
        name: 'Nueva Beneficio',
      },
      {
        url: 'Afiliado/Beneficios/Ver-editar-beneficio-afil',
        name: 'Ver/Editar Beneficio',
      },
    ]
  },
  {
    name: 'Planilla',
    url: '/base',
    iconComponent: { name: 'cilSpreadsheet' },
    children: [
      {
        name: 'Ingresos',
        children: [
          {
            name: 'Privados',
            url: '/Planilla/Ingresos/Privados/planilla-colegios-privados',
          },
        ]
      },
      {
        name: 'Egresos',
        children: [
          {
            url: 'Afiliado/Deducciones/nueva-deduccion-afil',
            name: 'Nueva Deducción',
          },
          {
            url: 'Afiliado/Deducciones/ver-editar-deduccion-afil',
            name: 'Ver/editar Deducción',
          },
          {
            url: '/Planilla/Egresos/nueva-planilla',
            name: 'Nueva Planilla',
          },
          {
            url: '/Planilla/Egresos/ver-planillas',
            name: 'Ver Planillas',
          },
        ]
      }
    ]
  }
];
