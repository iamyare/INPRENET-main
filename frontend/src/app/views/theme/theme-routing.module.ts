import { NgModule } from '@angular/core';
import { Routes, RouterModule } from '@angular/router';

import { AfilBancoComponent } from '../pages/afil-banco/afil-banco.component';
import { CentroTrabajoComponent } from '../pages/centro-trabajo/centro-trabajo.component';
import { DatosGenAfilComponent } from '../pages/datos-gen-afil/datos-gen-afil.component';
import { VerDeduccionesComponent } from '../pages/ver-deducciones/ver-deducciones.component';
import { SubirDeduccionesComponent } from '../pages/subir-deducciones/subir-deducciones.component';
import { NuevaPlanillaComponent } from '../pages/nueva-planilla/nueva-planilla.component';
import { VerPlanillasComponent } from '../pages/ver-planillas/ver-planillas.component';
import { SubirDeduccionesformComponent } from '../pages/subir-deduccionesform/subir-deduccionesform.component';
/* import { CentroTrabajoPageComponent } from '../pages/centro-trabajo-page/centro-trabajo-page.component'; */

const routes: Routes = [
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
    ],
  },
  {
    path: '',
    data: {
      title: 'Planilla',
    },
    children: [
      {
        path: 'subir-deducciones',
        component: SubirDeduccionesComponent,
        data: {
          title: 'Subir Deducciones',
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
        path: 'ver-deducciones',
        component: VerDeduccionesComponent,
        data: {
          title: 'Ver Deducciones',
        },
      },
      {
        path: 'nueva-planilla',
        component: NuevaPlanillaComponent,
        data: {
          title: 'Nueva Planilla',
        },
      },
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
];

@NgModule({
  imports: [RouterModule.forChild(routes)],
  exports: [RouterModule],
})
export class ThemeRoutingModule { }
