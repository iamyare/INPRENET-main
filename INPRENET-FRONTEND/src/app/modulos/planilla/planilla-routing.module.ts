import { NgModule } from '@angular/core';
import { RouterModule, Routes } from '@angular/router';
import { NuevaPlanillaComponentP } from './egresos/nueva-planilla/nueva-planilla.component';
import { VerPlanillasComponent } from './egresos/ver-planillas/ver-planillas.component';

const routes: Routes = [
  { path: 'nueva-planilla', component: NuevaPlanillaComponentP },
  { path: 'ver-planillas', component: VerPlanillasComponent },
  { path: '', redirectTo: 'planilla', pathMatch: 'full' }
];

@NgModule({
  imports: [RouterModule.forChild(routes)],
  exports: [RouterModule]
})
export class PlanillaRoutingModule { }
