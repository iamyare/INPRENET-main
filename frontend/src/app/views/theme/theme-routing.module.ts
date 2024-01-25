import { NgModule } from '@angular/core';
import { Routes, RouterModule } from '@angular/router';

import { AfilBancoComponent } from '../pages/Generales/afil-banco/afil-banco.component';
import { VerDeduccionesComponent } from '../pages/Generales/ver-deducciones/ver-deducciones.component';

import { VerPlanillasComponent } from '../pages/Generales/ver-planillas/ver-planillas.component';
import { SubirDeduccionesformComponent } from '../pages/Generales/subir-deduccionesform/subir-deduccionesform.component';
import { CentroTrabajoComponent } from '../pages/Generales/centro-trabajo/centro-trabajo.component';
import { NuevaPlanillaComponentP } from '../pages/Generales/nueva-planilla/nueva-planilla.component';

import { NuevoBeneficioComponent } from '../pages/Generales/nuevo-beneficio/nuevo-beneficio.component';
import { EditarBeneficioComponent } from '../pages/Generales/editar-beneficio/editar-beneficio.component';

import { NuevoTipoDeduccionComponent } from '../pages/Generales/nuevo-tipo-deduccion/nuevo-tipo-deduccion.component';
import { EditarTipoDeduccionComponent } from '../pages/Generales/editar-tipo-deduccion/editar-tipo-deduccion.component';

import { EditarTipoPlanillaComponent } from '../pages/Generales/editar-tipo-planilla/editar-tipo-planilla.component';
import { NuevoTipoPlanillaComponent } from '../pages/Generales/nuevo-tipo-planilla/nuevo-tipo-planilla.component';
/* import { CentroTrabajoPageComponent } from '../pages/centro-trabajo-page/centro-trabajo-page.component'; */
import { NuevoBeneficioAfilComponent } from '../pages/Generales/nuevo-beneficio-afil/nuevo-beneficio-afil.component';
import { NuevaDeduccionAfilComponent } from '../pages/Generales/nueva-deduccion-afil/nueva-deduccion-afil.component';
import { VerEditarBeneficioAfilComponent } from '../pages/Generales/ver-editar-beneficio-afil/ver-editar-beneficio-afil.component';
import { VerEditarDeduccionAfilComponent } from '../pages/Generales/ver-editar-deduccion-afil/ver-editar-deduccion-afil.component';

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
        redirectTo: 'afil-banco',
      },
      {
        path: 'afil-banco',
        component: AfilBancoComponent,
        data: {
          title: 'Nuevo Afiliado',
        },
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
        path: 'nueva-planilla',
        component: NuevaPlanillaComponentP,
        data: {
          title: 'Nueva Planilla',
        },
      },
      {
        path: 'subir-deduccionesform',
        component: SubirDeduccionesformComponent,
        data: {
          title: 'Subir Deducciones',
        },
      },
/*       {
        path: 'ver-deducciones',
        component: VerDeduccionesComponent,
        data: {
          title: 'Ver Deducciones',
        },
      }, */
      {
        path: 'ver-planillas',
        component: VerPlanillasComponent,
        data: {
          title: 'Ver Planillas',
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
          title: 'Nuevo Afiliado',
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
          title: 'Nuevo Afiliado',
        },
      },
      {
        path: 'editar-tipo-deduccion',
        component: EditarTipoDeduccionComponent,
        data: {
          title: 'Editar tipo-deduccion',
        },
      },
    ],
  },
];

@NgModule({
  imports: [RouterModule.forChild(routes)],
  exports: [RouterModule],
})
export class ThemeRoutingModule { }
