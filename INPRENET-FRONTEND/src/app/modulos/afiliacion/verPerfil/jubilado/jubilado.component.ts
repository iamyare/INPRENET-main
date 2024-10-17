import { Component, Input } from '@angular/core';

@Component({
  selector: 'app-jubilado',
  templateUrl: './jubilado.component.html',
  styleUrls: ['./jubilado.component.scss']
})
export class JubiladoComponent{
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
