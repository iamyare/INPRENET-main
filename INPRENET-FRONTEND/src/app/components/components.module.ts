import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { ConfirmDialogComponent } from './dinamicos/confirm-dialog/confirm-dialog.component';
import { MaterialAngularModule } from '../material-angular/material-angular.module';
import { DynamicDialogComponent } from './dinamicos/dynamic-dialog/dynamic-dialog.component';
import { DynamicFormComponent } from './dinamicos/dynamic-form/dynamic-form.component';
import { DynamicFormDialogComponent } from './dinamicos/dynamic-form-dialog/dynamic-form-dialog.component';
import { DynamicMenuConstanciasComponent } from './dinamicos/dynamic-menu-constancias/dynamic-menu-constancias.component';
import { DynamicTableComponent } from './dinamicos/dynamic-table/dynamic-table.component';
import { DynamicTablePruebaComponent } from './dinamicos/dynamic-table-prueba/dynamic-table-prueba.component';
import { EditarDialogComponent } from './dinamicos/editar-dialog/editar-dialog.component';
import { ProgressbarDynamicComponent } from './dinamicos/progressbar-dynamic/progressbar-dynamic.component';
import { SharedFormFieldsComponent } from './dinamicos/shared-form-fields/shared-form-fields.component';
import { BotonarchivosComponent } from './dinamicos/botonarchivos/botonarchivos.component';
import { CamaraComponent } from './camara/camara.component';
import { ProgressbarComponent } from './progressbar/progressbar.component';
import { BuscadorComponent } from './dinamicos/buscador/buscador.component';
import { UserMenuComponent } from './user-menu/user-menu.component';
import { MapsComponent } from './maps/maps.component';
import { GoogleMapsModule } from '@angular/google-maps';
import { DynamicDialogAgregarComponent } from './dynamic-dialog-agregar/dynamic-dialog-agregar.component';
import { CustomHeaderComponent } from './custom-header/custom-header.component';
import { CustomContainerComponent } from './custom-container/custom-container.component';
import { LayoutComponent } from './layout/layout.component';
import { HeaderComponent } from './header/header.component';
import { FooterComponent } from './footer/footer.component';
import { MainLayoutComponent } from './main-layout/main-layout.component';
import { LandingPageComponent } from './landing-page/landing-page.component';



@NgModule({
  declarations: [
    ConfirmDialogComponent,
    DynamicDialogComponent,
    DynamicFormComponent,
    DynamicFormDialogComponent,
    DynamicMenuConstanciasComponent,
    DynamicTableComponent,
    DynamicTablePruebaComponent,
    EditarDialogComponent,
    ProgressbarDynamicComponent,
    SharedFormFieldsComponent,
    BotonarchivosComponent,
    CamaraComponent,
    ProgressbarComponent,
    BuscadorComponent,
    UserMenuComponent,
    MapsComponent,
    DynamicDialogAgregarComponent,
    CustomHeaderComponent,
    CustomContainerComponent,
    LayoutComponent,
    HeaderComponent,
    FooterComponent,
    MainLayoutComponent,
    LandingPageComponent
  ],
  imports: [
    CommonModule,
    MaterialAngularModule,
    GoogleMapsModule
  ],
  exports:[
    ConfirmDialogComponent,
    DynamicDialogComponent,
    DynamicFormComponent,
    DynamicFormDialogComponent,
    DynamicMenuConstanciasComponent,
    DynamicTableComponent,
    DynamicTablePruebaComponent,
    EditarDialogComponent,
    ProgressbarDynamicComponent,
    SharedFormFieldsComponent,
    BotonarchivosComponent,
    CamaraComponent,
    ProgressbarComponent,
    BuscadorComponent,
    UserMenuComponent,
    MapsComponent,
    DynamicDialogAgregarComponent,
    CustomHeaderComponent,
    CustomContainerComponent,
    LayoutComponent,
    HeaderComponent,
    FooterComponent,
    MainLayoutComponent,
    LandingPageComponent
  ]
})
export class ComponentsModule { }
