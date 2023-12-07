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
    name: 'Afiliado'
  },
  /* {
    name: 'Colors',
    url: '/theme/colors',
    iconComponent: { name: 'cil-drop' }
  },
  {
    name: 'Typography',
    url: '/theme/typography',
    linkProps: { fragment: 'someAnchor' },
    iconComponent: { name: 'cil-pencil' }
  },  */
  {
    name: 'Datos Generales',
    url: '/base',
    iconComponent: { name: 'cil-puzzle' },
    children: [
      {
        url: '/Afiliado/afil-banco',
        iconComponent: { name: 'cilDollar' },
        name: 'Nuevo datos bancarios',
        /* linkProps: { fragment: 'someAnchor' }, */
      },
    ]
  },
  {
    name: 'Centro de trabajo',
    url: '/Afiliado/centro-trabajo',
    iconComponent: { name: 'cil-drop' }
  },
  /* {
    name: '',
    url: '',
     linkProps: { fragment: 'someAnchor' },
    iconComponent: { name: 'cilDollar' }
  },  */
];
