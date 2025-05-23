import { NgModule } from '@angular/core';
import { RouterModule, Routes } from '@angular/router';
import { LoginComponent } from './login/login.component';
import { LoginPrivadosComponent } from './login-privados/login-privados.component';
import { OlvidoContrasenaComponent } from './olvido-contrasena/olvido-contrasena.component';
import { RegisterComponent } from './register/register.component';
import { RestablecerContrasenaComponent } from './restablecer-contrasena/restablecer-contrasena.component';
import { LandingPageComponent } from 'src/app/components/landing-page/landing-page.component';

const routes: Routes = [
  { path: 'login', component: LoginComponent },
  { path: 'login-privados', component: LoginPrivadosComponent },
  { path: 'solicitud-restablecimiento', component: OlvidoContrasenaComponent },
  { path: 'restablecer-contrasena/:token', component: RestablecerContrasenaComponent },
  { path: 'register', component: RegisterComponent },
  { path: 'landing-page', component: LandingPageComponent },


  /* { path: 'pre-register', component: PreRegisterComponent }, */
  /* { path: 'editar', component: EditarPerfilComponent }, */
];

@NgModule({
  imports: [RouterModule.forChild(routes)],
  exports: [RouterModule]
})
export class AuthModuleRoutingModule { }
