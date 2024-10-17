import { Component, Inject, OnInit } from '@angular/core';
import { FormArray, FormBuilder, FormGroup, Validators } from '@angular/forms';
import { MAT_DIALOG_DATA, MatDialogRef } from '@angular/material/dialog';
import { ToastrService } from 'ngx-toastr';
import { AfiliacionService } from 'src/app/services/afiliacion.service';

@Component({
  selector: 'app-agregar-referencias-personales',
  templateUrl: './agregar-referencias-personales.component.html',
  styleUrls: ['./agregar-referencias-personales.component.scss']
})
export class AgregarReferenciasPersonalesComponent implements OnInit {
  formReferencias: FormGroup;
  tipo_referencia: any[] = [];
  parentesco: any[] = [];

  constructor(
    private fb: FormBuilder,
    private toastr: ToastrService,
    private afilService: AfiliacionService,
    private dialogRef: MatDialogRef<AgregarReferenciasPersonalesComponent>,
    @Inject(MAT_DIALOG_DATA) public data: { idPersona: number }
  ) {
    this.formReferencias = this.fb.group({
      refpers: this.fb.array([], [Validators.required])
    });
  }

  ngOnInit(): void {
    this.cargarDatosEstaticos();
  }

  get referencias(): FormArray {
    return this.formReferencias.get('refpers') as FormArray;
  }

  agregarReferencia(datos?: any): void {
    const referenciaForm = this.fb.group({
      tipo_referencia: [datos?.tipo_referencia || '', [Validators.required]],
      primer_nombre: [datos?.primer_nombre || '', [Validators.required]],
      segundo_nombre: [datos?.segundo_nombre || ''],
      tercer_nombre: [datos?.tercer_nombre || ''],
      primer_apellido: [datos?.primer_apellido || '', [Validators.required]],
      segundo_apellido: [datos?.segundo_apellido || ''],
      direccion: [datos?.direccion || ''],
      telefono_domicilio: [datos?.telefono_domicilio || ''],
      telefono_trabajo: [datos?.telefono_trabajo || ''],
      telefono_personal: [datos?.telefono_personal || ''],
      parentesco: [datos?.parentesco || '', [Validators.required]],
      n_identificacion: [datos?.n_identificacion || ''],
    });
    this.referencias.push(referenciaForm);
  }

  eliminarReferencia(index: number): void {
    if (this.referencias.length > 0) {
      this.referencias.removeAt(index);
    }
  }

  cargarDatosEstaticos(): void {
    // Simulando la carga de datos para tipo de referencia y parentesco
    this.tipo_referencia = [
      { label: 'REFERENCIA PERSONAL', value: 'REFERENCIA PERSONAL' },
      { label: 'REFERENCIA FAMILIAR', value: 'REFERENCIA FAMILIAR' }
    ];

    this.parentesco = [
      { label: 'Padre', value: 'Padre' },
      { label: 'Madre', value: 'Madre' },
      { label: 'Hermano/a', value: 'Hermano/a' },
      { label: 'Amigo/a', value: 'Amigo/a' },
    ];
  }

  guardarReferencias() {
    if (!this.formReferencias.get('refpers')) {
      this.toastr.error('No hay referencias para guardar');
      return;
    }

    const referencias = this.formatReferencias(this.formReferencias.value.refpers);

    this.afilService.agregarReferencias(this.data.idPersona, referencias).subscribe(
      (res: any) => {
        if (res.length > 0) {
          this.toastr.success("Referencia personal agregada con éxito");
          this.dialogRef.close(true);
        }
      },
      (error) => {
        this.toastr.error('Error al agregar referencias personales');
        console.error('Error al agregar referencias personales:', error);
      }
    );
  }

  private formatReferencias(refpers: any[]): any[] {
    return refpers.map(referencia => ({
      tipo_referencia: referencia.tipo_referencia,
      parentesco: referencia.parentesco,
      primer_nombre: referencia.primer_nombre,
      segundo_nombre: referencia.segundo_nombre,
      tercer_nombre: referencia.tercer_nombre,
      primer_apellido: referencia.primer_apellido,
      segundo_apellido: referencia.segundo_apellido,
      telefono_domicilio: referencia.telefono_domicilio,
      telefono_trabajo: referencia.telefono_trabajo,
      telefono_personal: referencia.telefono_personal,
      n_identificacion: referencia.n_identificacion,
      direccion: referencia.direccion,
    }));
  }

  cerrar(): void {
    this.dialogRef.close();
  }
}
