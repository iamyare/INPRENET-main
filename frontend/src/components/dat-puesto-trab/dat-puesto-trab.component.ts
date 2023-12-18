import { ChangeDetectionStrategy, Component, EventEmitter, Input, Output, inject } from '@angular/core';
import { CommonModule } from '@angular/common';
import { ControlContainer, FormArray, FormBuilder, FormControl, FormGroup, Validators } from '@angular/forms';

export function generatePuestoTrabFormGroup(): FormGroup { 
  return new FormGroup({
     centroTrabajo: new FormControl('', [Validators.required]),
     cargo: new FormControl('', [Validators.required]),
     sectorEconomico: new FormControl('', [Validators.required]),
     actividadEconomica: new FormControl('', [Validators.required]),
     claseCliente: new FormControl('', [Validators.required]),
     sector: new FormControl('', [Validators.required]),
     numeroAcuerdo: new FormControl('', [Validators.required]),
     salarioNeto: new FormControl('', [Validators.required, Validators.pattern("\^[0-9]{1,8}([\\.][0-9]{2})?")]),
     fechaIngreso: new FormControl('', [Validators.required]),
     fechaPago: new FormControl('', [Validators.required]),
     colegioMagisterial: new FormControl('', [Validators.required]),
     numeroCarnet: new FormControl('', [Validators.required]),
  });
}

@Component({
  selector: 'app-dat-puesto-trab',
  templateUrl: './dat-puesto-trab.component.html',
  styleUrl: './dat-puesto-trab.component.scss',
  changeDetection: ChangeDetectionStrategy.OnPush,
  viewProviders: [
    {
      provide: ControlContainer,
      useFactory: () =>
        inject(ControlContainer, { skipSelf: true, host: true }),
    },
  ],
})
export class DatPuestoTrabComponent {
  form1: FormGroup;
  datosGen:any;
  sector: any = [];
  @Input() groupName = '';
  @Input() centroTrabajo?:string
  
  centrosTrabajo: any = [];
  constructor( private fb: FormBuilder) {
    this.centrosTrabajo = [
      {
        "idCentroTrabajo":1,
        "value": "Central Vicente Caceres"
      },
      {
        "idCentroTrabajo":2,
        "value": "IHCI"
      },
      {
        "idCentroTrabajo":3,
        "value": "UNAH"
      }
    ];
    this.form1 = this.fb.group({
     centroTrabajo: new FormControl('', [Validators.required]),
     cargo: new FormControl('', [Validators.required]),
     sectorEconomico: new FormControl('', [Validators.required]),
     actividadEconomica: new FormControl('', [Validators.required]),
     claseCliente: new FormControl('', [Validators.required]),
     sector: new FormControl('', [Validators.required]),
     numeroAcuerdo: new FormControl('', [Validators.required]),
     salarioNeto: new FormControl('', [Validators.required, Validators.pattern("\^[0-9]{1,8}([\\.][0-9]{2})?")]),
     fechaIngreso: new FormControl('', [Validators.required]),
     fechaPago: new FormControl('', [Validators.required]),
     colegioMagisterial: new FormControl('', [Validators.required]),
     numeroCarnet: new FormControl('', [Validators.required]),
    });
    this.sector = [
      {
        "idsector":1,
        "value": "JUBILADO"
      },
      {
        "idsector":2,
        "value": "PEDAGOGICO"
      },
      {
        "idsector":3,
        "value": "PRIVADO"
      },
      {
        "idsector":4,
        "value": "PROHECO"
      },
      {
        "idsector":5,
        "value": "PUBLICO"
      }
    ];
    
  }

  ngOnInit():void{
  }


}
