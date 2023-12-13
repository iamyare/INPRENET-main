import { ChangeDetectionStrategy, Component, OnInit, inject } from '@angular/core';
import { ControlContainer, FormArray, FormBuilder, FormControl, FormGroup, Validators } from '@angular/forms';
import { generateDatBancFormGroup } from '@docs-components/dat-banc/dat-banc.component';
import { generateAddressFormGroup } from '@docs-components/dat-generales-afiliado/dat-generales-afiliado.component';
@Component({
  selector: 'app-afil-banco',
  templateUrl: './afil-banco.component.html',
  styleUrl: './afil-banco.component.scss',
  changeDetection:ChangeDetectionStrategy.OnPush,
})
export class AfilBancoComponent implements OnInit {
  public formParent: FormGroup = new FormGroup({});

  form = this.fb.group({
    DatosGenerales: generateAddressFormGroup(),
    DatosBacAfil: generateDatBancFormGroup(),
    benfGroup: generateAddressFormGroup(),
  });

  Bancos: any = []; tipoIdent: any = []; Sexo: any = []; estadoCivil: any = [];
  htmlSTID: string = "Archivo de identificación"

  public archivo: any;
  datosGen:any; datosPuestTrab:any; datosBanc:any;datosRefPer:any;
  DatosBancBen:any = []; DatosGenBen:any  = [];

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
  }

  setDatosGen(datosGen:any){
    this.datosGen = datosGen;
  }

  setDatosPuetTrab(datosPuestTrab:any){
    this.datosPuestTrab = datosPuestTrab;
  }

  setDatosBanc(datosBanc:any){
    this.datosBanc = datosBanc;
  }

  setDatosRefPer(datosRefPer:any){
    this.datosRefPer = datosRefPer;
  }

  setDatosBen(DatosBancBen:any){
    this.DatosBancBen = DatosBancBen;
  }

  ngOnInit():void{
  }

  enviar(){
    console.log(this.datosGen);
    console.log(this.datosPuestTrab);
    console.log(this.datosBanc);
    console.log(this.datosRefPer);
    
    console.log(this.DatosBancBen); 
  }

}