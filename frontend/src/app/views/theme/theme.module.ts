import { CommonModule } from '@angular/common';
import { NgModule } from '@angular/core';

import { CardModule, GridModule, NavModule, UtilitiesModule, TabsModule } from '@coreui/angular';
import { IconModule } from '@coreui/icons-angular';

// Theme Routing
import { ThemeRoutingModule } from './theme-routing.module';
import { AfilBancoComponent } from '../pages/Generales/afil-banco/afil-banco.component';
import { SharedModule } from '../../shared/shared.module';
import { CentroTrabajoComponent } from '../pages/Generales/centro-trabajo/centro-trabajo.component';

import { FormsModule } from '@angular/forms';

// Importaciones específicas de Angular Material
import { MatInputModule } from '@angular/material/input';
import { MatFormFieldModule } from '@angular/material/form-field';
import { MatButtonModule } from '@angular/material/button';
import { MatCardModule } from '@angular/material/card';
import { MatTableModule } from '@angular/material/table';
import { MatPaginatorModule } from '@angular/material/paginator';
import { MatIconModule } from '@angular/material/icon';

import { DatosGenAfilComponent } from '../pages/Generales/datos-gen-afil/datos-gen-afil.component';
import { NuevaPlanillaComponentP } from '../pages/Generales/nueva-planilla/nueva-planilla.component';
import { VerPlanillasComponent } from '../pages/Generales/ver-planillas/ver-planillas.component';
import { SubirDeduccionesformComponent } from '../pages/Generales/subir-deduccionesform/subir-deduccionesform.component';
import { NuevoBeneficioComponent } from '../pages/Mantenimiento/nuevo-beneficio/nuevo-beneficio.component';
import { EditarBeneficioComponent } from '../pages/Mantenimiento/editar-beneficio/editar-beneficio.component';
/* import { CentroTrabajoPageComponent } from '../pages/centro-trabajo-page/centro-trabajo-page.component' */
import { InlineEditingOneComponent } from '../../../components/inline-editing-one/inline-editing-one.component';
import { NuevaplanillaComponent } from '../../../components/nuevaplanilla/nuevaplanilla.component';
import { NuevoTipoPlanillaComponent } from '../pages/Mantenimiento/nuevo-tipo-planilla/nuevo-tipo-planilla.component';
import { EditarTipoPlanillaComponent } from '../pages/Mantenimiento/editar-tipo-planilla/editar-tipo-planilla.component';
import { NuevoTipoDeduccionComponent } from '../pages/Mantenimiento/nuevo-tipo-deduccion/nuevo-tipo-deduccion.component';
import { EditarTipoDeduccionComponent } from '../pages/Mantenimiento/editar-tipo-deduccion/editar-tipo-deduccion.component';
import { NuevoBeneficioAfilComponent } from '../pages/Generales/nuevo-beneficio-afil/nuevo-beneficio-afil.component';
import { NuevaDeduccionAfilComponent } from '../pages/Generales/nueva-deduccion-afil/nueva-deduccion-afil.component';
import { VerEditarDeduccionAfilComponent } from '../pages/Generales/ver-editar-deduccion-afil/ver-editar-deduccion-afil.component';
import { AsignacionAfilPlanComponent } from '../../../components/asignacion-afil-plan/asignacion-afil-plan.component';
import { VerplanprelcompComponent } from '../../../components/verplanprelcomp/verplanprelcomp.component';
import { VerplancerradaComponent } from '../../../components/verplancerrada/verplancerrada.component';
import { VerDatPlanIngComponent } from '../../../components/ver-dat-plan-ing/ver-dat-plan-ing.component';
import { VerEditarBeneficioAfilComponent } from '../pages/Generales/ver-editar-beneficio-afil/ver-editar-beneficio-afil.component';
import { MatStepperModule } from '@angular/material/stepper';
import { MAT_DATE_LOCALE, MatNativeDateModule, DateAdapter } from '@angular/material/core';
import { MatGridListModule } from '@angular/material/grid-list';
import { CargarPlanillaPrivadosComponent } from '../pages/Centros Privados/cargar-planilla-privados/cargar-planilla-privados.component';
import { NuevoMovimientoComponent } from '../pages/Generales/nuevo-movimiento/nuevo-movimiento.component';
import { VerMovimientosComponent } from '../pages/Generales/ver-movimientos/ver-movimientos.component';
import { EditPerfilPuestTrabComponent } from '../pages/Generales/edit-perfil-puest-trab/edit-perfil-puest-trab.component';
import { EditReferPersonalesComponent } from '../pages/Generales/edit-refer-personales/edit-refer-personales.component';
import { EditDatosGeneralesComponent } from '../pages/Generales/edit-datos-generales/edit-datos-generales.component';
import { EditBeneficiariosComponent } from '../pages/Generales/edit-beneficiarios/edit-beneficiarios.component';
import { EditDatosBancariosComponent } from '../pages/Generales/edit-datos-bancarios/edit-datos-bancarios.component';
import { EditColegiosMagisterialesComponent } from '../pages/Generales/edit-colegios-magisteriales/edit-colegios-magisteriales.component';
import { PlanillaColegiosPrivadosComponent } from '../pages/Centros Privados/planilla-colegios-privados/planilla-colegios-privados.component';
import { NavDefaultComponent } from '../pages/Centros Privados/nav-default/nav-default.component';
import { EditFamiliaresComponent } from '../pages/Generales/edit-familiares/edit-familiares.component';
import { VerDatosAfiliadosComponent } from '../pages/Generales/ver-datos-afiliados/ver-datos-afiliados.component';
import { VerCuentasPersonasComponent } from '../pages/Generales/ver-cuentas-personas/ver-cuentas-personas.component';
import { AfiliacionCentrosComponent } from '../pages/afil-centros-priv/afiliacion-centros/afiliacion-centros.component';
import { DatosGeneralesCentroComponent } from '../pages/afil-centros-priv/datos-generales-centro/datos-generales-centro.component';
import { ReferenciasBancariasComercialesComponent } from '../pages/afil-centros-priv/referencias-bancarias-comerciales/referencias-bancarias-comerciales.component';
import { SociedadComponent } from '../pages/afil-centros-priv/sociedad/sociedad.component';
import { SociedadSocioComponent } from '../pages/afil-centros-priv/sociedad-socio/sociedad-socio.component';
import { AdminCentroEducativoComponent } from '../pages/afil-centros-priv/admin-centro-educativo/admin-centro-educativo.component';
import { GestionUsuariosComponent } from '../pages/admin-centro/gestion-usuarios/gestion-usuarios.component';
import { VerReferenciasComponent } from '../pages/afil-centros-priv/ver-referencias/ver-referencias.component';
import { VerSociosComponent } from '../pages/afil-centros-priv/ver-socios/ver-socios.component';
import { NuevoUsuarioComponent } from '../pages/admin-centro/nuevo-usuario/nuevo-usuario.component';
import { PagesModule } from '../pages/pages.module';
import { VerDatosCentrosComponent } from '../pages/afil-centros-priv/ver-datos-centros/ver-datos-centros.component';

