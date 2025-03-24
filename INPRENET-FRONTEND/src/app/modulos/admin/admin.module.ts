import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { AdminRoutingModule } from './admin-routing.module';
import { AdminLayoutComponent } from './admin-layout/admin-layout.component';
import { DashboardAdminComponent } from './dashboard-admin/dashboard-admin.component';
import { UserManagementComponent } from './user-management/user-management.component';
import { AddAdminComponent } from './add-admin/add-admin.component';
import { MaterialAngularModule } from 'src/app/material-angular/material-angular.module';
import { ComponentsModule } from 'src/app/components/components.module';
import { DisableUserDialogComponent } from './admin-centro/disable-user-dialog/disable-user-dialog.component';
import { GestionUsuariosComponent } from './admin-centro/gestion-usuarios/gestion-usuarios.component';
import { NuevoUsuarioComponent } from './admin-centro/nuevo-usuario/nuevo-usuario.component';
import { PerfilEdicionComponent } from './admin-centro/perfil-edicion/perfil-edicion.component';
import { PerfilEdicionSeguridadComponent } from './admin-centro/perfil-edicion-seguridad/perfil-edicion-seguridad.component';

@NgModule({
  declarations: [
    AdminLayoutComponent,
    DashboardAdminComponent,
    UserManagementComponent,
    AddAdminComponent,
    DisableUserDialogComponent,
    GestionUsuariosComponent,
    NuevoUsuarioComponent,
    PerfilEdicionComponent,
    PerfilEdicionSeguridadComponent
  ],
  imports: [
    CommonModule,
    AdminRoutingModule,
    MaterialAngularModule,
    ComponentsModule
  ]
})
export class AdminModule { }
