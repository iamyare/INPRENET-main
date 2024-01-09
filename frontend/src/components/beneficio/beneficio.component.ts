import { ChangeDetectionStrategy, Component, Input, inject } from '@angular/core';
import { ControlContainer, FormBuilder, FormControl, FormGroup, Validators } from '@angular/forms';

export function generateBenefFormGroup(datos?:any): FormGroup {
  return new FormGroup({
    porcBenef: new FormControl(datos?.porcBenef, [Validators.required, Validators.pattern("([0-9]+([0-9])?)")])
  });
}

@Component({
  selector: 'app-beneficio',
  templateUrl: './beneficio.component.html',
  styleUrl: './beneficio.component.scss',
  changeDetection: ChangeDetectionStrategy.OnPush,
  viewProviders: [
    {
      provide: ControlContainer,
      useFactory: () =>
        inject(ControlContainer, { skipSelf: true, host: true }),
    },
  ]
})
export class BeneficioComponent {
  @Input() groupName = ""

  constructor(private fb: FormBuilder) {
  }
}
