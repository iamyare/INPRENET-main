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
    name: 'Beneficio',
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
    name: 'Deduccion',
    url: '/base',
    children: [
      {
        name: 'Nueva Deduccion',
        url: '/Deduccion/nuevo-tipo-deduccion',
      },
      {
        name: 'Editar Deduccion',
        url: '/Deduccion/editar-tipo-deduccion',
      },
  ]
  },
  {
    name: 'Tipo-Planilla',
    url: '/base',
    children: [
      {
        name: 'Nuevo tipo planilla',
        url: '/Tipo-Planilla/nuevo-tipo-planilla',
      },
      {
        name: 'Editar tipo planilla',
        url: '/Tipo-Planilla/editar-tipo-planilla',
      },
  ]
  },

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
        url: '/Planilla/nueva-planilla',
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
