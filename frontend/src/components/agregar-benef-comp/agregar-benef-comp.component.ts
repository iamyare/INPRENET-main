import { DatePipe } from '@angular/common';
import { Component, Inject, OnInit } from '@angular/core';
import { FormArray, FormBuilder, FormGroup, Validators } from '@angular/forms';
import { MAT_DIALOG_DATA, MatDialogRef } from '@angular/material/dialog';
import { ToastrService } from 'ngx-toastr';
import { AfiliadoService } from 'src/app/services/afiliado.service';

@Component({
  selector: 'app-agregar-benef-comp',
  templateUrl: './agregar-benef-comp.component.html',
  styleUrls: ['./agregar-benef-comp.component.scss']
})
export class AgregarBenefCompComponent implements OnInit {
  form = this.fb.group({});
  formBeneficiarios: FormGroup;

  constructor(
    private fb: FormBuilder,
    @Inject(MAT_DIALOG_DATA) public data: { idPersona: string },
    private dialogRef: MatDialogRef<AgregarBenefCompComponent>,
    private toastr: ToastrService,
    private afilService: AfiliadoService,
    private datePipe: DatePipe,
  ) {
    this.formBeneficiarios = this.fb.group({
      beneficiario: this.fb.array([], [Validators.required])
    });
  }

  ngOnInit(): void {
  }

  setDatosBen(DatosBancBen: any) {
    this.formBeneficiarios = DatosBancBen;
  }

  get beneficiarios(): FormArray {
    return this.formBeneficiarios.get('beneficiario') as FormArray;
  }

  guardar() {
    const beneficiariosData = this.beneficiarios.value.map((beneficiario: any) => {
        const datosBeneficiario = beneficiario.datosBeneficiario;
        const formattedDate = this.datePipe.transform(datosBeneficiario.fecha_nacimiento, 'yyyy-MM-dd');

        const benef = {
            primer_nombre: datosBeneficiario.primer_nombre,
            segundo_nombre: datosBeneficiario.segundo_nombre,
            primer_apellido: datosBeneficiario.primer_apellido,
            segundo_apellido: datosBeneficiario.segundo_apellido,
            dni: datosBeneficiario.dni,
            fecha_nacimiento: formattedDate,
            cantidad_dependientes: datosBeneficiario.cantidad_dependientes,
            correo_1: datosBeneficiario.correo_1 || "",
            telefono_1: datosBeneficiario.telefono_1,
            id_tipo_identificacion: datosBeneficiario.id_tipo_identificacion || null,
            id_pais_nacionalidad: datosBeneficiario.id_pais,
            detalleBenef: {
                ID_CAUSANTE: this.data.idPersona,
                porcentaje: beneficiario.porcentaje,
                ID_TIPO_PERSONA: 2,
                ID_CAUSANTE_PADRE: this.data.idPersona
            }
        };

        return benef;
    });

    const payload = beneficiariosData[0];
    console.log(payload);

    this.afilService.createBeneficiarioConDetalle(payload).subscribe(
        response => {
            this.toastr.success("Beneficiarios agregados con éxito");
            this.formBeneficiarios.reset();
            this.cerrar();
        },
        error => {
            this.toastr.error("Error al agregar beneficiarios");
            console.error('Error al agregar beneficiarios', error);
        }
    );
}


cerrar() {
    this.dialogRef.close();
}

}
