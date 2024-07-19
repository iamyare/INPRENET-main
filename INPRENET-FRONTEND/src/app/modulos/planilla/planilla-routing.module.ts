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

const routes: Routes = [
  { path: 'nueva-planilla', component: NuevaPlanillaComponentP },
  { path: 'ver-planillas', component: VerPlanillasComponent },
  { path: 'planilla-colegios-privados', component: PlanillaColegiosPrivadosComponent },
  { path: 'cargar-planilla-privados', component: CargarPlanillaPrivadosComponent },
  { path: 'documentos-planilla', component: DocumentosPlanillaComponent },
  {
    path: 'Beneficios/nuevo-beneficio-afil',
    component: NuevoBeneficioAfilComponent,
    data: {
      title: 'Nuevo Beneficio',
    },
  },
  {
    path: 'Beneficios/Ver-editar-beneficio-afil',
    component: VerEditarBeneficioAfilComponent,
    data: {
      title: 'Ver/editar Beneficio',
    },
  },
  {
    path: 'Deducciones/nueva-deduccion-afil',
    component: NuevaDeduccionAfilComponent,
    data: {
      title: 'nueva Deducción',
    },
  },
  {
    path: 'Deducciones/ver-editar-deduccion-afil',
    component: VerEditarDeduccionAfilComponent,
    data: {
      title: 'Ver-editar Deducción',
    },
  },
  { path: '', redirectTo: 'planilla', pathMatch: 'full' }
];

@NgModule({
  imports: [RouterModule.forChild(routes)],
  exports: [RouterModule]
})
export class PlanillaRoutingModule { }
