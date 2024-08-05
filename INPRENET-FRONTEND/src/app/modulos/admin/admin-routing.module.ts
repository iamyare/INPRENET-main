import { NgModule } from '@angular/core';
import { RouterModule, Routes } from '@angular/router';
import { AdminLayoutComponent } from './admin-layout/admin-layout.component';
import { DashboardAdminComponent } from './dashboard-admin/dashboard-admin.component';
import { UserManagementComponent } from './user-management/user-management.component';
import { AddAdminComponent } from './add-admin/add-admin.component'; // Importa tu componente aquí
import { GestionUsuariosComponent } from './admin-centro/gestion-usuarios/gestion-usuarios.component';
import { PerfilEdicionComponent } from './admin-centro/perfil-edicion/perfil-edicion.component';
import { NuevoUsuarioComponent } from './admin-centro/nuevo-usuario/nuevo-usuario.component';

const routes: Routes = [
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
    path: '',
    children: [
      { path: 'editar-usuarios', component: GestionUsuariosComponent },
      { path: 'editar-perfil/:id', component: PerfilEdicionComponent },
      { path: 'nuevo-usuario', component: NuevoUsuarioComponent },
    ],
  },
];

@NgModule({
  imports: [RouterModule.forChild(routes)],
  exports: [RouterModule]
})
export class AdminRoutingModule { }
