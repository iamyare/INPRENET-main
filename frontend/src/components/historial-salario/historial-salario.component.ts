import { ChangeDetectionStrategy, Component, EventEmitter, Input, Output, inject } from '@angular/core';
import { ControlContainer, FormArray, FormBuilder, FormControl, FormGroup, Validators } from '@angular/forms';
import { DatosEstaticosService } from 'src/app/services/datos-estaticos.service';

export function generateHistSalFormGroup(datos?:any): FormGroup {
  return new FormGroup({
    nombre_banco: new FormControl(datos.nombre_banco, Validators.required),
    numero_cuenta: new FormControl(datos.numero_cuenta, Validators.required)
  });
}

@Component({
  selector: 'app-historial-salario',
  templateUrl: './historial-salario.component.html',
  styleUrl: './historial-salario.component.scss',
  changeDetection: ChangeDetectionStrategy.OnPush,
  viewProviders: [
    {
      provide: ControlContainer,
      useFactory: () =>
        inject(ControlContainer, { skipSelf: true, host: true }),
    },
  ],
})
export class HistorialSalarioComponent {
  public formParent: FormGroup = new FormGroup({});

  Bancos: any;

  @Output() newDatHistSal = new EventEmitter<any>()
  @Input() datos:any;

  onDatosHistSal(){
    const data = this.formParent
    this.newDatHistSal.emit(data);
  }

  constructor( private fb: FormBuilder, private datosEstaticos: DatosEstaticosService) {
    this.datosEstaticos.getBancos();
    this.Bancos = this.datosEstaticos.Bancos;
  }

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
    )
  }

  initFormRefPers(): FormGroup {
    return generateHistSalFormGroup();
  }

  agregarRefPer(datos?:any): void{
    const ref_RefPers = this.formParent.get('refpers') as FormArray;
    if (datos){
      ref_RefPers.push(generateHistSalFormGroup(datos))
    }else {
      ref_RefPers.push(generateHistSalFormGroup({}))
    }
  }
  
  eliminarRefPer():void{
    const ref_RefPers = this.formParent.get('refpers') as FormArray;
    ref_RefPers.removeAt(-1);
    const data = this.formParent
    this.newDatHistSal.emit(data);
  }
  
  getCtrl(key: string, form: FormGroup): any {
    return form.get(key)
  }

}
