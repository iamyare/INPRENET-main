import { NgModule } from '@angular/core';
import { RouterModule, Routes } from '@angular/router';
import { VerAfiliadoComponent } from './ver-afiliado/ver-afiliado.component';
import { RoleGuard } from '../../../app/guards/role-guard.guard';
import { PermisosService } from '../../../app/services/permisos.service';
import { ConasaMenuComponent } from './conasa-menu/conasa-menu.component';
import { IngresarAsistenciaComponent } from './ingresar-asistencia/ingresar-asistencia.component';
import { ReporteAsistenciasComponent } from './reporte-asistencias/reporte-asistencias.component';
import { AnularAsistenciasComponent } from './anular-asistencias/anular-asistencias.component';
import { ModificarAsistenciasComponent } from './modificar-asistencias/modificar-asistencias.component';
import { CancelarAsistenciasComponent } from './cancelar-asistencias/cancelar-asistencias.component';
import { SubirFacturaComponent } from './subir-factura/subir-factura.component';

const routes: Routes = [
  { path: 'ver-afiliado',
    component: VerAfiliadoComponent,
    canActivate: [RoleGuard],
    data: { expectedRolesModules: PermisosService.getExpectedRolesForRoute('CONASA', 'conasa/ver-afiliado') }
  },
  { path: 'subir-factura',
    component: SubirFacturaComponent,
    canActivate: [RoleGuard],
    data: { expectedRolesModules: PermisosService.getExpectedRolesForRoute('CONASA', 'conasa/subir-factura') }
  },
  { path: 'menu-conasa',
    component: ConasaMenuComponent,
    canActivate: [RoleGuard],
    data: { expectedRolesModules: PermisosService.getExpectedRolesForRoute('CONASA', 'conasa/menu-conasa') }
  },
  {
    path: 'menu-conasa/ingresar-asistencia',
    component: IngresarAsistenciaComponent,
    canActivate: [RoleGuard],
    data: { expectedRolesModules: PermisosService.getExpectedRolesForRoute('CONASA', 'conasa/menu-conasa/ingresar-asistencia') }
  },
  {
    path: 'menu-conasa/reporte-asistencias',
    component: ReporteAsistenciasComponent,
    canActivate: [RoleGuard],
    data: { expectedRolesModules: PermisosService.getExpectedRolesForRoute('CONASA', 'conasa/menu-conasa/reporte-asistencias') }
  },
  {
    path: 'menu-conasa/anular-asistencias',
    component: AnularAsistenciasComponent,
    canActivate: [RoleGuard],
    data: { expectedRolesModules: PermisosService.getExpectedRolesForRoute('CONASA', 'conasa/menu-conasa/anular-asistencias') }
  },
  {
    path: 'menu-conasa/modificar-asistencias',
    component: ModificarAsistenciasComponent,
    canActivate: [RoleGuard],
    data: { expectedRolesModules: PermisosService.getExpectedRolesForRoute('CONASA', 'conasa/menu-conasa/modificar-asistencias') }
  },
  {
    path: 'menu-conasa/cancelar-asistencias',
    component: CancelarAsistenciasComponent,
    canActivate: [RoleGuard],
    data: { expectedRolesModules: PermisosService.getExpectedRolesForRoute('CONASA', 'conasa/menu-conasa/cancelar-asistencias') }
  },
];

@NgModule({
  imports: [RouterModule.forChild(routes)],
  exports: [RouterModule],
})
export class ConasaRoutingModule {}
