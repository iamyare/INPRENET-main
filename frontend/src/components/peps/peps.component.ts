import { Component, EventEmitter, Input, Output } from '@angular/core';
import { AbstractControl, FormArray, FormBuilder, FormControl, FormGroup, Validators } from '@angular/forms';
import { DireccionService } from 'src/app/services/direccion.service';
import { FieldArrays } from 'src/app/shared/Interfaces/field-arrays';
import { FieldConfig } from 'src/app/shared/Interfaces/field-config';

@Component({
  selector: 'app-peps',
  templateUrl: './peps.component.html',
  styleUrl: './peps.component.scss'
})
export class PepsComponent {
  parentForm!: FormGroup;
  departamentos: any = [];
  municipios: any = [];

  fields: FieldArrays[] = [
    {
      name: 'pep_declaration',
      label: '¿Ha desempeñado un cargo público?',
      type: 'radio',
      options: [
        { label: 'Sí', value: 'si' },
        { label: 'No', value: 'no' }
      ],
      value: '',
      validations: [],
      layout: { row: 8, col: 12 }
    },
    {
      name: 'pep_cargo_desempenado',
      label: 'Cargo Desempeñado',
      type: 'text',
      value: '',
      validations: [],
      layout: { row: 9, col: 6 }
    },
    {
      name: 'pep_periodo',
      label: 'Periodo',
      type: 'text',
      value: '',
      validations: [],
      layout: { row: 9, col: 6 }
    },
    {
      name: 'fecha_resolucion',
      label: 'Fecha Resolucion',
      type: 'date',
      value: '',
      validations: [],
      layout: { row: 9, col: 6 }
    },
    {
      name: 'fecha_ingreso_peps',
      label: 'Fecha Ingreso A PEPS',
      type: 'date',
      value: '',
      validations: [],
      layout: { row: 9, col: 6 }
    },
    {
      name: 'pep_otras_peps',
      label: 'Otras peps',
      type: 'text',
      value: '',
      validations: [],
      layout: { row: 10, col: 12 }
    },
    {
      name: 'docente_deducciones',
      label: '¿Ha realizado deducciones de cotizaciones a los docentes que trabajan en la institución?',
      type: 'radio',
      options: [
        { label: 'Sí', value: 'si' },
        { label: 'No', value: 'no' }
      ],
      value: '',
      validations: [],
      layout: { row: 11, col: 12 }
    }
  ];

  constructor(private fb: FormBuilder, private direccionService: DireccionService) { }

  ngOnInit(): void {
    if (!this.parentForm) {
      this.parentForm = this.fb.group({
        peps: this.fb.array([])
      });
    }
    this.addReferencia();
  }

  addControlsToForm() {
    if (!this.parentForm.contains('peps')) {
      this.parentForm.addControl('peps', this.fb.array([]));
    }
  }

  get peps(): FormArray {
    return this.parentForm.get('peps') as FormArray;
  }

  addReferencia(): void {
    const referenciaGroup = this.fb.group({
      nombre: ['', Validators.required],
      pep_declaration: ['', Validators.required],
      docente_deducciones: ['', Validators.required],
      pep_otras_peps: ['', Validators.required],
      pep_periodo: ['', Validators.required],
      pep_cargo_desempenado: ['', Validators.required],
      fecha_resolucion: ['', Validators.required],
      fecha_ingreso_peps: ['', Validators.required]
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
