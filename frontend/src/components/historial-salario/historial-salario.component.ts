import { ChangeDetectionStrategy, Component, EventEmitter, Input, Output, inject } from '@angular/core';
import { ControlContainer, FormArray, FormBuilder, FormControl, FormGroup, Validators } from '@angular/forms';
import { DatosEstaticosService } from 'src/app/services/datos-estaticos.service';

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

  centrosTrabajo: any = this.datosEstaticos.centrosTrabajo;
  sector: any = this.datosEstaticos.sector;

  @Output() newDatHistSal = new EventEmitter<any>()
  
  onDatosHistSal(){
    const data = this.formParent
    this.newDatHistSal.emit(data);
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
        fechaInicio: new FormControl('', Validators.required),
        fechaFin: new FormControl('', Validators.required),
        salario: new FormControl('', Validators.required),
        centroTrabajo: new FormControl('', Validators.required),
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
