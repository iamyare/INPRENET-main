import { NgModule } from '@angular/core';
import { RouterModule, Routes } from '@angular/router';
import { MovimientosComponent } from './movimientos/movimientos.component';

const routes: Routes = [
  {
    path: 'Movimientos',
    children: [
      {
        path: 'Ver-movimientos',
        component: MovimientosComponent
      },
      { path: '**', redirectTo: 'Ver-movimientos', pathMatch: 'full' }
    ]
  },
];

@NgModule({
  imports: [RouterModule.forChild(routes)],
  exports: [RouterModule]
})
export class MovimientosRoutingModule { }
