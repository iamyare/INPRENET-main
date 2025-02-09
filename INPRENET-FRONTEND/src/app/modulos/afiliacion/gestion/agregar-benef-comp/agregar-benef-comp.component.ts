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
          
          this.obtenerPersonaConPerfilYBeneficiarios(this.data.idPersona);

          setTimeout(() => {
            this.generarPDF();
          }, 1000);
          
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


  generarPDF() {
    if (!this.persona || !this.perfil || this.beneficiarios.length === 0) {
      this.toastr.warning("Faltan datos para generar el documento.");
      return;
    }

    const documentDefinition = this.getDocumentDefinition(this.persona, this.perfil, this.beneficiarios, this.backgroundImageBase64);
    pdfMake.createPdf(documentDefinition).download();
  }

  getDocumentDefinition(persona: any, perfil: any, beneficiarios: any[], backgroundImageBase64: string): any {
    
    beneficiarios.forEach(item => {
      item.nombre = item.nombre_completo || 'N/A';
      item.fechaNacimiento = item.fecha_nacimiento || 'N/A';
      item.identidad = item.n_identificacion || 'N/A';
      item.parentesco = item.parentesco || 'N/A';
      item.porcentaje = item.porcentaje || 'N/A';
      item.direccion_residencia = item.direccion_residencia || 'N/A';
      item.telefono_1 = item.telefono_1 || 'N/A';
    });

    // Detalles del usuario (afiliado)
    const afiliado = {
      nombre: persona.nombre_completo || 'N/A',
      grado_academico: persona.grado_academico || 'N/A',
      centroEducativo: perfil.nombre_centro_trabajo || 'N/A',
      municipioResidencia: perfil.nombre_municipio || 'N/A',
      departamentoResidencia: perfil.nombre_departamento || 'N/A',
      n_identificacion: persona.n_identificacion || 'N/A'
    };

    interface TableCell {
      text?: string;
      style?: string;
      rowSpan?: number;
      colSpan?: number;
      fillColor?: string;
      alignment?: string;
    }

    const body: TableCell[][] = [
      [
        { text: 'N°', style: 'tableHeader', fillColor: '#CCCCCC', alignment: 'center' },
        { text: 'NOMBRE COMPLETO', style: 'tableHeader', alignment: 'center' },
        { text: 'FECHA DE NACIMIENTO', style: 'tableHeader', alignment: 'center' },
        { text: 'IDENTIDAD', style: 'tableHeader', alignment: 'center' },
        { text: 'PARENTESCO', style: 'tableHeader', alignment: 'center' },
        { text: '%', style: 'tableHeader', alignment: 'center' },
      ]
    ];

    beneficiarios.forEach((item, index) => {
      const fechaNacimiento = item.fechaNacimiento
        ? new Date(item.fechaNacimiento).toLocaleDateString('es-ES', {
          day: '2-digit',
          month: '2-digit',
          year: 'numeric',
        })
        : 'N/A';

      body.push(
        [
          { text: (index + 1).toString(), rowSpan: 2, style: 'tableRowLarge', fillColor: '#CCCCCC', alignment: 'center' },
          { text: item.nombre, style: 'tableRowLarge', alignment: 'center' },
          { text: fechaNacimiento, style: 'tableRowLarge', alignment: 'center' },
          { text: item.identidad, style: 'tableRowLarge', alignment: 'center' },
          { text: item.parentesco, style: 'tableRowLarge', alignment: 'center' },
          { text: item.porcentaje, style: 'tableRowLarge', alignment: 'center' },
        ],
        [
          {},
          { text: 'DIRECCIÓN', style: 'tableRowLarge', fillColor: '#CCCCCC', alignment: 'center' },
          { text: item.direccion_residencia, style: 'tableRowLarge', colSpan: 2, alignment: 'center' },
          { text: '', style: 'tableRowLarge' },
          { text: 'TELEFONO/CEL', style: 'tableRowLarge', fillColor: '#CCCCCC', alignment: 'center' },
          { text: item.telefono_1, style: 'tableRowLarge', alignment: 'center' },
        ]
      );
    });

    return {
      background: function (currentPage: any, pageSize: any) {
        return {
          image: backgroundImageBase64,
          width: pageSize.width,
          height: pageSize.height,
          absolutePosition: { x: 0, y: 2 }
        };
      },
      content: [
        {
          text: [
            'Señores de la Comisión Interventora del INPREMA\nPresente.\n\nYo ',
            { text: afiliado.nombre, bold: true },
            ', mayor de edad, laborando como docente en el nivel ',
            { text: afiliado.grado_academico, bold: true },
            ', del Centro Educativo ',
            { text: afiliado.centroEducativo || 'NOMBRE NO DISPONIBLE', bold: true }, 
            ', ubicado en el Municipio ',
            { text: afiliado.municipioResidencia, bold: true },
            ' del Departamento ',
            { text: afiliado.departamentoResidencia, bold: true },
            ', con Identidad N°. ',
            { text: afiliado.n_identificacion, bold: true },
            ', comparezco ante el Instituto Nacional de Previsión del magisterio a registrar mis beneficiarios legales de la manera siguiente:\n\n'
          ],
          style: 'introText',
          margin: [0, 100, 0, 0]
        },
        {
          table: {
            widths: [20, '*', '*', '*', '*', '*'],
            body: body
          }
        },
        {
          text: '', 
          margin: [0, 20, 0, 0]
        },
        {
          stack: [
            {
              text: [
                'También dispongo, que si alguno de mis beneficiarios (as) designados en este instrumento falleciere, el porcentaje de él o ella asignado, se distribuya en partes iguales entre los sobrevivientes registrados. Me reservo el derecho de actualizar, modificar o cancelar la presente DESIGNACIÓN, cuando lo estime conveniente.\n\n',
                { text: 'Nota: Con esta designación dejo sin valor ni efecto la presentada anteriormente.\n\n', bold: true }
              ],
              style: 'mainText'
            },
            {
              columns: [
                {
                  width: '*',
                  stack: [
                    {
                      text: 'Lugar y Fecha: _______________________________________________________________',
                      margin: [0, 20, 0, 15]
                    },
                    {
                      text: '(f) _______________________________',
                      margin: [0, 15, 0, 0]
                    }
                  ]
                },
                {
                  width: 'auto',
                  stack: [
                    {
                      canvas: [
                        {
                          type: 'rect',
                          x: 0,
                          y: 0,
                          w: 80,
                          h: 80,
                          lineWidth: 1,
                          lineColor: 'black'
                        }
                      ],
                      margin: [0, -25, 0, 0]
                    },
                    {
                      text: 'Huella',
                      alignment: 'center',
                      margin: [0, -60, 0, 0]
                    }
                  ]
                }
              ]
            },
            {
              style: 'usoExclusivo',
              table: {
                widths: ['*'],
                body: [
                  [{ text: 'PARA USO EXCLUSIVO DEL INPREMA', style: 'tableHeader', alignment: 'center', fillColor: '#CCCCCC' }],
                  [
                    {
                      columns: [
                        {
                          width: '50%',
                          stack: [
                            { text: 'Nombre del empleado: ___________________________', margin: [0, 10] },
                            { text: 'Código: _______', margin: [0, 10] }
                          ],
                          style: 'subHeader'
                        },
                        {
                          width: '50%',
                          stack: [
                            { text: '________________________________', alignment: 'center', margin: [0, 10, 0, 0] },
                            { text: 'Firma', alignment: 'center', margin: [-10, 0, 0, 0] }
                          ],
                          style: 'subHeader'
                        }
                      ]
                    }
                  ]
                ]
              },
              margin: [0, 20, 0, 0]
            }
          ]
        }
      ],
      styles: {
        introText: { fontSize: 12, margin: [0, 0, 0, 10] },
        mainText: { fontSize: 12, margin: [0, 0, 0, 10] }
      }
    };
  }

}
