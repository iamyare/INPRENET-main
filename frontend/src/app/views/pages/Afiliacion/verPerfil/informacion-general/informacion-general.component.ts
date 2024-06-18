import { ChangeDetectionStrategy, Component, Input, OnInit, inject } from '@angular/core';
import { ControlContainer } from '@angular/forms';

@Component({
  selector: 'app-informacion-general',
  templateUrl: './informacion-general.component.html',
  styleUrls: ['./informacion-general.component.scss']
})
export class InformacionGeneralComponent {
  @Input() persona: any;

  steps = [
    { label: 'Información General', isActive: true },
    { label: 'Datos Bancarios', isActive: false }
  ];

  currentStepIndex = 0;
  onStepChange(index: number) {
    this.steps.forEach((step, i) => step.isActive = i === index);
    this.currentStepIndex = index;
  }
}
