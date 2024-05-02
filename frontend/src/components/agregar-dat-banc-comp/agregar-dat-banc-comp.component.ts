import { Component, Inject } from '@angular/core';
import { FormArray, FormBuilder, FormGroup, Validators } from '@angular/forms';
import { MAT_DIALOG_DATA, MatDialogRef } from '@angular/material/dialog';
import { ToastrService } from 'ngx-toastr';
import { AfiliadoService } from 'src/app/services/afiliado.service';

@Component({
  selector: 'app-agregar-dat-banc-comp',
  templateUrl: './agregar-dat-banc-comp.component.html',
  styleUrl: './agregar-dat-banc-comp.component.scss'
})
export class AgregarDatBancCompComponent {
  form = this.fb.group({
  });

  formHistPag: any = new FormGroup(
    {
      refpers: new FormArray([], [Validators.required])
    });

    constructor(private fb: FormBuilder, private afilService: AfiliadoService,
      private dialogRef: MatDialogRef<AgregarDatBancCompComponent>, 
      private toastr: ToastrService,
      @Inject(MAT_DIALOG_DATA) public data: { idPersona: string } 
    ) {}

    ngOnInit(): void {}

    setHistSal(datosHistSal: any) {
      this.formHistPag = datosHistSal
    }

    guardar(){
      this.afilService.createDatosBancarios(this.data.idPersona, this.formHistPag.value.refpers).subscribe(
        (res: any) => {
          if (res.length>0) {
            this.formHistPag.reset();
            this.toastr.success("Dato Bancario agregado con éxito");
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
