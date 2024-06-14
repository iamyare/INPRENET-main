import { Component, Input, OnInit } from '@angular/core';

@Component({
  selector: 'app-pensionado',
  templateUrl: './pensionado.component.html',
  styleUrls: ['./pensionado.component.scss']
})
export class PensionadoComponent implements OnInit {
  @Input() datos: any;

  constructor() { }

  ngOnInit(): void {
    console.log('Datos recibidos en PensionadoComponent:', this.datos);
  }
}
