import { Component, Input, OnInit } from '@angular/core';

@Component({
  selector: 'app-beneficiario-constancias',
  templateUrl: './beneficiario-constancias.component.html',
  styleUrls: ['./beneficiario-constancias.component.scss']
})
export class BeneficiarioConstanciasComponent implements OnInit {
  @Input() datos: any;

  ngOnInit() {
    console.log(this.datos);
  }
}
