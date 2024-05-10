import { Component, Inject, Input, Output, EventEmitter, Optional, OnInit } from '@angular/core';
import { MAT_DIALOG_DATA, MatDialogRef } from '@angular/material/dialog';
import { ToastrService } from 'ngx-toastr';
import { FormBuilder, FormGroup, Validators, FormArray, FormControl } from '@angular/forms';
import { DatePipe } from '@angular/common';
import { AfiliadoService } from 'src/app/services/afiliado.service';
import { FormStateService } from 'src/app/services/form-state.service';

@Component({
  selector: 'app-new-familiares',
  templateUrl: './new-familiares.component.html',
  styleUrls: ['./new-familiares.component.scss'],
})
export class NewFamiliaresComponent implements OnInit {
  private formKey = 'FormFamiliar';
  public formParent: FormGroup;

  @Input() datos: any;
  @Output() newDatosFamiliares = new EventEmitter<any>();
  @Input() dniPersona!: string;

  parentesco = [
    { value: "ABUELA MATERNA", label: "Abuela Materna" },
    { value: "ABUELA PATERNA", label: "Abuela Paterna" },
    { value: "ABUELO MATERNO", label: "Abuelo Materno" },
    { value: "ABUELO PATERNO", label: "Abuelo Paterno" },
    { value: "CUÑADA", label: "Cuñada" },
    { value: "CUÑADO", label: "Cuñado" },
    { value: "ESPOSA", label: "Esposa" },
    { value: "ESPOSO", label: "Esposo" },
    { value: "HERMANA", label: "Hermana" },
    { value: "HERMANO", label: "Hermano" },
    { value: "HIJA", label: "Hija" },
    { value: "HIJO", label: "Hijo" },
    { value: "MADRE", label: "Madre" },
    { value: "NIETA", label: "Nieta" },
    { value: "NIETO", label: "Nieto" },
    { value: "NUERA", label: "Nuera" },
    { value: "PADRE", label: "Padre" },
    { value: "PRIMA", label: "Prima" },
    { value: "PRIMO", label: "Primo" },
    { value: "SOBRINA", label: "Sobrina" },
    { value: "SOBRINO", label: "Sobrino" },
    { value: "SUEGRO", label: "Suegro" },
    { value: "SUEGRA", label: "Suegra" },
    { value: "TÍA MATERNA", label: "Tía Materna" },
    { value: "TÍA PATERNA", label: "Tía Paterna" },
    { value: "TÍO MATERNO", label: "Tío Materno" },
    { value: "TÍO PATERNO", label: "Tío Paterno" },
    { value: "YERNO", label: "Yerno" }
  ];

  constructor(
    private afiliadoService: AfiliadoService,
    private datePipe: DatePipe,
    private formStateService: FormStateService,
    private fb: FormBuilder,
    private toastr: ToastrService,
    @Optional() @Inject(MAT_DIALOG_DATA) public data: any,
    @Optional() private dialogRef?: MatDialogRef<NewFamiliaresComponent>
  ) {
    this.formParent = this.fb.group({
      familiar: this.fb.array([])
    });
    if (data && data.dniPersona) {
      this.dniPersona = data.dniPersona;
    }
  }

  ngOnInit(): void {
    this.initForm();
    const familiarArray = this.formParent.get('familiar') as FormArray;
    if (this.datos && this.datos.value && this.datos.value.familiar && this.datos.value.familiar.length > 0 && familiarArray.length === 0) {
      for (const item of this.datos.value.familiar) {
        this.agregarFamiliar(item);
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

  initFormFamiliar(): FormGroup {
    return this.fb.group({
      primerNombre: new FormControl('', [Validators.required, Validators.maxLength(40)]),
      segundoNombre: new FormControl('', [Validators.maxLength(40)]),
      primerApellido: new FormControl('', [Validators.required, Validators.maxLength(40)]),
      segundoApellido: new FormControl('', [Validators.maxLength(40)]),
      dni: new FormControl('', [Validators.required,Validators.pattern(/^[0-9]{13}$|^[0-9]{4}-[0-9]{4}-[0-9]{5}$/),Validators.maxLength(15)]),
      fechaNacimiento: new FormControl('', Validators.required),
      parentesco: new FormControl('', Validators.required)
    });
  }

  agregarFamiliar(datos?: any): void {
    const familiar = this.formParent.get('familiar') as FormArray;
    if (datos) {
      familiar.push(this.fb.group({
        primerNombre: new FormControl(datos.primerNombre || '', [Validators.required, Validators.maxLength(40)]),
        segundoNombre: new FormControl(datos.segundoNombre || '', [Validators.maxLength(40)]),
        primerApellido: new FormControl(datos.primerApellido || '', [Validators.required, Validators.maxLength(40)]),
        segundoApellido: new FormControl(datos.segundoApellido || '', [Validators.maxLength(40)]),
        dni: new FormControl(datos.dni || '', [Validators.required,Validators.pattern(/^[0-9]{13}$|^[0-9]{4}-[0-9]{4}-[0-9]{5}$/),Validators.maxLength(15)]),
        fechaNacimiento: new FormControl(datos.fechaNacimiento || '', Validators.required),
        parentesco: new FormControl(datos.parentesco || '', Validators.required)
      }));
    } else {
      familiar.push(this.initFormFamiliar());
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

  onDatosBenChange() {
    this.newDatosFamiliares.emit(this.formParent);
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
}
