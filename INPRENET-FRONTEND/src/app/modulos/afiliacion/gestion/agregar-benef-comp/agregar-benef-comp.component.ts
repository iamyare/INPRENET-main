import { Component, Inject, OnInit } from '@angular/core';
import { FormBuilder, FormGroup, FormArray } from '@angular/forms';
import { MAT_DIALOG_DATA, MatDialogRef } from '@angular/material/dialog';
import { ToastrService } from 'ngx-toastr';
import { AfiliacionService } from 'src/app/services/afiliacion.service';
import { DatosEstaticosService } from 'src/app/services/datos-estaticos.service';
import pdfMake from 'pdfmake/build/pdfmake';
import { HttpClient } from '@angular/common/http';

@Component({
  selector: 'app-agregar-benef-comp',
  templateUrl: './agregar-benef-comp.component.html',
  styleUrls: ['./agregar-benef-comp.component.scss']
})
export class AgregarBenefCompComponent implements OnInit {
  formBeneficiarios: FormGroup;
  tipoDiscapacidad: any[] = [];
  porcentajeDisponible: number;
  persona: any = null;
  perfil: any = null;
  beneficiarios: any[] = [];
  backgroundImageBase64: string = '';

  constructor(
    private fb: FormBuilder,
    private afiliacionService: AfiliacionService,
    private toastr: ToastrService,
    private dialogRef: MatDialogRef<AgregarBenefCompComponent>,
    private http: HttpClient,
    private datosEstaticosService: DatosEstaticosService,
    @Inject(MAT_DIALOG_DATA) public data: { idPersona: string, id_detalle_persona: number, porcentajeDisponible: number }
  ) {
    this.formBeneficiarios = this.fb.group({
      beneficiario: this.fb.array([])
    });
    this.porcentajeDisponible = data.porcentajeDisponible;
    this.convertirImagenABase64('../../../../../assets/images/membratadoFinal.jpg').then(base64 => {
      this.backgroundImageBase64 = base64;
    }).catch(error => {
      console.error('Error al enviar los datos:', error);
      const errorMessage = error.error?.mensaje || 'Hubo un error al enviar los datos';
      this.toastr.error(errorMessage, 'Error');
    });
  }

  ngOnInit(): void {
    // Cargar las discapacidades
    this.datosEstaticosService.getDiscapacidades().subscribe(discapacidades => {
      this.tipoDiscapacidad = discapacidades.map(d => d.label);
    });
  }

  convertirImagenABase64(url: string): Promise<string> {
    return this.http.get(url, { responseType: 'blob' }).toPromise().then((blob:any) => {
      return new Promise<string>((resolve, reject) => {
        if (blob) {
          const reader = new FileReader();
          reader.readAsDataURL(blob);
          reader.onloadend = () => resolve(reader.result as string);
          reader.onerror = error => reject(error);
        } else {
          reject('No se pudo cargar la imagen. El blob es undefined.');
        }
      });
    });
  }

  /**
   * 📌 Obtener Persona con su perfil y beneficiarios
   */
  obtenerPersonaConPerfilYBeneficiarios(n_identificacion: string) {
    this.afiliacionService.obtenerPersonaConPerfilYBeneficiarios(n_identificacion).subscribe({
      next: (response) => {
        if (response.data) {
          this.persona = response.data.persona;
          this.perfil = response.data.perfil;
          this.beneficiarios = response.data.beneficiarios || [];
        } else {
          this.toastr.warning("No se encontraron datos asociados");
        }
      },
      error: (error) => {
        this.toastr.error("Error al obtener los datos de la persona");
        console.error("❌ Error en la carga de datos:", error);
      }
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
        genero: beneficiario.genero,
        direccion_residencia: beneficiario.direccion_residencia,
        id_municipio_residencia: beneficiario.id_municipio_residencia,
        id_municipio_nacimiento: beneficiario.id_municipio_nacimiento
      },
      discapacidades: this.formatDiscapacidades(this.mapDiscapacidades(beneficiario.discapacidades)),
      porcentaje: beneficiario.porcentaje || null,
      parentesco: beneficiario.parentesco || null
    }));

    this.afiliacionService.asignarBeneficiariosAPersona(
      Number(this.data.idPersona),
      this.data.id_detalle_persona,
      beneficiariosFormateados
    ).subscribe({
      next: (res: any) => {
        if (res.length > 0) {
          this.toastr.success("Beneficiario agregado con éxito");
          
          /* this.obtenerPersonaConPerfilYBeneficiarios(this.data.idPersona);

          setTimeout(() => {
            this.generarPDF();
          }, 1000);
           */
          this.cerrar();
        }
      },
      error: (error) => {
        this.toastr.error("Error al agregar el beneficiario");
        console.error('❌ Error al agregar beneficiarios al afiliado:', error);
      }
    });
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
