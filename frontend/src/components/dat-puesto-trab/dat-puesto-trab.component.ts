import { ChangeDetectionStrategy, Component, EventEmitter, Input, Output, inject } from '@angular/core';
import { CommonModule } from '@angular/common';
import { ControlContainer, FormArray, FormBuilder, FormControl, FormGroup, Validators } from '@angular/forms';
import { DatosEstaticosService } from 'src/app/services/datos-estaticos.service';

export function generatePuestoTrabFormGroup(datos?:any): FormGroup {
  return new FormGroup({
    centroTrabajo: new FormControl(datos.centroTrabajo, [Validators.required]),
    actividadEconomica: new FormControl(datos.actividadEconomica, [Validators.required]), /* ACTIVIDAD ECONOMICA -> cargo que desempeña */
    salario: new FormControl(datos.salario, [Validators.required]),
    numeroAcuerdo: new FormControl(datos.numeroAcuerdo, [Validators.required]),
    fechaIngreso: new FormControl(datos.fechaIngreso, [Validators.required]),
    fechaEgreso: new FormControl(datos.fechaEgreso, Validators.required),

    /* CLASE CLIENTE -> ESTADO */
    claseCliente: new FormControl(datos.claseCliente, [Validators.required]),
    /* SECTOR ECONOMICO-> PUBLICO, PRIVADO, PROHECO, PEDAGIGICO, JUBILADO */
    sectorEconomico: new FormControl(datos.sectorEconomico, [Validators.required]),
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
  @Input() datos:any;
  
  onDatosDatosPuestTrab(){
    const data = this.formParent
    this.newDatDatosPuestTrab.emit(data);
  }

  constructor( private fb: FormBuilder, private datosEstaticos: DatosEstaticosService) {}

  ngOnInit():void{
    this.initFormParent();
    
    if (this.datos.value.refpers.length>0){
      for (let i of this.datos.value.refpers){
        this.agregarRefPer(i)
      }
    }
  }

  initFormParent():void {
    this.formParent = new FormGroup(
      {
        refpers: new FormArray([], [Validators.required])
      }
    );
  }

  agregarRefPer(datos?:any): void{
    const ref_RefPers = this.formParent.get('refpers') as FormArray;
    if (datos){
      ref_RefPers.push(generatePuestoTrabFormGroup(datos))
    }else {
      ref_RefPers.push(generatePuestoTrabFormGroup({}))
    }
  }
  
  eliminarRefPer():void{
    const ref_RefPers = this.formParent.get('refpers') as FormArray;
    ref_RefPers.removeAt(-1);
    const data = this.formParent
    this.newDatDatosPuestTrab.emit(data);
  }
  
  getCtrl(key: string, form: FormGroup): any {
    return form.get(key)
  }

}