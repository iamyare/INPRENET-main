import { NgModule } from '@angular/core';

//angular material
import { AvatarModule, BadgeModule, BreadcrumbModule, } from '@coreui/angular';
import { GridModule, HeaderModule } from '@coreui/angular';
import { ListGroupModule, NavModule, ProgressModule, SidebarModule, TabsModule, UtilitiesModule } from '@coreui/angular';
import { ButtonGroupModule, ButtonModule, CardModule, DropdownModule, FooterModule, FormModule } from '@coreui/angular';
import { IconModule } from '@coreui/icons-angular';

import { FormsModule, ReactiveFormsModule } from '@angular/forms';
import { MatFormFieldModule } from '@angular/material/form-field';
import { MatInputModule } from '@angular/material/input';
import { MatIconModule } from '@angular/material/icon';
import { MatButtonModule } from '@angular/material/button';
import { MatSnackBarModule } from '@angular/material/snack-bar';
import { MatProgressSpinnerModule } from '@angular/material/progress-spinner';
import { MatSidenavModule } from '@angular/material/sidenav';
import { MatCheckboxModule } from '@angular/material/checkbox';
import { MatToolbarModule } from '@angular/material/toolbar';
import { MatMenuModule } from '@angular/material/menu';
import { LayoutModule } from '@angular/cdk/layout';
import { MatListModule } from '@angular/material/list';
import { MatGridListModule } from '@angular/material/grid-list';
import { MatPaginatorModule } from '@angular/material/paginator';
import { MatDatepickerModule } from '@angular/material/datepicker';
import { MatSlideToggleModule } from '@angular/material/slide-toggle';
import { MatCardModule } from '@angular/material/card';
import { MatRadioModule } from '@angular/material/radio';
import { MatDialogModule } from '@angular/material/dialog';
import { MatSelectModule } from '@angular/material/select';
import { NgScrollbarModule } from 'ngx-scrollbar';
import { MatTableModule } from '@angular/material/table';
import { MatStepperModule } from '@angular/material/stepper';
import { MatNativeDateModule } from '@angular/material/core';
import { DocsComponentsModule } from '../../components/docs-components.module';
import { MatTabsModule } from '@angular/material/tabs';
import { UppercaseDirective } from './directives/uppercase.directive';
import { GoogleMapsModule } from '@angular/google-maps';

@NgModule({
  declarations: [
    UppercaseDirective,
  ],
  imports: [
    DocsComponentsModule,
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
    MatStepperModule,
    MatTabsModule,

  ],
  exports: [
    DocsComponentsModule,
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
    MatTabsModule,
    MatTableModule,
  ]
})
export class SharedModule { }
