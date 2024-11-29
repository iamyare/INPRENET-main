import { LOCALE_ID, NgModule } from '@angular/core';
import { BrowserModule } from '@angular/platform-browser';
import { BrowserAnimationsModule } from '@angular/platform-browser/animations';
import { AppRoutingModule } from './app-routing.module';
import { AppComponent } from './app.component';
import { AfiliacionModule } from './modulos/afiliacion/afiliacion.module';
import { MaterialAngularModule } from './material-angular/material-angular.module';
import { ToastrModule } from 'ngx-toastr';
import { HTTP_INTERCEPTORS, HttpClientModule } from '@angular/common/http';
import { FormsModule, ReactiveFormsModule } from '@angular/forms';
import { PlanillaModule } from './modulos/planilla/planilla.module';
import { AuthModule } from './modulos/auth/auth.module';
import { ComponentsModule } from './components/components.module';
import { AdminModule } from './modulos/admin/admin.module';
import { SidenavService } from './services/sidenav.service';
import { TokenInterceptor } from './interceptors/token.interceptor';
import { EscalafonModule } from './modulos/escalafon/escalafon.module';
import { ConasaModule } from './modulos/conasa/conasa.module';
import { registerLocaleData } from '@angular/common';
import localeEs from '@angular/common/locales/es';

registerLocaleData(localeEs, 'es');
@NgModule({
  declarations: [
    AppComponent,
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
    EscalafonModule,
    ComponentsModule,
    ReactiveFormsModule,
    AdminModule,
    FormsModule,
    ConasaModule,
    ToastrModule.forRoot({
      timeOut: 10000,
      positionClass: 'toast-bottom-right',
      preventDuplicates: true,
    }),
  ],
  providers: [SidenavService,
    { provide: HTTP_INTERCEPTORS, useClass: TokenInterceptor, multi: true },
    { provide: LOCALE_ID, useValue: 'es' }
  ],
  bootstrap: [AppComponent]
})
export class AppModule { }
