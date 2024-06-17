import { Component, Input, OnInit } from '@angular/core';

@Component({
  selector: 'app-jubilado',
  templateUrl: './jubilado.component.html',
  styleUrls: ['./jubilado.component.scss']
})
export class JubiladoComponent{
  @Input() detalle: any;
}
