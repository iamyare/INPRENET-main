import { INavData } from '@coreui/angular';

export const navItems: INavData[] = [
  /* {
    name: 'Dashboard',
    url: '/dashboard',
    iconComponent: { name: 'cil-speedometer' },
    badge: {
      color: 'info',
      text: 'NEW'
    }
  }, */

  {
    title: true,
    name: 'Menú Mantenimiento'
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
    name: 'Gestion De Personal'
  },
  {
    name: 'Gestion',
    iconComponent: { name: 'cilMoney' },
    children: [
      {
        name: 'Gestion de usuarios',
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
    name: 'Operaciones',
    iconComponent: { name: 'cilSpreadsheet' },
    url: '/base',
    children: [
      {
        name: 'Planilla',
        url: '/base',
        children: [
          {
            name: 'Ingresos',
            iconComponent: { name: 'cilMoney' },
            children: [
              {
                name: 'Privados',
                children: [
                  {
                    name: 'Planilla de privados',
                    url: '/Planilla/Ingresos/Privados/planilla-colegios-privados',
                  },
                  {
                    name: 'Cargar Planilla de privados',
                    url: '/Planilla/Ingresos/Privados/cargar-planilla-privados',
                  },
                ]
              }
            ]
          },
          {
            name: 'Egresos',
            iconComponent: { name: 'cilMoney' },
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
      },
    ]
  },
  {
    name: 'Movimientos',
    iconComponent: { name: 'cilSpreadsheet' },
    url: '/base',
    children: [
      {
        name: 'Nuevo Movimiento',
        url: '/Movimiento/nuevo-movimiento',
      },
      {
        name: 'Ver Movimientos',
        url: '/Movimiento/ver-movimientos',
      },
    ]
  },
];
