import { NgModule, CUSTOM_ELEMENTS_SCHEMA } from '@angular/core';
import { CommonModule, registerLocaleData } from '@angular/common';
import { SharedModule } from '../../../shared/shared.module';
import { AfiliadoComponent } from './verPerfil/afiliado/afiliado.component';
import { BeneficiarioComponent } from './verPerfil/beneficiario/beneficiario.component';
import { BuscarPersonaComponent } from './verPerfil/buscar-persona/buscar-persona.component';
import { PerfilComponent } from './verPerfil/perfil/perfil.component';
import { PensionadoComponent } from './verPerfil/pensionado/pensionado.component';
import { VoluntarioComponent } from './verPerfil/voluntario/voluntario.component';
import { JubiladoComponent } from './verPerfil/jubilado/jubilado.component';
import { ThemeModule } from '../../theme/theme.module';
import { InformacionGeneralComponent } from './verPerfil/informacion-general/informacion-general.component';
import { PruebiComponent } from './verPerfil/pruebi/pruebi.component';
import { BeneficiarioConstanciasComponent } from './verPerfil/beneficiario-constancias/beneficiario-constancias.component';
import { BeneficiarioBeneficiosAsignadosComponent } from './verPerfil/beneficiario-beneficios-asignados/beneficiario-beneficios-asignados.component';
import { CausanteDetalleComponent } from './verPerfil/causante-detalle/causante-detalle.component';
import { ConstanciasAfiliadoComponent } from './verAfiliados/constancias-afiliado/constancias-afiliado.component';
import { EditBeneficiariosComponent } from './Docentes-Designados/edit-beneficiarios/edit-beneficiarios.component';
import { EditDatosGeneralesComponent } from './Docentes-Designados/edit-datos-generales/edit-datos-generales.component';
import { EditColegiosMagisterialesComponent } from './Docentes-Designados/edit-colegios-magisteriales/edit-colegios-magisteriales.component';
import { VerCuentasPersonasComponent } from './Docentes-Designados/ver-cuentas-personas/ver-cuentas-personas.component';

import { EditPerfilPuestTrabComponent } from './Docentes-Designados/edit-perfil-puest-trab/edit-perfil-puest-trab.component';
import { EditReferPersonalesComponent } from './Docentes-Designados/edit-refer-personales/edit-refer-personales.component';
import { EditDatosBancariosComponent } from './Docentes-Designados/edit-datos-bancarios/edit-datos-bancarios.component';
import { MAT_DATE_LOCALE } from '@angular/material/core';
import { AgregarMovimientoComponent } from './Docentes-Designados/agregar-movimiento/agregar-movimiento.component';
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
    EditDatosGeneralesComponent,
    EditColegiosMagisterialesComponent,
    EditPerfilPuestTrabComponent,
    EditDatosBancariosComponent,
    EditReferPersonalesComponent,
    VerCuentasPersonasComponent,
    ConstanciasAfiliadoComponent,
    AgregarMovimientoComponent
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
    EditBeneficiariosComponent,
    EditColegiosMagisterialesComponent,
    EditPerfilPuestTrabComponent,
    EditDatosBancariosComponent,
    EditReferPersonalesComponent,
    VerCuentasPersonasComponent,
    ConstanciasAfiliadoComponent,
  ],
  providers: [
    { provide: MAT_DATE_LOCALE, useValue: 'es' }
  ],
  schemas: [CUSTOM_ELEMENTS_SCHEMA]
})
export class AfiliacionModule { }
