import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { AdminRoutingModule } from './admin-routing.module';
import { AdminLayoutComponent } from './admin-layout/admin-layout.component';
import { DashboardAdminComponent } from './dashboard-admin/dashboard-admin.component';
import { UserManagementComponent } from './user-management/user-management.component';
import { SharedModule } from 'src/app/shared/shared.module';
import { AddAdminComponent } from './add-admin/add-admin.component';

@NgModule({
  declarations: [
    AdminLayoutComponent,
    DashboardAdminComponent,
    UserManagementComponent,
    AddAdminComponent
  ],
  imports: [
    CommonModule,
    AdminRoutingModule,
    SharedModule,
  ]
})
export class AdminModule { }
