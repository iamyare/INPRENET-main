import { NgModule } from '@angular/core';
import { RouterModule, Routes } from '@angular/router';
import { AdminLayoutComponent } from './admin-layout/admin-layout.component';
import { DashboardAdminComponent } from './dashboard-admin/dashboard-admin.component';
import { UserManagementComponent } from './user-management/user-management.component';
import { AddAdminComponent } from './add-admin/add-admin.component'; // Importa tu componente aquí

const routes: Routes = [
  {
    path: '',
    component: AdminLayoutComponent,
    children: [
      { path: 'dashboard', component: DashboardAdminComponent },
      { path: 'user-management', component: UserManagementComponent },
      { path: 'add-admin', component: AddAdminComponent },
      { path: '', redirectTo: 'dashboard', pathMatch: 'full' }
    ]
  }
];

@NgModule({
  imports: [RouterModule.forChild(routes)],
  exports: [RouterModule]
})
export class AdminRoutingModule { }
