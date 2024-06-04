import { ChangeDetectionStrategy, Component, EventEmitter, Input, Output } from '@angular/core';

@Component({
  selector: 'app-progressbar-dynamic',
  templateUrl: './progressbar-dynamic.component.html',
  styleUrl: './progressbar-dynamic.component.scss',
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class ProgressbarDynamicComponent {

  @Input() steps: { label: string, isActive: boolean }[] = [];
  @Output() stepChange = new EventEmitter<number>();

  activateStep(index: number) {
    this.steps.forEach((step, i) => step.isActive = i === index);
    this.stepChange.emit(index);
  }
}
