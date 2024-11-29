import { Component, Input, OnInit } from '@angular/core';
import { FormArray, FormBuilder, FormGroup, Validators } from '@angular/forms';
import { DatosEstaticosService } from 'src/app/services/datos-estaticos.service';

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
      estado: ['INACTIVO', Validators.required]
    });
    this.bancosArray.push(bancoForm);
    this.markAllAsTouched(bancoForm);
    this.formGroup.markAsTouched();
  }

  eliminarBanco(index: number): void {
    if (this.bancosArray.length > 0) {
      this.bancosArray.removeAt(index);
    }
  }

  onCuentaPrincipalChange(index: number): void {
    this.bancosArray.controls.forEach((group, i) => {
      if (i === index) {
        group.get('estado')?.setValue('ACTIVO', { emitEvent: false });
      } else {
        group.get('estado')?.setValue('INACTIVO', { emitEvent: false });
      }
    });
  }

  getErrors(i: number, fieldName: string): string[] {
    const control:any = this.bancosArray.at(i).get(fieldName);
    if (control && control.errors) {
      return Object.keys(control.errors).map(key => this.getErrorMessage(key, control.errors[key]));
    }
    return [];
  }

  private getErrorMessage(errorType: string, errorValue: any): string {
    const errorMessages: any = {
      required: 'Este campo es requerido.',
      minlength: `Debe tener al menos ${errorValue.requiredLength} caracteres.`,
      maxlength: `No puede tener más de ${errorValue.requiredLength} caracteres.`,
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
    // Limpia todos los bancos del FormArray
    this.bancosArray.clear();
    // Reinicia el formulario padre
    this.formGroup.reset();
  }
}
