import { CommonModule } from '@angular/common';
import { NgModule } from '@angular/core';

import { CardModule, GridModule, NavModule, UtilitiesModule, TabsModule } from '@coreui/angular';
import { IconModule } from '@coreui/icons-angular';


// Theme Routing
import { ThemeRoutingModule } from './theme-routing.module';
import { AfilBancoComponent } from '../pages/afil-banco/afil-banco.component';
import { SharedModule } from '../shared/shared/shared.module';
import { CentroTrabajoComponent } from '../pages/centro-trabajo/centro-trabajo.component';

import { FormsModule } from '@angular/forms';

// Importaciones específicas de Angular Material
import { MatInputModule } from '@angular/material/input';
import { MatFormFieldModule } from '@angular/material/form-field';
import { MatButtonModule } from '@angular/material/button';
import { MatCardModule } from '@angular/material/card';
import { MatTableModule } from '@angular/material/table';
import { MatPaginatorModule } from '@angular/material/paginator';
import { MatIconModule } from '@angular/material/icon';

import { DatosGenAfilComponent } from '../pages/datos-gen-afil/datos-gen-afil.component';
import { VerDeduccionesComponent } from '../pages/ver-deducciones/ver-deducciones.component';
import { SubirDeduccionesComponent } from '../pages/subir-deducciones/subir-deducciones.component';
import { NuevaPlanillaComponent } from '../pages/nueva-planilla/nueva-planilla.component';
import { VerPlanillasComponent } from '../pages/ver-planillas/ver-planillas.component';
import { SubirDeduccionesformComponent } from '../pages/subir-deduccionesform/subir-deduccionesform.component';
/* import { CentroTrabajoPageComponent } from '../pages/centro-trabajo-page/centro-trabajo-page.component' */

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
    MatIconModule
    
  ],
  declarations: [
    SubirDeduccionesformComponent,
    VerDeduccionesComponent,
    SubirDeduccionesComponent,
    AfilBancoComponent,
    CentroTrabajoComponent,
    DatosGenAfilComponent,
    NuevaPlanillaComponent,
    VerPlanillasComponent
/*     CentroTrabajoPageComponent */
  ]
})
export class ThemeModule {
}
