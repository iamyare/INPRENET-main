import { Component, Input, OnInit } from '@angular/core';

@Component({
  selector: 'app-beneficiario-beneficios-asignados',
  templateUrl: './beneficiario-beneficios-asignados.component.html',
  styleUrls: ['./beneficiario-beneficios-asignados.component.scss']
})
export class BeneficiarioBeneficiosAsignadosComponent implements OnInit {
  @Input() datos: any;

  ngOnInit() {
    console.log(this.datos);
  }
}
