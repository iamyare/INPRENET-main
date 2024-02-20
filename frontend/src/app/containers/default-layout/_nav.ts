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
    name: 'Menú Principal'
  },
  /* {
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
  }, */

  {
    name: 'Afiliado',
    iconComponent: { name: 'cil-people' },
    url: '/base',
    children: [
      {
        name: 'Nuevo Afiliado',
        children: [
          {
            name: 'Nuevo',
            url: '/Afiliado/afil-banco',
          },
        ]
      },
      {
        name: 'Ver / Editar',
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
      {
        name: 'Beneficios',
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
        name: 'Deducciones',
        url: '/base',
        children: [
          {
            url: 'Afiliado/Deducciones/nueva-deduccion-afil',
            name: 'Nueva Deducción',
          },
          {
            url: 'Afiliado/Deducciones/ver-editar-deduccion-afil',
            name: 'Ver/editar Deducción',
          },
        ]
      },
    ]
  },

  {
    name: 'Planilla',
    iconComponent: { name: 'cilSpreadsheet' },
    url: '/base',
    children: [
      {
        url: '/Planilla/nueva-planilla',
        name: 'Nueva Planilla',
      },
      {
        url: '/Planilla/ver-planillas',
        name: 'Ver Planillas',
      },
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
