import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { SharedModule } from '../shared/shared/shared.module';

import { IconModule } from '@coreui/icons-angular';

import { PagesRoutingModule } from './pages-routing.module';
import { LoginComponent } from './login/login.component';
import { Page404Component } from './page404/page404.component';
import { Page500Component } from './page500/page500.component';

import { PreRegisterComponent } from './pre-register/pre-register.component';
import { RegisterComponent } from './register/register.component';
import { BotonarchivosComponent } from '@docs-components/botonarchivos/botonarchivos.component';

@NgModule({
  declarations: [
    BotonarchivosComponent,
    LoginComponent,
    Page404Component,
    Page500Component,
    PreRegisterComponent,
    RegisterComponent,
  ],
  imports: [
    CommonModule,
    PagesRoutingModule,
    IconModule,
    SharedModule,
  ]
})
export class PagesModule {
}
