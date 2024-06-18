import { Component, Input, OnInit } from '@angular/core';

@Component({
  selector: 'app-informacion-general',
  templateUrl: './informacion-general.component.html',
  styleUrls: ['./informacion-general.component.scss']
})
export class InformacionGeneralComponent{
  @Input() persona: any;

  steps = [
    { label: 'Información General', isActive: true },
    { label: 'Otra Información', isActive: false }
  ];

  currentStepIndex = 0;
  onStepChange(index: number) {
    this.steps.forEach((step, i) => step.isActive = i === index);
    this.currentStepIndex = index;
  }
}
