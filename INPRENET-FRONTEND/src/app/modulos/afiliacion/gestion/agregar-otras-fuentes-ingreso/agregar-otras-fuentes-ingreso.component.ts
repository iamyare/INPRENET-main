import { Component, Inject } from '@angular/core';
import { FormBuilder, FormGroup, FormArray } from '@angular/forms';
import { MAT_DIALOG_DATA, MatDialogRef } from '@angular/material/dialog';
import { ToastrService } from 'ngx-toastr';
import { AfiliacionService } from 'src/app/services/afiliacion.service';

@Component({
  selector: 'app-agregar-otras-fuentes-ingreso',
  templateUrl: './agregar-otras-fuentes-ingreso.component.html',
  styleUrls: ['./agregar-otras-fuentes-ingreso.component.scss']
})
export class AgregarOtrasFuentesIngresoComponent {
  formOtrasFuentesIngreso: FormGroup;

  constructor(
    private fb: FormBuilder,
    private afiliacionService: AfiliacionService,
    private toastr: ToastrService,
    private dialogRef: MatDialogRef<AgregarOtrasFuentesIngresoComponent>,
    @Inject(MAT_DIALOG_DATA) public data: { idPersona: string }
  ) {
    this.formOtrasFuentesIngreso = this.fb.group({
      otrasFuentesIngreso: this.fb.array([])
    });
  }

  get fuentesIngreso(): FormArray {
    return this.formOtrasFuentesIngreso.get('otrasFuentesIngreso') as FormArray;
  }

  guardar() {
    const datosParseados = this.formOtrasFuentesIngreso.value.otrasFuentesIngreso;

    this.afiliacionService.asignarFuentesIngresoAPersona(Number(this.data.idPersona), datosParseados).subscribe(
      (res: any) => {
        if (res.length > 0) {
          this.toastr.success("Fuente de ingreso agregada con éxito");
          this.cerrar();
        }
      },
      (error) => {
        this.toastr.error("Error al agregar la fuente de ingreso");
        console.error('Error al agregar fuentes de ingreso al afiliado', error);
      }
    );
  }

  cerrar() {
    this.dialogRef.close();
  }
}
