import { Component, OnInit } from '@angular/core';
import { FormArray, FormBuilder, FormControl, FormGroup, Validators } from '@angular/forms';

@Component({
  selector: 'app-afil-banco',
  templateUrl: './afil-banco.component.html',
  styleUrl: './afil-banco.component.scss'
})
export class AfilBancoComponent implements OnInit {
  form1: FormGroup; form2: FormGroup; form3: FormGroup;
  public formParent: FormGroup = new FormGroup({});

  Bancos: any = []; tipoIdent: any = []; Sexo: any = []; estadoCivil: any = [];
  htmlSTID: string = "Archivo de identificación"
  public archivo: any;
  datosGen:any;
  constructor( private fb: FormBuilder) {
    this.form1 = this.fb.group({
     centroTrabajo: ['', [Validators.required]],
     cargo: ['', [Validators.required]],
     sectorEconomico: ['', [Validators.required]],
     actividadEconomica: ['', [Validators.required]],
     claseCliente: ['', [Validators.required]],
     sector: ['', [Validators.required]],
     numeroAcuerdo: ['', [Validators.required]],
     salarioNeto: ['', [Validators.required, Validators.pattern("\^[0-9]{1,8}([\\.][0-9]{2})")]],
     fechaIngreso: ['', [Validators.required]],
     fechaPago: ['', [Validators.required]]
    });

    this.form2 = this.fb.group({
      nombreBanco: ['', [Validators.required]],
      numeroCuenta: ['', [Validators.required]],
    });

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

  getParams(datosGen:any){
    this.datosGen = datosGen;
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

  addSkill(): void{
    const ref_RefPers = this.formParent.get('refpers') as FormArray;
    ref_RefPers.push(this.initFormRefPers())
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

  enviar(){
    console.log(this.datosGen);
    
    const centroTrabajo = this.form1.value.centroTrabajo;
    const cargo = this.form1.value.cargo;
    const sectorEconomico = this.form1.value.sectorEconomico;
    const actividadEconomica = this.form1.value.actividadEconomica;
    const claseCliente = this.form1.value.claseCliente;
    const sector = this.form1.value.sector;
    const numeroAcuerdo = this.form1.value.numeroAcuerdo;
    const salarioNeto = this.form1.value.salarioNeto;
    const fechaIngreso = this.form1.value.fechaIngreso;
    const fechaPago = this.form1.value.fechaPago;

    const nombreBanco = this.form2.value.nombreBanco;
    const numeroCuenta = this.form2.value.numeroCuenta;

    //this.cargo = tipoIdentta;
    
    /* this.authSvc.crearCuenta(data).subscribe((res: any) => {
      console.log(res);
      //this.fakeLoading(res);
    }); */
  }

}