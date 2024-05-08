import { NgModule } from '@angular/core';
import { Routes, RouterModule } from '@angular/router';

import { AfilBancoComponent } from '../pages/Generales/afil-banco/afil-banco.component';

import { VerPlanillasComponent } from '../pages/Generales/ver-planillas/ver-planillas.component';
import { SubirDeduccionesformComponent } from '../pages/Generales/subir-deduccionesform/subir-deduccionesform.component';
import { CentroTrabajoComponent } from '../pages/Generales/centro-trabajo/centro-trabajo.component';
import { NuevaPlanillaComponentP } from '../pages/Generales/nueva-planilla/nueva-planilla.component';

import { NuevoBeneficioComponent } from '../pages/Mantenimiento/nuevo-beneficio/nuevo-beneficio.component';
import { EditarBeneficioComponent } from '../pages/Mantenimiento/editar-beneficio/editar-beneficio.component';
import { NuevoTipoDeduccionComponent } from '../pages/Mantenimiento/nuevo-tipo-deduccion/nuevo-tipo-deduccion.component';
import { EditarTipoDeduccionComponent } from '../pages/Mantenimiento/editar-tipo-deduccion/editar-tipo-deduccion.component';
import { EditarTipoPlanillaComponent } from '../pages/Mantenimiento/editar-tipo-planilla/editar-tipo-planilla.component';
import { NuevoTipoPlanillaComponent } from '../pages/Mantenimiento/nuevo-tipo-planilla/nuevo-tipo-planilla.component';

/* import { CentroTrabajoPageComponent } from '../pages/centro-trabajo-page/centro-trabajo-page.component'; */
import { NuevoBeneficioAfilComponent } from '../pages/Generales/nuevo-beneficio-afil/nuevo-beneficio-afil.component';
import { NuevaDeduccionAfilComponent } from '../pages/Generales/nueva-deduccion-afil/nueva-deduccion-afil.component';
import { VerEditarBeneficioAfilComponent } from '../pages/Generales/ver-editar-beneficio-afil/ver-editar-beneficio-afil.component';
import { VerEditarDeduccionAfilComponent } from '../pages/Generales/ver-editar-deduccion-afil/ver-editar-deduccion-afil.component';
import { CargarPlanillaPrivadosComponent } from '../pages/Centros Privados/cargar-planilla-privados/cargar-planilla-privados.component';
import { NuevoMovimientoComponent } from '../pages/Generales/nuevo-movimiento/nuevo-movimiento.component';
import { VerMovimientosComponent } from '../pages/Generales/ver-movimientos/ver-movimientos.component';
import { PlanillaColegiosPrivadosComponent } from '../pages/Centros Privados/planilla-colegios-privados/planilla-colegios-privados.component';
import { EditPerfilPuestTrabComponent } from '../pages/Generales/edit-perfil-puest-trab/edit-perfil-puest-trab.component';
import { EditReferPersonalesComponent } from '../pages/Generales/edit-refer-personales/edit-refer-personales.component';
import { EditDatosGeneralesComponent } from '../pages/Generales/edit-datos-generales/edit-datos-generales.component';
import { EditBeneficiariosComponent } from '../pages/Generales/edit-beneficiarios/edit-beneficiarios.component';
import { EditDatosBancariosComponent } from '../pages/Generales/edit-datos-bancarios/edit-datos-bancarios.component';
import { EditColegiosMagisterialesComponent } from '../pages/Generales/edit-colegios-magisteriales/edit-colegios-magisteriales.component';
import { EditFamiliaresComponent } from '../pages/Generales/edit-familiares/edit-familiares.component';
import { VerDatosAfiliadosComponent } from '../pages/Generales/ver-datos-afiliados/ver-datos-afiliados.component';

