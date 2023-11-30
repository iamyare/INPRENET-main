import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';

//angular material
import {FormsModule, ReactiveFormsModule } from '@angular/forms';
import {MatFormFieldModule} from '@angular/material/form-field';
import {MatInputModule} from '@angular/material/input';
import {MatIconModule} from '@angular/material/icon';
import {MatButtonModule} from '@angular/material/button';
import {MatSnackBarModule} from '@angular/material/snack-bar';
import {MatProgressSpinnerModule} from '@angular/material/progress-spinner';
import {MatSidenavModule} from '@angular/material/sidenav';
import {MatCheckboxModule} from '@angular/material/checkbox';
import {MatToolbarModule } from '@angular/material/toolbar';
import {MatMenuModule} from '@angular/material/menu';
import {LayoutModule} from '@angular/cdk/layout';
// import {FlexLayoutModule } from '@angular/flex-layout';
import {MatListModule} from '@angular/material/list';
import {MatGridListModule} from '@angular/material/grid-list';
import {MatPaginatorModule} from '@angular/material/paginator';
import {MatDatepickerModule} from '@angular/material/datepicker';
import { MatNativeDateModule } from '@angular/material/core';
import {MatSlideToggleModule} from '@angular/material/slide-toggle';
import {MatCardModule} from '@angular/material/card';
import {MatRadioModule} from '@angular/material/radio';
import {MatDialogModule} from '@angular/material/dialog';
import {MatSelectModule} from '@angular/material/select';
import { ButtonModule, CardModule, FormModule, GridModule } from '@coreui/angular';
//import { ToastrModule } from 'ngx-toastr';
// import { NgxMaterialTimepickerModule } from 'ngx-material-timepicker';


@NgModule({
  declarations: [],
  imports: [
    ButtonModule,
    CardModule,
    FormModule,
    GridModule,
    FormsModule,
    CommonModule,
    ReactiveFormsModule,
    MatFormFieldModule,
    MatInputModule,
    MatIconModule,
    MatButtonModule,
    MatSnackBarModule,
    MatProgressSpinnerModule,
    MatGridListModule,
    MatSidenavModule,
    MatCheckboxModule,
    MatToolbarModule,
    MatMenuModule,
    LayoutModule,
    MatListModule,
    MatPaginatorModule,
    MatDatepickerModule,
    MatNativeDateModule,
    MatSlideToggleModule,
    MatCardModule,
    MatRadioModule,
    MatDialogModule,
    MatSelectModule,
    //ToastrModule.forRoot(),
  ],
  exports: [
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
]
})
export class SharedModule { }