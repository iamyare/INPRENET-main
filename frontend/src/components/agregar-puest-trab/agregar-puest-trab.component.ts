import { Component, Inject } from '@angular/core';
import { FormArray, FormBuilder, FormGroup, Validators } from '@angular/forms';
import { MAT_DIALOG_DATA, MatDialogRef } from '@angular/material/dialog';
import { generateFormArchivo } from '@docs-components/botonarchivos/botonarchivos.component';
import { generateDatBancFormGroup } from '@docs-components/dat-banc/dat-banc.component';
import { generateAddressFormGroup } from '@docs-components/dat-generales-afiliado/dat-generales-afiliado.component';
import { ToastrService } from 'ngx-toastr';
import { AfiliadoService } from 'src/app/services/afiliado.service';
import { convertirFechaInputs } from 'src/app/shared/functions/formatoFecha';

@Component({
  selector: 'app-agregar-puest-trab',
  templateUrl: './agregar-puest-trab.component.html',
  styleUrl: './agregar-puest-trab.component.scss'
})
export class AgregarPuestTrabComponent {
  form = this.fb.group({
  });
  formPuestTrab: any = new FormGroup(
    {
      refpers: new FormArray([], [Validators.required])
    });

  constructor(private fb: FormBuilder, private afilService: AfiliadoService,
    private toastr: ToastrService,
    private dialogRef: MatDialogRef<AgregarPuestTrabComponent>,
    @Inject(MAT_DIALOG_DATA) public data: { idPersona: string }
  ) { }
  ngOnInit(): void { }

  setDatosPuetTrab1(datosPuestTrab: any) {
    this.formPuestTrab = datosPuestTrab
  }

  guardar() {
    console.log(this.formPuestTrab);

    const datosParseados = this.formPuestTrab.value.trabajo.map((dato: any) => {
      const fechaIngresoFormateada = convertirFechaInputs(dato.fechaIngreso.toISOString());
      const fechaEgresoFormateada = convertirFechaInputs(dato.fechaEgreso.toISOString());

      return {
        ...dato,
        fechaIngreso: fechaIngresoFormateada,
        fechaEgreso: fechaEgresoFormateada
      };

    });

    this.afilService.createCentrosTrabajo(this.data.idPersona, datosParseados).subscribe(
      (res: any) => {
        if (res.length > 0) {
          /* this.formPuestTrab.reset(); */
          this.toastr.success("Centro de trabajo agregado con éxito");
          this.cerrar();
        }
      },
      (error) => {
        this.toastr.error(error);
        console.error('Error al crear centros de trabajo pertenecientes al afiliado', error);
      }
    );

  }

  cerrar() {
    this.dialogRef.close();
  }
}
