import { Component, Input } from '@angular/core';

@Component({
  selector: 'app-asignacion-deducciones',
  templateUrl: './asignacion-deducciones.component.html',
  styleUrls: ['./asignacion-deducciones.component.scss']
})
export class AsignacionDeduccionesComponent {
  @Input() id_planilla: any;
  @Input() idTipoPlanilla: any;

  mostrarFormularioIndividual: boolean = false;
}
