
import { ChangeDetectorRef, Component, Inject, OnInit, QueryList, ViewChild, ViewChildren, Output, EventEmitter } from '@angular/core';
import { AbstractControl, FormBuilder, FormControl, FormGroup, ValidatorFn, Validators } from '@angular/forms';
import { MatDatepicker } from '@angular/material/datepicker';
import { MAT_DIALOG_DATA, MatDialogRef } from '@angular/material/dialog';
import { addMonths, endOfMonth, format, parseISO } from 'date-fns';

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
    @Inject(MAT_DIALOG_DATA) public data: {
      campos: Campo[];
      valoresIniciales: { [key: string]: any };
      validacionesDinamicas?: { [key: string]: ValidatorFn[] }; // 🔹 Agregamos validaciones dinámicas opcionales
    },
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
      let validadores = campo.validadores || [];

      // 🔹 Si existen validaciones dinámicas para este campo, las agregamos
      if (this.data.validacionesDinamicas && this.data.validacionesDinamicas[campo.nombre]) {
        validadores = [...validadores, ...this.data.validacionesDinamicas[campo.nombre]];
      }

      if (campo.tipo === 'daterange') {
        group[campo.nombre] = this.fb.group({
          start: [this.convertToDate(valorInicial?.start) || null, validadores],
          end: [this.convertToDate(valorInicial?.end) || null, validadores]
        });
      } else if (campo.tipo === 'date') {
        group[campo.nombre] = new FormControl(
          { value: this.convertToDate(valorInicial), disabled: !campo.editable },
          validadores
        );
      } else {
        group[campo.nombre] = new FormControl({ value: valorInicial, disabled: !campo.editable }, validadores);
      }
    });

    this.formGroup = this.fb.group(group);
    this.cdr.detectChanges();
  }

  convertToDate(value: string | Date): Date {
    if (value instanceof Date) {
      return value;
    }

    if (typeof value === 'string') {
      // Extraemos los componentes de la fecha
      const [year, month, day] = value.split('-').map(Number);

      // Creamos la fecha ajustándola directamente como local sin desfase
      return new Date(year, month - 1, day); // `month - 1` porque los meses empiezan desde 0 en JavaScript
    }

    // Retornamos una fecha por defecto si el valor no es válido
    return new Date();
  }

  escucharCambiosFormulario() {
    this.formGroup.valueChanges.subscribe(() => {
      const values = this.formGroup.getRawValue();

      let {
        num_rentas_pagar_primer_pago,
        monto_por_periodo,
        num_rentas_aplicadas,
        ultimo_dia_ultima_renta,
        fecha_calculo,
        monto_total,
        monto_ultima_cuota
      } = values;

      // Actualizar `monto_total` si se cumple la condición
      if (monto_total !== undefined && monto_por_periodo && monto_ultima_cuota) {
        const nuevomonto_por_periodo =
          monto_por_periodo * (num_rentas_aplicadas || 0) + monto_ultima_cuota;

        this.formGroup
          .get('monto_total')
          ?.patchValue(nuevomonto_por_periodo.toFixed(2), { emitEvent: false });
        values.monto_total = nuevomonto_por_periodo.toFixed(2)
      }

      // Calcular `periodo_finalizacion` basado en `fecha_calculo`
      let startDate: Date = new Date();
      if (num_rentas_aplicadas !== undefined) {
        // Ajustar la fecha al próximo mes y día especificado
        if (fecha_calculo) {
          if (typeof fecha_calculo === 'string') {
            startDate = parseISO(fecha_calculo);
          } else if (fecha_calculo instanceof Date) {
            startDate = fecha_calculo;
          } else {
            console.error('El formato de fecha no es válido.');
            return;
          }
        }

        // Asegúrate de que el número de meses no sea negativo
        let meses: number = Math.max(num_rentas_aplicadas - 1, 0);

        const endDateWithMonths = addMonths(startDate, meses);

        let endDateAdjusted: Date | null = null;

        const endOfMonthDate = endOfMonth(endDateWithMonths); // Último día del mes resultante
        let localEndOfMonthDate = new Date(endOfMonthDate.getTime() - (endOfMonthDate.getTimezoneOffset() * 60000));

        const lastDay = parseInt(ultimo_dia_ultima_renta, 10);

        monto_ultima_cuota = (monto_ultima_cuota === null) ? "" : monto_ultima_cuota;
        ultimo_dia_ultima_renta = (ultimo_dia_ultima_renta === null) ? "" : ultimo_dia_ultima_renta;

        if ((monto_ultima_cuota === '' || monto_ultima_cuota === 0) && (ultimo_dia_ultima_renta === '' || ultimo_dia_ultima_renta === 0)) {
          endDateAdjusted = localEndOfMonthDate;

        } else if ((monto_ultima_cuota !== '' && monto_ultima_cuota !== 0) && (ultimo_dia_ultima_renta !== '' && ultimo_dia_ultima_renta !== 0)) {

          let tem = new Date(endDateWithMonths);
          tem.setMonth(tem.getMonth() + 1);
          endDateAdjusted = new Date(tem.getFullYear(), tem.getMonth(), lastDay + 1);
        }

        else if (monto_ultima_cuota !== '' && monto_ultima_cuota !== 0) {
          let endDateWithMonths = addMonths(startDate, meses + 1);
          let tem = new Date(endDateWithMonths);
          tem.setMonth(tem.getMonth() + 1);
          endDateAdjusted = new Date(tem.getFullYear(), tem.getMonth());
          console.log(endDateAdjusted);

        }

        else if (ultimo_dia_ultima_renta !== '' && ultimo_dia_ultima_renta !== 0) {
          let endDateWithMonths = addMonths(startDate, meses + 1);
          let tem = new Date(endDateWithMonths);
          tem.setMonth(tem.getMonth());
          endDateAdjusted = new Date(tem.getFullYear(), tem.getMonth(), lastDay + 1);
        }


        // Verificar que endDateAdjusted no sea null antes de formatear
        if (endDateAdjusted) {
          // Ajustar la fecha a la zona horaria local
          const fechaLocal = new Date(endDateAdjusted.getTime() - (endDateAdjusted.getTimezoneOffset() * 60000));

          this.formGroup
            .get('periodo_finalizacion')
            ?.patchValue(fechaLocal, { emitEvent: false });

          values.periodo_finalizacion = endDateAdjusted;
        }

        this.formUpdated.emit(values); // Emitir cambios del formulario
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

    const errors: string[] = [];
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
    if (control.errors['excedeTotal']) {
      errors.push('Excede la suma total de los porcentajes');
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
