import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { MenuDocumentosComponent } from './menu-documentos/menu-documentos.component';
import { MaterialAngularModule } from '../../material-angular/material-angular.module';
import { ComponentsModule } from '../../components/components.module';
import { AfiliacionRoutingModule } from '../afiliacion/afiliacion-routing.module';
import { ReactiveFormsModule } from '@angular/forms';
import { DocumentosRoutingModule } from './documentos.routing.module';

@NgModule({
  declarations: [
    MenuDocumentosComponent
  ],
  imports: [
    DocumentosRoutingModule,
    CommonModule,
    MaterialAngularModule,
    ComponentsModule,
    AfiliacionRoutingModule,
    ReactiveFormsModule,
  ]
})
export class DocumentosModule { }
