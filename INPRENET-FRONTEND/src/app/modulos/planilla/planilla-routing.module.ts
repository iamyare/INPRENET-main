import { NgModule } from '@angular/core';
import { RouterModule, Routes } from '@angular/router';
import { VerPlanillasComponent } from './egresos/ver-planillas/ver-planillas.component';
import { CargarPlanillaPrivadosComponent } from './ingresos/cargar-planilla-privados/cargar-planilla-privados.component';
import { PlanillaColegiosPrivadosComponent } from './ingresos/planilla-colegios-privados/planilla-colegios-privados.component';
import { DocumentosPlanillaComponent } from './egresos/documentosPlanilla/documentosPlanilla.component';
import { NuevoBeneficioAfilComponent } from './beneneficios/nuevo-beneficio-afil/nuevo-beneficio-afil.component';
import { VerEditarBeneficioAfilComponent } from './beneneficios/ver-editar-beneficio-afil/ver-editar-beneficio-afil.component';
import { VerEditarDeduccionAfilComponent } from './beneneficios/ver-editar-deduccion-afil/ver-editar-deduccion-afil.component';
import { AsignacionDeduccionesComponent } from './beneneficios/asignacion-deducciones/asignacion-deducciones.component';
import { ProcesoPlanillaComponent } from './egresos/proceso-planilla/proceso-planilla.component';
import { GestionBancoComponent } from './gestion-banco/gestion-banco.component';
import { ActualizarFallecidosComponent } from './actualizar-fallecidos/actualizar-fallecidos.component';
import { P60RentasComponent } from './p-60-rentas/p-60-rentas.component';
import { RoleGuard } from 'src/app/guards/role-guard.guard';
import { PermisosService } from 'src/app/services/permisos.service';
import { NuevoBeneficioComponent } from './egresos/Mantenimiento/nuevo-beneficio/nuevo-beneficio.component';
import { EditarBeneficioComponent } from './egresos/Mantenimiento/editar-beneficio/editar-beneficio.component';
import { NuevoTipoDeduccionComponent } from './egresos/Mantenimiento/nuevo-tipo-deduccion/nuevo-tipo-deduccion.component';
import { EditarTipoDeduccionComponent } from './egresos/Mantenimiento/editar-tipo-deduccion/editar-tipo-deduccion.component';
import { VoucherGeneralMensComponent } from './voucher-general-mens/voucher-general-mens.component';

