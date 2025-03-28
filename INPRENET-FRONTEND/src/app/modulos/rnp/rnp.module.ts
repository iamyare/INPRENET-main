import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RnpRoutingModule } from './rnp-routing.module';
import { ComponentsModule } from '../../components/components.module';
import { MaterialAngularModule } from '../../material-angular/material-angular.module';
import { ReactiveFormsModule } from '@angular/forms';
import { PruebaVidaComponent } from './prueba-vida/prueba-vida.component';


@NgModule({
  declarations: [PruebaVidaComponent],
  imports: [
    CommonModule,
    RnpRoutingModule,
    MaterialAngularModule,
    ComponentsModule,
    ReactiveFormsModule
  ]
})
export class RnpModule { }
