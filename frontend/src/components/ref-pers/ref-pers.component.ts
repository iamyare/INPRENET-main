import { Component, EventEmitter, Input, Output } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormArray, FormBuilder, FormControl, FormGroup, Validators } from '@angular/forms';

@Component({
  selector: 'app-ref-pers',
  templateUrl: './ref-pers.component.html',
  styleUrl: './ref-pers.component.scss'
})
export class RefPersComponent {
  form3: FormGroup;
  public formParent: FormGroup = new FormGroup({});

  Bancos: any = []; tipoIdent: any = []; Sexo: any = []; estadoCivil: any = [];
  htmlSTID: string = "Archivo de identificación"
  public archivo: any;

  @Input() nombreComp?:string
  @Output() newDatRefPerChange = new EventEmitter<any>()
  
  onDatosRefPerChange(){
    const data = this.formParent.value.refpers
    this.newDatRefPerChange.emit(this.formParent.value.refpers);
  }

  constructor( private fb: FormBuilder) {
    this.form3 = this.fb.group({
      cantReferPers: ['', [Validators.required, Validators.pattern("[0-9]*")]],
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
    this.estadoCivil = [
      {
        "idEstadoCivil":1,
        "value": "Casado/a"
      },
      {
        "idEstadoCivil":2,
        "value": "Divorciado/a"
      },
      {
        "idEstadoCivil":3,
        "value": "Separado/a"
      },
      {
        "idEstadoCivil":4,
        "value": "Soltero/a"
      },
      {
        "idEstadoCivil":5,
        "value": "Union Libre"
      },
      {
        "idEstadoCivil":6,
        "value": "Viudo/a"
      }
    ];
    this.Sexo = [
      {
        "idBanco":1,
        "value": "M"
      },
      {
        "idBanco":2,
        "value": "F"
      }
    ];
    this.tipoIdent = [
      {
        "idIdentificacion":1,
        "value": "DNI"
      },
      {
        "idIdentificacion":2,
        "value": "PASAPORTE"
      },
      {
        "idIdentificacion":3,
        "value": "CARNET RESIDENCIA"
      },
      {
        "idIdentificacion":4,
        "value": "NÚMERO LICENCIA"
      },
      {
        "idIdentificacion":5,
        "value": "RTN"
      },
    ];
  }

  ngOnInit():void{
    this.initFormParent();
  }
  initFormParent():void {
    this.formParent = new FormGroup(
      {
        refpers: new FormArray([], [Validators.required])
      }
    )
  }

  initFormRefPers(): FormGroup {
    return new FormGroup(
      {
        nombreRefPers: new FormControl(''),
        Parentesco: new FormControl(''),
        direccion: new FormControl(''),
        telefonoDom: new FormControl(''),
        telefonoTrab: new FormControl(''),
        telefonoPers: new FormControl('')
      }
    )
  }

  agregarRefPer(): void{
    const ref_RefPers = this.formParent.get('refpers') as FormArray;
    ref_RefPers.push(this.initFormRefPers())
  }
  
  eliminarRefPer():void{
    const ref_RefPers = this.formParent.get('refpers') as FormArray;
    ref_RefPers.removeAt(-1);
  }
  
  getCtrl(key: string, form: FormGroup): any {
    return form.get(key)
  }

  addValidation(index: number, key: string): void {

    const refParent = this.formParent.get('refpers') as FormArray;
    const refSingle = refParent.at(index).get(key) as FormGroup;

    refSingle.setValidators(
      [
        Validators.required,
        Validators.required,
        Validators.required,
        Validators.required,
        Validators.required,
        Validators.required
      ]
    )
    refSingle.updateValueAndValidity();
  }

  agregarBeneficiario(): void{
    const ref_RefPers = this.formParent.get('refpers') as FormArray;
    ref_RefPers.push(this.initFormRefPers())
  }

}
