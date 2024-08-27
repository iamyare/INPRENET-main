import { NgModule } from '@angular/core';
import { RouterModule, Routes } from '@angular/router';
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
import { AfilBancoComponent } from './gestion/afil-banco/afil-banco.component';
import { AfiliacionDocentesComponent } from './gestion/afiliacion-docentes/afiliacion-docentes.component';
import { MantenimientoAfiliacionComponent } from './mantenimiento/mantenimiento-afiliacion/mantenimiento-afiliacion.component';
import { DiscapacidadComponent } from './mantenimiento/discapacidad/discapacidad.component';
import { ProfesionComponent } from './mantenimiento/profesion/profesion.component';
import { ColegioComponent } from './mantenimiento/colegio/colegio.component';
import { BancoComponent } from './mantenimiento/banco/banco.component';
import { JornadaComponent } from './mantenimiento/jornada/jornada.component';
import { NivelEducativoComponent } from './mantenimiento/nivel-educativo/nivel-educativo.component';
import { AfiliarDocenteComponent } from './gestion/afiliar-docente/afiliar-docente.component';

const routes: Routes = [
  { path: 'admin-centro-educativo', component: AdminCentroEducativoComponent },
  { path: 'nuevo-centro', component: AfiliacionCentrosComponent },
  { path: 'nada', component: DatosGeneralesCentroComponent },
  { path: 'referencias-bancarias-comerciales', component: ReferenciasBancariasComercialesComponent },
  { path: 'sociedad', component: SociedadComponent },
  { path: 'sociedad-socio', component: SociedadSocioComponent },
  { path: 'ver-datos-centro', component: VerDatosCentrosComponent },
  { path: 'ver-referencias', component: VerReferenciasComponent },
  { path: 'afiliado', component: AfiliadoComponent },
  { path: 'beneficiario', component: BeneficiarioComponent },
  { path: 'beneficiario-beneficios-asignados', component: BeneficiarioBeneficiosAsignadosComponent },
  { path: 'beneficiario-constancias', component: BeneficiarioConstanciasComponent },
  { path: 'buscar-persona', component: BuscarPersonaComponent },
  { path: 'causante-detalle', component: CausanteDetalleComponent },
  { path: 'constancias-afiliado', component: ConstanciasAfiliadoComponent },
  { path: 'informacion-general', component: InformacionGeneralComponent },
  { path: 'jubilado', component: JubiladoComponent },
  { path: 'pensionado', component: PensionadoComponent },
  { path: 'perfil', component: PerfilComponent },
  { path: 'voluntario', component: VoluntarioComponent },
  { path: 'nuevo-afiliado', component: AfilBancoComponent },
  { path: 'nueva-afiliacion', component: AfiliarDocenteComponent },
  { path: 'mantenimiento', component: MantenimientoAfiliacionComponent },
  { path: 'mantenimiento/discapacidad', component: DiscapacidadComponent },
  { path: 'mantenimiento/profesion', component: ProfesionComponent },
  { path: 'mantenimiento/colegio', component: ColegioComponent },
  { path: 'mantenimiento/banco', component: BancoComponent },
  { path: 'mantenimiento/jornada', component: JornadaComponent },
  { path: 'mantenimiento/nivel-educativo', component: NivelEducativoComponent },
  { path: '**', redirectTo: "nuevo-afiliado", pathMatch: 'full' },
];

@NgModule({
  imports: [RouterModule.forChild(routes)],
  exports: [RouterModule]
})
export class AfiliacionRoutingModule { }
