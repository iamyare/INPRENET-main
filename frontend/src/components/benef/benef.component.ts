import { ChangeDetectionStrategy, Component, EventEmitter, Input, Output } from '@angular/core';
import { FormArray, FormBuilder, FormControl, FormGroup, Validators } from '@angular/forms';
import { generateAddressFormGroup } from '../dat-generales-afiliado/dat-generales-afiliado.component';
import { generateDatBancFormGroup } from '@docs-components/dat-banc/dat-banc.component';
import { generateFormArchivo } from '../botonarchivos/botonarchivos.component';

import { generateBenefFormGroup } from '@docs-components/beneficio/beneficio.component';

@Component({
  selector: 'app-benef',
  templateUrl: './benef.component.html',
  styleUrls: ['./benef.component.scss'],
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class BenefComponent {
  public formParent: FormGroup;
  archIdent: any;
  labelbutton = "Archivo de identificación (beneficiario)"
  DatosBancBen: any = []; 
  @Input() datos:any
  @Output() newDatBenChange = new EventEmitter<any>()
  
  onDatosBenChange() {
    this.newDatBenChange.emit(this.formParent);
  }
  
  constructor(private fb: FormBuilder) {
    this.formParent = this.fb.group({
      refpers: this.fb.array([]),
    });
  }

  ngOnInit(): void {
    this.initFormParent();
    if (this.datos.value.refpers.length > 0){
      for (let i of this.datos.value.refpers){
        this.agregarBen(i)
      }
    }
  }

  initFormParent(): void {
    this.formParent = this.fb.group({
      refpers: this.fb.array([]),
    });
  }
  
  initFormRefPers(benfGroup?:any, DatosBac?:any, Archivos?:File, labelArch?:any, porcBenef?:any): FormGroup {
    
    const a:any = this.fb.group({
      refpers: new FormControl(''),
      benfGroup: generateAddressFormGroup(benfGroup),
      DatosBac: generateDatBancFormGroup(DatosBac),
      porcBenef: generateBenefFormGroup(porcBenef),
      Archivos: generateFormArchivo(labelArch),
      Arch: Archivos,
    });
    return a
  }

  agregarBen(datos?:any): void {
    const ref_RefPers = this.formParent.get('refpers') as FormArray
    if (datos?.benfGroup || datos?.DatosBac || datos?.archIdent || datos?.porcBenef){
      this.labelbutton = datos?.Arch?.name
      ref_RefPers.push(this.initFormRefPers(datos.benfGroup, datos.DatosBac, datos?.Arch, datos?.Arch.name, datos.porcBenef))
    }else {
      this.labelbutton = "Archivo de identificación (beneficiario)"
      ref_RefPers.push(this.initFormRefPers())
    }
  }

  eliminarRefPer(): void {
    const ref_RefPers = this.formParent.get('refpers') as FormArray
    ref_RefPers.removeAt(-1)
    const data = this.formParent
    this.newDatBenChange.emit(data)
  }

  getCtrl(key: string, form: FormGroup): any {
    return form.get(key)
  }

  getLabel(key:string,form:FormGroup, indice:any):String{
    return form.get(key)?.value[indice]?.Arch?.name
  }

  setDatosBanc(datosBanc: any) {
    this.DatosBancBen = datosBanc
  }
  handleArchivoSeleccionado(archivo: any, i:any) {
    if (this.formParent && this.formParent.get('refpers')) {
      const ref_RefPers = this.formParent.get('refpers') as FormArray;
      if (ref_RefPers.length > 0) {
        const ultimoBeneficiario = ref_RefPers.at(i);
        if (ultimoBeneficiario.get('Archivos.Archivos')) {
          ultimoBeneficiario.get('Arch')?.setValue(archivo);
        }
      }
    }
  }

  prueba(e: any, i: any) {
    this.formParent.value.refpers[i].benfGroup.fechaNacimiento = e
  }
}