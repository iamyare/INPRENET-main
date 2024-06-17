import { Component,ChangeDetectionStrategy, Input } from '@angular/core';

@Component({
  selector: 'app-informacion-general',
  templateUrl: './informacion-general.component.html',
  styleUrls: ['./informacion-general.component.scss'],
  changeDetection: ChangeDetectionStrategy.OnPush
})
export class InformacionGeneralComponent {
  @Input() persona: any;
}
