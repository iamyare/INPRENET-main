import { NgModule } from '@angular/core';
import { RouterModule, Routes } from '@angular/router';
import { DetalleEnvioEscalafonComponent } from './detalle-envio-escalafon/detalle-envio-escalafon.component';
import { PermisosService } from 'src/app/services/permisos.service';
import { RoleGuard } from 'src/app/guards/role-guard.guard';

const routes: Routes = [
  { path: 'detalle-envio',
     component: DetalleEnvioEscalafonComponent,
     canActivate: [RoleGuard],
     data: { expectedRolesModules: PermisosService.getExpectedRolesForRoute('ESCALAFÓN', 'escalafon/detalle-envio') }
   },
];

@NgModule({
  imports: [RouterModule.forChild(routes)],
  exports: [RouterModule]
})
export class EscalafonRoutingModule { }
