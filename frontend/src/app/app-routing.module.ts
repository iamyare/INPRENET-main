import { NgModule } from '@angular/core';
import { RouterModule, Routes } from '@angular/router';
import { DefaultLayoutComponent } from './containers';
import { Page404Component } from './views/pages/Errores/page404/page404.component';
import { Page500Component } from './views/pages/Errores/page500/page500.component';
import { LoginComponent } from './views/pages/login-registro/login/login.component';
import { RegisterComponent } from './views/pages/login-registro/register/register.component';
import { PreRegisterComponent } from './views/pages/login-registro/pre-register/pre-register.component';
import { RoleGuard } from './guards/role-guard.guard';
import { LoginPrivadosComponent } from './views/pages/login-registro/login-privados/login-privados.component';
import { RestablecerContrasenaComponent } from './views/pages/login-registro/restablecer-contrasena/restablecer-contrasena.component';
import { OlvidoContrasenaComponent } from './views/pages/login-registro/olvido-contrasena/olvido-contrasena.component';

const routes: Routes = [
  {
    path: '',
    redirectTo: 'dashboard',
    pathMatch: 'full'
  },
  {
    path: 'admin',
    loadChildren: () => import('../app/views/pages/admin/admin.module').then(m => m.AdminModule)
  },
  {
    path: 'perfil',
    loadChildren: () => import('../app/views/pages/afiliacion/afiliacion.module').then(m => m.AfiliacionModule)
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
          expectedRolesModules: [
            { role: 'ADMINISTRADOR', module: 'PLANILLA' },
            { role: 'ADMINISTRADOR', module: 'AFILIACION' },
            { role: 'JEFE DE AREA', module: 'PLANILLA' },
            { role: 'OFICIAL', module: 'PLANILLA' },
            { role: 'AUXILIAR', module: 'PLANILLA' },
          ]
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
        path: 'Usuario',
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
      {
        path: 'Gestion',
        loadChildren: () =>
          import('./views/theme/theme.module').then((m) => m.ThemeModule),
        canActivate: [RoleGuard],
        data: {
          expectedRolesModules: [
            { role: 'ADMINISTRADOR'}
          ]
        }
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
    path: 'register',
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
  { path: 'solicitud-restablecimiento',
    component: OlvidoContrasenaComponent,
    data: {
      title: 'Solitud de restablecimiento'
    }
   },
  { path: 'restablecer-contrasena/:token',
    component: RestablecerContrasenaComponent,
    data: {
      title: 'Restablecer Contraseña'
    }
   },
  { path: '**', redirectTo: 'dashboard' }
];

@NgModule({
  imports: [
    RouterModule.forRoot(routes, {
      scrollPositionRestoration: 'top',
      anchorScrolling: 'enabled',
      initialNavigation: 'enabledBlocking'
    })
  ],
  exports: [RouterModule]
})
export class AppRoutingModule { }
