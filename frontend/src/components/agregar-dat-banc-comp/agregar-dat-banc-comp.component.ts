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
    ) {
      this.formHistPag = this.fb.group({
        banco: this.fb.array([])
      });
    }

  ngOnInit(): void { }

  setHistSal(datosHistSal: any) {
    const bancoArray = this.formHistPag.get('banco') as FormArray;
    bancoArray.clear();
    if (datosHistSal && datosHistSal.banco && Array.isArray(datosHistSal.banco)) {
      datosHistSal.banco.forEach((banco:any) => {
        bancoArray.push(this.fb.group({
          idBanco: [banco.idBanco, Validators.required],
          numCuenta: [banco.numCuenta, Validators.required]
        }));
      });
    } else {
      console.error('Datos de historial bancario no son válidos:', datosHistSal);
    }
  }

  guardar() {
    if (this.formHistPag.valid) {
      this.afilService.createDatosBancarios(this.data.idPersona, this.formHistPag.value.banco).subscribe(
        (res: any) => {
          if (res.length > 0) {
            this.toastr.success("Dato Bancario agregado con éxito");
            this.cerrar();
            this.formHistPag.reset();
          }
        },
        (error) => {
          this.toastr.error(error);
          console.error('Error al guardar datos bancarios', error);
        }
      );
    } else {
      this.toastr.error("El formulario contiene errores.");
    }
  }

  cerrar() {
    this.dialogRef.close();
  }

}
