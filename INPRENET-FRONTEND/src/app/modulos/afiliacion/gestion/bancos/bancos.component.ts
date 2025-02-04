import { Component, Input, OnInit } from '@angular/core';
import { FormArray, FormBuilder, FormGroup, Validators } from '@angular/forms';
import { DatosEstaticosService } from '../../../../services/datos-estaticos.service';

@Component({
  selector: 'app-bancos',
  templateUrl: './bancos.component.html',
  styleUrls: ['./bancos.component.scss']
})
export class BancosComponent implements OnInit {
  @Input() formGroup!: FormGroup;
  bancos: any[] = [];

  constructor(
    private fb: FormBuilder,
    private datosEstaticosSVC: DatosEstaticosService
  ) {}

  ngOnInit(): void {
    if (!this.formGroup.get('bancos')) {
      this.formGroup.addControl('bancos', this.fb.array([]));
    }

    this.loadBancos();

    // Asegurar que siempre haya al menos un banco en el formulario
    if (this.bancosArray.length === 0) {
      this.agregarBanco();
    }
  }

  private loadBancos() {
    this.datosEstaticosSVC.getBancos().subscribe(bancos => {
      this.bancos = bancos;
    });
  }

  get bancosArray(): FormArray {
    return this.formGroup.get('bancos') as FormArray;
  }

  agregarBanco(): void {
    const bancoForm = this.fb.group({
      id_banco: ['', Validators.required],
      num_cuenta: ['', [Validators.required, Validators.minLength(8), Validators.pattern('^[0-9]*$')]],
      estado: ['ACTIVO', Validators.required]
    });

    this.bancosArray.push(bancoForm);
    this.markAllAsTouched(bancoForm);
    this.formGroup.markAsTouched();
  }

  eliminarBanco(index: number): void {
    if (this.bancosArray.length > 1) { // Solo permite eliminar si hay más de un banco
      this.bancosArray.removeAt(index);
    }
  }

  getErrors(i: number, fieldName: string): string[] {
    const control: any = this.bancosArray.at(i).get(fieldName);
    if (control && control.errors) {
      return Object.keys(control.errors).map(key => this.getErrorMessage(key, control.errors[key]));
    }
    return [];
  }

  private getErrorMessage(errorType: string, errorValue: any): string {
    const errorMessages: any = {
      required: 'Este campo es requerido.',
      minlength: `Debe tener al menos ${errorValue.requiredLength} caracteres.`,
      pattern: 'El formato no es válido.'
    };
    return errorMessages[errorType] || 'Error desconocido.';
  }

  private markAllAsTouched(control: FormGroup | FormArray): void {
    if (control instanceof FormGroup || control instanceof FormArray) {
      Object.values(control.controls).forEach(ctrl => {
        ctrl.markAsTouched();
        if (ctrl instanceof FormGroup || ctrl instanceof FormArray) {
          this.markAllAsTouched(ctrl);
        }
      });
    }
  }

  reset(): void {
    // Siempre debe haber un banco presente, así que en lugar de limpiar, lo reiniciamos
    this.bancosArray.clear();
    this.agregarBanco();
    this.formGroup.markAsUntouched();
  }
}
