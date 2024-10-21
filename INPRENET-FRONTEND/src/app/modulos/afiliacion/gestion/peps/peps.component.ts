import { Component, EventEmitter, Input, Output, OnInit } from '@angular/core';
import { AbstractControl, FormArray, FormBuilder, FormControl, FormGroup, Validators, ValidationErrors, ValidatorFn } from '@angular/forms';
import { FieldArrays } from 'src/app/shared/Interfaces/field-arrays';
import { DatosEstaticosService } from 'src/app/services/datos-estaticos.service';

@Component({
  selector: 'app-peps',
  templateUrl: './peps.component.html',
  styleUrls: ['./peps.component.scss']
})
export class PepsComponent implements OnInit {
  @Input() parentForm!: FormGroup;
  @Input() field: any;
  @Output() pepsChange = new EventEmitter<any>();

  departamentos: any = [];
  municipios: any = [];

  currentYear = new Date();
  maxDate: Date = new Date(this.currentYear.getFullYear(), this.currentYear.getMonth(), this.currentYear.getDate(), this.currentYear.getHours(), this.currentYear.getMinutes(), this.currentYear.getSeconds());

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
    },
  ];

  familiaresFields: FieldArrays[] = [];

  constructor(
    private fb: FormBuilder,
    private datosEstaticosService: DatosEstaticosService
  ) {}

  ngOnInit(): void {
    this.familiaresFields = [
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
          Validators.maxLength(15),
          Validators.pattern(/^[0-9]+$/),
          this.uniqueIdentificacionValidator()
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

    if (!this.parentForm) {
      this.parentForm = this.fb.group({
        peps: this.fb.array([]),
        familiares: this.fb.array([])
      });
    } else {
      if (!this.parentForm.contains('peps')) {
        this.parentForm.addControl('peps', this.fb.array([]));
      }
      if (!this.parentForm.contains('familiares')) {
        this.parentForm.addControl('familiares', this.fb.array([]));
      }
    }

    this.parentForm.get('cargoPublico')?.valueChanges.subscribe((value: string) => {
      if (value === 'NO') {
        this.peps.clear();
        this.familiares.clear();
        this.pepsChange.emit({ peps: [], familiares: [] });
      }
    });
  }

  get peps(): FormArray {
    return this.parentForm.get('peps') as FormArray;
  }

  get familiares(): FormArray {
    return this.parentForm.get('familiares') as FormArray;
  }

  addReferencia(): void {
    const referenciaGroup = this.fb.group({
      startDate: new FormControl(null, Validators.required),
      endDate: new FormControl(null, Validators.required),
      pep_cargo_desempenado: new FormControl('', Validators.required),
    });

    this.peps.push(referenciaGroup);
  }

  removeReferencia(index: number): void {
    this.peps.removeAt(index);
  }

  addFamiliar(): void {
    const familiarGroup = this.fb.group({
      primer_nombre: new FormControl('', Validators.required),
      segundo_nombre: new FormControl(''),
      primer_apellido: new FormControl('', Validators.required),
      segundo_apellido: new FormControl('',),
      n_identificacion: new FormControl('', [
        Validators.required,
        Validators.maxLength(15),
        Validators.pattern(/^[0-9]+$/),
        this.uniqueIdentificacionValidator()
      ]),
      parentesco: new FormControl('', Validators.required),
    });

    this.familiares.push(familiarGroup);
  }

  removeFamiliar(index: number): void {
    this.familiares.removeAt(index);
  }

  asFormGroup(control: AbstractControl): FormGroup {
    return control as FormGroup;
  }

  uniqueIdentificacionValidator(): ValidatorFn {
    return (control: AbstractControl): ValidationErrors | null => {
      const currentValue = control.value;
      if (!currentValue) return null;

      const familiaresArray = this.familiares;
      let count = 0;

      familiaresArray.controls.forEach((familiar) => {
        if (familiar.get('n_identificacion')?.value === currentValue) {
          count++;
        }
      });

      return count > 1 ? { fieldNotUnique: true } : null;
    };
  }
}
