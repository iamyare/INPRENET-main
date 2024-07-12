import { ChangeDetectionStrategy, Component, EventEmitter, Input, OnInit, Output, inject } from '@angular/core';
import { ControlContainer, FormBuilder, FormControl, FormGroup, Validators } from '@angular/forms';

import { BancosService } from 'src/app/services/bancos.service';
import { DatosEstaticosService } from 'src/app/services/datos-estaticos.service';
export function generateDatBancFormGroup(datos?: any): FormGroup {
  return new FormGroup({
    id_banco: new FormControl(datos?.id_banco, Validators.required),
    num_cuenta: new FormControl(datos?.num_cuenta, Validators.required)
  });
}

@Component({
  selector: 'app-dat-banc',
  templateUrl: './dat-banc.component.html',
  styleUrl: './dat-banc.component.scss',
  changeDetection: ChangeDetectionStrategy.OnPush,
  viewProviders: [
    {
      provide: ControlContainer,
      useFactory: () =>
        inject(ControlContainer, { skipSelf: true, host: true }),
    },
  ]
})
export class DatBancComponent implements OnInit {
  @Input() groupName = '';
  Bancos: any = this.datosEstaticos.Bancos;

  constructor(private fb: FormBuilder, private datosEstaticos: DatosEstaticosService) {
    /* this.bancosService.getAllBancos().subscribe((res: any) => {
      this.Bancos = res.bancos
    }); */
  }
  ngOnInit(): void {

  }


}
