import { Component, Inject, OnInit } from '@angular/core';
import { FormBuilder, FormGroup, FormArray } from '@angular/forms';
import { MAT_DIALOG_DATA, MatDialogRef } from '@angular/material/dialog';
import { ToastrService } from 'ngx-toastr';
import { AfiliacionService } from 'src/app/services/afiliacion.service';
import { DatosEstaticosService } from 'src/app/services/datos-estaticos.service';

@Component({
  selector: 'app-agregar-benef-comp',
  templateUrl: './agregar-benef-comp.component.html',
  styleUrls: ['./agregar-benef-comp.component.scss']
})
export class AgregarBenefCompComponent implements OnInit {
  formBeneficiarios: FormGroup;
  tipoDiscapacidad: any[] = [];

  constructor(
    private fb: FormBuilder,
    private afiliacionService: AfiliacionService,
    private toastr: ToastrService,
    private dialogRef: MatDialogRef<AgregarBenefCompComponent>,
    private datosEstaticosService: DatosEstaticosService,
    @Inject(MAT_DIALOG_DATA) public data: { idPersona: string, id_detalle_persona: number }
  ) {
    this.formBeneficiarios = this.fb.group({
      beneficiario: this.fb.array([])
    });
  }

  ngOnInit(): void {
    this.datosEstaticosService.getDiscapacidades().subscribe(discapacidades => {
      this.tipoDiscapacidad = discapacidades.map(d => d.label);
    });
  }

  guardar(): void {
    const beneficiariosFormateados = this.formBeneficiarios.value.beneficiario.map((beneficiario: any) => ({
      persona: {
        n_identificacion: beneficiario.n_identificacion,
        primer_nombre: beneficiario.primer_nombre,
        segundo_nombre: beneficiario.segundo_nombre,
        tercer_nombre: beneficiario.tercer_nombre,
        primer_apellido: beneficiario.primer_apellido,
        segundo_apellido: beneficiario.segundo_apellido,
        telefono_1: beneficiario.telefono_1,
        fecha_nacimiento: beneficiario.fecha_nacimiento,
        direccion_residencia: beneficiario.direccion_residencia,
        id_municipio_residencia: beneficiario.id_municipio_residencia,
        id_municipio_nacimiento: beneficiario.id_municipio_nacimiento
      },
      discapacidades: this.formatDiscapacidades(this.mapDiscapacidades(beneficiario.discapacidades)),
      porcentaje: beneficiario.porcentaje || null
    }));
    this.afiliacionService.asignarBeneficiariosAPersona(Number(this.data.idPersona), this.data.id_detalle_persona, beneficiariosFormateados).subscribe(
      (res: any) => {
        if (res.length > 0) {
          this.toastr.success("Beneficiario agregado con éxito");
          this.cerrar();
        }
      },
      (error) => {
        this.toastr.error("Error al agregar el beneficiario");
        console.error('Error al agregar beneficiarios al afiliado', error);
      }
    );
  }

  private mapDiscapacidades(discapacidadesArray: boolean[]): any {
    return this.tipoDiscapacidad.reduce((acc: any, tipo: string, index: number) => {
      acc[tipo] = discapacidadesArray[index];
      return acc;
    }, {});
  }

  private formatDiscapacidades(discapacidades: any): any[] {
    return Object.keys(discapacidades)
      .filter(key => discapacidades[key])
      .map(key => ({ tipo_discapacidad: key }));
  }

  cerrar(): void {
    this.dialogRef.close();
  }
}
