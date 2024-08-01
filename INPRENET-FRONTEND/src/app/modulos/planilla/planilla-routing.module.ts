import { NgModule } from '@angular/core';
import { RouterModule, Routes } from '@angular/router';
import { NuevaPlanillaComponentP } from './egresos/nueva-planilla/nueva-planilla.component';
import { VerPlanillasComponent } from './egresos/ver-planillas/ver-planillas.component';
import { CargarPlanillaPrivadosComponent } from './ingresos/cargar-planilla-privados/cargar-planilla-privados.component';
import { PlanillaColegiosPrivadosComponent } from './ingresos/planilla-colegios-privados/planilla-colegios-privados.component';
import { DocumentosPlanillaComponent } from './egresos/documentosPlanilla/documentosPlanilla.component';
import { NuevoBeneficioAfilComponent } from './beneneficios/nuevo-beneficio-afil/nuevo-beneficio-afil.component';
import { VerEditarBeneficioAfilComponent } from './beneneficios/ver-editar-beneficio-afil/ver-editar-beneficio-afil.component';
import { NuevaDeduccionAfilComponent } from './egresos/nueva-deduccion-afil/nueva-deduccion-afil.component';
import { VerEditarDeduccionAfilComponent } from './beneneficios/ver-editar-deduccion-afil/ver-editar-deduccion-afil.component';
import { RoleGuard } from '../../guards/role-guard.guard';
import { AsignacionDeduccionesComponent } from './beneneficios/asignacion-deducciones/asignacion-deducciones.component';

const routes: Routes = [
  {
    path: 'nueva-planilla',
    component: NuevaPlanillaComponentP,
    //canActivate: [RoleGuard],
    //data: { expectedRolesModules: [{role: 'ADMINISTRADOR'},{ role: 'ADMINISTRADOR DE PLANILLA', module: 'PLANILLA' }, { role: 'OFICIAL DE PLANILLA', module: 'PLANILLA' }] }
  },
  {
    path: 'ver-planillas',
    component: VerPlanillasComponent,
    //canActivate: [RoleGuard],
    //data: { expectedRolesModules: [{role: 'ADMINISTRADOR'},{ role: 'ADMINISTRADOR DE PLANILLA', module: 'PLANILLA' }, { role: 'OFICIAL DE PLANILLA', module: 'PLANILLA' }] }
  },
  {
    path: 'planilla-colegios-privados',
    component: PlanillaColegiosPrivadosComponent,
    //canActivate: [RoleGuard],
    //data: { expectedRolesModules: [{role: 'ADMINISTRADOR'},{ role: 'ADMINISTRADOR DE PLANILLA', module: 'PLANILLA' }, { role: 'OFICIAL DE PLANILLA', module: 'PLANILLA' }] }
  },
  {
    path: 'cargar-planilla-privados',
    component: CargarPlanillaPrivadosComponent,
    //canActivate: [RoleGuard],
    //data: { expectedRolesModules: [{role: 'ADMINISTRADOR'},{ role: 'ADMINISTRADOR DE PLANILLA', module: 'PLANILLA' }, { role: 'OFICIAL DE PLANILLA', module: 'PLANILLA' }] }
  },
  {
    path: 'documentos-planilla',
    component: DocumentosPlanillaComponent,
    //canActivate: [RoleGuard],
    //data: { expectedRolesModules: [{role: 'ADMINISTRADOR'},{ role: 'ADMINISTRADOR DE PLANILLA', module: 'PLANILLA' }, { role: 'OFICIAL DE PLANILLA', module: 'PLANILLA' }] }
  },
  {
    path: 'Beneficios/nuevo-beneficio-afil',
    component: NuevoBeneficioAfilComponent,
    //canActivate: [RoleGuard],
    //data: { expectedRolesModules: [{role: 'ADMINISTRADOR'},{ role: 'ADMINISTRADOR DE PLANILLA', module: 'PLANILLA' }, { role: 'OFICIAL DE PLANILLA', module: 'PLANILLA' }] }
  },
  {
    path: 'Beneficios/Ver-editar-beneficio-afil',
    component: VerEditarBeneficioAfilComponent,
    //canActivate: [RoleGuard],
    //data: { expectedRolesModules: [{role: 'ADMINISTRADOR'},{ role: 'ADMINISTRADOR DE PLANILLA', module: 'PLANILLA' }, { role: 'OFICIAL DE PLANILLA', module: 'PLANILLA' }] }
  },
  {
    path: 'Deducciones/nueva-deduccion-afil',
    component: AsignacionDeduccionesComponent,
    //canActivate: [RoleGuard],
    //data: { expectedRolesModules: [{role: 'ADMINISTRADOR'},{ role: 'ADMINISTRADOR DE PLANILLA', module: 'PLANILLA' }, { role: 'OFICIAL DE PLANILLA', module: 'PLANILLA' }] }
  },
  {
    path: 'Deducciones/ver-editar-deduccion-afil',
    component: VerEditarDeduccionAfilComponent,
    //canActivate: [RoleGuard],
    //data: { expectedRolesModules: [{role: 'ADMINISTRADOR'},{ role: 'ADMINISTRADOR DE PLANILLA', module: 'PLANILLA' }, { role: 'OFICIAL DE PLANILLA', module: 'PLANILLA' }] }
  },
  { path: '', redirectTo: 'planilla', pathMatch: 'full' }
];

@NgModule({
  imports: [RouterModule.forChild(routes)],
  exports: [RouterModule]
})
export class PlanillaRoutingModule { }
