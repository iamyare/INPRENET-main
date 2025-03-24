import { Component, Input, OnInit } from '@angular/core';
import { FormBuilder, FormGroup, FormArray, Validators, AbstractControl, FormControl } from '@angular/forms';
import { FieldArrays } from 'src/app/shared/Interfaces/field-arrays';
import { ValidationService } from 'src/app/shared/services/validation.service'; // Importa el servicio

@Component({
  selector: 'app-referencias-bancarias-comerciales',
  templateUrl: './referencias-bancarias-comerciales.component.html',
  styleUrls: ['./referencias-bancarias-comerciales.component.scss']
})
export class ReferenciasBancariasComercialesComponent implements OnInit {
  @Input() parentForm!: FormGroup;

  constructor(private fb: FormBuilder, private validationService: ValidationService) { }
  
  fields: FieldArrays[] = [
    { name: 'nombre', label: 'Nombre', icon: 'person', layout: { row: 0, col: 6 }, type: 'text', value: '', validations: [Validators.required, Validators.maxLength(200), this.validationService.namesValidator()]},
    { name: 'tipoReferencia', label: 'Tipo de Referencia', icon: 'list', layout: { row: 0, col: 6 }, type: 'select', options: [{ label: 'BANCARIA', value: 'BANCARIA' }, { label: 'COMERCIAL', value: 'COMERCIAL' }], value: '', validations: [Validators.required] }
  ];

  ngOnInit(): void {
    if (!this.parentForm) {
      this.parentForm = this.fb.group({
        referencias: this.fb.array([])
      });
    }
    this.addControlsToForm();
  }

  addControlsToForm() {
    if (!this.parentForm.contains('referencias')) {
      this.parentForm.addControl('referencias', this.fb.array([]));
    }
  }

  get referencias(): FormArray {
    return this.parentForm.get('referencias') as FormArray;
  }

  addReferencia(): void {
    const referenciaGroup = this.fb.group({
      nombre: ['', [Validators.required, Validators.maxLength(200), this.validationService.namesValidator()]],
      tipoReferencia: ['', Validators.required]
    });

    this.referencias.push(referenciaGroup);
  }

  removeReferencia(index: number): void {
    this.referencias.removeAt(index);
  }

  asFormGroup(control: AbstractControl): FormGroup {
    return control as FormGroup;
  }
}
