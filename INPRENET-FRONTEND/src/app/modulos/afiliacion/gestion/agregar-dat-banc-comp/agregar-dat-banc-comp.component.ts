import { Component, Inject } from '@angular/core';
import { FormBuilder, FormGroup } from '@angular/forms';
import { MAT_DIALOG_DATA, MatDialogRef } from '@angular/material/dialog';
import { ToastrService } from 'ngx-toastr';
import { AfiliacionService } from 'src/app/services/afiliacion.service';

@Component({
  selector: 'app-agregar-dat-banc-comp',
  templateUrl: './agregar-dat-banc-comp.component.html',
  styleUrls: ['./agregar-dat-banc-comp.component.scss']
})
export class AgregarDatBancCompComponent {
  formBancario: FormGroup;

  constructor(
    private fb: FormBuilder,
    private afiliacionService: AfiliacionService,
    private toastr: ToastrService,
    private dialogRef: MatDialogRef<AgregarDatBancCompComponent>,
    @Inject(MAT_DIALOG_DATA) public data: { idPersona: string }
  ) {
    this.formBancario = this.fb.group({
      bancos: this.fb.array([])
    });
  }

  guardar() {
    const datosParseados = this.formBancario.value.bancos;
    this.afiliacionService.asignarBancosAPersona(Number(this.data.idPersona), datosParseados).subscribe(
      (res: any) => {
        if (res.length > 0) {
          this.toastr.success("Datos bancarios agregados con éxito");
          this.cerrar();
        }
      },
      (error) => {
        this.toastr.error("Error al agregar los datos bancarios");
        console.error('Error al agregar datos bancarios para el afiliado', error);
      }
    );
  }

  cerrar() {
    this.dialogRef.close();
  }
}