const routes: Routes = [
  //rutas Afiliado
  {
    path: '',
    data: {
      title: 'Afiliado',
    },
    children: [
      {
        path: '',
        pathMatch: 'full',
        redirectTo: 'dashboard',
      },
      {
        path: '',
        data: {
          title: '',
        },
        children: [
          {
            path: 'nuevo-afiliado',
            component: AfilBancoComponent,
            data: {
              title: 'Nuevo Afiliado',
            },
          },
          {
            path: 'ver-datos-afiliado',
            component: VerDatosAfiliadosComponent,
            data: {
              title: 'Ver Datos Afiliado',
            },
          },
          {
            path: 'edit-datos-generales',
            component: EditDatosGeneralesComponent,
            data: {
              title: 'Editar Datos Generales',
            },
          },
          {
            path: 'edit-familiares',
            component: EditFamiliaresComponent,
            data: {
              title: 'Editar Familiares',
            },
          },
          {
            path: 'Edit-Perfil-Puest-Trab',
            component: EditPerfilPuestTrabComponent,
            data: {
              title: 'Editar Puestos de trabajo',
            },
          },
          {
            path: 'edit-colegios-magisteriales',
            component: EditColegiosMagisterialesComponent,
            data: {
              title: 'Editar Colegios Magisteriales',
            },
          },
          {
            path: 'edit-datos-bancarios',
            component: EditDatosBancariosComponent,
            data: {
              title: 'Editar Datos Bancarios',
            },
          },
          {
            path: 'edit-refer-personales',
            component: EditReferPersonalesComponent,
            data: {
              title: 'Editar Referencias Personales',
            },
          },
          {
            path: 'edit-beneficiarios',
            component: EditBeneficiariosComponent,
            data: {
              title: 'Editar Beneficiarios',
            },
          },
        ]
      },
      {
        path: 'Beneficios/nuevo-beneficio-afil',
        component: NuevoBeneficioAfilComponent,
        data: {
          title: 'Nuevo Beneficio',
        },
      },
      {
        path: 'Beneficios/Ver-editar-beneficio-afil',
        component: VerEditarBeneficioAfilComponent,
        data: {
          title: 'Ver/editar Beneficio',
        },
      },
      {
        path: 'Deducciones/nueva-deduccion-afil',
        component: NuevaDeduccionAfilComponent,
        data: {
          title: 'nueva Deducción',
        },
      },
      {
        path: 'Deducciones/ver-editar-deduccion-afil',
        component: VerEditarDeduccionAfilComponent,
        data: {
          title: 'Ver-editar Deducción',
        },
      },
    ],
  },
  //rutas planilla
  {
    path: '',
    data: {
      title: 'Planilla',
    },
    children: [
      {
        path: 'Egresos/nueva-planilla',
        component: NuevaPlanillaComponentP,
        data: {
          title: 'Nueva Planilla',
        },
      },
      {
        path: 'Egresos/ver-planillas',
        component: VerPlanillasComponent,
        data: {
          title: 'Ver Planillas',
        },
      },
      {
        path: 'Ingresos/Privados/planilla-colegios-privados',
        component: PlanillaColegiosPrivadosComponent,
        data: {
          title: 'Planilla Colegios Privados',
        },
      },
      {
        path: 'Ingresos/Privados/cargar-planilla-privados',
        component: CargarPlanillaPrivadosComponent,
        data: {
          title: 'Cargar Planilla Colegios Privados',
        },
      },
      {
        path: 'subir-deduccionesform',
        component: SubirDeduccionesformComponent,
        data: {
          title: 'Subir Deducciones',
        },
      },
      {
        path: 'centro-trabajo',
        component: CentroTrabajoComponent,
        data: {
          title: 'Centro Trabajo',
        },
      },
    ],
  },

  //rutas mantenimiento beneficio
  {
    path: '',
    data: {
      title: 'Beneficio',
    },
    children: [
      {
        path: '',
        pathMatch: 'full',
        redirectTo: '',
      },
      {
        path: 'nuevo-beneficio',
        component: NuevoBeneficioComponent,
        data: {
          title: 'Nuevo Beneficio',
        },
      },
      {
        path: 'editar-beneficio',
        component: EditarBeneficioComponent,
        data: {
          title: 'Editar Beneficio',
        },
      },
    ],
  },
  //rutas mantenimiento planilla
  {
    path: '',
    data: {
      title: 'Tipo-Planilla',
    },
    children: [
      {
        path: '',
        pathMatch: 'full',
        redirectTo: '',
      },
      {
        path: 'nuevo-tipo-planilla',
        component: NuevoTipoPlanillaComponent,
        data: {
          title: 'Nuevo Tipo Planilla',
        },
      },
      {
        path: 'editar-tipo-planilla',
        component: EditarTipoPlanillaComponent,
        data: {
          title: 'Editar Tipo Planilla',
        },
      },
    ],
  },
  //rutas mantenimiento deduccion
  {
    path: '',
    data: {
      title: 'Deduccion',
    },
    children: [
      {
        path: '',
        pathMatch: 'full',
        redirectTo: '',
      },
      {
        path: 'nuevo-tipo-deduccion',
        component: NuevoTipoDeduccionComponent,
        data: {
          title: 'Nueva Deducción',
        },
      },
      {
        path: 'editar-tipo-deduccion',
        component: EditarTipoDeduccionComponent,
        data: {
          title: 'Editar Tipo Deduccion',
        },
      },
    ],
  },
  {
    path: '',
    data: {
      title: 'Privados',
    },
    children: [
      {
        path: '',
        pathMatch: 'full',
        redirectTo: '',
      },
      {
        path: 'cargar-planilla-privados',
        component: CargarPlanillaPrivadosComponent,
        data: {
          title: 'Cargar Planilla Privados',
        },
      },
      {
        path: 'planilla-colegios-privados',
        component: PlanillaColegiosPrivadosComponent,
        data: {
          title: 'Planilla Privados',
        },
      },
    ],
  },
  {
    path: '',
    data: {
      title: 'Movimiento',
    },
    children: [
      {
        path: 'nuevo-movimiento',
        component: NuevoMovimientoComponent,
        data: {
          title: 'Nuevo Movimiento',
        },
      },
      {
        path: 'ver-movimientos',
        component: VerMovimientosComponent,
        data: {
          title: 'Nuevo Movimiento',
        },
      }
    ],
  },
];

@NgModule({
  imports: [RouterModule.forChild(routes)],
  exports: [RouterModule],
})
export class ThemeRoutingModule { }
