import { NgModule } from '@angular/core';
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
import { MovimientosInpremaModule } from './modulos/movimientos-inprema/movimientos-inprema.module';
import { EscalafonModule } from './modulos/escalafon/escalafon.module';

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
    MovimientosInpremaModule,
    PlanillaModule,
    AuthModule,
    EscalafonModule,
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
  providers: [SidenavService,
    { provide: HTTP_INTERCEPTORS, useClass: TokenInterceptor, multi: true }
  ],
  bootstrap: [AppComponent]
})
export class AppModule { }
