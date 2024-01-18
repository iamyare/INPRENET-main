import { ChangeDetectionStrategy, Component, EventEmitter, Input, Output, inject } from '@angular/core';
import { ControlContainer, FormArray, FormBuilder, FormControl, FormGroup, Validators } from '@angular/forms';


export function generatePlanillaFormGroup(datos?:any): FormGroup {
  return new FormGroup({
    cod_Planilla: new FormControl(datos?.cod_Planilla, [Validators.required, Validators.pattern("([0-9]+([0-9])?)")]),
    tipo_planilla: new FormControl(datos?.tipo_planilla, [Validators.required, Validators.pattern("([0-9]+([0-9])?)")]),
    fecha: new FormControl(datos?.fecha, [Validators.required, Validators.pattern("([0-9]+([0-9])?)")]),
    secuencia: new FormControl(datos?.secuencia, [Validators.required, Validators.pattern("([0-9]+([0-9])?)")]),
  });
}

@Component({
  selector: 'app-nuevaplanilla',
  templateUrl: './nuevaplanilla.component.html',
  styleUrl: './nuevaplanilla.component.scss',
  changeDetection: ChangeDetectionStrategy.OnPush,
  viewProviders: [
    {
      provide: ControlContainer,
      useFactory: () =>
        inject(ControlContainer, { skipSelf: true, host: true }),
    },]
})
export class NuevaplanillaComponent {
  @Input() groupName = ""

  constructor(private fb: FormBuilder) {}

  EnviarPlanilla(datos?:any): void {}
}