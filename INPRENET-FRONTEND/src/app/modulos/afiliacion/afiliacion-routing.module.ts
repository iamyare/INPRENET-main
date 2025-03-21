import { NgModule } from '@angular/core';
import { RouterModule, Routes } from '@angular/router';
import { AfiliacionCentrosComponent } from './Centros-Educativos/afiliacion-centros/afiliacion-centros.component';
import { VerDatosCentrosComponent } from './Centros-Educativos/ver-datos-centros/ver-datos-centros.component';
import { BuscarPersonaComponent } from './verPerfil/buscar-persona/buscar-persona.component';
import { MantenimientoAfiliacionComponent } from './mantenimiento/mantenimiento-afiliacion/mantenimiento-afiliacion.component';
import { DiscapacidadComponent } from './mantenimiento/discapacidad/discapacidad.component';
import { ProfesionComponent } from './mantenimiento/profesion/profesion.component';
import { ColegioComponent } from './mantenimiento/colegio/colegio.component';
import { BancoComponent } from './mantenimiento/banco/banco.component';
import { JornadaComponent } from './mantenimiento/jornada/jornada.component';
import { NivelEducativoComponent } from './mantenimiento/nivel-educativo/nivel-educativo.component';
import { AfiliarDocenteComponent } from './gestion/afiliar-docente/afiliar-docente.component';
import { RoleGuard } from 'src/app/guards/role-guard.guard';
import { PermisosService } from 'src/app/services/permisos.service';
import { ContanciasAfiliadosComponent } from './constancias/contancias-afiliados/contancias-afiliados.component';
import { AldeaComponent } from './mantenimiento/aldea/aldea.component';
import { ColoniaComponent } from './mantenimiento/colonia/colonia.component';

const routes: Routes = [
  {
    path: 'constancias-afiliados',
    component: ContanciasAfiliadosComponent,
    canActivate: [RoleGuard],
    data: { expectedRolesModules: PermisosService.getExpectedRolesForRoute('AFILIACIONES', 'afiliacion/constancias-afiliados') }
  },
  {
    path: 'nuevo-centro',
    component: AfiliacionCentrosComponent,
    canActivate: [RoleGuard],
    data: { expectedRolesModules: PermisosService.getExpectedRolesForRoute('AFILIACIONES', 'afiliacion/nuevo-centro') }
  },
  {
    path: 'ver-datos-centro',
    component: VerDatosCentrosComponent,
    canActivate: [RoleGuard],
    data: { expectedRolesModules: PermisosService.getExpectedRolesForRoute('AFILIACIONES', 'afiliacion/ver-datos-centro') }
  },
  {
    path: 'buscar-persona',
    component: BuscarPersonaComponent,
    canActivate: [RoleGuard],
    data: { expectedRolesModules: PermisosService.getExpectedRolesForRoute('AFILIACIONES', 'afiliacion/buscar-persona') }
  },
  {
    path: 'nueva-afiliacion',
    component: AfiliarDocenteComponent,
    canActivate: [RoleGuard],
    data: { expectedRolesModules: PermisosService.getExpectedRolesForRoute('AFILIACIONES', 'afiliacion/nueva-afiliacion') }
  },
  {
    path: 'mantenimiento',
    component: MantenimientoAfiliacionComponent,
    canActivate: [RoleGuard],
    data: { expectedRolesModules: PermisosService.getExpectedRolesForRoute('MANTENIMIENTO', 'afiliacion/mantenimiento') }
  },
  {
    path: 'mantenimiento/discapacidad',
    component: DiscapacidadComponent,
    canActivate: [RoleGuard],
    data: { expectedRolesModules: PermisosService.getExpectedRolesForRoute('MANTENIMIENTO', 'afiliacion/mantenimiento/discapacidad') }
  },
  {
    path: 'mantenimiento/profesion',
    component: ProfesionComponent,
    canActivate: [RoleGuard],
    data: { expectedRolesModules: PermisosService.getExpectedRolesForRoute('MANTENIMIENTO', 'afiliacion/mantenimiento/profesion') }
  },
  {
    path: 'mantenimiento/colegio',
    component: ColegioComponent,
    canActivate: [RoleGuard],
    data: { expectedRolesModules: PermisosService.getExpectedRolesForRoute('MANTENIMIENTO', 'afiliacion/mantenimiento/colegio') }
  },
  {
    path: 'mantenimiento/aldea',
    component: AldeaComponent,
    canActivate: [RoleGuard],
    data: { expectedRolesModules: PermisosService.getExpectedRolesForRoute('MANTENIMIENTO', 'afiliacion/mantenimiento/aldea') }
  },
  {
    path: 'mantenimiento/colonia',
    component: ColoniaComponent,
    canActivate: [RoleGuard],
    data: { expectedRolesModules: PermisosService.getExpectedRolesForRoute('MANTENIMIENTO', 'afiliacion/mantenimiento/colonia') }
  },
  {
    path: 'mantenimiento/banco',
    component: BancoComponent,
    canActivate: [RoleGuard],
    data: { expectedRolesModules: PermisosService.getExpectedRolesForRoute('MANTENIMIENTO', 'afiliacion/mantenimiento/banco') }
  },
  {
    path: 'mantenimiento/jornada',
    component: JornadaComponent,
    canActivate: [RoleGuard],
    data: { expectedRolesModules: PermisosService.getExpectedRolesForRoute('MANTENIMIENTO', 'afiliacion/mantenimiento/jornada') }
  },
  {
    path: 'mantenimiento/nivel-educativo',
    component: NivelEducativoComponent,
    canActivate: [RoleGuard],
    data: { expectedRolesModules: PermisosService.getExpectedRolesForRoute('MANTENIMIENTO', 'afiliacion/mantenimiento/nivel-educativo') }
  },
  { path: '**', redirectTo: 'nuevo-afiliado', pathMatch: 'full' }
];

@NgModule({
  imports: [RouterModule.forChild(routes)],
  exports: [RouterModule]
})
export class AfiliacionRoutingModule {}
