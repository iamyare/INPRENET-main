import { ChangeDetectorRef, Component, Inject, OnInit, ViewChild } from '@angular/core';
import { AbstractControl, FormBuilder, FormControl, FormGroup, ValidatorFn, Validators } from '@angular/forms';
import { MatDatepicker } from '@angular/material/datepicker';
import { MAT_DIALOG_DATA, MatDialogRef } from '@angular/material/dialog';

interface Campo {
  nombre: string;
  tipo: string;
  requerido: boolean;
  etiqueta?: string;
  editable?: boolean;
  opciones?: { value: any, label: string }[];
  dependeDe?: string; // Nombre del campo del cual depende
  valorDependiente?: any; // Valor del campo dependiente para mostrar este campo
}

@Component({
  selector: 'app-editar-dialog',
  templateUrl: './editar-dialog.component.html',
  styleUrls: ['./editar-dialog.component.scss']
})
export class EditarDialogComponent implements OnInit {
  form: FormGroup;
  @ViewChild(MatDatepicker) picker!: MatDatepicker<Date>;

  constructor(
    private fb: FormBuilder,
    private dialogRef: MatDialogRef<EditarDialogComponent>,
    @Inject(MAT_DIALOG_DATA) public data: { campos: Campo[], valoresIniciales: { [key: string]: any } },
    private cdr: ChangeDetectorRef
  ) {
    this.form = this.fb.group({});
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

        if (fecha) {
          valorInicial = fecha;
        } else {
          console.warn(`Fecha inválida para ${campo.nombre}:`, valorInicial);
          valorInicial = '';
        }
      }

      const validaciones = campo.requerido ? [Validators.required] : [];
      group[campo.nombre] = new FormControl(
        { value: valorInicial, disabled: !campo.editable },
        validaciones
      );
    });

    this.form = this.fb.group(group);
    this.cdr.detectChanges();
  }



  convertToDate(dateString: string): Date | null {
    const [day, month, year] = dateString.split('/').map(Number);
    const date = new Date(year, month - 1, day);
    return isNaN(date.getTime()) ? null : date;
  }

  guardar() {
    const formValues = this.form.value;
    if (formValues.fechaNacimiento instanceof Date) {
      const year = formValues.fechaNacimiento.getFullYear();
      const month = (formValues.fechaNacimiento.getMonth() + 1).toString().padStart(2, '0');
      const day = formValues.fechaNacimiento.getDate().toString().padStart(2, '0');

      formValues.fechaNacimiento = `${year}-${month}-${day}`;
    }

    if (this.form.valid) {
      this.dialogRef.close(formValues);
    }
  }


  cerrar() {
    this.dialogRef.close();
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
