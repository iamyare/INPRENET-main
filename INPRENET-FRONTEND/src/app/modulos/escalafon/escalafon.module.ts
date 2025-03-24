import { CUSTOM_ELEMENTS_SCHEMA, NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { EscalafonRoutingModule } from './escalafon-routing.module';
import { DetalleEnvioEscalafonComponent } from './detalle-envio-escalafon/detalle-envio-escalafon.component';
import { MovimientosComponent } from './movimientos/movimientos.component';
import { CrearCuentaEscalafonComponent } from './crear-cuenta-escalafon/crear-cuenta-escalafon.component';
import { CrearMovimientoComponent } from './crear-movimiento/crear-movimiento.component';
import { MaterialAngularModule } from 'src/app/material-angular/material-angular.module';
import { ComponentsModule } from 'src/app/components/components.module';
import { ReactiveFormsModule } from '@angular/forms';

@NgModule({
  declarations: [
    DetalleEnvioEscalafonComponent,
    MovimientosComponent,
    CrearCuentaEscalafonComponent,
    CrearMovimientoComponent
  ],
  imports: [
    ComponentsModule,
    CommonModule,
    MaterialAngularModule,
    EscalafonRoutingModule,
    ReactiveFormsModule,
  ],
  schemas: [CUSTOM_ELEMENTS_SCHEMA]
})
export class EscalafonModule { }
