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
  form = this.fb.group({});
  formReferencias: FormGroup;

  constructor(
    private toastr: ToastrService,
    private fb: FormBuilder,
    private dialogRef: MatDialogRef<AgregarReferenciasPersonalesComponent>,
    private afilService: AfiliacionService,
    @Inject(MAT_DIALOG_DATA) public data: { idPersona: number }
  ) {
    this.formReferencias = this.fb.group({
      refpers: this.fb.array([], [Validators.required])
    });
  }

  ngOnInit(): void {
    // Any additional initialization logic if needed
  }

  setDatosRefPer(datosRefPer: any) {
    if (datosRefPer && datosRefPer.referencias) {
      this.formReferencias.setControl('refpers', this.fb.array(datosRefPer.referencias, [Validators.required]));
    }
  }

  guardar() {
    if (!this.formReferencias.get('refpers')) {
      this.toastr.error('No hay referencias para guardar');
      return;
    }

    const referencias = this.formReferencias.value.refpers.map((ref: any) => ({
      tipo_referencia: ref.tipo_referencia,
      parentesco: ref.parentesco,
      persona_referencia: {
        id_tipo_identificacion: ref.id_tipo_identificacion,
        n_identificacion: ref.n_identificacion,
        primer_nombre: ref.primer_nombre,
        segundo_nombre: ref.segundo_nombre,
        tercer_nombre: ref.tercer_nombre,
        primer_apellido: ref.primer_apellido,
        segundo_apellido: ref.segundo_apellido,
        sexo: ref.sexo,
        telefono_1: ref.telefono_personal,
        telefono_2: ref.telefono_trabajo,
        telefono_3: ref.telefono_domicilio,
        direccion_residencia: ref.direccion
      }
    }));

    this.afilService.agregarReferencias(this.data.idPersona, referencias).subscribe(
      (res: any) => {
        console.log(res);
        if (res.length > 0) {
          this.toastr.success("Referencia personal agregada con éxito");
          this.cerrar();
        }
      },
      (error) => {
        this.toastr.error('Error al agregar referencias personales');
        console.error('Error al agregar referencias personales:', error);
      }
    );
  }

  cerrar() {
    this.dialogRef.close();
  }
}
