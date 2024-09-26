import { Component, OnInit } from '@angular/core';
import { FormBuilder, FormGroup, FormArray, FormControl, Validators, AbstractControl } from '@angular/forms';
import { FieldArrays } from 'src/app/shared/Interfaces/field-arrays';
import { DatosEstaticosService } from 'src/app/services/datos-estaticos.service';

@Component({
  selector: 'app-agregar-familiar',
  templateUrl: './agregar-familiar.component.html',
  styleUrls: ['./agregar-familiar.component.scss']
})
export class AgregarFamiliarComponent implements OnInit {
  formFamiliares!: FormGroup;

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
      validations: [Validators.required],
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

  constructor(private fb: FormBuilder, private datosEstaticosService: DatosEstaticosService) {}

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
      n_identificacion: new FormControl('', Validators.required),
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
}
