import { Component, Input, OnInit } from '@angular/core';

@Component({
  selector: 'app-voluntario',
  templateUrl: './voluntario.component.html',
  styleUrls: ['./voluntario.component.scss']
})
export class VoluntarioComponent implements OnInit {
  @Input() datos: any;

  constructor() { }

  ngOnInit(): void {
    console.log('Datos recibidos en VoluntarioComponent:', this.datos);
  }
}
