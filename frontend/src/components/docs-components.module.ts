import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouterModule } from '@angular/router';

import { AvatarModule, BadgeModule, BreadcrumbModule, ButtonGroupModule, ButtonModule, CalloutModule, CardModule, DropdownModule, FooterModule, FormModule, GridModule, HeaderModule, ListGroupModule, NavModule, ProgressModule, SidebarModule, TabsModule, UtilitiesModule } from '@coreui/angular';

import { IconModule } from '@coreui/icons-angular';
import { LayoutModule } from '@angular/cdk/layout';
import { FormsModule, ReactiveFormsModule } from '@angular/forms';
import { MatButtonModule } from '@angular/material/button';
import { MatCardModule } from '@angular/material/card';
import { MatCheckboxModule } from '@angular/material/checkbox';
import { MAT_DATE_LOCALE, MatNativeDateModule } from '@angular/material/core';
import { MatDatepickerModule } from '@angular/material/datepicker';
import { MatDialogModule } from '@angular/material/dialog';
import { MatFormFieldModule } from '@angular/material/form-field';
import { MatGridListModule } from '@angular/material/grid-list';
import { MatIconModule } from '@angular/material/icon';
import { MatInputModule } from '@angular/material/input';
import { MatListModule } from '@angular/material/list';
import { MatMenuModule } from '@angular/material/menu';
import { MatPaginatorIntl, MatPaginatorModule } from '@angular/material/paginator';
import { MatProgressSpinnerModule } from '@angular/material/progress-spinner';
import { MatRadioModule } from '@angular/material/radio';
import { MatSelectModule } from '@angular/material/select';
import { MatSidenavModule } from '@angular/material/sidenav';
import { MatSlideToggleModule } from '@angular/material/slide-toggle';
import { MatSnackBarModule } from '@angular/material/snack-bar';
import { MatTableModule } from '@angular/material/table';
import { MatToolbarModule } from '@angular/material/toolbar';
import { NgScrollbarModule } from 'ngx-scrollbar';
import { MatTabsModule } from '@angular/material/tabs';

import { DatGeneralesAfiliadoComponent } from './dat-generales-afiliado/dat-generales-afiliado.component';
import { HistorialSalarioComponent } from './historial-salario/historial-salario.component';
import { DatPuestoTrabComponent } from './dat-puesto-trab/dat-puesto-trab.component';
import { DatBancComponent } from './dat-banc/dat-banc.component';
import { RefPersComponent } from './ref-pers/ref-pers.component';
import { BenefComponent } from './benef/benef.component';
import { ColMagisterialesComponent } from './col-magisteriales/col-magisteriales.component';
import { BotonarchivosComponent } from './botonarchivos/botonarchivos.component';
import { ProgressbarComponent } from './progressbar/progressbar.component';
import { ProgressbarVerdatosComponent } from './progressbar-verdatos/progressbar-verdatos.component';
import { ProgressplanillComponent } from './progressplanill/progressplanill.component';
import { WebcamModule } from 'ngx-webcam';
import { BeneficioComponent } from './beneficio/beneficio.component';
import { CustomMatPaginatorIntl } from '../app/shared/functions/paginado';
import { DynamicFormComponent } from './dynamic-form/dynamic-form.component';
import { DynamicTableComponent } from './dynamic-table/dynamic-table.component';
import { DynamicDialogComponent } from './dynamic-dialog/dynamic-dialog.component';
import { DetallePlanillaDialogComponent } from './detalle-planilla-dialog/detalle-planilla-dialog.component';
import { EditarDialogComponent } from './editar-dialog/editar-dialog.component';
import { TotalesporbydDialogComponent } from './totalesporbydDialog/totalesporbydDialog.component';
import { DynamicFormDialogComponent } from './dynamic-form-dialog/dynamic-form-dialog.component';
import { ConfirmDialogComponent } from './confirm-dialog/confirm-dialog.component';
import { AgregarPuestTrabComponent } from './agregar-puest-trab/agregar-puest-trab.component';
import { AgregarReferenciasPersonalesComponent } from './agregar-referencias-personales/agregar-referencias-personales.component';
import { AgregarBenefCompComponent } from './agregar-benef-comp/agregar-benef-comp.component';
import { AgregarDatBancCompComponent } from './agregar-dat-banc-comp/agregar-dat-banc-comp.component';
import { AgregarColMagisComponent } from './agregar-col-magis/agregar-col-magis.component';
import { CamaraComponent } from './camara/camara.component';
import { NewFamiliaresComponent } from './new-familiares/new-familiares.component';
import { EditFamiliaresCompComponent } from './edit-familiares-comp/edit-familiares-comp.component';
import { AgregarCuentasComponent } from './agregar-cuentas/agregar-cuentas.component';
import { CuentaBancariaCompComponent } from './cuenta-bancaria-comp/cuenta-bancaria-comp.component';
import { ProgressbarDynamicComponent } from './progressbar-dynamic/progressbar-dynamic.component';
import { SharedFormFieldsComponent } from './shared-form-fields/shared-form-fields.component';
import { BuscadorComponent } from './buscador/buscador.component';
import { PepsComponent } from './peps/peps.component';
import { DynamicTablePruebaComponent } from './dynamic-table-prueba/dynamic-table-prueba.component';
import { DynamicMenuConstanciasComponent } from './Dynamics/dynamic-menu-constancias/dynamic-menu-constancias.component';
import { MapsComponent } from './maps/maps.component';
import { GoogleMapsModule } from '@angular/google-maps';
import { MatStepperModule } from '@angular/material/stepper';


