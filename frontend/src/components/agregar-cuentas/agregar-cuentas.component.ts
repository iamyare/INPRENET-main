import { Component, Inject } from '@angular/core';
import { FormArray, FormBuilder, FormGroup, Validators } from '@angular/forms';
import { MAT_DIALOG_DATA, MatDialogRef } from '@angular/material/dialog';
import { AgregarPuestTrabComponent } from '@docs-components/agregar-puest-trab/agregar-puest-trab.component';
import { ToastrService } from 'ngx-toastr';
import { AfiliadoService } from 'src/app/services/afiliado.service';
import { TransaccionesService } from 'src/app/services/transacciones.service';
import { convertirFechaInputs } from 'src/app/shared/functions/formatoFecha';

@Component({
  selector: 'app-agregar-cuentas',
  templateUrl: './agregar-cuentas.component.html',
  styleUrl: './agregar-cuentas.component.scss'
})
export class AgregarCuentasComponent {
  form = this.fb.group({
  });
  formPuestTrab: any = new FormGroup(
    {
      refpers: new FormArray([], [Validators.required])
    });

  constructor(private fb: FormBuilder,
    private afilService: AfiliadoService,
    private transaccionesSVC: TransaccionesService,
    private toastr: ToastrService,
    private dialogRef: MatDialogRef<AgregarPuestTrabComponent>,
    @Inject(MAT_DIALOG_DATA) public data: { idPersona: number }
  ) { }
  ngOnInit(): void { }

  setDatosPuetTrab1(datosPuestTrab: any) {
    this.formPuestTrab = datosPuestTrab
  }

  guardar() {
    const datosParseados = this.formPuestTrab.trabajo.map((dato: any) => {

      return {
        ...dato
      };

    });

    this.transaccionesSVC.crearCuenta(this.data.idPersona, datosParseados).subscribe(
      (res: any) => {
        this.toastr.success("Cuenta agregada con éxito");
        this.cerrar();
        /* if (res.length > 0) {
          //this.formPuestTrab.reset(); 
        } */
      },
      (error) => {
        this.toastr.error(error);
        console.error('Error al crear cuenta perteneciente al afiliados', error);
      }
    );

  }

  cerrar() {
    this.dialogRef.close();
  }
}
