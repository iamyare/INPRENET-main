import { ChangeDetectionStrategy, Component, EventEmitter, Input, Output, inject } from '@angular/core';
import { CommonModule } from '@angular/common';
import { ControlContainer, FormArray, FormBuilder, FormControl, FormGroup, Validators } from '@angular/forms';
import { DatosEstaticosService } from 'src/app/services/datos-estaticos.service';

export function generatePuestoTrabFormGroup(): FormGroup { 
  return new FormGroup({
    centroTrabajo: new FormControl('', [Validators.required]),
    cargo: new FormControl('', [Validators.required]),
    sectorEconomico: new FormControl('', [Validators.required]),
    actividadEconomica: new FormControl('', [Validators.required]),
    claseCliente: new FormControl('', [Validators.required]),
    sector: new FormControl('', [Validators.required]),
    numeroAcuerdo: new FormControl('', [Validators.required]),
    fechaIngreso: new FormControl('', [Validators.required]),
    colegioMagisterial: new FormControl('', [Validators.required]),
    numeroCarnet: new FormControl('', [Validators.required]),

    fechaInicio: new FormControl('', Validators.required),
    fechaFin: new FormControl('', Validators.required),
    salario: new FormControl('', Validators.required)
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
  public formParent: FormGroup = new FormGroup({});

  centrosTrabajo: any = this.datosEstaticos.centrosTrabajo;
  sector: any = this.datosEstaticos.sector;

  @Output() newDatDatosPuestTrab = new EventEmitter<any>()
  
  onDatosDatosPuestTrab(){
    const data = this.formParent
    this.newDatDatosPuestTrab.emit(data);
  }

  constructor( private fb: FormBuilder, private datosEstaticos: DatosEstaticosService) {}

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
        centroTrabajo: new FormControl('', [Validators.required]),
        cargo: new FormControl('', [Validators.required]),
        sectorEconomico: new FormControl('', [Validators.required]),
        actividadEconomica: new FormControl('', [Validators.required]),
        claseCliente: new FormControl('', [Validators.required]),
        sector: new FormControl('', [Validators.required]),
        numeroAcuerdo: new FormControl('', [Validators.required]),
        fechaIngreso: new FormControl('', [Validators.required]),
        colegioMagisterial: new FormControl('', [Validators.required]),
        numeroCarnet: new FormControl('', [Validators.required]),
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

}