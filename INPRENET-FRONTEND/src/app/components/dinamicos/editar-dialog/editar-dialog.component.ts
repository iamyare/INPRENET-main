import { ChangeDetectorRef, Component, Inject, OnInit, QueryList, ViewChild, ViewChildren, Output, EventEmitter } from '@angular/core';
import { AbstractControl, FormBuilder, FormControl, FormGroup, ValidatorFn, Validators } from '@angular/forms';
import { MatDatepicker } from '@angular/material/datepicker';
import { MAT_DIALOG_DATA, MatDialogRef } from '@angular/material/dialog';
import { addMonths } from 'date-fns';

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
  @Output() formUpdated = new EventEmitter<any>(); // Nuevo evento para cambios en el formulario.

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
    this.escucharCambiosFormulario(); // Escuchar cambios en el formulario.
    this.cdr.detectChanges();
  }

  crearFormulario() {
    const group: { [key: string]: FormControl | FormGroup } = {};

    this.data.campos.forEach(campo => {
      let valorInicial = this.data.valoresIniciales[campo.nombre] || '';
      const validadores = campo.validadores || [];

      if (campo.tipo === 'daterange') {
        const dateRangeGroup = this.fb.group({
          start: [valorInicial?.start || '', validadores],
          end: [valorInicial?.end || '', validadores]
        });
        group[campo.nombre] = dateRangeGroup;
      } else if (campo.tipo === 'date') {
        group[campo.nombre] = new FormControl({ value: valorInicial, disabled: !campo.editable }, validadores);
      } else {
        group[campo.nombre] = new FormControl({ value: valorInicial, disabled: !campo.editable }, validadores);
      }
    });

    this.formGroup = this.fb.group(group);
    this.cdr.detectChanges();
  }

  escucharCambiosFormulario() {
    this.formGroup.valueChanges.subscribe(values => {
      this.formUpdated.emit(values); // Emitir cambios del formulario.

      // Suponiendo que el campo que modifica es 'input1' y el que quieres cambiar es 'input2'.
      const num_rentas_pagar_primer_pago = this.formGroup.get("num_rentas_pagar_primer_pago")?.value;
      const monto_por_periodo = this.formGroup.get("monto_por_periodo")?.value;

      const num_rentas_aplicadas = this.formGroup.get("num_rentas_aplicadas")?.value;
      //const valorInput4 = values.num_rentas_aplicadas;
      const ultimo_dia_ultima_renta = values?.ultimo_dia_ultima_renta;
      const fecha_calculo = this.formGroup.get("fecha_calculo")?.value;

      const monto_total = this.formGroup.get("monto_total")?.value;
      const monto_ultima_cuota = this.formGroup.get("monto_ultima_cuota")?.value;

      /* if (num_rentas_pagar_primer_pago !== undefined) {
        // Aplica lógica para calcular el nuevo valor
        const nuevomonto_por_periodo = num_rentas_pagar_primer_pago * monto_por_periodo; // Ejemplo: duplicar el valor

        // Actualiza el valor de 'input2' sin emitir eventos
        this.formGroup.get('monto_primera_cuota')?.patchValue(nuevomonto_por_periodo, { emitEvent: false });
      } */

      if (monto_total !== undefined) {
        // Aplica lógica para calcular el nuevo valor
        const nuevomonto_por_periodo = (monto_por_periodo * num_rentas_aplicadas) + monto_ultima_cuota; // Ejemplo: duplicar el valor

        // Actualiza el valor de 'input2' sin emitir eventos
        this.formGroup.get('monto_total')?.patchValue(nuevomonto_por_periodo.toFixed(2), { emitEvent: false });
      }

      if (num_rentas_aplicadas !== undefined) {
        let startDate: any
        if (fecha_calculo) {

          if (typeof fecha_calculo === 'string' && fecha_calculo.includes('T')) {
            // Si el valor tiene formato ISO con 'T', convertirlo a 'yyyy-mm-dd'
            startDate = new Date(fecha_calculo).toISOString().split('T')[0];
          } else {
            // Si ya tiene formato 'yyyy-mm-dd', dejarlo tal cual
            startDate = new Date().toISOString().split('T')[0];
          }
        } else {
          startDate = new Date().toISOString().split('T')[0];
        }

        // Sumamos los meses especificados en `num_rentas_aplicadas`
        const endDateWithMonths = addMonths(startDate, parseInt(num_rentas_aplicadas, 10));
        //const endDateWithMonths = addMonths(startDate, parseInt(valorInput3, 10));
        // Configuramos la fecha al próximo mes y asignamos el día de `ultimo_dia_ultima_renta`
        const endDateAdjusted = new Date(endDateWithMonths.getFullYear(), endDateWithMonths.getMonth(), parseInt(ultimo_dia_ultima_renta, 10));

        this.formGroup.get('periodo_finalizacion')?.patchValue(endDateAdjusted, { emitEvent: false });
      }
    });
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

  minCurrentValueValidator(minValue: number): ValidatorFn {
    return (control: AbstractControl): { [key: string]: any } | null => {
      if (!control.value) {
        return null;
      }
      return control.value >= minValue ? null : { 'valueTooLow': { value: control.value } };
    };
  }

  getRangeFormGroup(fieldName: string): FormGroup {
    const control = this.formGroup.get(fieldName);
    if (control instanceof FormGroup) {
      return control;
    } else {
      console.warn(`No FormGroup found for field: ${fieldName}`);
      return this.fb.group({
        start: [''],
        end: ['']
      });
    }
  }

}
