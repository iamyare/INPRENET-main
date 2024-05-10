import { Component, Inject } from '@angular/core';
import { FormArray, FormBuilder, FormGroup, Validators } from '@angular/forms';
import { MAT_DIALOG_DATA, MatDialogRef } from '@angular/material/dialog';
import { ToastrService } from 'ngx-toastr';
import { AfiliadoService } from 'src/app/services/afiliado.service';

@Component({
  selector: 'app-agregar-benef-comp',
  templateUrl: './agregar-benef-comp.component.html',
  styleUrl: './agregar-benef-comp.component.scss'
})
export class AgregarBenefCompComponent {
  form = this.fb.group({
  });
  formBeneficiarios: any = new FormGroup(
    {
      refpers: new FormArray([], [Validators.required])
    });

  constructor(
    private fb: FormBuilder,
    private afilService: AfiliadoService,
    @Inject(MAT_DIALOG_DATA) public data: { idPersona: string },
    private dialogRef: MatDialogRef<AgregarBenefCompComponent>,
    private toastr: ToastrService,
  ) { }

  ngOnInit(): void { }

  setDatosBen(DatosBancBen: any) {
    this.formBeneficiarios = DatosBancBen
  }
  /* CAMBIAR BENEFICIARIOS */
  guardar() {
    this.formBeneficiarios.value.beneficiario = this.formBeneficiarios.value.beneficiario.map((item: any) => ({
      ...item,
      porcentaje: item.porcentaje.porcBenef,
    }));

    /* CAMBIAR BENEFICIARIOS */
    const dataBeneficiarios = {
      beneficiarios: this.formBeneficiarios.value.beneficiario
    }

    this.afilService.createBeneficiarios(this.data.idPersona, dataBeneficiarios).subscribe(
      (res: any) => {
        if (res.length > 0) {
          this.toastr.success("Beneficiario agregado con éxito");
          this.formBeneficiarios.reset();
          this.cerrar();
        }
      },
      (error) => {
        this.toastr.error(error);
        console.error('Error al obtener afiliados', error);
      }
    );
  }

  cerrar() {
    this.dialogRef.close();
  }
}