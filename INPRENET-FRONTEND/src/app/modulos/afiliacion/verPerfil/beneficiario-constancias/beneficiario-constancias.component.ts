import { Component, Input, OnInit } from '@angular/core';

@Component({
  selector: 'app-beneficiario-constancias',
  templateUrl: './beneficiario-constancias.component.html',
  styleUrls: ['./beneficiario-constancias.component.scss']
})
export class BeneficiarioConstanciasComponent implements OnInit {
  @Input() datos: any;

  menuItems = [
    { name: 'Constancia De Beneficios', action: this.constancia1Action.bind(this) },
    { name: 'Constancia 2', action: this.constancia2Action.bind(this) }
  ];

  ngOnInit() {
    //console.log(this.datos);
  }

  constancia1Action() {
    console.log('Constancia 1 action');
  }

  constancia2Action() {
    console.log('Constancia 2 action');
  }
}
