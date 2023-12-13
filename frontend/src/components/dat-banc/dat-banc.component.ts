import { ChangeDetectionStrategy, Component, EventEmitter, Input, Output, inject } from '@angular/core';
import { CommonModule } from '@angular/common';
import { ControlContainer, FormBuilder, FormControl, FormGroup, Validators } from '@angular/forms';

export function generateDatBancFormGroup(): FormGroup {
  return new FormGroup({
    nombreBanco: new FormControl('', Validators.required),
    numeroCuenta: new FormControl('', Validators.required)
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
export class DatBancComponent {
  form2: FormGroup;
  
  @Input() groupName = '';
  @Output() newDatBancChange = new EventEmitter<any>()
  
  onDatosBancChange():void{
    const nombreBanco = this.form2.value.nombreBanco;
    const numeroCuenta = this.form2.value.numeroCuenta;
  
    const data = {
      nombreBanco: nombreBanco,
      numeroCuenta: numeroCuenta,
    }
    this.newDatBancChange.emit(data);
  }

  Bancos: any = [];
  htmlSTID: string = "Archivo de identificación"
  public archivo: any;

  constructor( private fb: FormBuilder) {
    this.form2 = this.fb.group({
      nombreBanco: new FormControl('', Validators.required),
      numeroCuenta: new FormControl('', Validators.required),
    });

    this.Bancos = [
      {
        "idBanco":1,
        "value": "Atlántida"
      },
      {
        "idBanco":2,
        "value": "BAC"
      },
      {
        "idBanco":3,
        "value": "Ficohosa"
      }
    ];

  }

}
