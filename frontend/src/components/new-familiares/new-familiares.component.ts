import { ChangeDetectionStrategy, Component, EventEmitter, Input, Output } from '@angular/core';
import { FormArray, FormBuilder, FormControl, FormGroup, Validators } from '@angular/forms';
import { generateAddressFormGroup } from '@docs-components/dat-generales-afiliado/dat-generales-afiliado.component';
import { FormStateService } from 'src/app/services/form-state.service';

@Component({
  selector: 'app-new-familiares',
  templateUrl: './new-familiares.component.html',
  styleUrl: './new-familiares.component.scss',
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class NewFamiliaresComponent {
  private formKey = 'FormFamiliar';
  public formParent: FormGroup;

  @Input() datos:any
  @Output() newDatosFamiliares = new EventEmitter<any>()
  parentesco = [
    {value: "ABUELA MATERNA", label: "Abuela Materna"},
    {value: "ABUELA PATERNA", label: "Abuela Paterna"},
    {value: "ABUELO MATERNO", label: "Abuelo Materno"},
    {value: "ABUELO PATERNO", label: "Abuelo Paterno"},
    {value: "CUÑADA", label: "Cuñada"},
    {value: "CUÑADO", label: "Cuñado"},
    {value: "ESPOSA", label: "Esposa"},
    {value: "ESPOSO", label: "Esposo"},
    {value: "HERMANA", label: "Hermana"},
    {value: "HERMANO", label: "Hermano"},
    {value: "HIJA", label: "Hija"},
    {value: "HIJO", label: "Hijo"},
    {value: "MADRE", label: "Madre"},
    {value: "NIETA", label: "Nieta"},
    {value: "NIETO", label: "Nieto"},
    {value: "NUERA", label: "Nuera"},
    {value: "PADRE", label: "Padre"},
    {value: "PRIMA", label: "Prima"},
    {value: "PRIMO", label: "Primo"},
    {value: "SOBRINA", label: "Sobrina"},
    {value: "SOBRINO", label: "Sobrino"},
    {value: "SUEGRA", label: "Suegra"},
    {value: "SUEGRO", label: "Suegro"},
    {value: "TÍA MATERNA", label: "Tía Materna"},
    {value: "TÍA PATERNA", label: "Tía Paterna"},
    {value: "TÍO MATERNO", label: "Tío Materno"},
    {value: "TÍO PATERNO", label: "Tío Paterno"},
    {value: "YERNO", label: "Yerno"}
  ]

  onDatosBenChange() {
    this.newDatosFamiliares.emit(this.formParent);
  }

  constructor(private formStateService: FormStateService, private fb: FormBuilder,) {
    this.formParent = this.fb.group({
      familiar: this.fb.array([]),
    });
  }

  ngOnInit(): void {
    this.initForm();
    const familiarArray = this.formParent.get('familiar') as FormArray;
    if (this.datos && this.datos.value && this.datos.value.familiar && this.datos.value.familiar.length > 0 && familiarArray.length === 0) {
      for (let i of this.datos.value.familiar) {
        this.agregarBen(i);
      }
    }
  }

  private initForm() {
    let existingForm = this.formStateService.getForm(this.formKey);
    if (existingForm) {
      this.formParent = existingForm;
    } else {
      this.formParent = this.fb.group({
        familiar: this.fb.array([])
      });
      this.formStateService.setForm(this.formKey, this.formParent);
    }
  }

  initFormFamiliar(datosFamiliar?:any, DatosBac?:any, Archivos?:File, labelArch?:any, porcentaje?:any): FormGroup {
    return this.fb.group({
      familiar: new FormControl(''),
      datosFamiliar: generateAddressFormGroup(datosFamiliar),
      id_parentesco: new FormControl("", Validators.required)
    });
  }

  agregarBen(datos?: any): void {
    const familiar = this.formParent.get('familiar') as FormArray;
    if (datos) {
      /* familiar.push(this.initFormFamiliar(datos.benfGroup)); */
    } else {
      familiar.push(this.initFormFamiliar());
    }
  }

  eliminarRefPer(): void {
    const asig_Familiar = this.formParent.get('familiar') as FormArray
    asig_Familiar.removeAt(-1)
    const data = this.formParent
    this.newDatosFamiliares.emit(data)
  }

  getCtrl(key: string, form: FormGroup): any {
    return form.get(key)
  }

  getLabel(key:string,form:FormGroup, indice:any):String{
    return form.get(key)?.value[indice]?.Arch?.name
  }


  prueba(e: any, i: any) {
    this.formParent.value.familiar[i].benfGroup.fechaNacimiento = e
  }
}
