import { NgModule } from '@angular/core';
import { RouterModule, Routes } from '@angular/router';
import { VerAfiliadoComponent } from './ver-afiliado/ver-afiliado.component';
import { RoleGuard } from '../../../app/guards/role-guard.guard';
import { PermisosService } from '../../../app/services/permisos.service';

const routes: Routes = [
  { path: 'ver-afiliado',
    component: VerAfiliadoComponent,
    canActivate: [RoleGuard],
    data: { expectedRolesModules: PermisosService.getExpectedRolesForRoute('CONASA', 'conasa/ver-afiliado') }
  },
];

@NgModule({
  imports: [RouterModule.forChild(routes)],
  exports: [RouterModule],
})
export class ConasaRoutingModule {}
