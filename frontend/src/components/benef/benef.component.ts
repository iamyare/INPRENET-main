import { ChangeDetectionStrategy, Component, EventEmitter, Input, Output } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormArray, FormBuilder, FormControl, FormGroup, Validators } from '@angular/forms';
import { generateAddressFormGroup } from '../dat-generales-afiliado/dat-generales-afiliado.component';
import { generateDatBancFormGroup } from '@docs-components/dat-banc/dat-banc.component';

@Component({
  selector: 'app-benef',
  templateUrl: './benef.component.html',
  styleUrl: './benef.component.scss',
  changeDetection:ChangeDetectionStrategy.OnPush,
})
export class BenefComponent {
  public formParent: FormGroup = new FormGroup({});
  
  Bancos: any = []; tipoIdent: any = []; Sexo: any = []; estadoCivil: any = [];
  htmlSTID: string = "Archivo de identificación"
  DatosBancBen:any = []; DatosGenBen:any  = [];

  public archivo: any;

  @Input() nombreComp?:string
  @Output() newDatBenChange = new EventEmitter<any>()

  onDatosBenChange(){
    const data = this.formParent.value.refpers
    this.newDatBenChange.emit(this.formParent.value.refpers);
  }

  setDatosBancBen(datosBanc:any){
    this.DatosBancBen = datosBanc;
  }
  setDatosBanc(datosBanc:any){
    this.DatosBancBen = datosBanc;
  }

  setDatosGenBen(datosGen:any){
    this.DatosGenBen = datosGen;
  }

  constructor( private fb: FormBuilder) {
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
    this.formParent = new FormGroup({
      refpers: new FormArray([], [Validators.required]),
      benfGroup: generateAddressFormGroup(),
      DatosBac: generateDatBancFormGroup(),
    });
  }

  ngOnInit():void{
    this.initFormParent();
  }

  initFormParent():void {
    this.formParent = new FormGroup(
      {
        refpers: new FormArray([], [Validators.required]),
      }
    )
  }

  initFormRefPers(): FormGroup {
    return new FormGroup(
      {
        refpers: new FormControl(''),
        benfGroup: generateAddressFormGroup(),
        DatosBac: generateDatBancFormGroup(),
      }
    )
  }
  agregarBen(): void{
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

}
