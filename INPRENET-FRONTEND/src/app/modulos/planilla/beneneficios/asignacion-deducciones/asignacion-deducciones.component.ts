import { Component, Input, OnInit } from '@angular/core';

@Component({
  selector: 'app-asignacion-deducciones',
  templateUrl: './asignacion-deducciones.component.html',
  styleUrls: ['./asignacion-deducciones.component.scss']
})
export class AsignacionDeduccionesComponent implements OnInit {
  @Input() tipoDeduccion: any;
  @Input() id_planilla: any;
  @Input() idTipoPlanilla: any;
  @Input() tipo_planilla: any;

  mostrarFormularioIndividual: boolean = false;

  ngOnInit() { }

}
