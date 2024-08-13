import { NgModule } from '@angular/core';
import { RouterModule, Routes } from '@angular/router';
import { AdminLayoutComponent } from './modulos/admin/admin-layout/admin-layout.component';
import { DashboardAdminComponent } from './modulos/admin/dashboard-admin/dashboard-admin.component';
import { UserManagementComponent } from './modulos/admin/user-management/user-management.component';
import { AddAdminComponent } from './modulos/admin/add-admin/add-admin.component';
import { MainLayoutComponent } from './components/main-layout/main-layout.component';
import { EditarPerfilComponent } from './modulos/auth/editar-perfil/editar-perfil.component';
import { CustomContainerComponent } from './components/custom-container/custom-container.component';
import { RoleGuard } from './guards/role-guard.guard';
import { LoginComponent } from './modulos/auth/login/login.component';
import { LoginPrivadosComponent } from './modulos/auth/login-privados/login-privados.component';
import { OlvidoContrasenaComponent } from './modulos/auth/olvido-contrasena/olvido-contrasena.component';
import { RestablecerContrasenaComponent } from './modulos/auth/restablecer-contrasena/restablecer-contrasena.component';
import { RegisterComponent } from './modulos/auth/register/register.component';
import { LandingPageComponent } from './components/landing-page/landing-page.component';
import { PagenotfoundComponent } from './components/pagenotfound/pagenotfound.component';

const routes: Routes = [
  {
    path: 'auth',
    component: CustomContainerComponent,
    children: [
      { path: 'login', component: LoginComponent },
      { path: 'login-privados', component: LoginPrivadosComponent },
      { path: 'solicitud-restablecimiento', component: OlvidoContrasenaComponent },
      { path: 'restablecer-contrasena/:token', component: RestablecerContrasenaComponent },
      { path: 'register', component: RegisterComponent },
      { path: '', redirectTo: 'login', pathMatch: 'full' },
      { path: '**', redirectTo: '/pagenotfound', pathMatch: 'full' },
    ],
  },
  {
    path: 'admin',
    component: AdminLayoutComponent,
    children: [
      { path: 'dashboard-admin', component: DashboardAdminComponent },
      { path: 'user-management', component: UserManagementComponent },
      { path: 'add-admin', component: AddAdminComponent },
      //{ path: '', redirectTo: 'dashboard-admin', pathMatch: 'full' }
    ],
    canActivate: [RoleGuard],
    data: { expectedRolesModules: [{ role: 'ADMINISTRADOR' }, { role: 'ADMINISTRADOR DE PLANILLA', module: 'PLANILLA' }, { role: 'OFICIAL DE PLANILLA', module: 'PLANILLA' }] }
  },
  {
    path: 'home',
    component: MainLayoutComponent,
    children: [
      {
        path: 'afiliacion',
        loadChildren: () => import('./modulos/afiliacion/afiliacion.module').then(m => m.AfiliacionModule),
        /* canActivate: [RoleGuard],
        data: { expectedRolesModules: [{ role: 'ADMINISTRADOR' }, { role: 'ADMINISTRADOR DE PLANILLA', module: 'PLANILLA' }, { role: 'OFICIAL DE PLANILLA', module: 'PLANILLA' }] } */
      },
      {
        path: 'planilla',
        loadChildren: () => import('./modulos/planilla/planilla.module').then(m => m.PlanillaModule),
        /* canActivate: [RoleGuard],
        data: { expectedRolesModules: [{ role: 'ADMINISTRADOR' }, { role: 'ADMINISTRADOR DE PLANILLA', module: 'PLANILLA' }, { role: 'OFICIAL DE PLANILLA', module: 'PLANILLA' }] } */
      },
      {
        path: 'gestion',
        loadChildren: () => import('./modulos/admin/admin.module').then(m => m.AdminModule),
        /* canActivate: [RoleGuard],
        data: { expectedRolesModules: [{ role: 'ADMINISTRADOR' }, { role: 'ADMINISTRADOR DE PLANILLA', module: 'PLANILLA' }, { role: 'OFICIAL DE PLANILLA', module: 'PLANILLA' }] } */
      },
      {
        path: 'menu',
        loadChildren: () => import('./views/views.module').then(m => m.ViewsModule),
      },
      { path: 'usuario/editar', component: EditarPerfilComponent },
    ],
    /* canActivate: [RoleGuard],
    data: { expectedRolesModules: [{ role: 'ADMINISTRADOR' }, { role: 'ADMINISTRADOR DE PLANILLA', module: 'PLANILLA' }, { role: 'OFICIAL DE PLANILLA', module: 'PLANILLA' }] } */
  },
  { path: '', component: CustomContainerComponent, children: [{ path: '', component: LandingPageComponent }] },
  { path: 'pagenotfound', component: PagenotfoundComponent},
  { 
    path: '**',  redirectTo: 'pagenotfound', pathMatch: 'full'
  }
];

@NgModule({
  imports: [RouterModule.forRoot(routes)],
  exports: [RouterModule]
})
export class AppRoutingModule { }
