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
import { AgregarDatBancCompComponent } from './gestion/agregar-dat-banc-comp/agregar-dat-banc-comp.component';
import { EditDatosBancariosComponent } from './gestion/edit-datos-bancarios/edit-datos-bancarios.component';
import { EditDatosGeneralesComponent } from './gestion/edit-datos-generales/edit-datos-generales.component';
import { AgregarPuestTrabComponent } from './gestion/agregar-puest-trab/agregar-puest-trab.component';
import { EditReferPersonalesComponent } from './gestion/edit-refer-personales/edit-refer-personales.component';
import { AgregarReferenciasPersonalesComponent } from './gestion/agregar-referencias-personales/agregar-referencias-personales.component';
import { VerDatosAfiliadosComponent } from './gestion/ver-datos-afiliados/ver-datos-afiliados.component';
import { ReactiveFormsModule } from '@angular/forms';
import { PepsComponent } from './gestion/peps/peps.component';
import { ColMagisterialesComponent } from './gestion/col-magisteriales/col-magisteriales.component';
import { OtrasFuentesIngresoComponent } from './gestion/otras-fuentes-ingreso/otras-fuentes-ingreso.component';
import { DatPuestoTrabComponent } from './gestion/dat-puesto-trab/dat-puesto-trab.component';
import { RefPersComponent } from './gestion/ref-pers/ref-pers.component';
import { BenefComponent } from './gestion/benef/benef.component';
import { EditPerfilPuestTrabComponent } from './gestion/edit-perfil-puest-trab/edit-perfil-puest-trab.component';
import { EditColegiosMagisterialesComponent } from './gestion/edit-colegios-magisteriales/edit-colegios-magisteriales.component';
import { EditPepsComponent } from './gestion/edit-peps/edit-peps.component';
import { DatosPropietarioComponent } from './Centros-Educativos/admin-centro-educativo/datos-propietario/datos-propietario.component';
import { DatosContadorComponent } from './Centros-Educativos/admin-centro-educativo/datos-contador/datos-contador.component';
import { DatosAdministradorComponent } from './Centros-Educativos/admin-centro-educativo/datos-administrador/datos-administrador.component';
import { DiscapacidadComponent } from './mantenimiento/discapacidad/discapacidad.component';
import { ProfesionComponent } from './mantenimiento/profesion/profesion.component';
import { ColegioComponent } from './mantenimiento/colegio/colegio.component';
import { BancoComponent } from './mantenimiento/banco/banco.component';
import { MantenimientoAfiliacionComponent } from './mantenimiento/mantenimiento-afiliacion/mantenimiento-afiliacion.component';
import { JornadaComponent } from './mantenimiento/jornada/jornada.component';
import { NivelEducativoComponent } from './mantenimiento/nivel-educativo/nivel-educativo.component';
import { DatFamiliaresComponent } from './gestion/dat-familiares/dat-familiares.component';
import { VerSociosComponent } from './Centros-Educativos/ver-socios/ver-socios.component';
import { AfiliarDocenteComponent } from './gestion/afiliar-docente/afiliar-docente.component';
import { DatosGeneralesComponent } from './gestion/datos-generales/datos-generales.component';
import { BancosComponent } from './gestion/bancos/bancos.component';
import { VerOtrasFuentesIngresoComponent } from './verPerfil/ver-otras-fuentes-ingreso/ver-otras-fuentes-ingreso.component';
import { AgregarOtrasFuentesIngresoComponent } from './gestion/agregar-otras-fuentes-ingreso/agregar-otras-fuentes-ingreso.component';
import { DetallePagosComponent } from '../planilla/detalle-pagos/detalle-pagos.component';
import { DesglosePagoComponent } from '../planilla/desglose-pago/desglose-pago.component';
import { TodosPagosComponent } from '../planilla/todos-pagos/todos-pagos.component';
import { EditConyugueComponent } from './gestion/edit-conyugue/edit-conyugue.component';
import { AgregarPepsComponent } from './gestion/agregar-peps/agregar-peps.component';
import { AgregarFamiliarComponent } from './gestion/agregar-familiar/agregar-familiar.component';
import { DatosGeneralesTemporalComponent } from './gestion/datos-generales-temporal/datos-generales-temporal.component';
import { BeneficiarioSinCausanteComponent } from './verPerfil/beneficiario-sin-causante/beneficiario-sin-causante.component';
import { DesignadoComponent } from './verPerfil/designado/designado.component';
import { ContanciasAfiliadosComponent } from './constancias/contancias-afiliados/contancias-afiliados.component';

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
    AgregarDatBancCompComponent,
    EditDatosBancariosComponent,
    EditDatosGeneralesComponent,
    AgregarPuestTrabComponent,
    EditReferPersonalesComponent,
    AgregarReferenciasPersonalesComponent,
    VerDatosAfiliadosComponent,
    PepsComponent,
    ColMagisterialesComponent,
    OtrasFuentesIngresoComponent,
    DatPuestoTrabComponent,
    RefPersComponent,
    BenefComponent,
    EditPerfilPuestTrabComponent, 
    EditColegiosMagisterialesComponent,
    DatosPropietarioComponent,
    DatosContadorComponent,
    DatosAdministradorComponent,
    MantenimientoAfiliacionComponent,
    DiscapacidadComponent,
    ProfesionComponent,
    ColegioComponent,
    BancoComponent,
    JornadaComponent,
    NivelEducativoComponent,
    DatFamiliaresComponent,
    VerSociosComponent,
    AfiliarDocenteComponent,
    DatosGeneralesComponent,
    BancosComponent,
    VerOtrasFuentesIngresoComponent,
    AgregarOtrasFuentesIngresoComponent,
    EditPepsComponent,
    DetallePagosComponent,
    DesglosePagoComponent,
    TodosPagosComponent,
    EditConyugueComponent,
    AgregarPepsComponent,
    AgregarFamiliarComponent,
    DatosGeneralesTemporalComponent,
    BeneficiarioSinCausanteComponent,
    DesignadoComponent,
    ContanciasAfiliadosComponent
  ],
  imports: [
    CommonModule,
    MaterialAngularModule,
    ComponentsModule,
    AfiliacionRoutingModule,
    ReactiveFormsModule
  ],
  exports: [
    AdminCentroEducativoComponent,
    JubiladoComponent,
    PensionadoComponent,
    BeneficiarioComponent,
    AfiliadoComponent,
    VoluntarioComponent,
    DatBancComponent,
    EditDatosBancariosComponent,
  ],
  providers: [
    { provide: MAT_DATE_LOCALE, useValue: 'es', },
  ],
  schemas: [CUSTOM_ELEMENTS_SCHEMA]
})
export class AfiliacionModule { }
