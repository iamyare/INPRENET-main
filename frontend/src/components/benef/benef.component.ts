import { ChangeDetectionStrategy, Component, EventEmitter, Input, Output } from '@angular/core';
import { FormArray, FormBuilder, FormControl, FormGroup, Validators } from '@angular/forms';
import { generateAddressFormGroup } from '../dat-generales-afiliado/dat-generales-afiliado.component';
import { generateDatBancFormGroup } from '@docs-components/dat-banc/dat-banc.component';
import { generateFormArchivo } from '../botonarchivos/botonarchivos.component';

@Component({
  selector: 'app-benef',
  templateUrl: './benef.component.html',
  styleUrls: ['./benef.component.scss'],
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class BenefComponent {
  public formParent: FormGroup;
  public beneficio: FormGroup;

  DatosBancBen: any = []; 
  @Output() newDatBenChange = new EventEmitter<any>();
    
  constructor(private fb: FormBuilder) {
    this.beneficio = this.fb.group({
      porcBenef: new FormControl("", [Validators.required, Validators.pattern("([0-9]+([0-9])?)")])
    });

    this.formParent = this.fb.group({
      refpers: this.fb.array([]),
      benfGroup: generateAddressFormGroup(),
      DatosBac: generateDatBancFormGroup(),
      Archivos: generateFormArchivo(),
    });
  }

  ngOnInit(): void {
    this.initFormParent();
  }

  initFormParent(): void {
    this.formParent = this.fb.group({
      refpers: this.fb.array([]),
      benfGroup: generateAddressFormGroup(),
      DatosBac: generateDatBancFormGroup(),
      Archivos: generateFormArchivo(),
    });
  }
  
  initFormRefPers(): FormGroup {
    return this.fb.group({
      refpers: new FormControl(''),
      benfGroup: generateAddressFormGroup(),
      DatosBac: generateDatBancFormGroup(),
      porcBenef: this.beneficio,
      Archivos: generateFormArchivo()
    });
  }

  agregarBen(): void {
    const ref_RefPers = this.formParent.get('refpers') as FormArray;
    ref_RefPers.push(this.initFormRefPers());
  }

  eliminarRefPer(): void {
    const ref_RefPers = this.formParent.get('refpers') as FormArray;
    ref_RefPers.removeAt(-1);
  }

  getCtrl(key: string, form: FormGroup): any {
    return form.get(key);
  }

  setDatosBanc(datosBanc: any) {
    this.DatosBancBen = datosBanc;
  }

  handleArchivoSeleccionado(archivo: any) {
    /* console.log(archivo); */
    // Hacer algo con el archivo seleccionado, si es necesario
  }

  onDatosBenChange() {
    this.newDatBenChange.emit(this.formParent);
  }

  prueba(e: any, i: any) {
    this.formParent.value.refpers[i].benfGroup.fechaNacimiento = e;
  }
}