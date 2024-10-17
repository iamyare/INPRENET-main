import { Component, Input, Output, EventEmitter } from '@angular/core';
import { FormGroup } from '@angular/forms';

@Component({
  selector: 'app-dynamic-steps',
  templateUrl: './dynamic-steps.component.html',
  styleUrls: ['./dynamic-steps.component.scss']
})
export class DynamicStepsComponent {
  @Input() steps: any[] = [];
  @Output() stepChange = new EventEmitter<number>();

  currentStep = 0;

  // Función para avanzar al siguiente paso
  nextStep() {
    if (this.isCurrentStepValid()) {
      this.currentStep++;
      this.stepChange.emit(this.currentStep);
    } else {
      alert('Por favor, completa los campos requeridos.');
    }
  }

  // Función para retroceder al paso anterior
  previousStep() {
    if (this.currentStep > 0) {
      this.currentStep--;
      this.stepChange.emit(this.currentStep);
    }
  }

  // Verifica si el formulario actual es válido
  isCurrentStepValid(): boolean {
    const currentFormGroup = this.steps[this.currentStep].formGroup as FormGroup;
    return currentFormGroup ? currentFormGroup.valid : true;
  }
}
