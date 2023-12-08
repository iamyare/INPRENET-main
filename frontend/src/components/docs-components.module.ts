import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouterModule } from '@angular/router';

import { AvatarModule, BadgeModule, BreadcrumbModule, ButtonGroupModule, ButtonModule, CalloutModule, CardModule, DropdownModule, FooterModule, FormModule, GridModule, HeaderModule, ListGroupModule, NavModule, ProgressModule, SidebarModule, TabsModule, UtilitiesModule } from '@coreui/angular';
import { IconModule } from '@coreui/icons-angular';
import { DocsExampleComponent } from './docs-example/docs-example.component';
import { DocsLinkComponent } from './docs-link/docs-link.component';
import { DocsCalloutComponent } from './docs-callout/docs-callout.component';
import { DatGeneralesAfiliadoComponent } from './dat-generales-afiliado/dat-generales-afiliado.component';
import { LayoutModule } from '@angular/cdk/layout';
import { FormsModule, ReactiveFormsModule } from '@angular/forms';
import { MatButtonModule } from '@angular/material/button';
import { MatCardModule } from '@angular/material/card';
import { MatCheckboxModule } from '@angular/material/checkbox';
import { MatNativeDateModule } from '@angular/material/core';
import { MatDatepickerModule } from '@angular/material/datepicker';
import { MatDialogModule } from '@angular/material/dialog';
import { MatFormFieldModule } from '@angular/material/form-field';
import { MatGridListModule } from '@angular/material/grid-list';
import { MatIconModule } from '@angular/material/icon';
import { MatInputModule } from '@angular/material/input';
import { MatListModule } from '@angular/material/list';
import { MatMenuModule } from '@angular/material/menu';
import { MatPaginatorModule } from '@angular/material/paginator';
import { MatProgressSpinnerModule } from '@angular/material/progress-spinner';
import { MatRadioModule } from '@angular/material/radio';
import { MatSelectModule } from '@angular/material/select';
import { MatSidenavModule } from '@angular/material/sidenav';
import { MatSlideToggleModule } from '@angular/material/slide-toggle';
import { MatSnackBarModule } from '@angular/material/snack-bar';
import { MatTableModule } from '@angular/material/table';
import { MatToolbarModule } from '@angular/material/toolbar';
import { NgScrollbarModule } from 'ngx-scrollbar';

@NgModule({
  declarations: [
    DocsExampleComponent,
    DocsLinkComponent,
    DocsCalloutComponent,
    DatGeneralesAfiliadoComponent
  ],
  exports: [
    DocsExampleComponent,
    DocsLinkComponent,
    DocsCalloutComponent,
    DatGeneralesAfiliadoComponent
  ],
  imports: [
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
  ]
})
export class DocsComponentsModule {
}
