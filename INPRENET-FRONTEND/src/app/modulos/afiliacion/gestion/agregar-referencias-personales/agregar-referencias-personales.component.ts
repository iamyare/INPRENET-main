import { Component, Inject } from '@angular/core';
import { FormArray, FormBuilder, FormGroup, Validators } from '@angular/forms';
import { MAT_DIALOG_DATA, MatDialogRef } from '@angular/material/dialog';
import { ToastrService } from 'ngx-toastr';
import { AfiliadoService } from 'src/app/services/afiliado.service';

@Component({
  selector: 'app-agregar-referencias-personales',
  templateUrl: './agregar-referencias-personales.component.html',
  styleUrl: './agregar-referencias-personales.component.scss'
})
export class AgregarReferenciasPersonalesComponent {
  form = this.fb.group({
  });

  dataReferenciasP: any
  formReferencias: any = new FormGroup(
    {
      refpers: new FormArray([], [Validators.required])
    });

  constructor(
    private toastr: ToastrService,
    private fb: FormBuilder,
    private dialogRef: MatDialogRef<AgregarReferenciasPersonalesComponent>,
    private afilService: AfiliadoService,
    @Inject(MAT_DIALOG_DATA) public data: { idPersona: number }
  ) { }

  ngOnInit(): void { }

  setDatosRefPer(datosRefPer: any) {
    this.formReferencias = datosRefPer
  }

  guardar() {
    this.afilService.createReferPersonales(String(this.data.idPersona), this.formReferencias.value.refpers).subscribe(
      (res: any) => {
        console.log(res);

        if (res.length > 0) {
          this.toastr.success("Referencia personal agregada con éxito");
          this.cerrar();
        }
      },
      (error) => {
        this.toastr.error(error);
        console.error('Error al agregar referencias personales pertenecientes al afiliado', error);
      }
    );
  }

  cerrar() {
    this.dialogRef.close();
  }

}
