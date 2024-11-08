import { Component, OnInit, Inject } from '@angular/core';
import { FormBuilder, FormGroup, FormArray, FormControl, Validators, AbstractControl } from '@angular/forms';
import { DatosEstaticosService } from 'src/app/services/datos-estaticos.service';
import { AfiliacionService } from 'src/app/services/afiliacion.service';
import { ToastrService } from 'ngx-toastr';
import { MatDialogRef, MAT_DIALOG_DATA } from '@angular/material/dialog';
import { FieldArrays } from 'src/app/shared/Interfaces/field-arrays';

@Component({
  selector: 'app-agregar-familiar',
  templateUrl: './agregar-familiar.component.html',
  styleUrls: ['./agregar-familiar.component.scss']
})
export class AgregarFamiliarComponent implements OnInit {
  formFamiliares!: FormGroup;
  idPersona: number;

  familiaresFields: FieldArrays[] = [
    {
      name: 'primer_nombre',
      label: 'Primer Nombre',
      type: 'text',
      icon: 'person',
      validations: [Validators.required],
      layout: { row: 1, col: 6 }
    },
    {
      name: 'segundo_nombre',
      label: 'Segundo Nombre',
      type: 'text',
      icon: 'person',
      layout: { row: 1, col: 6 }
    },
    {
      name: 'primer_apellido',
      label: 'Primer Apellido',
      type: 'text',
      icon: 'person',
      validations: [Validators.required],
      layout: { row: 1, col: 6 }
    },
    {
      name: 'segundo_apellido',
      label: 'Segundo Apellido',
      type: 'text',
      icon: 'person',
      validations: [Validators.required],
      layout: { row: 1, col: 6 }
    },
    {
      name: 'n_identificacion',
      label: 'Número de Identificación',
      type: 'text',
      icon: 'badge',
      validations: [
        Validators.required,
        Validators.pattern('^[0-9]{13}$|^[0-9]{15}$')
      ],
      layout: { row: 1, col: 6 }
    },
    {
      name: 'parentesco',
      label: 'Parentesco',
      type: 'select',
      icon: 'family_restroom',
      options: this.datosEstaticosService.parentesco,
      validations: [Validators.required],
      layout: { row: 1, col: 6 }
    }
  ];

  constructor(
    private fb: FormBuilder,
    private datosEstaticosService: DatosEstaticosService,
    private afiliacionService: AfiliacionService,
    private toastr: ToastrService,
    private dialogRef: MatDialogRef<AgregarFamiliarComponent>,
    @Inject(MAT_DIALOG_DATA) public data: any
  ) {
    this.idPersona = data.idPersona;
  }

  ngOnInit(): void {
    this.formFamiliares = this.fb.group({
      familiares: this.fb.array([])
    });
  }

  get familiares(): FormArray {
    return this.formFamiliares.get('familiares') as FormArray;
  }

  addFamiliar(): void {
    const familiarGroup = this.fb.group({
      primer_nombre: new FormControl('', Validators.required),
      segundo_nombre: new FormControl(''),
      primer_apellido: new FormControl('', Validators.required),
      segundo_apellido: new FormControl('', Validators.required),
      n_identificacion: new FormControl('', [
        Validators.required,
        Validators.pattern('^[0-9]{13}$|^[0-9]{15}$')
      ]),
      parentesco: new FormControl('', Validators.required)
    });
    this.familiares.push(familiarGroup);
  }

  removeFamiliar(index: number): void {
    this.familiares.removeAt(index);
  }

  asFormGroup(control: AbstractControl): FormGroup {
    return control as FormGroup;
  }

  saveFamiliares(): void {
    if (this.formFamiliares.valid) {
      const familiaresData = this.formatFamiliares(this.familiares.value);
      //console.log(familiaresData);

      this.afiliacionService.crearFamilia(this.idPersona, familiaresData).subscribe({
        next: () => {
          this.toastr.success('Familiares guardados exitosamente');
          this.dialogRef.close();
        },
        error: (error) => {
          this.toastr.error('Error al guardar los familiares');
          console.error('Error al guardar los familiares:', error);
        }
      });
    } else {
      this.toastr.error('Por favor, completa todos los campos requeridos');
    }
  }

  isFormValid(): boolean {
    return this.formFamiliares.valid;
  }

  private formatFamiliares(datosFamiliares: any[]): any[] {
    return datosFamiliares.map((familiar: any) => ({
      parentesco: familiar.parentesco,
      persona_referencia: {
        primer_nombre: familiar.primer_nombre,
        segundo_nombre: familiar.segundo_nombre || '',
        tercer_nombre: familiar.tercer_nombre || '',
        primer_apellido: familiar.primer_apellido,
        segundo_apellido: familiar.segundo_apellido,
        n_identificacion: familiar.n_identificacion
      }
    }));
  }
}
