import { NgModule } from '@angular/core';
import { Routes, RouterModule } from '@angular/router';

/* import { ColorsComponent } from './colors.component';
import { TypographyComponent } from './typography.component'; */
import { AfilBancoComponent } from '../pages/afil-banco/afil-banco.component';

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
      /* {
        path: 'colors',
        component: ColorsComponent,
        data: {
          title: 'Colors',
        },
      }, */
      /* {
        path: 'typography',
        component: TypographyComponent,
        data: {
          title: 'Typography',
        },
      }, */
      {
        path: 'afil-banco',
        component: AfilBancoComponent,
        data: {
          title: 'Afiliados a banco',
        },
      },
    ],
  },
];

@NgModule({
  imports: [RouterModule.forChild(routes)],
  exports: [RouterModule],
})
export class ThemeRoutingModule {}
