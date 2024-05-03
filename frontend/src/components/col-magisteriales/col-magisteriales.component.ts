import { ChangeDetectionStrategy, Component, EventEmitter, Input, OnInit, Output, inject } from '@angular/core';
import { ControlContainer, FormArray, FormBuilder, FormControl, FormGroup, Validators } from '@angular/forms';
import { DatosEstaticosService } from 'src/app/services/datos-estaticos.service';
import { FormStateService } from 'src/app/services/form-state.service';

export function generateColegMagistFormGroup(datos?:any): FormGroup {
  return new FormGroup({
    idColegio: new FormControl(datos.idColegio, Validators.required)
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
export class ColMagisterialesComponent implements OnInit{
  public formParent: FormGroup = new FormGroup({});
  colegio_magisterial: any = [];

  private formKey = 'colMagForm';

  @Input() nombreComp?:string
  @Input() datos?:any
  @Output() newDataColegioMagisterial = new EventEmitter<any>()

  onDatosColMagChange() {
    const data = this.formParent.value; // Emite el valor actual del formulario, no el FormGroup
    this.newDataColegioMagisterial.emit(data);
}

  constructor(private formStateService: FormStateService, private fb: FormBuilder, private datosEstaticosSVC: DatosEstaticosService) {
    this.datosEstaticosSVC.getColegiosMagisteriales();
    this.colegio_magisterial = this.datosEstaticosSVC.colegiosMagisteriales;
  }

  ngOnInit(): void {
    this.initForm();
  }


  ngOnDestroy() {
    this.formStateService.setForm(this.formKey, this.formParent);
  }

  private initForm() {
    let existingForm = this.formStateService.getForm(this.formKey);
    if (existingForm) {
      this.formParent = existingForm;
    } else {
      this.formParent = this.fb.group({
        ColMags: this.fb.array([])
      });
      this.formStateService.setForm(this.formKey, this.formParent);
    }
  }

agregarColMag(datos?: any): void {
  const col_ColMags = this.formParent.get('ColMags') as FormArray;
  if (datos) {
      col_ColMags.push(generateColegMagistFormGroup(datos));
      console.log("Form data on change:", this.formParent.value);

  } else {
      col_ColMags.push(generateColegMagistFormGroup({}));
  }
  this.onDatosColMagChange();  // Asegúrate de emitir los cambios cada vez que se modifica el formulario
}


  eliminarColMag():void{
    const col_ColMags = this.formParent.get('ColMags') as FormArray;
    col_ColMags.removeAt(-1);
    const data = this.formParent
    this.newDataColegioMagisterial.emit(data);
  }

  getCtrl(key: string, form: FormGroup): any {
    return form.get(key)
  }

  addValidation(index: number, key: string): void {
    const colParent = this.formParent.get('ColMags') as FormArray;
    const colSingle = colParent.at(index).get(key) as FormControl;
    colSingle.setValidators(Validators.required);
    colSingle.updateValueAndValidity();
  }

}
