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
import { ThemeModule } from '../../theme/theme.module';
import { InformacionGeneralComponent } from './verPerfil/informacion-general/informacion-general.component';
import { PruebiComponent } from './verPerfil/pruebi/pruebi.component';
import { BeneficiarioConstanciasComponent } from './verPerfil/beneficiario-constancias/beneficiario-constancias.component';
import { BeneficiarioBeneficiosAsignadosComponent } from './verPerfil/beneficiario-beneficios-asignados/beneficiario-beneficios-asignados.component';
import { CausanteDetalleComponent } from './verPerfil/causante-detalle/causante-detalle.component';
import { ConstanciasAfiliadoComponent } from './verAfiliados/constancias-afiliado/constancias-afiliado.component';
import { EditBeneficiariosComponent } from './Docentes-Designados/edit-beneficiarios/edit-beneficiarios.component';
import { EditDatosGeneralesComponent } from './Docentes-Designados/edit-datos-generales/edit-datos-generales.component';

@NgModule({
  declarations: [
    AfiliadoComponent,
    BeneficiarioComponent,
    PensionadoComponent,
    VoluntarioComponent,
    JubiladoComponent,
    BuscarPersonaComponent,
    PerfilComponent,
    InformacionGeneralComponent,
    PruebiComponent,
    BeneficiarioConstanciasComponent,
    BeneficiarioBeneficiosAsignadosComponent,
    CausanteDetalleComponent,
    ConstanciasAfiliadoComponent,
    EditBeneficiariosComponent,
    EditDatosGeneralesComponent
  ],
  imports: [
    CommonModule,
    SharedModule,
  ],
  exports: [
    BuscarPersonaComponent,
    PerfilComponent,
    ThemeModule,
    EditDatosGeneralesComponent,
    EditBeneficiariosComponent
  ],
  schemas: [CUSTOM_ELEMENTS_SCHEMA]
})
export class AfiliacionModule { }
