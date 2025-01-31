import { Component, Input } from '@angular/core';

@Component({
  selector: 'app-afiliado',
  templateUrl: './afiliado.component.html',
  styleUrls: ['./afiliado.component.scss']
})
export class AfiliadoComponent {
  @Input() persona: any = {};

  currentStepIndex = 0;

  steps = [
    { label: 'Fuentes De Ingreso', isActive: true },
    { label: 'Beneficiarios', isActive: true },
    { label: 'Colegios Magisteriales', isActive: true },
    { label: 'Referencias Personales', isActive: true },
    { label: 'Detalles de pagos', isActive: false },
    { label: 'Todos los pagos', isActive: false },
    /* { label: 'Constancias', isActive: true }, */
  ];

  onStepChange(index: number) {
    this.currentStepIndex = index;
  }
}
