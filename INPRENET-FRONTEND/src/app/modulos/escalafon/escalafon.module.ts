import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { EscalafonRoutingModule } from './escalafon-routing.module';
import { DetalleEnvioEscalafonComponent } from './detalle-envio-escalafon/detalle-envio-escalafon.component';
import { MaterialAngularModule } from 'src/app/material-angular/material-angular.module';
import { ComponentsModule } from 'src/app/components/components.module';
import { ReactiveFormsModule } from '@angular/forms';

@NgModule({
  declarations: [
    DetalleEnvioEscalafonComponent
  ],
  imports: [
    CommonModule,
    MaterialAngularModule,
    ComponentsModule,
    EscalafonRoutingModule,
    ReactiveFormsModule
  ]
})
export class EscalafonModule { }
