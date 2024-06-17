import { Component, Input, OnInit } from '@angular/core';

@Component({
  selector: 'app-afiliado',
  templateUrl: './afiliado.component.html',
  styleUrls: ['./afiliado.component.scss']
})
export class AfiliadoComponent implements OnInit{
  @Input() detalle: any;

  ngOnInit(): void {
    console.log('ngOnInit: AfiliadoComponent informacionCompleta:', this.detalle);
  }
}
