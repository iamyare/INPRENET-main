import { NgModule } from '@angular/core';
import { Routes, RouterModule } from '@angular/router';

import { AfilBancoComponent } from '../pages/Afiliacion/Docentes-Designados/afil-banco/afil-banco.component';
import { VerPlanillasComponent } from '../pages/planilla/ver-planillas/ver-planillas.component';
import { SubirDeduccionesformComponent } from '../pages/Generales/subir-deduccionesform/subir-deduccionesform.component';
import { CentroTrabajoComponent } from '../pages/Generales/centro-trabajo/centro-trabajo.component';
import { NuevaPlanillaComponentP } from '../pages/planilla/nueva-planilla/nueva-planilla.component';
import { NuevoBeneficioComponent } from '../pages/Mantenimiento/nuevo-beneficio/nuevo-beneficio.component';
import { EditarBeneficioComponent } from '../pages/Mantenimiento/editar-beneficio/editar-beneficio.component';
import { NuevoTipoDeduccionComponent } from '../pages/Mantenimiento/nuevo-tipo-deduccion/nuevo-tipo-deduccion.component';
import { EditarTipoDeduccionComponent } from '../pages/Mantenimiento/editar-tipo-deduccion/editar-tipo-deduccion.component';
import { EditarTipoPlanillaComponent } from '../pages/Mantenimiento/editar-tipo-planilla/editar-tipo-planilla.component';
import { GestionUsuariosComponent } from '../pages/admin-centro/gestion-usuarios/gestion-usuarios.component';
import { NuevoUsuarioComponent } from '../pages/admin-centro/nuevo-usuario/nuevo-usuario.component';
import { AfiliacionCentrosComponent } from '../pages/Afiliacion/Centros-Educativos/afiliacion-centros/afiliacion-centros.component';
import { BuscarPersonaComponent } from '../pages/afiliacion/verPerfil/buscar-persona/buscar-persona.component';
import { VerDatosCentrosComponent } from '../pages/Afiliacion/Centros-Educativos/ver-datos-centros/ver-datos-centros.component';
import { EditPerfilPuestTrabComponent } from '../pages/afiliacion/Docentes-Designados/edit-perfil-puest-trab/edit-perfil-puest-trab.component';
import { EditDatosBancariosComponent } from '../pages/afiliacion/Docentes-Designados/edit-datos-bancarios/edit-datos-bancarios.component';
import { EditReferPersonalesComponent } from '../pages/afiliacion/Docentes-Designados/edit-refer-personales/edit-refer-personales.component';
import { EditBeneficiariosComponent } from '../pages/afiliacion/Docentes-Designados/edit-beneficiarios/edit-beneficiarios.component';
import { NuevoBeneficioAfilComponent } from '../pages/Generales/nuevo-beneficio-afil/nuevo-beneficio-afil.component';
import { VerEditarBeneficioAfilComponent } from '../pages/Generales/ver-editar-beneficio-afil/ver-editar-beneficio-afil.component';
import { NuevaDeduccionAfilComponent } from '../pages/planilla/nueva-deduccion-afil/nueva-deduccion-afil.component';
import { VerEditarDeduccionAfilComponent } from '../pages/Generales/ver-editar-deduccion-afil/ver-editar-deduccion-afil.component';
import { PlanillaColegiosPrivadosComponent } from '../pages/planilla/Centros Privados/planilla-colegios-privados/planilla-colegios-privados.component';
import { CargarPlanillaPrivadosComponent } from '../pages/planilla/Centros Privados/cargar-planilla-privados/cargar-planilla-privados.component';
import { NuevoTipoPlanillaComponent } from '../pages/Mantenimiento/nuevo-tipo-planilla/nuevo-tipo-planilla.component';
import { VerMovimientosComponent } from '../pages/planilla/ver-movimientos/ver-movimientos.component';
import { NuevoMovimientoComponent } from '../pages/planilla/nuevo-movimiento/nuevo-movimiento.component';
import { EditarPerfilComponent } from '../pages/usuarios/editar-perfil/editar-perfil.component';
import { PerfilEdicionComponent } from '../pages/admin-centro/perfil-edicion/perfil-edicion.component';

