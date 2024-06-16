import { Component, Input, OnInit } from '@angular/core';

@Component({
  selector: 'app-pensionado',
  templateUrl: './pensionado.component.html',
  styleUrls: ['./pensionado.component.scss']
})
export class PensionadoComponent {
  @Input() detalle: any;
}
