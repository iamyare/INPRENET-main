import { NgModule } from '@angular/core';
import { RouterModule, Routes } from '@angular/router';

import { DefaultLayoutComponent } from './containers';
import { Page404Component } from './views/pages/Errores/page404/page404.component';
import { Page500Component } from './views/pages/Errores/page500/page500.component';
import { LoginComponent } from './views/pages/Generales/login/login.component';
import { RegisterComponent } from './views/pages/Generales/register/register.component';
import { PreRegisterComponent } from './views/pages/Generales/pre-register/pre-register.component';
import { RoleGuard } from './guards/role-guard.guard';
import { LoginPrivadosComponent } from './views/pages/Centros Privados/login-privados/login-privados.component';
import { PlanillaColegiosPrivadosComponent } from './views/pages/Centros Privados/planilla-colegios-privados/planilla-colegios-privados.component';
import { NavDefaultComponent } from './views/pages/Centros Privados/nav-default/nav-default.component';

const routes: Routes = [
  {
    path: '',
    redirectTo: 'dashboard',
    pathMatch: 'full'
  },
  {
    path: '',
    component: DefaultLayoutComponent,
    data: {
      title: 'Inicio'
    },
    children: [
      {
        path: 'dashboard',
        loadChildren: () =>
          import('./views/dashboard/dashboard.module').then((m) => m.DashboardModule),
      },
      {
        path: 'Afiliado',
        loadChildren: () =>
          import('./views/theme/theme.module').then((m) => m.ThemeModule),
        canActivate: [RoleGuard],
        data: {
          expectedRoles: ['ADMINISTRADOR', 'JEFE', 'OFICIAL', 'AUXILIAR']
    }
      },
      {
        path: 'Planilla',
        loadChildren: () =>
          import('./views/theme/theme.module').then((m) => m.ThemeModule),
      },
      {
        path: 'Beneficio',
        loadChildren: () =>
          import('./views/theme/theme.module').then((m) => m.ThemeModule),
      },
      {
        path: 'Tipo-Planilla',
        loadChildren: () =>
          import('./views/theme/theme.module').then((m) => m.ThemeModule),
      },
      {
        path: 'Deduccion',
        loadChildren: () =>
          import('./views/theme/theme.module').then((m) => m.ThemeModule),
      },
      {
        path: 'Privados',
        loadChildren: () =>
          import('./views/theme/theme.module').then((m) => m.ThemeModule)
      },
      {
        path: 'Movimiento',
        loadChildren: () =>
          import('./views/theme/theme.module').then((m) => m.ThemeModule),
      },
      {
        path: 'pages',
        loadChildren: () =>
          import('./views/pages/pages.module').then((m) => m.PagesModule)
      },
    ]
  },

  {
    path: '404',
    component: Page404Component,
    data: {
      title: 'Page 404'
    }
  },
  {
    path: '500',
    component: Page500Component,
    data: {
      title: 'Page 500'
    }
  },
  {
    path: 'login',
    component: LoginComponent,
    data: {
      title: 'Login Page'
    }
  },
  {
    path: 'register/:token',
    component: RegisterComponent,
    data: {
      title: 'Register Page'
    }
  },
  {
    path: 'pre-register',
    component: PreRegisterComponent,
    data: {
      title: 'Pre Register Page'
    }
  },
  {
    path: 'login-privados',
    component: LoginPrivadosComponent,
    data: {
      title: 'Login Privados Page'
    }
  },
  {
    path: 'privados',
    component: NavDefaultComponent,
    data: {
      title: 'Inicio Privados'
    },
    children: [
      {
        path: '',
        component: PlanillaColegiosPrivadosComponent,
        data: {
          title: 'Planilla de privados'
        }
      },
      {
        path: 'PlanillaPrivados',
        component: PlanillaColegiosPrivadosComponent,
        data: {
          title: 'Planilla de privados'
        }
      },
    ]
  },


  /* {path: '**', redirectTo: 'dashboard'} */
];

@NgModule({
  imports: [
    RouterModule.forRoot(routes, {
      scrollPositionRestoration: 'top',
      anchorScrolling: 'enabled',
      initialNavigation: 'enabledBlocking'
      // relativeLinkResolution: 'legacy'
    })
  ],
  exports: [RouterModule]
})
export class AppRoutingModule {
}

/*
{
        path: 'dashboard',
        loadChildren: () =>
          import('./views/dashboard/dashboard.module').then((m) => m.DashboardModule),
      },
*/