const routes: Routes = [
  {
    path: '',
    data: {
      title: 'Afiliado',
    },
    children: [
      {
        path: '',
        pathMatch: 'full',
        redirectTo: 'dashboard',
      },
      {
        path: '',
        data: {
          title: '',
        },
        children: [
          {
            path: 'nuevo-afiliado',
            component: AfilBancoComponent,
            data: {
              title: 'Nuevo Afiliado',
            },
          },
          {
            path: 'ver-datos-afiliado',
            component: BuscarPersonaComponent,
            data: {
              title: 'Ver Datos Afiliado',
            },
          },
          {
            path: 'ver-datos-centro',
            component: VerDatosCentrosComponent,
            data: {
              title: 'Ver Datos Centro',
            },
          },
          {
            path: 'nuevo-centro',
            component: AfiliacionCentrosComponent,
            data: {
              title: 'Nuevo Centro',
            },
          },
          {
            path: 'Edit-Perfil-Puest-Trab',
            component: EditPerfilPuestTrabComponent,
            data: {
              title: 'Editar Puestos de trabajo',
            },
          },
          {
            path: 'edit-datos-bancarios',
            component: EditDatosBancariosComponent,
            data: {
              title: 'Editar Datos Bancarios',
            },
          },
          {
            path: 'edit-refer-personales',
            component: EditReferPersonalesComponent,
            data: {
              title: 'Editar Referencias Personales',
            },
          },
          {
            path: 'edit-beneficiarios',
            component: EditBeneficiariosComponent,
            data: {
              title: 'Editar Beneficiarios',
            },
          },
        ]
      },
      {
        path: 'Beneficios/nuevo-beneficio-afil',
        component: NuevoBeneficioAfilComponent,
        data: {
          title: 'Nuevo Beneficio',
        },
      },
      {
        path: 'Beneficios/Ver-editar-beneficio-afil',
        component: VerEditarBeneficioAfilComponent,
        data: {
          title: 'Ver/editar Beneficio',
        },
      },
      {
        path: 'Deducciones/nueva-deduccion-afil',
        component: NuevaDeduccionAfilComponent,
        data: {
          title: 'nueva Deducción',
        },
      },
      {
        path: 'Deducciones/ver-editar-deduccion-afil',
        component: VerEditarDeduccionAfilComponent,
        data: {
          title: 'Ver-editar Deducción',
        },
      },
    ],
  },
  {
    path: '',
    data: {
      title: 'Planilla',
    },
    children: [
      {
        path: 'Egresos/nueva-planilla',
        component: NuevaPlanillaComponentP,
        data: {
          title: 'Nueva Planilla',
        },
      },
      {
        path: 'Egresos/ver-planillas',
        component: VerPlanillasComponent,
        data: {
          title: 'Ver Planillas',
        },
      },
      {
        path: 'Ingresos/Privados/planilla-colegios-privados',
        component: PlanillaColegiosPrivadosComponent,
        data: {
          title: 'Planilla Colegios Privados',
        },
      },
      {
        path: 'Ingresos/Privados/cargar-planilla-privados',
        component: CargarPlanillaPrivadosComponent,
        data: {
          title: 'Cargar Planilla Colegios Privados',
        },
      },
      {
        path: 'subir-deduccionesform',
        component: SubirDeduccionesformComponent,
        data: {
          title: 'Subir Deducciones',
        },
      },
      {
        path: 'centro-trabajo',
        component: CentroTrabajoComponent,
        data: {
          title: 'Centro Trabajo',
        },
      },
    ],
  },
  {
    path: '',
    data: {
      title: 'Beneficio',
    },
    children: [
      {
        path: '',
        pathMatch: 'full',
        redirectTo: '',
      },
      {
        path: 'nuevo-beneficio',
        component: NuevoBeneficioComponent,
        data: {
          title: 'Nuevo Beneficio',
        },
      },
      {
        path: 'editar-beneficio',
        component: EditarBeneficioComponent,
        data: {
          title: 'Editar Beneficio',
        },
      },
    ],
  },
  {
    path: '',
    data: {
      title: 'Tipo-Planilla',
    },
    children: [
      {
        path: '',
        pathMatch: 'full',
        redirectTo: '',
      },
      {
        path: 'nuevo-tipo-planilla',
        component: NuevoTipoPlanillaComponent,
        data: {
          title: 'Nuevo Tipo Planilla',
        },
      },
      {
        path: 'editar-tipo-planilla',
        component: EditarTipoPlanillaComponent,
        data: {
          title: 'Editar Tipo Planilla',
        },
      },
    ],
  },
  {
    path: '',
    data: {
      title: 'Deduccion',
    },
    children: [
      {
        path: '',
        pathMatch: 'full',
        redirectTo: '',
      },
      {
        path: 'nuevo-tipo-deduccion',
        component: NuevoTipoDeduccionComponent,
        data: {
          title: 'Nueva Deducción',
        },
      },
      {
        path: 'editar-tipo-deduccion',
        component: EditarTipoDeduccionComponent,
        data: {
          title: 'Editar Tipo Deduccion',
        },
      },
    ],
  },
  {
    path: '',
    data: {
      title: 'Privados',
    },
    children: [
      {
        path: '',
        pathMatch: 'full',
        redirectTo: '',
      },
      {
        path: 'cargar-planilla-privados',
        component: CargarPlanillaPrivadosComponent,
        data: {
          title: 'Cargar Planilla Privados',
        },
      },
      {
        path: 'planilla-colegios-privados',
        component: PlanillaColegiosPrivadosComponent,
        data: {
          title: 'Planilla Privados',
        },
      },
    ],
  },
  {
    path: '',
    data: {
      title: 'Movimiento',
    },
    children: [
      {
        path: 'nuevo-movimiento',
        component: NuevoMovimientoComponent,
        data: {
          title: 'Nuevo Movimiento',
        },
      },
      {
        path: 'ver-movimientos',
        component: VerMovimientosComponent,
        data: {
          title: 'Nuevo Movimiento',
        },
      }
    ],
  },
  {
    path: '',
    data: {
      title: 'Gestion Usuarios',
    },
    children: [
      {
        path: 'editar-usuarios',
        component: GestionUsuariosComponent,
        data: {
          title: 'Editar Usuarios',
        },
      },
      { path: 'editar-perfil/:id', component: PerfilEdicionComponent },
      {
        path: 'nuevo-usuario',
        component: NuevoUsuarioComponent,
        data: {
          title: 'Nuevo usuario',
        },
      },
    ],
  },
  {
    path: '',
    data: {
      title: 'Usuario',
    },
    children: [
      {
        path: 'editar',
        component: EditarPerfilComponent,
        data: {
          title: 'Editar Usuario',
        },
      },
    ],
  },
];

@NgModule({
  imports: [RouterModule.forChild(routes)],
  exports: [RouterModule],
})
export class ThemeRoutingModule { }
