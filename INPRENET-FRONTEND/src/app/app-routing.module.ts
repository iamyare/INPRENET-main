import { NgModule } from '@angular/core';
import { RouterModule, Routes } from '@angular/router';
import { AdminLayoutComponent } from './modulos/admin/admin-layout/admin-layout.component';
import { DashboardAdminComponent } from './modulos/admin/dashboard-admin/dashboard-admin.component';
import { UserManagementComponent } from './modulos/admin/user-management/user-management.component';
import { AddAdminComponent } from './modulos/admin/add-admin/add-admin.component';
import { MainLayoutComponent } from './components/main-layout/main-layout.component';
import { EditarPerfilComponent } from './modulos/auth/editar-perfil/editar-perfil.component';
import { CustomContainerComponent } from './components/custom-container/custom-container.component';
import { LoginComponent } from './modulos/auth/login/login.component';
import { LoginPrivadosComponent } from './modulos/auth/login-privados/login-privados.component';
import { OlvidoContrasenaComponent } from './modulos/auth/olvido-contrasena/olvido-contrasena.component';
import { RestablecerContrasenaComponent } from './modulos/auth/restablecer-contrasena/restablecer-contrasena.component';
import { RegisterComponent } from './modulos/auth/register/register.component';
import { PreRegisterComponent } from './modulos/auth/pre-register/pre-register.component';
import { LandingPageComponent } from './components/landing-page/landing-page.component';

const routes: Routes = [
  {
    path: 'auth',
    component: CustomContainerComponent,
    children: [
      {
        path: '',
        loadChildren: () => import('./modulos/auth/auth.module').then(m => m.AuthModule),
      },
    ]
  },
  {
    path: 'admin',
    component: AdminLayoutComponent,
    children: [
      { path: 'dashboard-admin', component: DashboardAdminComponent },
      { path: 'user-management', component: UserManagementComponent },
      { path: 'add-admin', component: AddAdminComponent },
      { path: '', redirectTo: 'dashboard-admin', pathMatch: 'full' }
    ]
  },
  {
    path: 'home',
    component: MainLayoutComponent,
    children: [
      {
        path: 'afiliacion',
        loadChildren: () => import('./modulos/afiliacion/afiliacion.module').then(m => m.AfiliacionModule),
      },
      {
        path: 'planilla',
        loadChildren: () => import('./modulos/planilla/planilla.module').then(m => m.PlanillaModule)
      },
      {
        path: 'gestion',
        loadChildren: () => import('./modulos/admin/admin.module').then(m => m.AdminModule),
      },
      {
        path: 'menu',
        loadChildren: () => import('./views/views.module').then(m => m.ViewsModule),
      },
      { path: 'usuario/editar', component: EditarPerfilComponent },
    ]
  },
];

@NgModule({
  imports: [RouterModule.forRoot(routes)],
  exports: [RouterModule]
})
export class AppRoutingModule { }
