import { ChangeDetectionStrategy, Component, EventEmitter, Input, Output } from '@angular/core';
import { FormArray, FormBuilder, FormControl, FormGroup, Validators } from '@angular/forms';
import { generateAddressFormGroup } from '../dat-generales-afiliado/dat-generales-afiliado.component';
import { generateDatBancFormGroup } from '@docs-components/dat-banc/dat-banc.component';
import { generateFormArchivo } from '../botonarchivos/botonarchivos.component';

import { generateBenefFormGroup } from '@docs-components/beneficio/beneficio.component';
import { FormStateService } from 'src/app/services/form-state.service';

@Component({
  selector: 'app-benef',
  templateUrl: './benef.component.html',
  styleUrls: ['./benef.component.scss'],
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class BenefComponent {
  private formKey = 'FormBeneficiario';
  public formParent: FormGroup;

  archIdent: any;
  labelbutton = "Archivo de identificación (beneficiario)"
  DatosBancBen: any = [];

  @Input() datos: any
  @Output() newDatBenChange = new EventEmitter<any>()

  onDatosBenChange() {
    this.newDatBenChange.emit(this.formParent);
  }

  constructor(private formStateService: FormStateService, private fb: FormBuilder) {
    this.formParent = this.fb.group({
      beneficiario: this.fb.array([]),
    });
  }

  ngOnInit(): void {
    this.initForm();
    const beneficiariosArray = this.formParent.get('beneficiario') as FormArray;
    if (this.datos && this.datos.value && this.datos.value.beneficiario && this.datos.value.beneficiario.length > 0 && beneficiariosArray.length === 0) {
      for (let i of this.datos.value.beneficiario) {
        this.agregarBen(i);
      }
    }
  }

  get porcentajes() {
    return this.formParent.get('porcentaje') as FormArray;
  }

  suma100Validator(): any {
    return (control: FormControl) => {
      const valor = control.value;
      if (valor !== null && isNaN(valor) === false && (valor < 0 || valor > 100)) {
        return { sumaNo100: true };
      }
      return null;
    };
  }

  actualizarPorcentajes(indice: number, nuevoValor: any) {
    const diferencia = nuevoValor.target.value - (this.porcentajes.at(indice).value || 0);
    const otrosPorcentajes = this.porcentajes.controls.filter((control, i) => i !== indice);
    const porcentajeDistribuir = diferencia / otrosPorcentajes.length;

    otrosPorcentajes.forEach(control => {
      const valorActual = control.value || 0;
      control.setValue(valorActual + porcentajeDistribuir);
    });
  }

  private initForm() {
    let existingForm = this.formStateService.getForm(this.formKey);
    if (existingForm) {
      this.formParent = existingForm;
    } else {
      this.formParent = this.fb.group({
        beneficiario: this.fb.array([])
      });
      this.formStateService.setForm(this.formKey, this.formParent);
    }
  }

  initFormBeneficiario(datosBeneficiario?: any, DatosBac?: any, Archivos?: File, labelArch?: any, porcentaje?: any): FormGroup {
    return this.fb.group({
      beneficiario: new FormControl(''),
      porcentaje: new FormControl('', [Validators.required, this.suma100Validator()]),
      datosBeneficiario: generateAddressFormGroup(datosBeneficiario),
      DatosBac: generateDatBancFormGroup(DatosBac),
      Archivos: generateFormArchivo(labelArch),
      Arch: Archivos,
    });
  }

  agregarBen(datos?: any): void {
    const beneficiarios = this.formParent.get('beneficiario') as FormArray;
    if (datos) {
      this.labelbutton = datos.Arch ? datos.Arch.name : "Archivo de identificación (beneficiario)";
      beneficiarios.push(this.initFormBeneficiario(datos.benfGroup, datos.DatosBac, datos.Arch, datos.Arch ? datos.Arch.name : undefined));

    } else {
      this.labelbutton = "Archivo de identificación (beneficiario)";
      beneficiarios.push(this.initFormBeneficiario());
    }
  }


  eliminarRefPer(): void {
    const asig_Beneficiario = this.formParent.get('beneficiario') as FormArray
    asig_Beneficiario.removeAt(-1)
    const data = this.formParent
    this.newDatBenChange.emit(data)
  }

  getCtrl(key: string, form: FormGroup): any {
    return form.get(key)
  }

  getLabel(key: string, form: FormGroup, indice: any): String {
    return form.get(key)?.value[indice]?.Arch?.name
  }

  setDatosBanc(datosBanc: any) {
    this.DatosBancBen = datosBanc
  }
  handleArchivoSeleccionado(archivo: any, i: any) {
    if (this.formParent && this.formParent.get('beneficiario')) {
      const asig_Beneficiario = this.formParent.get('beneficiario') as FormArray;
      if (asig_Beneficiario.length > 0) {
        const ultimoBeneficiario = asig_Beneficiario.at(i);
        if (ultimoBeneficiario.get('Archivos.Archivos')) {
          ultimoBeneficiario.get('Arch')?.setValue(archivo);
        }
      }
    }
  }

  prueba(e: any, i: any) {
    this.formParent.value.beneficiario[i].benfGroup.fechaNacimiento = e
  }
}
