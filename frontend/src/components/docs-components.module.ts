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

import { DatGeneralesAfiliadoComponent } from './dat-generales-afiliado/dat-generales-afiliado.component';
import { HistorialSalarioComponent } from './historial-salario/historial-salario.component';
import { DatPuestoTrabComponent } from './dat-puesto-trab/dat-puesto-trab.component';
import { DatBancComponent } from './dat-banc/dat-banc.component';
import { RefPersComponent } from './ref-pers/ref-pers.component';
import { BenefComponent } from './benef/benef.component';
import { BotonarchivosComponent } from './botonarchivos/botonarchivos.component';
import { ProgressbarComponent } from './progressbar/progressbar.component';
import { ProgressplanillComponent } from './progressplanill/progressplanill.component';
import { WebcamModule } from 'ngx-webcam';
import { BeneficioComponent } from './beneficio/beneficio.component';
import { CustomMatPaginatorIntl } from './inline-editing-one/inline-editing-one.component';

@NgModule({
  declarations: [
    BeneficioComponent,
    ProgressplanillComponent,
    ProgressbarComponent,
    DatGeneralesAfiliadoComponent,
    DatPuestoTrabComponent,
    DatBancComponent,
    BenefComponent,
    RefPersComponent,
    BotonarchivosComponent,
    HistorialSalarioComponent,
    
  ],
  exports: [
    ProgressbarComponent,
    ProgressplanillComponent,
    BeneficioComponent,
    DatGeneralesAfiliadoComponent,
    DatPuestoTrabComponent,
    DatBancComponent,
    BenefComponent,
    RefPersComponent,
    BotonarchivosComponent,
    HistorialSalarioComponent,
    
  ],
  imports: [
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
  ],
  providers: [
    { provide: MatPaginatorIntl, useClass: CustomMatPaginatorIntl },
  ],
})
export class DocsComponentsModule {
}
