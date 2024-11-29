import { Component, EventEmitter, Input, OnInit, Output } from '@angular/core';
import { FormArray, FormBuilder, FormGroup, Validators } from '@angular/forms';

@Component({
  selector: 'app-otras-fuentes-ingreso',
  templateUrl: './otras-fuentes-ingreso.component.html',
  styleUrls: ['./otras-fuentes-ingreso.component.scss']
})
export class OtrasFuentesIngresoComponent implements OnInit {
  @Input() formGroup!: FormGroup;
  @Output() onOtrasFuentesIngresoChange = new EventEmitter<FormGroup>();

  constructor(private fb: FormBuilder) {}

  ngOnInit(): void {
    if (!this.formGroup.get('otrasFuentesIngreso')) {
      this.formGroup.addControl('otrasFuentesIngreso', this.fb.array([]));
    }
  }

  get otrasFuentesIngresoArray(): FormArray {
    return this.formGroup.get('otrasFuentesIngreso') as FormArray;
  }

  agregarFuenteIngreso(): void {
    const fuenteIngresoForm = this.fb.group({
      actividad_economica: ['', Validators.required],
      monto_ingreso: ['', [Validators.required, Validators.min(0)]],
      observacion: ['', [Validators.required, Validators.maxLength(255)]]
    });

    this.otrasFuentesIngresoArray.push(fuenteIngresoForm);
    fuenteIngresoForm.markAllAsTouched();
    this.onOtrasFuentesIngresoChange.emit(this.formGroup); // Emitir el cambio
  }

  eliminarFuenteIngreso(index: number): void {
    if (this.otrasFuentesIngresoArray.length > 0) {
      this.otrasFuentesIngresoArray.removeAt(index);
      this.onOtrasFuentesIngresoChange.emit(this.formGroup); // Emitir el cambio
    }
  }

  getErrors(i: number, fieldName: string): string[] {
    const control:any = this.otrasFuentesIngresoArray.at(i).get(fieldName);
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
      pattern: 'El formato no es válido.',
      min: 'El valor debe ser mayor o igual a 0.'
    };
    return errorMessages[errorType] || 'Error desconocido.';
  }

  reset(): void {
    this.otrasFuentesIngresoArray.clear();
    this.formGroup.reset();
  }
  
}
