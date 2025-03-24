import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';  // Asegúrate de importar esto
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
import { MatTabsModule } from '@angular/material/tabs';
import { GoogleMapsModule } from '@angular/google-maps';

// Importa el componente de mensajes de error
import { ErrorMessagesComponent } from './error-messages/error-messages.component';

@NgModule({
  declarations: [
    ErrorMessagesComponent,  // Declara el componente
  ],
  imports: [
    CommonModule,  // Importa CommonModule aquí para usar *ngIf
    MatNativeDateModule,
    MatButtonModule,
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
    NgScrollbarModule,
    MatTableModule,
    MatStepperModule,
    MatTabsModule,
  ],
  exports: [
    ErrorMessagesComponent,  
    CommonModule,  // Exporta CommonModule si es necesario
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
    NgScrollbarModule,
    MatTableModule,
    MatStepperModule,
    MatTabsModule,
  ]
})
export class SharedModule { }
