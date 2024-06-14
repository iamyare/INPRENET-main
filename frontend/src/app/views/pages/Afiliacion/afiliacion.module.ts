import { NgModule, CUSTOM_ELEMENTS_SCHEMA } from '@angular/core';
import { CommonModule } from '@angular/common';
import { SharedModule } from '../../../shared/shared.module';
import { AfiliadoComponent } from './verPerfil/afiliado/afiliado.component';
import { BeneficiarioComponent } from './verPerfil/beneficiario/beneficiario.component';
import { BuscarPersonaComponent } from './verPerfil/buscar-persona/buscar-persona.component';
import { PerfilComponent } from './verPerfil/perfil/perfil.component';
import { PensionadoComponent } from './verPerfil/pensionado/pensionado.component';
import { VoluntarioComponent } from './verPerfil/voluntario/voluntario.component';
import { JubiladoComponent } from './verPerfil/jubilado/jubilado.component';
import { AfiliacionRoutingModule } from './afiliacion-routing.module';

@NgModule({
  declarations: [
    AfiliadoComponent,
    BeneficiarioComponent,
    BuscarPersonaComponent,
    PerfilComponent,
    PensionadoComponent,
    VoluntarioComponent,
    JubiladoComponent,
  ],
  imports: [
    CommonModule,
    SharedModule,
    AfiliacionRoutingModule,
  ],
  exports: [
    BuscarPersonaComponent,
    PerfilComponent
  ],
  schemas: [CUSTOM_ELEMENTS_SCHEMA]
})
export class AfiliacionModule { }
