import { ChangeDetectorRef, Component, Inject, OnInit, QueryList, ViewChild, ViewChildren, Output, EventEmitter } from '@angular/core';
import { AbstractControl, FormBuilder, FormControl, FormGroup, ValidatorFn, Validators } from '@angular/forms';
import { MatDatepicker } from '@angular/material/datepicker';
import { MAT_DIALOG_DATA, MatDialogRef } from '@angular/material/dialog';

interface Campo {
  nombre: string;
  tipo: string;
  etiqueta?: string;
  editable?: boolean;
  opciones?: { value: any, label: string }[];
  dependeDe?: string;
  valorDependiente?: any;
  validadores?: ValidatorFn[];
  icono?: string;
}

@Component({
  selector: 'app-editar-dialog',
  templateUrl: './editar-dialog.component.html',
  styleUrls: ['./editar-dialog.component.scss']
})
export class EditarDialogComponent implements OnInit {
  formGroup!: FormGroup;
  @ViewChild(MatDatepicker) picker!: MatDatepicker<Date>;
  @ViewChildren(MatDatepicker) private pickerQueryList!: QueryList<MatDatepicker<Date>>;
  datePickers!: MatDatepicker<Date>[];

  @Output() saved = new EventEmitter<any>();

  constructor(
    private fb: FormBuilder,
    private dialogRef: MatDialogRef<EditarDialogComponent>,
    @Inject(MAT_DIALOG_DATA) public data: { campos: Campo[], valoresIniciales: { [key: string]: any } },
    private cdr: ChangeDetectorRef
  ) {
    this.formGroup = this.fb.group({});
  }

  ngAfterViewInit() {
    this.datePickers = this.pickerQueryList.toArray();
    this.cdr.detectChanges();
  }

  ngOnInit(): void {
    this.crearFormulario();
    this.cdr.detectChanges();
  }

  crearFormulario() {
    const group: { [key: string]: FormControl } = {};

    this.data.campos.forEach(campo => {
      let valorInicial = this.data.valoresIniciales[campo.nombre] || '';

      if (campo.tipo === 'date' && valorInicial) {
        const fecha = this.convertToDate(valorInicial);
        valorInicial = fecha ? fecha : '';
        console.warn(`Fecha inválida para ${campo.nombre}:`, valorInicial);
      }

      const validadores = campo.validadores || [];

      group[campo.nombre] = new FormControl(
        { value: valorInicial, disabled: !campo.editable },
        validadores
      );
    });

    this.formGroup = this.fb.group(group);
    this.cdr.detectChanges();
  }

  convertToDate(dateString: string): Date | null {
    const [day, month, year] = dateString.split('/').map(Number);
    const date = new Date(year, month - 1, day);
    return isNaN(date.getTime()) ? null : date;
  }

  guardar() {
    const formValues = this.formGroup.value;
    if (formValues.fechaNacimiento instanceof Date) {
      const year = formValues.fechaNacimiento.getFullYear();
      const month = (formValues.fechaNacimiento.getMonth() + 1).toString().padStart(2, '0');
      const day = formValues.fechaNacimiento.getDate().toString().padStart(2, '0');

      formValues.fechaNacimiento = `${day}/${month}/${year}`;
    }

    if (this.formGroup.valid) {
      this.saved.emit(formValues);
      this.dialogRef.close(formValues);
    }
  }

  cerrar() {
    this.dialogRef.close();
  }

  getErrors(fieldName: string): string[] {
    const control = this.formGroup.get(fieldName);
    if (!control || !control.errors) {
      return [];
    }

    const errors = [];
    if (control.errors['required']) {
      errors.push('Este campo es requerido.');
    }
    if (control.errors['minlength']) {
      errors.push(`Debe tener al menos ${control.errors['minlength'].requiredLength} caracteres.`);
    }
    if (control.errors['maxlength']) {
      errors.push(`No puede tener más de ${control.errors['maxlength'].requiredLength} caracteres.`);
    }
    if (control.errors['pattern']) {
      errors.push('El formato no es válido.');
    }
    return errors;
  }

  // Ejemplo de un validador personalizado
  minCurrentValueValidator(minValue: number): ValidatorFn {
    return (control: AbstractControl): { [key: string]: any } | null => {
      if (!control.value) {
        return null;
      }
      return control.value >= minValue ? null : { 'valueTooLow': { value: control.value } };
    };
  }
}
