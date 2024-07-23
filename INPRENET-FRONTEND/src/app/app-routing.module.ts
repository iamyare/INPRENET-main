import { NgModule } from '@angular/core';
import { RouterModule, Routes } from '@angular/router';
import { LoginComponent } from './modulos/auth/login/login.component';
import { LoginPrivadosComponent } from './modulos/auth/login-privados/login-privados.component';
import { OlvidoContrasenaComponent } from './modulos/auth/olvido-contrasena/olvido-contrasena.component';
import { RestablecerContrasenaComponent } from './modulos/auth/restablecer-contrasena/restablecer-contrasena.component';
import { RegisterComponent } from './modulos/auth/register/register.component';
import { PreRegisterComponent } from './modulos/auth/pre-register/pre-register.component';
import { LayoutComponent } from './components/layout/layout.component';
import { AdminLayoutComponent } from './modulos/admin/admin-layout/admin-layout.component';
import { DashboardAdminComponent } from './modulos/admin/dashboard-admin/dashboard-admin.component';
import { UserManagementComponent } from './modulos/admin/user-management/user-management.component';
import { AddAdminComponent } from './modulos/admin/add-admin/add-admin.component';
import { EditarPerfilComponent } from './modulos/auth/editar-perfil/editar-perfil.component';
import { DashboardComponent } from './views/dashboard/dashboard.component';
import { MainLayoutComponent } from './components/main-layout/main-layout.component';

const routes: Routes = [
  { path: 'login', component: LoginComponent },
  { path: 'login-privados', component: LoginPrivadosComponent },
  { path: 'solicitud-restablecimiento', component: OlvidoContrasenaComponent },
  { path: 'restablecer-contrasena/:token', component: RestablecerContrasenaComponent },
  { path: 'register', component: RegisterComponent },
  { path: 'pre-register', component: PreRegisterComponent },
  //{ path: 'dashboard', component: DashboardComponent },

  {
    path: '',
    /* component: MainLayoutComponent, */
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
        loadChildren: () => import('./modulos/admin/admin.module').then((m) => m.AdminModule),
      },
      {
        path: 'menu',
        loadChildren: () => import('./views/views.module').then((m) => m.ViewsModule),
      },
      { path: 'usuario/editar', component: EditarPerfilComponent },
    ]
  },
  {
    path: '',
    component: AdminLayoutComponent,
    children: [
      { path: 'dashboard-admin', component: DashboardAdminComponent },
      { path: 'user-management', component: UserManagementComponent },
      { path: 'add-admin', component: AddAdminComponent },
      { path: '', redirectTo: 'dashboard', pathMatch: 'full' }
    ]
  },
];

@NgModule({
  imports: [RouterModule.forRoot(routes)],
  exports: [RouterModule]
})
export class AppRoutingModule { }