@NgModule({
  imports: [
    CommonModule,
    ThemeRoutingModule,
    CardModule,
    GridModule,
    UtilitiesModule,
    IconModule,
    NavModule,
    TabsModule,
    SharedModule,
    FormsModule,
    MatInputModule,
    MatFormFieldModule,
    MatButtonModule,
    MatCardModule,
    MatTableModule,
    MatPaginatorModule,
    MatIconModule,
    MatStepperModule,
    MatNativeDateModule,
    MatGridListModule,
    PagesModule,
  ],
  providers: [
    { provide: MAT_DATE_LOCALE, useValue: 'es' }
  ],
  declarations: [
    VerplanprelcompComponent,
    VerplancerradaComponent,
    SubirDeduccionesformComponent,
    NuevaPlanillaComponentP,
    AfilBancoComponent,
    CentroTrabajoComponent,
    DatosGenAfilComponent,
    VerPlanillasComponent,
    InlineEditingOneComponent,
    NuevaplanillaComponent,
    AsignacionAfilPlanComponent,
    NuevoBeneficioComponent,
    EditarBeneficioComponent,
    NuevoTipoPlanillaComponent,
    EditarTipoPlanillaComponent,
    NuevoTipoDeduccionComponent,
    EditarTipoDeduccionComponent,
    NuevoBeneficioAfilComponent,
    NuevaDeduccionAfilComponent,
    VerEditarDeduccionAfilComponent,
    VerEditarBeneficioAfilComponent,
    PlanillaColegiosPrivadosComponent,
    CargarPlanillaPrivadosComponent,
    NuevoMovimientoComponent,
    VerMovimientosComponent,
    NavDefaultComponent,
    VerDatPlanIngComponent,
    EditPerfilPuestTrabComponent,
    EditDatosGeneralesComponent,
    EditBeneficiariosComponent,
    EditDatosBancariosComponent,
    EditReferPersonalesComponent,
    EditColegiosMagisterialesComponent,
    EditFamiliaresComponent,
    VerDatosAfiliadosComponent,
    VerCuentasPersonasComponent,
    AfiliacionCentrosComponent,
    DatosGeneralesCentroComponent,
    ReferenciasBancariasComercialesComponent,
    SociedadComponent,
    SociedadSocioComponent,
    AdminCentroEducativoComponent,
    GestionUsuariosComponent,
    NuevoUsuarioComponent,
    VerDatosCentrosComponent,
    VerReferenciasComponent,
    VerSociosComponent,
  ],
  exports: [EditDatosGeneralesComponent]
})
export class ThemeModule {
}
