import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { MaterialAngularModule } from 'src/app/material-angular/material-angular.module';
import { ComponentsModule } from 'src/app/components/components.module';
import { LoginComponent } from './login/login.component';
import { LoginPrivadosComponent } from './login-privados/login-privados.component';
import { OlvidoContrasenaComponent } from './olvido-contrasena/olvido-contrasena.component';
import { PreRegisterComponent } from './pre-register/pre-register.component';
import { RegisterComponent } from './register/register.component';
import { RestablecerContrasenaComponent } from './restablecer-contrasena/restablecer-contrasena.component';
import { AuthModuleRoutingModule } from './auth-routing.module';
import { EditarPerfilComponent } from './editar-perfil/editar-perfil.component';

@NgModule({
  declarations: [
    LoginComponent,
    LoginPrivadosComponent,
    OlvidoContrasenaComponent,
    PreRegisterComponent,
    RegisterComponent,
    RestablecerContrasenaComponent,
    EditarPerfilComponent
  ],
  imports: [
    CommonModule,
    MaterialAngularModule,
    ComponentsModule,
  ]
})
export class AuthModule { }
