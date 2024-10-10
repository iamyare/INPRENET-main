import { NgModule } from '@angular/core';
import { RouterModule, Routes } from '@angular/router';
import { DetalleEnvioEscalafonComponent } from './detalle-envio-escalafon/detalle-envio-escalafon.component';

const routes: Routes = [
  { path: 'detalle-envio', component: DetalleEnvioEscalafonComponent },
];

@NgModule({
  imports: [RouterModule.forChild(routes)],
  exports: [RouterModule]
})
export class EscalafonRoutingModule { }
