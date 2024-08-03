import { Component } from '@angular/core';

@Component({
  selector: 'app-proceso-planilla',
  templateUrl: './proceso-planilla.component.html',
  styleUrls: ['./proceso-planilla.component.scss']
})
export class ProcesoPlanillaComponent {
  currentStep: number = 0;
  title: string = 'Proceso de Planilla';
  steps = [
    { label: 'Nueva Planilla', isActive: true },
    { label: 'Cargar Beneficios/Deducciones', isActive: false },
    { label: 'Ver Planilla Preliminar', isActive: false },
    { label: 'Ver Planilla Cerrada', isActive: false }
  ];

  onStepChange(stepIndex: number) {
    this.currentStep = stepIndex;
  }
}
