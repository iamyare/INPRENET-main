import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { VerAfiliadoComponent } from '../conasa/ver-afiliado/ver-afiliado.component'
import { ConasaRoutingModule } from '../conasa/conasa-routing.module'
import { ReactiveFormsModule } from '@angular/forms';
import { MaterialAngularModule } from 'src/app/material-angular/material-angular.module';
import { ComponentsModule } from 'src/app/components/components.module';

@NgModule({
  declarations: [
    VerAfiliadoComponent
  ],
  imports: [
    CommonModule,
    ConasaRoutingModule,
    ReactiveFormsModule,
    MaterialAngularModule,
    ComponentsModule,
  ]
})
export class ConasaModule { }
