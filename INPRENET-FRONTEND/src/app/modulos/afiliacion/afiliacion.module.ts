import { NgModule, CUSTOM_ELEMENTS_SCHEMA } from '@angular/core';
import { CommonModule } from '@angular/common';
import { MaterialAngularModule } from 'src/app/material-angular/material-angular.module';
import { AdminCentroEducativoComponent } from './Centros-Educativos/admin-centro-educativo/admin-centro-educativo.component';
import { AfiliacionCentrosComponent } from './Centros-Educativos/afiliacion-centros/afiliacion-centros.component';
import { DatosGeneralesCentroComponent } from './Centros-Educativos/datos-generales-centro/datos-generales-centro.component';
import { ReferenciasBancariasComercialesComponent } from './Centros-Educativos/referencias-bancarias-comerciales/referencias-bancarias-comerciales.component';
import { SociedadComponent } from './Centros-Educativos/sociedad/sociedad.component';
import { SociedadSocioComponent } from './Centros-Educativos/sociedad-socio/sociedad-socio.component';
import { VerDatosCentrosComponent } from './Centros-Educativos/ver-datos-centros/ver-datos-centros.component';
import { VerReferenciasComponent } from './Centros-Educativos/ver-referencias/ver-referencias.component';
import { AfiliadoComponent } from './verPerfil/afiliado/afiliado.component';
import { BeneficiarioComponent } from './verPerfil/beneficiario/beneficiario.component';
import { BeneficiarioBeneficiosAsignadosComponent } from './verPerfil/beneficiario-beneficios-asignados/beneficiario-beneficios-asignados.component';
import { BeneficiarioConstanciasComponent } from './verPerfil/beneficiario-constancias/beneficiario-constancias.component';
import { BuscarPersonaComponent } from './verPerfil/buscar-persona/buscar-persona.component';
import { CausanteDetalleComponent } from './verPerfil/causante-detalle/causante-detalle.component';
import { ConstanciasAfiliadoComponent } from './verPerfil/constancias-afiliado/constancias-afiliado.component';
import { InformacionGeneralComponent } from './verPerfil/informacion-general/informacion-general.component';
import { JubiladoComponent } from './verPerfil/jubilado/jubilado.component';
import { PensionadoComponent } from './verPerfil/pensionado/pensionado.component';
import { PerfilComponent } from './verPerfil/perfil/perfil.component';
import { VoluntarioComponent } from './verPerfil/voluntario/voluntario.component';
import { ComponentsModule } from 'src/app/components/components.module';
import { MAT_DATE_LOCALE } from '@angular/material/core';
import { AfiliacionRoutingModule } from './afiliacion-routing.module';
import { DatBancComponent } from './nose/dat-banc/dat-banc.component';
import { AgregarMovimientoComponent } from './gestion/agregar-movimiento/agregar-movimiento.component';
import { AgregarBenefCompComponent } from './gestion/agregar-benef-comp/agregar-benef-comp.component';
import { EditBeneficiariosComponent } from './gestion/edit-beneficiarios/edit-beneficiarios.component';
import { AgregarColMagisComponent } from './gestion/agregar-col-magis/agregar-col-magis.component';
import { HistorialSalarioComponent } from './gestion/historial-salario/historial-salario.component';
import { AgregarDatBancCompComponent } from './gestion/agregar-dat-banc-comp/agregar-dat-banc-comp.component';
import { EditDatosBancariosComponent } from './gestion/edit-datos-bancarios/edit-datos-bancarios.component';
import { EditDatosGeneralesComponent } from './gestion/edit-datos-generales/edit-datos-generales.component';
import { AgregarPuestTrabComponent } from './gestion/agregar-puest-trab/agregar-puest-trab.component';
import { EditReferPersonalesComponent } from './gestion/edit-refer-personales/edit-refer-personales.component';
import { AgregarReferenciasPersonalesComponent } from './gestion/agregar-referencias-personales/agregar-referencias-personales.component';
import { VerCuentasPersonasComponent } from './gestion/ver-cuentas-personas/ver-cuentas-personas.component';
import { AgregarCuentasComponent } from './gestion/agregar-cuentas/agregar-cuentas.component';
import { VerDatosAfiliadosComponent } from './gestion/ver-datos-afiliados/ver-datos-afiliados.component';
import { AfilBancoComponent } from './gestion/afil-banco/afil-banco.component';
import { DatGeneralesAfiliadoComponent } from './gestion/dat-generales-afiliado/dat-generales-afiliado.component';
import { ReactiveFormsModule } from '@angular/forms';
import { PepsComponent } from './gestion/peps/peps.component';
import { ColMagisterialesComponent } from './gestion/col-magisteriales/col-magisteriales.component';
import { OtrasFuentesIngresoComponent } from './gestion/otras-fuentes-ingreso/otras-fuentes-ingreso.component';
import { DatPuestoTrabComponent } from './gestion/dat-puesto-trab/dat-puesto-trab.component';
import { RefPersComponent } from './gestion/ref-pers/ref-pers.component';
import { BenefComponent } from './gestion/benef/benef.component';
import { VerOtrasFuentesIngresoComponent } from './verPerfil/ver-otras-fuentes-ingreso/ver-otras-fuentes-ingreso.component';
import { EditPerfilPuestTrabComponent } from './gestion/edit-perfil-puest-trab/edit-perfil-puest-trab.component';
import { EditColegiosMagisterialesComponent } from './gestion/edit-colegios-magisteriales/edit-colegios-magisteriales.component';
import { AfiliacionDocentesComponent } from './gestion/afiliacion-docentes/afiliacion-docentes.component';

