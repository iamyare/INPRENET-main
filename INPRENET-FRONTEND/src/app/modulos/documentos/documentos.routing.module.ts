import { NgModule } from '@angular/core';
import { MenuDocumentosComponent } from './menu-documentos/menu-documentos.component';
import { RoleGuard } from '../../guards/role-guard.guard';
import { PermisosService } from '../../services/permisos.service';
import { RouterModule, Routes } from '@angular/router';

const routes: Routes = [
  {
    path: 'menu-documentos',
    component: MenuDocumentosComponent,
    canActivate: [RoleGuard],
    data: { expectedRolesModules: PermisosService.getExpectedRolesForRoute('DOCUMENTOS', 'documentos/menu-documentos') }
  },
  { path: '**', redirectTo: 'menu-documentos', pathMatch: 'full' }
];

@NgModule({
  imports: [RouterModule.forChild(routes)],
  exports: [RouterModule]
})
export class DocumentosRoutingModule {}
