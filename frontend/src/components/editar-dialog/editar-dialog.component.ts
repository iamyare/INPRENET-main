import { Component, Inject, OnInit } from '@angular/core';
import { AbstractControl, FormBuilder, FormControl, FormGroup, ValidatorFn, Validators } from '@angular/forms';
import { MAT_DIALOG_DATA, MatDialogRef } from '@angular/material/dialog';

interface Campo {
  nombre: string;
  tipo: string;
  requerido: boolean;
  etiqueta?: string;
  editable?: boolean;
  opciones?: { valor: any, etiqueta: string }[];
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

  constructor(
    private fb: FormBuilder,
    private dialogRef: MatDialogRef<EditarDialogComponent>,
    @Inject(MAT_DIALOG_DATA) public data: { campos: Campo[], valoresIniciales: { [key: string]: any } }
  ) {
    this.form = this.fb.group({});
  }

  ngOnInit(): void {
    this.crearFormulario();
  }

  crearFormulario() {
    const group: { [key: string]: any } = {};

    /* const isFormDisabled = this.data.valoresIniciales['estado_aplicacion'] === 'COBRADA' ||
    this.data.valoresIniciales['codigo_planilla'] !== 'No ha sido asignado'; */
    const isFormDisabled = false;
    this.data.campos.forEach(campo => {
      const validaciones = [];
      if (campo.requerido) {
        validaciones.push(Validators.required);  // Agrega validación para campos requeridos
      }
      if (campo.nombre === 'prestamos') {
        const valorInicialPrestamo = this.data.valoresIniciales[campo.nombre];
        validaciones.push(this.minCurrentValueValidator(valorInicialPrestamo));
      }
      if (campo.tipo === 'list') {
        const valorInicial = this.data.valoresIniciales[campo.nombre];
        group[campo.nombre] = new FormControl({ value: valorInicial || null, disabled: isFormDisabled });
      } else {
        group[campo.nombre] = new FormControl({ value: this.data.valoresIniciales[campo.nombre] || '', disabled: isFormDisabled });
      }
      group[campo.nombre].setValidators(validaciones);
    });
    this.form = this.fb.group(group);
    if (isFormDisabled) {
      this.form.disable();
    }
  }



  guardar() {
    if (this.form.valid) {
      this.dialogRef.close(this.form.value);
    }
  }

  cerrar() {
    this.dialogRef.close();
  }

  minCurrentValueValidator(minValue: number): ValidatorFn {
    return (control: AbstractControl): { [key: string]: any } | null => {
      if (!control.value) {
        return null;
      }
      return control.value >= minValue ? null : { 'valueTooLow': { value: control.value } };
    };
  }
}
