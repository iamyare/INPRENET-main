import { Component, Input, OnInit } from '@angular/core';
import { FormBuilder, FormArray, Validators, FormGroup, AbstractControl } from '@angular/forms';
import moment from 'moment';
import { DatosEstaticosService } from '../../../services/datos-estaticos.service';
@Component({
  selector: 'app-agregar-beneficiarios',
  templateUrl: './agregar-beneficiarios.component.html',
  styleUrls: ['./agregar-beneficiarios.component.scss'],
})
export class AgregarBeneficiariosComponent implements OnInit {
  @Input() beneficiariosForm!: FormArray;
  parentescos: any[] = [];

  constructor(private fb: FormBuilder, private datosEstaticosService: DatosEstaticosService) {}

  ngOnInit(): void {
    if (!this.beneficiariosForm) {
      throw new Error('El FormArray beneficiariosForm es requerido.');
    }

    this.parentescos = this.datosEstaticosService.parentesco;
  }

  agregarBeneficiario(): void {
    const nuevoBeneficiario = this.fb.group({
      primer_nombre: ['', Validators.required],
      segundo_nombre: [''],
      primer_apellido: ['', Validators.required],
      segundo_apellido: ['', Validators.required],
      parentesco: ['', Validators.required],
      fecha_nacimiento: ['', Validators.required],
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

  blockManualInput(event: KeyboardEvent): void {
    event.preventDefault();
  }

  clearManualInput(event: Event): void {
    const inputElement = event.target as HTMLInputElement;
    inputElement.value = '';
  }
}
