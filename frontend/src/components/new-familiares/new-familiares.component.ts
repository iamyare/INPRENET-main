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
    primerNombre: new FormControl(datos.primerNombre || '', [Validators.required, Validators.maxLength(40)]),
    segundoNombre: new FormControl(datos.segundoNombre || '', [Validators.maxLength(40)]),
    primerApellido: new FormControl(datos.primerApellido || '', [Validators.required, Validators.maxLength(40)]),
    segundoApellido: new FormControl(datos.segundoApellido || '', [Validators.maxLength(40)]),
    dni: new FormControl(datos.dni || '', [Validators.required, Validators.pattern(/^[0-9]{13}$|^[0-9]{4}-[0-9]{4}-[0-9]{5}$/), Validators.maxLength(15)]),
    fechaNacimiento: new FormControl(datos.fechaNacimiento || '', Validators.required),
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
      primerNombre: String(familiar.primerNombre),
      segundoNombre: familiar.segundoNombre ? String(familiar.segundoNombre) : undefined,
      primerApellido: String(familiar.primerApellido),
      segundoApellido: familiar.segundoApellido ? String(familiar.segundoApellido) : undefined,
      dni: String(familiar.dni),
      fechaNacimiento: this.datePipe.transform(familiar.fechaNacimiento, 'yyyy-MM-dd') || undefined,
      parentesco: String(familiar.parentesco)
    }));

    familiaresData.forEach((familiar: any) => {
      this.afiliadoService.agregarFamiliar(this.dniPersona, familiar).subscribe({
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
