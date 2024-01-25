import { CommonModule } from '@angular/common';
import { NgModule } from '@angular/core';

import { CardModule, GridModule, NavModule, UtilitiesModule, TabsModule } from '@coreui/angular';
import { IconModule } from '@coreui/icons-angular';

// Theme Routing
import { ThemeRoutingModule } from './theme-routing.module';
import { AfilBancoComponent } from '../pages/Generales/afil-banco/afil-banco.component';
import { SharedModule } from '../shared/shared/shared.module';
import { CentroTrabajoComponent } from '../pages/Generales/centro-trabajo/centro-trabajo.component';

import { FormsModule } from '@angular/forms';

// Importaciones específicas de Angular Material
import { MatInputModule } from '@angular/material/input';
import { MatFormFieldModule } from '@angular/material/form-field';
import { MatButtonModule } from '@angular/material/button';
import { MatCardModule } from '@angular/material/card';
import { MatTableModule } from '@angular/material/table';
import { MatPaginatorModule } from '@angular/material/paginator';
import { MatIconModule } from '@angular/material/icon';

import { VerDeduccionesComponent } from '../pages/Generales/ver-deducciones/ver-deducciones.component';
import { DatosGenAfilComponent } from '../pages/Generales/datos-gen-afil/datos-gen-afil.component';
import { NuevaPlanillaComponentP } from '../pages/Generales/nueva-planilla/nueva-planilla.component';
import { VerPlanillasComponent } from '../pages/Generales/ver-planillas/ver-planillas.component';
import { SubirDeduccionesformComponent } from '../pages/Generales/subir-deduccionesform/subir-deduccionesform.component';
import { NuevoBeneficioComponent } from '../pages/Mantenimiento/nuevo-beneficio/nuevo-beneficio.component';
import { EditarBeneficioComponent } from '../pages/Mantenimiento/editar-beneficio/editar-beneficio.component';
/* import { CentroTrabajoPageComponent } from '../pages/centro-trabajo-page/centro-trabajo-page.component' */
import { InlineEditingOneComponent } from '../../../components/inline-editing-one/inline-editing-one.component';
import { NuevaplanillaComponent } from '../../../components/nuevaplanilla/nuevaplanilla.component';
import { NuevoTipoPlanillaComponent } from '../pages/Mantenimiento/nuevo-tipo-planilla/nuevo-tipo-planilla.component';
import { EditarTipoPlanillaComponent } from '../pages/Mantenimiento/editar-tipo-planilla/editar-tipo-planilla.component';
import { NuevoTipoDeduccionComponent } from '../pages/Mantenimiento/nuevo-tipo-deduccion/nuevo-tipo-deduccion.component';
import { EditarTipoDeduccionComponent } from '../pages/Mantenimiento/editar-tipo-deduccion/editar-tipo-deduccion.component';
import { NuevoBeneficioAfilComponent } from '../pages/Generales/nuevo-beneficio-afil/nuevo-beneficio-afil.component';
import { NuevaDeduccionAfilComponent } from '../pages/Generales/nueva-deduccion-afil/nueva-deduccion-afil.component';

@NgModule({
  imports: [
    CommonModule,
    ThemeRoutingModule,
    CardModule,
    GridModule,
    UtilitiesModule,
    IconModule,
    NavModule,
    TabsModule,
    SharedModule,
    FormsModule,
    MatInputModule,
    MatFormFieldModule,
    MatButtonModule,
    MatCardModule,
    MatTableModule,
    MatPaginatorModule,
    MatIconModule,
  ],
  declarations: [
    SubirDeduccionesformComponent,
    VerDeduccionesComponent,
    NuevaPlanillaComponentP,
    AfilBancoComponent,
    CentroTrabajoComponent,
    DatosGenAfilComponent,
    VerPlanillasComponent,
    InlineEditingOneComponent,
    NuevaplanillaComponent,
    NuevoBeneficioComponent,
    EditarBeneficioComponent,
    NuevoTipoPlanillaComponent,
    EditarTipoPlanillaComponent,
    NuevoTipoDeduccionComponent,
    EditarTipoDeduccionComponent,
    NuevoBeneficioAfilComponent,
    NuevaDeduccionAfilComponent
/*     CentroTrabajoPageComponent */
  ]
})
export class ThemeModule {
}
