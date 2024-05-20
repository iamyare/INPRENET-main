import { Component, Inject, Input, Output, EventEmitter, Optional, OnInit } from '@angular/core';
import { MAT_DIALOG_DATA, MatDialogRef } from '@angular/material/dialog';
import { ToastrService } from 'ngx-toastr';
import { FormBuilder, FormGroup, Validators, FormArray, FormControl } from '@angular/forms';
import { DatePipe } from '@angular/common';
import { AfiliadoService } from 'src/app/services/afiliado.service';
import { FormStateService } from 'src/app/services/form-state.service';
import { DatosEstaticosService } from 'src/app/services/datos-estaticos.service';

export function generateFamiliaresFormGroup(datos?: any): FormGroup {
  return new FormGroup({
    primer_nombre: new FormControl(datos.primer_nombre || '', [Validators.required, Validators.maxLength(40)]),
    segundo_nombre: new FormControl(datos.segundo_nombre || '', [Validators.maxLength(40)]),
    primer_apellido: new FormControl(datos.primer_apellido || '', [Validators.required, Validators.maxLength(40)]),
    segundo_apellido: new FormControl(datos.segundo_apellido || '', [Validators.maxLength(40)]),
    dni: new FormControl(datos.dni || '', [Validators.required, Validators.pattern(/^[0-9]{13}$|^[0-9]{4}-[0-9]{4}-[0-9]{5}$/), Validators.maxLength(15)]),
    fecha_nacimiento: new FormControl(datos.fecha_nacimiento || '', Validators.required),
    parentesco: new FormControl(datos.parentesco || '', Validators.required)
  });
}

@Component({
  selector: 'app-new-familiares',
  templateUrl: './new-familiares.component.html',
  styleUrls: ['./new-familiares.component.scss'],
})
export class NewFamiliaresComponent implements OnInit {
  public formParent: FormGroup = new FormGroup({});
  private formKey = 'FormFamiliar';
  parentesco: any;
  minDate: Date;
  @Input() datos: any;
  @Output() newDatosFamiliares = new EventEmitter<any>();
  @Input() dniPersona!: string;

  onDatosBenChange() {
    const data = this.formParent
    this.newDatosFamiliares.emit(data);
  }

  constructor(
    private afiliadoService: AfiliadoService,
    private datePipe: DatePipe,
    private formStateService: FormStateService,
    private fb: FormBuilder,
    private toastr: ToastrService,
    private datosEstaticosService: DatosEstaticosService,
    @Optional() @Inject(MAT_DIALOG_DATA) public data: any,
    @Optional() private dialogRef?: MatDialogRef<NewFamiliaresComponent>
  ) {
    const currentYear = new Date();
    this.minDate = new Date(currentYear.getFullYear(), currentYear.getMonth(), currentYear.getDate());
  }

  ngOnInit(): void {
    this.parentesco = this.datosEstaticosService.parentesco;
    this.initForm();
    if (this.datos) {
      if (this.datos.value.familiar.length > 0) {
        for (let i of this.datos.value.familiar) {
          this.agregarFamiliar(i)
        }
      }
    }
  }

  private initForm() {
    const existingForm = this.formStateService.getForm(this.formKey);
    if (existingForm) {
      this.formParent = existingForm;
    } else {
      this.formParent = this.fb.group({
        familiar: this.fb.array([])
      });
      /* this.formStateService.setForm(this.formKey, this.formParent); */
    }
  }

  agregarFamiliar(datos?: any): void {
    const ref_Familiares = this.formParent.get('familiar') as FormArray;
    if (datos) {
      ref_Familiares.push(generateFamiliaresFormGroup(datos))
    } else {
      ref_Familiares.push(generateFamiliaresFormGroup({}))
    }
  }

  eliminarFamiliar(): void {
    const familiar = this.formParent.get('familiar') as FormArray;
    if (familiar.length > 0) {
      familiar.removeAt(familiar.length - 1);
      this.newDatosFamiliares.emit(this.formParent);
    }
  }

  getCtrl(key: string, form: FormGroup): any {
    return form.get(key);
  }

  guardarFamiliares(): void {
    const familiaresArray = (this.formParent.get('familiar') as FormArray).value;
    const familiaresData = familiaresArray.map((familiar: any) => ({
      primer_nombre: String(familiar.primer_nombre),
      segundo_nombre: familiar.segundo_nombre ? String(familiar.segundo_nombre) : undefined,
      primer_apellido: String(familiar.primer_apellido),
      segundo_apellido: familiar.segundo_apellido ? String(familiar.segundo_apellido) : undefined,
      dni: String(familiar.dni),
      fecha_nacimiento: this.datePipe.transform(familiar.fecha_nacimiento, 'yyyy-MM-dd') || undefined,
      parentesco: String(familiar.parentesco)
    }));

    console.log(familiaresData);



    familiaresData.forEach((familiar: any) => {
      this.afiliadoService.agregarFamiliar(this.data.dniPersona, familiar).subscribe({
        next: (response) => {
          console.log('Familiar agregado con éxito:', response);
          this.toastr.success('Familiar agregado con éxito');
          this.cerrarDialogo();
        },
        error: (error) => {
          console.error('Error al agregar familiar:', error);
          this.toastr.error('Error al agregar familiar');
        }
      });
    });
  }

  cerrarDialogo(): void {
    if (this.dialogRef) {
      this.dialogRef.close();
    }
  }

  getErrors(i: number, fieldName: string): any {
    if (this.formParent instanceof FormGroup) {
      const controlesfamiliar = (this.formParent.get('familiar') as FormGroup).controls;
      const a = controlesfamiliar[i].get(fieldName)!.errors

      let errors = []
      if (a) {
        if (a['required']) {
          errors.push('Este campo es requerido.');
        }
        if (a['minlength']) {
          errors.push(`Debe tener al menos ${a['minlength'].requiredLength} caracteres.`);
        }
        if (a['maxlength']) {
          errors.push(`No puede tener más de ${a['maxlength'].requiredLength} caracteres.`);
        }
        if (a['pattern']) {
          errors.push('El formato no es válido.');
        }
        return errors;
      }
    }

  }
}
