import { NgModule } from '@angular/core';
import { RouterModule, Routes } from '@angular/router';
import { Page404Component } from './Errores/page404/page404.component';
import { Page500Component } from './Errores/page500/page500.component';
import { LoginComponent } from './Generales/login/login.component';
import { RegisterComponent } from './Generales/register/register.component';
import { PreRegisterComponent } from './Generales/pre-register/pre-register.component';
import { PlanillaColegiosPrivadosComponent } from './Generales/planilla-colegios-privados/planilla-colegios-privados.component';

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
    path: 'register/:token',
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
  }
];

@NgModule({
  imports: [RouterModule.forChild(routes)],
  exports: [RouterModule]
})
export class PagesRoutingModule {
}
