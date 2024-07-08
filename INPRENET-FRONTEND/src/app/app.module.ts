import { NgModule } from '@angular/core';
import { BrowserModule } from '@angular/platform-browser';
import { BrowserAnimationsModule } from '@angular/platform-browser/animations';
import { AppRoutingModule } from './app-routing.module';
import { AppComponent } from './app.component';
import { AfiliacionModule } from './modulos/afiliacion/afiliacion.module';
import { MaterialAngularModule } from './material-angular/material-angular.module';
import { ToastrModule } from 'ngx-toastr';
import { HttpClientModule } from '@angular/common/http';
import { FormsModule, ReactiveFormsModule } from '@angular/forms';
import { PlanillaModule } from './modulos/planilla/planilla.module';
import { AuthModule } from './modulos/auth/auth.module';
import { LayoutComponent } from './components/layout/layout.component';
import { ComponentsModule } from './components/components.module';
import { AdminModule } from './modulos/admin/admin.module';
import { SidenavService } from './services/sidenav.service';
import { HeaderComponent } from './components/header/header.component';
import { FooterComponent } from './components/footer/footer.component';
import { MainLayoutComponent } from './components/main-layout/main-layout.component';
@NgModule({
  declarations: [
    AppComponent,
    LayoutComponent,
    HeaderComponent,
    FooterComponent,
    MainLayoutComponent
  ],
  imports: [
    BrowserModule,
    AppRoutingModule,
    HttpClientModule,
    BrowserAnimationsModule,
    MaterialAngularModule,
    AfiliacionModule,
    PlanillaModule,
    AuthModule,
    ComponentsModule,
    ReactiveFormsModule,
    AdminModule,
    FormsModule,
    ToastrModule.forRoot({
      timeOut: 10000,
      positionClass: 'toast-bottom-right',
      preventDuplicates: true,
    }),
  ],
  providers: [SidenavService],
  bootstrap: [AppComponent]
})
export class AppModule { }
