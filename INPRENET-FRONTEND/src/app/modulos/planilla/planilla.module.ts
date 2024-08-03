import { NgModule } from '@angular/core';
import { CommonModule, DatePipe } from '@angular/common';
import { NuevaDeduccionAfilComponent } from './egresos/nueva-deduccion-afil/nueva-deduccion-afil.component';
import { MaterialAngularModule } from 'src/app/material-angular/material-angular.module';
import { NuevaPlanillaComponentP } from './egresos/nueva-planilla/nueva-planilla.component';
import { ProgressplanillComponent } from './egresos/progressplanill/progressplanill.component';
import { NuevaplanillaComponent } from './egresos/nuevaplanilla/nuevaplanilla.component';
import { VerplanprelcompComponent } from './egresos/verplanprelcomp/verplanprelcomp.component';
import { TotalesporbydDialogComponent } from './egresos/totalesporbydDialog/totalesporbydDialog.component';
import { AsignacionAfilPlanComponent } from './egresos/asignacion-afil-plan/asignacion-afil-plan.component';
import { VerplancerradaComponent } from './egresos/verplancerrada/verplancerrada.component';
import { ComponentsModule } from 'src/app/components/components.module';
import { PlanillaColegiosPrivadosComponent } from './ingresos/planilla-colegios-privados/planilla-colegios-privados.component';
import { VerDatPlanIngComponent } from './ingresos/ver-dat-plan-ing/ver-dat-plan-ing.component';
import { PlanillaRoutingModule } from './planilla-routing.module';
import { VerPlanillasComponent } from './egresos/ver-planillas/ver-planillas.component';
import { DetallePlanillaDialogComponent } from './egresos/detalle-planilla-dialog/detalle-planilla-dialog.component';
import { CargarPlanillaPrivadosComponent } from './ingresos/cargar-planilla-privados/cargar-planilla-privados.component';
import { DocumentosPlanillaComponent } from './egresos/documentosPlanilla/documentosPlanilla.component';
import { EditarBeneficioComponent } from './egresos/Mantenimiento/editar-beneficio/editar-beneficio.component';
import { EditarTipoDeduccionComponent } from './egresos/Mantenimiento/editar-tipo-deduccion/editar-tipo-deduccion.component';
import { EditarTipoPlanillaComponent } from './egresos/Mantenimiento/editar-tipo-planilla/editar-tipo-planilla.component';
import { NuevoBeneficioComponent } from './egresos/Mantenimiento/nuevo-beneficio/nuevo-beneficio.component';
import { NuevoTipoDeduccionComponent } from './egresos/Mantenimiento/nuevo-tipo-deduccion/nuevo-tipo-deduccion.component';
import { NuevoTipoPlanillaComponent } from './egresos/Mantenimiento/nuevo-tipo-planilla/nuevo-tipo-planilla.component';
import { NuevoBeneficioAfilComponent } from './beneneficios/nuevo-beneficio-afil/nuevo-beneficio-afil.component';
import { SubirDeduccionesformComponent } from './beneneficios/subir-deduccionesform/subir-deduccionesform.component';
import { VerEditarBeneficioAfilComponent } from './beneneficios/ver-editar-beneficio-afil/ver-editar-beneficio-afil.component';
import { VerEditarDeduccionAfilComponent } from './beneneficios/ver-editar-deduccion-afil/ver-editar-deduccion-afil.component';
import { NuevaDeduccionPersComponent } from './beneneficios/nueva-deduccion-pers/nueva-deduccion-pers.component';
import { AsignacionDeduccionesComponent } from './beneneficios/asignacion-deducciones/asignacion-deducciones.component';
import { SubirDeduccionesTercerosComponent } from './beneneficios/subir-deducciones-terceros/subir-deducciones-terceros.component';
import { CargarbefDedComponent } from './egresos/cargarbef-ded/cargarbef-ded.component';
import { ProcesoPlanillaComponent } from './egresos/proceso-planilla/proceso-planilla.component';
import { DialogDesgloseComponent } from './egresos/dialog-desglose/dialog-desglose.component';

@NgModule({
  declarations: [
    NuevaDeduccionAfilComponent,
    NuevaPlanillaComponentP,
    ProgressplanillComponent,
    NuevaplanillaComponent,
    VerplanprelcompComponent,
    TotalesporbydDialogComponent,
    AsignacionAfilPlanComponent,
    VerplancerradaComponent,
    PlanillaColegiosPrivadosComponent,
    VerDatPlanIngComponent,
    VerPlanillasComponent,
    DetallePlanillaDialogComponent,
    CargarPlanillaPrivadosComponent,
    DocumentosPlanillaComponent,
    EditarBeneficioComponent,
    EditarTipoDeduccionComponent,
    EditarTipoPlanillaComponent,
    NuevoBeneficioComponent,
    NuevoTipoDeduccionComponent,
    NuevoTipoPlanillaComponent,
    NuevoBeneficioAfilComponent,
    SubirDeduccionesformComponent,
    VerEditarBeneficioAfilComponent,
    VerEditarDeduccionAfilComponent,
    NuevaDeduccionPersComponent,
    AsignacionDeduccionesComponent,
    SubirDeduccionesTercerosComponent,
    CargarbefDedComponent,
    ProcesoPlanillaComponent,
    DialogDesgloseComponent
  ],
  imports: [
    CommonModule,
    PlanillaRoutingModule,
    MaterialAngularModule,
    ComponentsModule,
  ],
  providers: [DatePipe]
})
export class PlanillaModule { }
