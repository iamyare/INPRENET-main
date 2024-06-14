import { NgModule } from '@angular/core';
import { RouterModule, Routes } from '@angular/router';
import { BuscarPersonaComponent } from './verPerfil/buscar-persona/buscar-persona.component';
import { PerfilComponent } from './verPerfil/perfil/perfil.component';
import { AfiliadoComponent } from './verPerfil/afiliado/afiliado.component';
import { BeneficiarioComponent } from './verPerfil/beneficiario/beneficiario.component';
import { PensionadoComponent } from './verPerfil/pensionado/pensionado.component';
import { VoluntarioComponent } from './verPerfil/voluntario/voluntario.component';
import { JubiladoComponent } from './verPerfil/jubilado/jubilado.component';

const routes: Routes = [
  { path: 'buscar-persona', component: BuscarPersonaComponent },
  { path: 'perfil', component: PerfilComponent, children: [
      { path: 'afiliado', component: AfiliadoComponent },
      { path: 'beneficiario', component: BeneficiarioComponent },
      { path: 'pensionado', component: PensionadoComponent },
      { path: 'voluntario', component: VoluntarioComponent },
      { path: 'jubilado', component: JubiladoComponent }
    ]
  },
  { path: '', redirectTo: 'buscar-persona', pathMatch: 'full' }
];

@NgModule({
  imports: [RouterModule.forChild(routes)],
  exports: [RouterModule]
})
export class AfiliacionRoutingModule { }
