import { Component, Inject } from '@angular/core';
import { FormBuilder, FormGroup } from '@angular/forms';
import { MAT_DIALOG_DATA, MatDialogRef } from '@angular/material/dialog';
import { ToastrService } from 'ngx-toastr';
import { AfiliacionService } from 'src/app/services/afiliacion.service';

@Component({
  selector: 'app-agregar-puest-trab',
  templateUrl: './agregar-puest-trab.component.html',
  styleUrls: ['./agregar-puest-trab.component.scss']
})
export class AgregarPuestTrabComponent{
  formPuestTrab: FormGroup;

  constructor(
    private fb: FormBuilder,
    private afiliacionService: AfiliacionService,
    private toastr: ToastrService,
    private dialogRef: MatDialogRef<AgregarPuestTrabComponent>,
    @Inject(MAT_DIALOG_DATA) public data: { idPersona: string }
  ) {
    this.formPuestTrab = this.fb.group({
      trabajo: this.fb.array([])
    });
  }

  guardar() {
    const datosParseados = this.formPuestTrab.value.trabajo;

    this.afiliacionService.asignarCentrosTrabajoAPersona(Number(this.data.idPersona), datosParseados).subscribe(
      (res: any) => {
        if (res.length > 0) {
          this.toastr.success("Centro de trabajo agregado con éxito");
          this.cerrar();
        }
      },
      (error) => {
        this.toastr.error("Error al crear el centro de trabajo");
        console.error('Error al crear centros de trabajo pertenecientes al afiliado', error);
      }
    );
  }

  cerrar() {
    this.dialogRef.close();
  }
}
