import { Component, Input, OnInit } from '@angular/core';

@Component({
  selector: 'app-jubilado',
  templateUrl: './jubilado.component.html',
  styleUrls: ['./jubilado.component.scss']
})
export class JubiladoComponent implements OnInit {
  @Input() datos: any;

  constructor() { }

  ngOnInit(): void {
    console.log('Datos recibidos en JubiladoComponent:', this.datos);
  }
}
