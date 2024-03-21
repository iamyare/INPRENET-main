import { NgModule } from '@angular/core';
import { RouterModule, Routes } from '@angular/router';

import { DefaultLayoutComponent } from './containers';
import { Page404Component } from './views/pages/Errores/page404/page404.component';
import { Page500Component } from './views/pages/Errores/page500/page500.component';
import { LoginComponent } from './views/pages/Generales/login/login.component';
import { RegisterComponent } from './views/pages/Generales/register/register.component';
import { PreRegisterComponent } from './views/pages/Generales/pre-register/pre-register.component';
import { RoleGuard } from './guards/role-guard.guard';

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
          canActivate: [RoleGuard],
          data: { expectedRoles: ['ADMINISTRADOR', 'JEFE DE AREA'] }
      },
      {
        path: 'Afiliado',
        loadChildren: () =>
          import('./views/theme/theme.module').then((m) => m.ThemeModule),
          canActivate: [RoleGuard],
          data: { expectedRoles: ['ADMINISTRADOR', 'JEFE DE AREA'] }
      },
      {
        path: 'Planilla',
        loadChildren: () =>
          import('./views/theme/theme.module').then((m) => m.ThemeModule),
          canActivate: [RoleGuard],
          data: { expectedRoles: ['ADMINISTRADOR', 'JEFE DE AREA'] }
      },
      {
        path: 'Beneficio',
        loadChildren: () =>
          import('./views/theme/theme.module').then((m) => m.ThemeModule),
          canActivate: [RoleGuard],
          data: { expectedRoles: ['ADMINISTRADOR', 'JEFE DE AREA'] }
      },
      {
        path: 'Deduccion',
        loadChildren: () =>
          import('./views/theme/theme.module').then((m) => m.ThemeModule),
          canActivate: [RoleGuard],
          data: { expectedRoles: ['ADMINISTRADOR', 'JEFE DE AREA'] }
      },
      {
        path: 'Tipo-Planilla',
        loadChildren: () =>
          import('./views/theme/theme.module').then((m) => m.ThemeModule),
          canActivate: [RoleGuard],
          data: { expectedRoles: ['ADMINISTRADOR', 'JEFE DE AREA'] }
      },
      {
        path: 'Privados',
        loadChildren: () =>
          import('./views/theme/theme.module').then((m) => m.ThemeModule),
          canActivate: [RoleGuard],
          data: { expectedRoles: ['ADMINISTRADOR', 'JEFE DE AREA'] }
      },
      {
        path: 'Movimiento',
        loadChildren: () =>
          import('./views/theme/theme.module').then((m) => m.ThemeModule),
          canActivate: [RoleGuard],
          data: { expectedRoles: ['ADMINISTRADOR', 'JEFE DE AREA'] }
      },
/*       {
        path: 'icons',
        loadChildren: () =>
          import('./views/icons/icons.module').then((m) => m.IconsModule)
      }, */
/*       {
        path: 'notifications',
        loadChildren: () =>
          import('./views/notifications/notifications.module').then((m) => m.NotificationsModule)
      }, */
      /* {
        path: 'widgets',
        loadChildren: () =>
          import('./views/widgets/widgets.module').then((m) => m.WidgetsModule)
      }, */
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
