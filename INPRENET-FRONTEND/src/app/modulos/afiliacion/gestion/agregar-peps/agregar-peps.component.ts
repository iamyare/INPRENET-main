import { Component, OnInit } from '@angular/core';
import { FormBuilder, FormGroup, FormArray, FormControl, Validators, AbstractControl } from '@angular/forms';
import { FieldArrays } from 'src/app/shared/Interfaces/field-arrays';

@Component({
  selector: 'app-agregar-peps',
  templateUrl: './agregar-peps.component.html',
  styleUrls: ['./agregar-peps.component.scss']
})
export class AgregarPepsComponent implements OnInit {
  formPeps!: FormGroup;

  fields: FieldArrays[] = [
    {
      name: 'pep_cargo_desempenado',
      label: 'Cargo Desempeñado',
      type: 'text',
      icon: 'work',
      value: '',
      validations: [Validators.required],
      layout: { row: 1, col: 6 }
    },
    {
      name: 'dateRange',
      label: 'Periodo',
      type: 'dateRange',
      icon: 'date_range',
      startDateControlName: 'startDate',
      endDateControlName: 'endDate',
      layout: { row: 1, col: 6 }
    }
  ];

  constructor(private fb: FormBuilder) {}

  ngOnInit(): void {
    this.formPeps = this.fb.group({
      peps: this.fb.array([])
    });
  }

  get peps(): FormArray {
    return this.formPeps.get('peps') as FormArray;
  }

  addReferencia(): void {
    const referenciaGroup = this.fb.group({
      pep_cargo_desempenado: new FormControl('', Validators.required),
      startDate: new FormControl(null, Validators.required),
      endDate: new FormControl(null)
    });
    this.peps.push(referenciaGroup);
  }

  removeReferencia(index: number): void {
    this.peps.removeAt(index);
  }

  asFormGroup(control: AbstractControl): FormGroup {
    return control as FormGroup;
  }
}
