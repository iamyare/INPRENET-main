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
    DocumentosPlanillaComponent
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
