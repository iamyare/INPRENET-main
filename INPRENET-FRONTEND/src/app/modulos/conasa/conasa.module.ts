import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { VerAfiliadoComponent } from '../conasa/ver-afiliado/ver-afiliado.component'
import { ConasaMenuComponent } from '../conasa/conasa-menu/conasa-menu.component'
import { ConasaRoutingModule } from '../conasa/conasa-routing.module'
import { ReactiveFormsModule } from '@angular/forms';
import { MaterialAngularModule } from 'src/app/material-angular/material-angular.module';
import { ComponentsModule } from 'src/app/components/components.module';
import { IngresarAsistenciaComponent } from '../conasa/ingresar-asistencia/ingresar-asistencia.component';
import { ReporteAsistenciasComponent } from '../conasa/reporte-asistencias/reporte-asistencias.component';
import { AnularAsistenciasComponent } from '../conasa/anular-asistencias/anular-asistencias.component';
import { ModificarAsistenciasComponent } from '../conasa/modificar-asistencias/modificar-asistencias.component';
import { CancelarAsistenciasComponent } from '../conasa/cancelar-asistencias/cancelar-asistencias.component';
import { AgregarBeneficiariosComponent } from '../conasa/agregar-beneficiarios/agregar-beneficiarios.component';
import { VerContratosComponent } from '../conasa/ver-contratos/ver-contratos.component';


@NgModule({
  declarations: [
    VerAfiliadoComponent,
    ConasaMenuComponent,
    IngresarAsistenciaComponent,
    ReporteAsistenciasComponent,
    AnularAsistenciasComponent,
    ModificarAsistenciasComponent,
    CancelarAsistenciasComponent,
    AgregarBeneficiariosComponent,
    VerContratosComponent
  ],
  imports: [
    CommonModule,
    ConasaRoutingModule,
    ReactiveFormsModule,
    MaterialAngularModule,
    ComponentsModule,
  ]
})
export class ConasaModule { }
