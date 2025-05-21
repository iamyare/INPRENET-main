import { NgModule } from '@angular/core';
import { RouterModule, Routes } from '@angular/router';
import { RoleGuard } from '../../guards/role-guard.guard';
import { PermisosService } from '../../services/permisos.service';
import { PruebaVidaComponent } from './prueba-vida/prueba-vida.component';

const routes: Routes = [
  {
      path: 'prueba-vida',
      component: PruebaVidaComponent,
      canActivate: [RoleGuard],
      data: { expectedRolesModules: PermisosService.getExpectedRolesForRoute('CARNETIZACION', 'rnp/prueba-vida') }
    },
    { path: '**', redirectTo: 'prueba-vida', pathMatch: 'full' }
];

@NgModule({
  imports: [RouterModule.forChild(routes)],
  exports: [RouterModule]
})
export class RnpRoutingModule { }
