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
    name: 'Menú Principal'
  },

  {
    name: 'Afiliado',
    url: '/base',
    children: [
      {
        url: '/Afiliado/afil-banco',
        /* iconComponent: { name: 'cilDollar' }, */
        name: 'Nuevo registro',
        /* linkProps: { fragment: 'someAnchor' }, */
      },
      {
        name: 'Ver/Editar',
        children: [
          {
            url: '/Afiliado/datos-gen-afil',
            name: 'Datos generales',
          },
          {
            url: '/Afiliado/afil-banco',
            name: 'Datos del puesto de trabajo',
          },
          {
            url: '/Afiliado/afil-banco',
            name: 'Datos bancarios',
          },
          {
            url: '/Afiliado/afil-banco',
            name: 'Referencias personales',
          }
        ]
      },

    ]
  },

  {
    name: 'Centro de trabajo',
    url: '/Afiliado/centro-trabajo',
    /* iconComponent: { name: 'cil-drop' } */
    children: [

    ]
  },
];
