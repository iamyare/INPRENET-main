import { Component, Inject, OnInit } from '@angular/core';
import { FormBuilder, FormControl, FormGroup, Validators } from '@angular/forms';
import { MAT_DIALOG_DATA, MatDialogRef } from '@angular/material/dialog';

interface Campo {
  nombre: string;
  tipo: string; // 'text', 'number', 'list', etc.
  requerido: boolean;
  etiqueta?: string;
  editable?: boolean;
  opciones?: { valor: any, etiqueta: string }[];
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
    console.log(this.data.valoresIniciales);

    const isFormDisabled = this.data.valoresIniciales['estado_aplicacion'] === 'COBRADA' || this.data.valoresIniciales['fecha_aplicado']
    this.data.valoresIniciales['codigo_planilla'] !== 'No ha sido asignado';

    this.data.campos.forEach(campo => {
      const validaciones = [];
      if (campo.requerido) validaciones.push(Validators.required);

      if (campo.tipo === 'list') {
        const valorInicial = this.data.valoresIniciales[campo.nombre];
        group[campo.nombre] = {
          value: valorInicial || null,
          disabled: isFormDisabled
        };
      } else {
        group[campo.nombre] = { value: this.data.valoresIniciales[campo.nombre] || '', disabled: isFormDisabled };
      }
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
}
