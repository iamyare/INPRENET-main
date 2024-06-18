import { Component, Input, OnInit } from '@angular/core';

@Component({
  selector: 'app-afiliado',
  templateUrl: './afiliado.component.html',
  styleUrls: ['./afiliado.component.scss']
})
export class AfiliadoComponent {
  @Input() persona: any = {};

  currentStepIndex = 0;

  steps = [
    { label: 'Constancias', isActive: true },
  ];
  onStepChange(index: number) {
    this.currentStepIndex = index;
  }
}
