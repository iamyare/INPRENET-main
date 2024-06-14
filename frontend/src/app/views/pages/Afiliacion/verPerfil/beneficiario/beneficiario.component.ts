import { Component, OnInit, Input } from '@angular/core';

@Component({
  selector: 'app-beneficiario',
  templateUrl: './beneficiario.component.html',
  styleUrls: ['./beneficiario.component.scss']
})
export class BeneficiarioComponent implements OnInit {
  @Input() datos: any;

  constructor() { }

  ngOnInit(): void {
    console.log(this.datos);

  }
}
