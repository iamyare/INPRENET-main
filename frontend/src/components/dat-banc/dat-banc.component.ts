import { Component, EventEmitter, Input, Output } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormBuilder, FormGroup, Validators } from '@angular/forms';

@Component({
  selector: 'app-dat-banc',
  templateUrl: './dat-banc.component.html',
  styleUrl: './dat-banc.component.scss'
})
export class DatBancComponent {
  form2: FormGroup;
  
  @Input() nombreBanco?:string
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
      nombreBanco: ['', [Validators.required]],
      numeroCuenta: ['', [Validators.required]],
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
