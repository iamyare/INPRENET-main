import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { SharedModule } from '../../shared/shared.module';

import { IconModule } from '@coreui/icons-angular';

import { PagesRoutingModule } from './pages-routing.module';
import { LoginComponent } from './login-registro/login/login.component';
import { Page404Component } from './Errores/page404/page404.component';
import { Page500Component } from './Errores/page500/page500.component';

import { PreRegisterComponent } from './login-registro/pre-register/pre-register.component';
import { RegisterComponent } from './login-registro/register/register.component';
import { LoginPrivadosComponent } from './login-registro/login-privados/login-privados.component';
import { OlvidoContrasenaComponent } from './login-registro/olvido-contrasena/olvido-contrasena.component';
import { RestablecerContrasenaComponent } from './login-registro/restablecer-contrasena/restablecer-contrasena.component';

@NgModule({
  declarations: [
    LoginComponent,
    Page404Component,
    Page500Component,
    PreRegisterComponent,
    RegisterComponent,
    LoginPrivadosComponent,
    RestablecerContrasenaComponent,
    OlvidoContrasenaComponent,
  ],
  imports: [
    CommonModule,
    PagesRoutingModule,
    IconModule,
    SharedModule,
  ],
  exports: [
    PreRegisterComponent
  ]
})
export class PagesModule {
}
