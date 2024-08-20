import { Component, EventEmitter, Input, Output, OnInit } from '@angular/core';
import { AbstractControl, FormArray, FormBuilder, FormControl, FormGroup, Validators } from '@angular/forms';
import { DireccionService } from 'src/app/services/direccion.service';
import { FieldArrays } from 'src/app/shared/Interfaces/field-arrays';

@Component({
  selector: 'app-peps',
  templateUrl: './peps.component.html',
  styleUrls: ['./peps.component.scss']
})
export class PepsComponent implements OnInit {
  @Input() parentForm!: FormGroup;
  @Input() field: any; // Recibiendo la propiedad `field` del componente padre
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
      value: '',
      validations: [Validators.required],
      layout: { row: 1, col: 6 }
    },
    {
      name: 'dateRange',
      label: 'Periodo',
      type: 'dateRange',
      startDateControlName: 'startDate',
      endDateControlName: 'endDate',
      layout: { row: 1, col: 6 }
    },
  ];

  constructor(private fb: FormBuilder, private direccionService: DireccionService) {}

  ngOnInit(): void {
    if (!this.parentForm) {
      this.parentForm = this.fb.group({
        peps: this.fb.array([])
      });
    } else if (!this.parentForm.contains('peps')) {
      this.parentForm.addControl('peps', this.fb.array([]));
    }
    // Escuchar cambios en el control de "cargo público"
    this.parentForm.get('cargoPublico')?.valueChanges.subscribe((value: string) => {
      if (value === 'NO') {
        this.peps.clear();
        this.pepsChange.emit([]);
      }
    });
  }

  get peps(): FormArray {
    return this.parentForm.get('peps') as FormArray;
  }

  addReferencia(): void {
    const referenciaGroup = this.fb.group({
      startDate: new FormControl(null, Validators.required),
      endDate: new FormControl(null, Validators.required),
      pep_cargo_desempenado: new FormControl('', Validators.required),
    });

    this.peps.push(referenciaGroup);
    this.emitPepsData();
  }

  removeReferencia(index: number): void {
    this.peps.removeAt(index);
    this.emitPepsData();
  }

  emitPepsData(): void {
    const validPeps = this.peps.controls.filter(control => {
      const group = control as FormGroup;
      return Object.values(group.value).some(value => value !== null && value !== '');
    }).map(control => control.value);

    this.pepsChange.emit(validPeps);
  }

  asFormGroup(control: AbstractControl): FormGroup {
    return control as FormGroup;
  }
}
