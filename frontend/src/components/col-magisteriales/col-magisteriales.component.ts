import { ChangeDetectionStrategy, Component, EventEmitter, Input, Output, inject } from '@angular/core';
import { ControlContainer, FormArray, FormBuilder, FormControl, FormGroup, Validators } from '@angular/forms';
export function generateColegMagistFormGroup(datos?:any): FormGroup {
  return new FormGroup({
    colegio_magisterial: new FormControl(datos.colegio_magisterial, Validators.required)
  });
}
@Component({
  selector: 'app-col-magisteriales',
  templateUrl: './col-magisteriales.component.html',
  styleUrl: './col-magisteriales.component.scss',
  changeDetection: ChangeDetectionStrategy.OnPush,
  viewProviders: [
    {
      provide: ControlContainer,
      useFactory: () =>
        inject(ControlContainer, { skipSelf: true, host: true }),
    },
  ],
})
export class ColMagisterialesComponent {
  public formParent: FormGroup = new FormGroup({});
  colegio_magisterial: any = [];
  @Input() nombreComp?:string
  @Input() datos?:any
  @Output() newDataColegioMagisterial = new EventEmitter<any>()
  
  onDatosRefPerChange(){
    const data = this.formParent
    this.newDataColegioMagisterial.emit(data)
  }

  constructor( private fb: FormBuilder) {
  }

  ngOnInit():void{
    this.initFormParent();
    if(this.datos){
      if (this.datos.value.refpers.length>0){
        for (let i of this.datos.value.refpers){
          this.agregarRefPer(i)
        }
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
    return generateColegMagistFormGroup()
  }

  agregarRefPer(datos?:any): void{
    const ref_RefPers = this.formParent.get('refpers') as FormArray;
    if (datos){
      ref_RefPers.push(generateColegMagistFormGroup(datos))
    }else {
      ref_RefPers.push(generateColegMagistFormGroup({}))
    }
  }
  
  eliminarRefPer():void{
    const ref_RefPers = this.formParent.get('refpers') as FormArray;
    ref_RefPers.removeAt(-1);
    const data = this.formParent
    this.newDataColegioMagisterial.emit(data);
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
  
}
