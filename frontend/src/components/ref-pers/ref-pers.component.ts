import { Component, EventEmitter, Input, Output } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormArray, FormBuilder, FormControl, FormGroup, Validators } from '@angular/forms';

export function generateRefPerFormGroup(datos?:any): FormGroup {
  return new FormGroup({
    nombreRefPers: new FormControl(datos.nombreRefPers, Validators.required),
    Parentesco: new FormControl(datos.Parentesco, Validators.required),
    direccion: new FormControl(datos.direccion, Validators.required),
    telefonoDom: new FormControl(datos.telefonoDom ),
    telefonoTrab: new FormControl(datos.telefonoTrab),
    telefonoPers: new FormControl(datos.telefonoPers, Validators.required)
  });
}

@Component({
  selector: 'app-ref-pers',
  templateUrl: './ref-pers.component.html',
  styleUrl: './ref-pers.component.scss'
})
export class RefPersComponent {
  public formParent: FormGroup = new FormGroup({});

  @Input() nombreComp?:string
  @Input() datos?:any
  @Output() newDatRefPerChange = new EventEmitter<any>()
  
  onDatosRefPerChange(){
    const data = this.formParent
    this.newDatRefPerChange.emit(data)
  }

  constructor( private fb: FormBuilder) {
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
    return generateRefPerFormGroup()
  }

  agregarRefPer(datos?:any): void{
    const ref_RefPers = this.formParent.get('refpers') as FormArray;
    if (datos){
      ref_RefPers.push(generateRefPerFormGroup(datos))
    }else {
      ref_RefPers.push(generateRefPerFormGroup({}))
    }
  }
  
  eliminarRefPer():void{
    const ref_RefPers = this.formParent.get('refpers') as FormArray;
    ref_RefPers.removeAt(-1);
    const data = this.formParent
    this.newDatRefPerChange.emit(data);
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
