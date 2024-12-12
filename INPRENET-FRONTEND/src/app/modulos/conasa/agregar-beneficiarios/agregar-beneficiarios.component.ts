import { Component, Input, OnInit } from '@angular/core';
import { FormBuilder, FormArray, Validators, FormGroup, AbstractControl } from '@angular/forms';
import moment from 'moment';

@Component({
  selector: 'app-agregar-beneficiarios',
  templateUrl: './agregar-beneficiarios.component.html',
  styleUrls: ['./agregar-beneficiarios.component.scss'],
})
export class AgregarBeneficiariosComponent implements OnInit {
  @Input() beneficiariosForm!: FormArray;

  constructor(private fb: FormBuilder) {}

  ngOnInit(): void {
    if (!this.beneficiariosForm) {
      throw new Error('El FormArray beneficiariosForm es requerido.');
    }
  }

  agregarBeneficiario(): void {
    const nuevoBeneficiario = this.fb.group({
      primer_nombre: ['', Validators.required],
      segundo_nombre: [''],
      primer_apellido: ['', Validators.required],
      segundo_apellido: ['', Validators.required],
      parentesco: ['', Validators.required],
      fecha_nacimiento: ['', Validators.required],
      observaciones: [''],
    });
    this.beneficiariosForm.push(nuevoBeneficiario);
  }

  eliminarBeneficiario(index: number): void {
    this.beneficiariosForm.removeAt(index);
  }

  asFormGroup(control: AbstractControl): FormGroup {
    return control as FormGroup;
  }

  onDateChange(event: any, index: number): void {
    const formattedDate = moment(event.value).format('DD/MM/YYYY');
    this.beneficiariosForm.at(index).get('fecha_nacimiento')?.setValue(formattedDate);
  }
}