@NgModule({
  declarations: [
    AdminCentroEducativoComponent,
    AfiliacionCentrosComponent,
    DatosGeneralesCentroComponent,
    ReferenciasBancariasComercialesComponent,
    SociedadComponent,
    SociedadSocioComponent,
    VerDatosCentrosComponent,
    VerReferenciasComponent,
    AfiliadoComponent,
    BeneficiarioComponent,
    BeneficiarioBeneficiosAsignadosComponent,
    BeneficiarioConstanciasComponent,
    BuscarPersonaComponent,
    CausanteDetalleComponent,
    ConstanciasAfiliadoComponent,
    InformacionGeneralComponent,
    JubiladoComponent,
    PensionadoComponent,
    PerfilComponent,
    VoluntarioComponent,
    DatBancComponent,
    AgregarMovimientoComponent,
    EditBeneficiariosComponent,
    AgregarBenefCompComponent,
    AgregarColMagisComponent,
    HistorialSalarioComponent,
    AgregarDatBancCompComponent,
    EditDatosBancariosComponent,
    EditDatosGeneralesComponent,
    AgregarPuestTrabComponent,
    EditReferPersonalesComponent,
    AgregarReferenciasPersonalesComponent,
    VerCuentasPersonasComponent,
    AgregarCuentasComponent,
    VerDatosAfiliadosComponent,
    AfilBancoComponent,
    DatGeneralesAfiliadoComponent,
    PepsComponent,
    ColMagisterialesComponent,
    OtrasFuentesIngresoComponent,
    DatPuestoTrabComponent,
    RefPersComponent,
    BenefComponent,
    VerOtrasFuentesIngresoComponent, EditPerfilPuestTrabComponent, EditColegiosMagisterialesComponent,
    AfiliacionDocentesComponent
  ],
  imports: [
    CommonModule,
    MaterialAngularModule,
    ComponentsModule,
    AfiliacionRoutingModule,
    ReactiveFormsModule,
  ],
  exports: [
    AdminCentroEducativoComponent,
    JubiladoComponent,
    PensionadoComponent,
    BeneficiarioComponent,
    AfiliadoComponent,
    VoluntarioComponent,
    DatBancComponent
  ],
  providers: [
    { provide: MAT_DATE_LOCALE, useValue: 'es', },
  ],
  schemas: [CUSTOM_ELEMENTS_SCHEMA]
})
export class AfiliacionModule { }
