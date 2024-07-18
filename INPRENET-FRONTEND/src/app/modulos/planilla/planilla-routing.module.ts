import { NgModule } from '@angular/core';
import { RouterModule, Routes } from '@angular/router';
import { NuevaPlanillaComponentP } from './egresos/nueva-planilla/nueva-planilla.component';
import { VerPlanillasComponent } from './egresos/ver-planillas/ver-planillas.component';
import { CargarPlanillaPrivadosComponent } from './ingresos/cargar-planilla-privados/cargar-planilla-privados.component';
import { PlanillaColegiosPrivadosComponent } from './ingresos/planilla-colegios-privados/planilla-colegios-privados.component';
import { DocumentosPlanillaComponent } from './egresos/documentosPlanilla/documentosPlanilla.component';

const routes: Routes = [
  { path: 'nueva-planilla', component: NuevaPlanillaComponentP },
  { path: 'ver-planillas', component: VerPlanillasComponent },
  { path: 'planilla-colegios-privados', component: PlanillaColegiosPrivadosComponent },
  { path: 'cargar-planilla-privados', component: CargarPlanillaPrivadosComponent },
  { path: 'documentos-planilla', component: DocumentosPlanillaComponent },
  { path: '', redirectTo: 'planilla', pathMatch: 'full' }
];

@NgModule({
  imports: [RouterModule.forChild(routes)],
  exports: [RouterModule]
})
export class PlanillaRoutingModule { }
