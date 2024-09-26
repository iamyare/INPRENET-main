import { CUSTOM_ELEMENTS_SCHEMA, NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { ReactiveFormsModule } from '@angular/forms';
import { AfiliacionRoutingModule } from '../afiliacion/afiliacion-routing.module';
import { ComponentsModule } from '../../components/components.module';
import { MaterialAngularModule } from '../../material-angular/material-angular.module';
import { MovimientosComponent } from './movimientos/movimientos.component';
import { MAT_DATE_LOCALE } from '@angular/material/core';
import { MovimientosRoutingModule } from './movimientos-routing.module';


@NgModule({
  declarations: [
    MovimientosComponent
  ],
  imports: [
    MovimientosRoutingModule,
    CommonModule,
    MaterialAngularModule,
    ComponentsModule,
    AfiliacionRoutingModule,
    ReactiveFormsModule
  ],
  providers: [
    { provide: MAT_DATE_LOCALE, useValue: 'es', },
  ],
  schemas: [CUSTOM_ELEMENTS_SCHEMA]
})
export class MovimientosInpremaModule { }
