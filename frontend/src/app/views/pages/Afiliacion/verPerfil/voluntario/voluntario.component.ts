import { Component, Input, OnInit } from '@angular/core';

@Component({
  selector: 'app-voluntario',
  templateUrl: './voluntario.component.html',
  styleUrls: ['./voluntario.component.scss']
})
export class VoluntarioComponent {
  @Input() detalle: any;
}
