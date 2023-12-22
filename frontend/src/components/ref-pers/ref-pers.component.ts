import { Component, EventEmitter, Input, Output } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormArray, FormBuilder, FormControl, FormGroup, Validators } from '@angular/forms';

@Component({
  selector: 'app-ref-pers',
  templateUrl: './ref-pers.component.html',
  styleUrl: './ref-pers.component.scss'
})
export class RefPersComponent {
  public formParent: FormGroup = new FormGroup({});

  @Input() nombreComp?:string
  @Output() newDatRefPerChange = new EventEmitter<any>()
  
  onDatosRefPerChange(){
    const data = this.formParent
    this.newDatRefPerChange.emit(data);
  }

  constructor( private fb: FormBuilder) {
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
        nombreRefPers: new FormControl('', Validators.required),
        Parentesco: new FormControl('', Validators.required),
        direccion: new FormControl('', Validators.required),
        telefonoDom: new FormControl('' ),
        telefonoTrab: new FormControl(''),
        telefonoPers: new FormControl('', Validators.required)
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
