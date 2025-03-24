import { Component, Input, OnInit } from '@angular/core';

@Component({
  selector: 'app-causante-detalle',
  templateUrl: './causante-detalle.component.html',
  styleUrls: ['./causante-detalle.component.scss']
})
export class CausanteDetalleComponent implements OnInit {
  @Input() causante: any;

  constructor() {}

  ngOnInit(): void {

  }
}