@NgModule({
  declarations: [
    DatPuestoTrabComponent,
    PepsComponent,
    MapsComponent,
    BuscadorComponent,
    BeneficioComponent,
    ProgressplanillComponent,
    ProgressbarComponent,
    ProgressbarVerdatosComponent,
    DatGeneralesAfiliadoComponent,
    DatPuestoTrabComponent,
    DatBancComponent,
    BenefComponent,
    RefPersComponent,
    ColMagisterialesComponent,
    BotonarchivosComponent,
    HistorialSalarioComponent,
    DynamicFormComponent,
    DynamicTableComponent,
    DynamicDialogComponent,
    DetallePlanillaDialogComponent,
    EditarDialogComponent,
    TotalesporbydDialogComponent,
    DynamicFormDialogComponent,
    ConfirmDialogComponent,
    AgregarPuestTrabComponent,
    AgregarBenefCompComponent,
    AgregarDatBancCompComponent,
    AgregarColMagisComponent,
    AgregarReferenciasPersonalesComponent,
    CamaraComponent,
    NewFamiliaresComponent,
    EditFamiliaresCompComponent,
    AgregarCuentasComponent,
    CuentaBancariaCompComponent,
    ProgressbarDynamicComponent,
    SharedFormFieldsComponent,
    DynamicMenuConstanciasComponent,
    DynamicTablePruebaComponent,
    DatPuestoTrabComponent,
  ],
  exports: [
    PepsComponent,
    MatTabsModule,
    MatStepperModule,
    MapsComponent,
    ProgressbarComponent,
    ProgressplanillComponent,
    ProgressbarVerdatosComponent,
    BeneficioComponent,
    DatGeneralesAfiliadoComponent,
    DatPuestoTrabComponent,
    DatBancComponent,
    BenefComponent,
    RefPersComponent,
    ColMagisterialesComponent,
    BotonarchivosComponent,
    HistorialSalarioComponent,
    DynamicFormComponent,
    DynamicTableComponent,
    DetallePlanillaDialogComponent,
    EditarDialogComponent,
    TotalesporbydDialogComponent,
    DynamicFormDialogComponent,
    ConfirmDialogComponent,
    AgregarPuestTrabComponent,
    AgregarBenefCompComponent,
    AgregarDatBancCompComponent,
    AgregarColMagisComponent,
    AgregarReferenciasPersonalesComponent,
    CamaraComponent,
    NewFamiliaresComponent,
    EditFamiliaresCompComponent,
    AgregarCuentasComponent,
    CuentaBancariaCompComponent,
    ProgressbarDynamicComponent,
    SharedFormFieldsComponent,
    BuscadorComponent,
    DynamicMenuConstanciasComponent
  ],
  imports: [
    MatTabsModule,
    MatStepperModule,
    GoogleMapsModule,
    WebcamModule,
    CommonModule,
    NavModule,
    IconModule,
    RouterModule,
    TabsModule,
    UtilitiesModule,
    CalloutModule,
    MatNativeDateModule,
    ButtonModule,
    CardModule,
    FormModule,
    GridModule,
    FormsModule,
    ReactiveFormsModule,
    MatFormFieldModule,
    MatInputModule,
    MatIconModule,
    MatButtonModule,
    MatSnackBarModule,
    MatSidenavModule,
    MatProgressSpinnerModule,
    MatGridListModule,
    MatCheckboxModule,
    MatToolbarModule,
    MatMenuModule,
    LayoutModule,
    MatListModule,
    MatPaginatorModule,
    MatDatepickerModule,
    MatSlideToggleModule,
    MatCardModule,
    MatRadioModule,
    MatDialogModule,
    MatSelectModule,
    AvatarModule,
    BreadcrumbModule,
    FooterModule,
    DropdownModule,
    HeaderModule,
    SidebarModule,
    IconModule,
    NavModule,
    UtilitiesModule,
    ButtonGroupModule,
    TabsModule,
    ProgressModule,
    BadgeModule,
    ListGroupModule,
    NgScrollbarModule,
    MatTableModule,
    MatPaginatorModule,
    MatTabsModule
  ],
  providers: [
    { provide: MatPaginatorIntl, useClass: CustomMatPaginatorIntl },
  ],
})
export class DocsComponentsModule {
}