const routes: Routes = [
  {
    path: 'Beneficios',
    children: [
      {
        path: 'nuevo-beneficio-afil',
        component: NuevoBeneficioAfilComponent,
        canActivate: [RoleGuard],
        data: { expectedRolesModules: PermisosService.getExpectedRolesForRoute('BENEFICIOS', 'planilla/Beneficios/nuevo-beneficio-afil') }
      },
      {
        path: 'Ver-editar-beneficio-afil',
        component: VerEditarBeneficioAfilComponent,
        canActivate: [RoleGuard],
        data: { expectedRolesModules: PermisosService.getExpectedRolesForRoute('BENEFICIOS', 'planilla/Beneficios/Ver-editar-beneficio-afil') }
      },
      {
        path: 'nuevo-beneficio',
        component: NuevoBeneficioComponent,
        canActivate: [RoleGuard],
        data: { expectedRolesModules: PermisosService.getExpectedRolesForRoute('BENEFICIOS', 'planilla/Beneficios/Ver-editar-beneficio-afil') }
      },
      {
        path: 'editar-beneficio',
        component: EditarBeneficioComponent,
        canActivate: [RoleGuard],
        data: { expectedRolesModules: PermisosService.getExpectedRolesForRoute('BENEFICIOS', 'planilla/Beneficios/Ver-editar-beneficio-afil') }
      },
      {
        path: 'crear-tipo-deduccion',
        component: NuevoTipoDeduccionComponent,
        canActivate: [RoleGuard],
        data: { expectedRolesModules: PermisosService.getExpectedRolesForRoute('BENEFICIOS', 'planilla/Beneficios/Ver-editar-beneficio-afil') }
      },
      {
        path: 'editar-tipo-deduccion',
        component: EditarTipoDeduccionComponent,
        canActivate: [RoleGuard],
        data: { expectedRolesModules: PermisosService.getExpectedRolesForRoute('BENEFICIOS', 'planilla/Beneficios/Ver-editar-beneficio-afil') }
      },

      { path: '**', redirectTo: 'nuevo-beneficio-afil', pathMatch: 'full' }
    ]
  },
  {
    path: 'Deducciones',
    children: [
      {
        path: 'nueva-deduccion-afil',
        component: AsignacionDeduccionesComponent,
        canActivate: [RoleGuard],
        data: { expectedRolesModules: PermisosService.getExpectedRolesForRoute('PLANILLA', 'planilla/Deducciones/nueva-deduccion-afil') }
      },
      {
        path: 'ver-editar-deduccion-afil',
        component: VerEditarDeduccionAfilComponent,
        canActivate: [RoleGuard],
        data: { expectedRolesModules: PermisosService.getExpectedRolesForRoute('PLANILLA', 'planilla/Deducciones/ver-editar-deduccion-afil') }
      },
      { path: '**', redirectTo: 'nueva-deduccion-afil', pathMatch: 'full' }
    ]
  },
  {
    path: 'Egresos',
    children: [
      {
        path: 'proceso-planilla',
        component: ProcesoPlanillaComponent,
        canActivate: [RoleGuard],
        data: { expectedRolesModules: PermisosService.getExpectedRolesForRoute('PLANILLA', 'planilla/Egresos/proceso-planilla') }
      },
      {
        path: 'ver-planillas',
        component: VerPlanillasComponent,
        canActivate: [RoleGuard],
        data: { expectedRolesModules: PermisosService.getExpectedRolesForRoute('PLANILLA', 'planilla/Egresos/ver-planillas') }
      },
      {
        path: 'documentos-planilla',
        component: DocumentosPlanillaComponent,
        canActivate: [RoleGuard],
        data: { expectedRolesModules: PermisosService.getExpectedRolesForRoute('PLANILLA', 'planilla/Egresos/documentos-planilla') }
      },
      {
        path: 'editar-banco',
        component: GestionBancoComponent,
        canActivate: [RoleGuard],
        data: { expectedRolesModules: PermisosService.getExpectedRolesForRoute('PLANILLA', 'planilla/Egresos/editar-banco') }
      },
      {
        path: 'cargar-fallecidos',
        component: ActualizarFallecidosComponent,
        canActivate: [RoleGuard],
        data: { expectedRolesModules: PermisosService.getExpectedRolesForRoute('PLANILLA', 'planilla/Egresos/cargar-fallecidos') }
      },

      {
        path: 'ver_estatus_60_rentas',
        component: P60RentasComponent,
        canActivate: [RoleGuard],
        data: { expectedRolesModules: PermisosService.getExpectedRolesForRoute('PLANILLA', 'planilla/Egresos/ver_estatus_60_rentas') }
      },
      {
        path: 'voucher-general-mens',
        component: VoucherGeneralMensComponent,
        canActivate: [RoleGuard],
        data: { expectedRolesModules: PermisosService.getExpectedRolesForRoute('PLANILLA', 'planilla/Egresos/ver_estatus_60_rentas') }
      },
      { path: '**', redirectTo: 'proceso-planilla', pathMatch: 'full' }
    ]
  },
  {
    path: 'Ingresos',
    children: [
      {
        path: 'planilla-colegios-privados',
        component: PlanillaColegiosPrivadosComponent,
        canActivate: [RoleGuard],
        data: { expectedRolesModules: PermisosService.getExpectedRolesForRoute('PLANILLA', 'planilla/Ingresos/planilla-colegios-privados') }
      },
      {
        path: 'cargar-planilla-privados',
        component: CargarPlanillaPrivadosComponent,
        canActivate: [RoleGuard],
        data: { expectedRolesModules: PermisosService.getExpectedRolesForRoute('PLANILLA', 'planilla/Ingresos/cargar-planilla-privados') }
      },
      { path: '**', redirectTo: 'planilla-colegios-privados', pathMatch: 'full' }
    ]
  },
];

@NgModule({
  imports: [RouterModule.forChild(routes),],
  exports: [RouterModule]
})
export class PlanillaRoutingModule { }
