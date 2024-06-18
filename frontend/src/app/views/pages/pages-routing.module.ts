import { NgModule } from '@angular/core';
import { RouterModule, Routes } from '@angular/router';
import { Page404Component } from './Errores/page404/page404.component';
import { Page500Component } from './Errores/page500/page500.component';
import { LoginComponent } from './login-registro/login/login.component';
import { RegisterComponent } from './login-registro/register/register.component';
import { PreRegisterComponent } from './login-registro/pre-register/pre-register.component';
import { LoginPrivadosComponent } from './login-registro/login-privados/login-privados.component';

const routes: Routes = [
  {
    path: '404',
    component: Page404Component,
    data: {
      title: 'Page 404'
    }
  },
  {
    path: '500',
    component: Page500Component,
    data: {
      title: 'Page 500'
    }
  },
  {
    path: 'login',
    component: LoginComponent,
    data: {
      title: 'Login Page'
    }
  },
  {
    path: 'register',
    component: RegisterComponent,
    data: {
      title: 'Register Page'
    }
  },
  {
    path: 'pre-register',
    component: PreRegisterComponent,
    data: {
      title: 'Pre Register Page'
    }
  },
  {
    path: 'login-privados',
    component: LoginPrivadosComponent,
    data: {
      title: 'Login Privados Page'
    }
  },
];

@NgModule({
  imports: [RouterModule.forChild(routes)],
  exports: [RouterModule]
})
export class PagesRoutingModule {
}
