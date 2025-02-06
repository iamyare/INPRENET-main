import { Component, Input, OnInit } from '@angular/core';

@Component({
  selector: 'app-pensionado',
  templateUrl: './pensionado.component.html',
  styleUrls: ['./pensionado.component.scss']
})
export class PensionadoComponent {
  @Input() persona: any = {};

  currentStepIndex = 0;

  constructor(){
  }

  steps = [
    { label: 'Fuentes De Ingreso', isActive: true },
    { label: 'Beneficiarios', isActive: true },
    { label: 'Colegios Magisteriales', isActive: true },
    { label: 'Referencias Personales', isActive: true },
    { label: 'Detalles de pagos', isActive: false },
    //{ label: 'Todos los pagos', isActive: false },
    //{ label: 'Constancias', isActive: true },
  ];

  onStepChange(index: number) {
    this.currentStepIndex = index;
  }
}
