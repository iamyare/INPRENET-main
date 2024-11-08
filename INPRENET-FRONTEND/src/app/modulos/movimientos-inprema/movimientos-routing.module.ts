import { NgModule } from '@angular/core';
import { RouterModule, Routes } from '@angular/router';
import { MovimientosComponent } from './movimientos/movimientos.component';
import { RoleGuard } from 'src/app/guards/role-guard.guard';
import { PermisosService } from 'src/app/services/permisos.service';

const routes: Routes = [
  {
    path: 'Movimientos',
    children: [
      {
        path: 'Ver-movimientos',
        component: MovimientosComponent,
        canActivate: [RoleGuard],
        data: { expectedRolesModules: PermisosService.getExpectedRolesForRoute('CUENTAS INPREMA', 'cuentas/Movimientos/Ver-movimientos') }
      },
      { path: '**', redirectTo: 'Ver-movimientos', pathMatch: 'full' }
    ]
  },
];

@NgModule({
  imports: [RouterModule.forChild(routes)],
  exports: [RouterModule]
})
export class MovimientosRoutingModule { }
