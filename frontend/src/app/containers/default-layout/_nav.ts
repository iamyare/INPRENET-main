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
        name: 'Nuevo',
        url: '/Afiliado/afil-banco',
      },
      {
        name: 'Ver / Editar (Afiliados)',
        children: [
          {
            url: '/Afiliado/datos-gen-afil',
            name: 'Datos generales',
          },
          {
            url: '/Afiliado/afil-banco',
            name: 'Centros de trabajo',
          },
          {
            url: '/Afiliado/afil-banco',
            name: 'Historial de salario',
          },
          {
            url: '/Afiliado/afil-banco',
            name: 'Referencias personales',
          },
          {
            url: '/Afiliado/afil-banco',
            name: 'Beneficiarios',
          }
        ]
      },
    ]
  },
  {
    name: 'Planilla',
    url: '/base',
    children: [
      {
        url: '/Planilla/subir-deducciones',
        name: 'Nueva Planilla',
      },
      {
        url: '/Planilla/ver-deducciones',
        name: 'Ver Planillas',
      },
/*       {
        name: 'subir nueva planilla',
        url: '/Afiliado/nueva-planilla',
      },
      {
        name: 'Ver planillas',
        url: '/Afiliado/ver-planillas',
      }, */
    ]
  },
/* 
  {
    name: 'Centro de trabajo',
    url: '/Afiliado/centro-trabajo',
     iconComponent: { name: 'cil-drop' } 
    children: [
      {
        url: '/Afiliado/centro-trabajo',
        name: 'Nuevo registro',
         iconComponent: { name: 'cilDollar' }, 
         linkProps: { fragment: 'someAnchor' }, 
      },
      {
        name: 'Ver / Editar',
        children: [
          {
            url: '/Afiliado/datos-gen-afil',
            name: 'Datos generales',
          }
        ]
      },
    ]
  }, */
];
