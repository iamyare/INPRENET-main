import { Component, Input, OnInit } from '@angular/core';

@Component({
  selector: 'app-pensionado',
  templateUrl: './pensionado.component.html',
  styleUrls: ['./pensionado.component.scss']
})
export class PensionadoComponent {
  @Input() persona: any = {};

  currentStepIndex = 0;

  steps = [
    { label: 'Fuentes De Ingreso', isActive: true },
    { label: 'Beneficiarios', isActive: true },
    { label: 'Colegios Magisteriales', isActive: true },
    { label: 'Referencias Personales', isActive: true },
    { label: 'Constancias', isActive: true },
  ];

  onStepChange(index: number) {
    this.currentStepIndex = index;
  }
}
