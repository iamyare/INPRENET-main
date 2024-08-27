import { Component, OnInit } from '@angular/core';
import { FormBuilder, FormGroup } from '@angular/forms';
import { AfiliacionService } from 'src/app/services/afiliacion.service';
import { DatosEstaticosService } from 'src/app/services/datos-estaticos.service';
import pdfMake from 'pdfmake/build/pdfmake';

@Component({
  selector: 'app-afiliacion-docentes',
  templateUrl: './afiliacion-docentes.component.html',
  styleUrls: ['./afiliacion-docentes.component.scss']
})
export class AfiliacionDocentesComponent implements OnInit {
  steps = [
    { label: 'Datos Generales Del Docente', isActive: true },
    { label: 'Colegio Magisterial', isActive: false },
    { label: 'Datos Cuentas Bancarias', isActive: false },
    { label: 'Centros De Trabajo', isActive: false },
    { label: 'Referencias Personales / Familiares', isActive: false },
    { label: 'Beneficiarios', isActive: false },
    { label: 'Finalizar', isActive: false },
  ];

  activeStep = 0;

  datosGeneralesForm!: FormGroup;
  familiaresForm!: FormGroup;
  colegioMagisterialForm!: FormGroup;
  bancosForm!: FormGroup;
  centrosTrabajoForm!: FormGroup;
  otrasFuentesIngresoForm!: FormGroup;
  refPersForm!: FormGroup;
  benefForm!: FormGroup;

  datosGeneralesData: any = {};
  familiaresData: any = [];
  colegioMagisterialData: any = {};
  bancosData: any = {};
  centrosTrabajoData: any = {};
  otrasFuentesIngresoData: any = {};
  refPersData: any = {};
  benefData: any = {};
  fotoPerfil: string = '';
  tipoDiscapacidad: any[] = [];
  pepsData: any = [];

  constructor(private fb: FormBuilder, private afiliacionService: AfiliacionService, private datosEstaticos: DatosEstaticosService) {
    this.datosGeneralesForm = this.fb.group({});
    this.familiaresForm = this.fb.group({});
    this.colegioMagisterialForm = this.fb.group({});
    this.bancosForm = this.fb.group({});
    this.centrosTrabajoForm = this.fb.group({});
    this.refPersForm = this.fb.group({});
    this.benefForm = this.fb.group({});
  }

  ngOnInit(): void {
    this.initForms();
    this.loadDiscapacidades();
  }

  loadDiscapacidades(): void {
    this.datosEstaticos.getDiscapacidades().subscribe(
      (data) => {
        this.tipoDiscapacidad = data;
      },
      (error) => {
        console.error('Error al cargar discapacidades', error);
      }
    );
  }

  initForms() {
    this.datosGeneralesForm = this.fb.group({});
    this.familiaresForm = this.fb.group({
      familiares: this.fb.array([])
    });
    this.colegioMagisterialForm = this.fb.group({});
    this.bancosForm = this.fb.group({});
    this.centrosTrabajoForm = this.fb.group({});
    this.otrasFuentesIngresoForm = this.fb.group({
      sociedadSocios: this.fb.array([])
    });
    this.refPersForm = this.fb.group({
      refpers: this.fb.array([])
    });
    this.benefForm = this.fb.group({
      beneficiarios: this.fb.array([])
    });
  }

  handleDatosGeneralesChange(data: any): void {
    this.datosGeneralesData = data;
    this.pepsData = data.peps;
    this.familiaresData = data.familiares;
  }

  handleOtrasFuentesIngreso(otrasFuentesData: any): void {
    this.otrasFuentesIngresoData = otrasFuentesData;
  }

  handleDatosPuestTrab(data: any): void {
    this.centrosTrabajoData = data;
  }

  handleRefPersData(data: any): void {
    this.refPersData = data;
  }

  handleBenefData(data: any): void {
    this.benefData = data;
  }

  handleStepChange(index: number): void {
    this.activeStep = index;
  }

  onDatosGeneralesFormUpdate(formValues: any): void {
    this.datosGeneralesData = formValues;
  }

  onColegioMagisterialFormUpdate(formValues: any): void {
    this.colegioMagisterialData = formValues;
  }

  onBancosFormUpdate(formValues: any): void {
    this.bancosData = formValues;
  }

  onCentrosTrabajoFormUpdate(formValues: any): void {
    this.centrosTrabajoData = formValues.value.trabajo;
  }

  onOtrasFuentesIngresoChange(formValues: any): void {
    this.otrasFuentesIngresoData = formValues.value;
  }

  gatherAllData(): void {
    // Recopilar discapacidades seleccionadas para la persona principal
    const selectedDiscapacidades = this.datosGeneralesData?.refpers?.[0]?.discapacidades
      ?.map((d: any, index: number) => d ? { id_discapacidad: this.tipoDiscapacidad[index].value } : null)
      .filter((d: any) => d !== null) || [];

    // Recopilar datos de los beneficiarios, incluyendo las discapacidades seleccionadas
    const beneficiarios = this.benefData?.value?.beneficiarios?.map((beneficiario: any, bIndex: number) => ({
      persona: {
        id_tipo_identificacion: beneficiario.persona.id_tipo_identificacion,
        id_pais_nacionalidad: beneficiario.persona.id_pais_nacionalidad,
        n_identificacion: beneficiario.persona.n_identificacion,
        primer_nombre: beneficiario.persona.primer_nombre,
        segundo_nombre: beneficiario.persona.segundo_nombre,
        direccion_residencia: beneficiario.persona.direccion_residencia,
        tercer_nombre: beneficiario.persona.tercer_nombre,
        primer_apellido: beneficiario.persona.primer_apellido,
        segundo_apellido: beneficiario.persona.segundo_apellido,
        parentesco: beneficiario.persona.parentesco,
        telefono_1: beneficiario.persona.telefono_1,
        genero: beneficiario.persona.genero,
        fecha_nacimiento: beneficiario.persona.fecha_nacimiento,
        discapacidades: beneficiario.persona.discapacidades
          .map((selected: boolean, dIndex: number) => selected ? { id_discapacidad: this.tipoDiscapacidad[dIndex].value } : null)
          .filter((d: any) => d !== null)
      },
      porcentaje: beneficiario.persona.porcentaje,
    })) || [];

    const peps = this.pepsData?.map((pep: any) => ({
      cargo: pep.pep_cargo_desempenado,
      fecha_inicio: pep.startDate,
      fecha_fin: pep.endDate,
    })) || [];


    const persona = {
      departamentoResidencia: this.datosGeneralesData.departamentoResidencia || 'N/A',
      municipioResidencia: this.datosGeneralesData.municipioResidencia || 'N/A',
      id_tipo_identificacion: this.datosGeneralesData.refpers[0].id_tipo_identificacion,
      id_pais_nacionalidad: this.datosGeneralesData.refpers[0].id_pais,
      n_identificacion: this.datosGeneralesData.refpers[0].n_identificacion,
      fecha_vencimiento_ident: this.datosGeneralesData.refpers[0].fecha_vencimiento_ident,
      rtn: this.datosGeneralesData.refpers[0].rtn,
      grupo_etnico: this.datosGeneralesData.refpers[0].grupo_etnico,
      estado_civil: this.datosGeneralesData.refpers[0].estado_civil,
      primer_nombre: this.datosGeneralesData.refpers[0].primer_nombre,
      segundo_nombre: this.datosGeneralesData.refpers[0].segundo_nombre,
      tercer_nombre: this.datosGeneralesData.refpers[0].tercer_nombre,
      primer_apellido: this.datosGeneralesData.refpers[0].primer_apellido,
      segundo_apellido: this.datosGeneralesData.refpers[0].segundo_apellido,
      genero: this.datosGeneralesData.refpers[0].genero,
      sexo: this.datosGeneralesData.refpers[0].sexo,
      cantidad_dependientes: this.datosGeneralesData.refpers[0].cantidad_dependientes,
      cantidad_hijos: this.datosGeneralesData.refpers[0].cantidad_hijos,
      grado_academico: this.datosGeneralesData.refpers[0].grado_academico,
      telefono_1: this.datosGeneralesData.refpers[0].telefono_1,
      telefono_2: this.datosGeneralesData.refpers[0].telefono_2,
      correo_1: this.datosGeneralesData.refpers[0].correo_1,
      correo_2: this.datosGeneralesData.refpers[0].correo_2,
      fecha_nacimiento: this.datosGeneralesData.refpers[0].fecha_nacimiento,
      archivo_identificacion: this.datosGeneralesData.refpers[0].archivo_identificacion,
      direccion_residencia: this.datosGeneralesData.refpers[0].direccion_residencia,
      id_municipio_residencia: this.datosGeneralesData.refpers[0].id_municipio_residencia,
      id_municipio_nacimiento: this.datosGeneralesData.refpers[0].id_municipio_nacimiento,
      id_profesion: this.datosGeneralesData.refpers[0].id_profesion,
      representacion: this.datosGeneralesData.refpers[0].representacion,
      discapacidades: selectedDiscapacidades,
      peps: peps
    };


    const detalle = {
      eliminado: "NO",
      tipo_persona: "AFILIADO",
      nombre_estado: "ACTIVO"
    };

    const familiares = Array.isArray(this.familiaresData) ? this.familiaresData.map((familiar: any) => ({
      parentesco: familiar.parentesco,
      persona_referencia: {
        primer_nombre: familiar.primer_nombre,
        segundo_nombre: familiar.segundo_nombre,
        tercer_nombre: familiar.tercer_nombre,
        primer_apellido: familiar.primer_apellido,
        segundo_apellido: familiar.segundo_apellido,
        n_identificacion: familiar.n_identificacion
      }
    })) : [];

    const conyugeData = this.refPersData?.conyuge;
    if (conyugeData) {
      familiares.push({
        parentesco: 'CÓNYUGUE',
        persona_referencia: {
          primer_nombre: conyugeData.persona_referencia.primer_nombre,
          segundo_nombre: conyugeData.persona_referencia.segundo_nombre,
          tercer_nombre: conyugeData.persona_referencia.tercer_nombre,
          primer_apellido: conyugeData.persona_referencia.primer_apellido,
          segundo_apellido: conyugeData.persona_referencia.segundo_apellido,
          n_identificacion: conyugeData.persona_referencia.n_identificacion
        }
      });
    }


    const allData = {
      persona: persona,
      detallePersona: detalle,
      colegiosMagisteriales: this.colegioMagisterialData,
      bancos: this.bancosData.banco,
      centrosTrabajo: this.centrosTrabajoData.trabajo,
      otrasFuentesIngreso: this.otrasFuentesIngresoData.sociedadSocios,
      referencias: this.refPersData.referencias,
      beneficiarios: beneficiarios,
      familiares: familiares
    };
    console.log(allData);

    const docDefinition:any = this.getDocumentDefinition(allData.beneficiarios, allData.persona);

    // Generar el PDF con pdfMake
    pdfMake.createPdf(docDefinition).download('afiliacion-docentes.pdf');

    //this.enviarDatos(allData);
  }

  enviarDatos(datos: any): void {
    const fotoPerfilBase64 = this.fotoPerfil || '';

    let file: any;
    if (fotoPerfilBase64) {
      const fotoBlob = this.dataURItoBlob(fotoPerfilBase64);
      file = new File([fotoBlob], 'perfil.jpg', { type: 'image/jpeg' });
    }

    this.afiliacionService.crearAfiliacion(datos, file).subscribe(
      response => {
        console.log('Datos enviados con éxito:', response);
      },
      error => {
        console.error('Error al enviar los datos:', error);
      }
    );
  }

  dataURItoBlob(dataURI: string): Blob {
    const byteString = atob(dataURI.split(',')[1]);
    const mimeString = dataURI.split(',')[0].split(':')[1].split(';')[0];

    const buffer = new ArrayBuffer(byteString.length);
    const data = new DataView(buffer);

    for (let i = 0; i < byteString.length; i++) {
      data.setUint8(i, byteString.charCodeAt(i));
    }

    return new Blob([buffer], { type: mimeString });
  }

  handleImageCaptured(image: string): void {
    this.fotoPerfil = image;
  }

  getDocumentDefinition(data: any[], userDetails: any) {
    // Revisar los datos y asignar valores por defecto si no existen
    data.forEach(item => {
        item.numero = item.numero || 'N/A';
        item.nombre = `${item.persona.primer_nombre || 'N/A'} ${item.persona.segundo_nombre || ''} ${item.persona.primer_apellido || 'N/A'} ${item.persona.segundo_apellido || ''}`;
        item.fechaNacimiento = item.persona.fecha_nacimiento || 'N/A';
        item.identidad = item.persona.n_identificacion || 'N/A';
        item.parentesco = item.parentesco || 'N/A';
        item.porcentaje = item.porcentaje || 'N/A';
        item.direccion_residencia = item.direccion_residencia || 'N/A';
        item.telefono_1 = item.telefono_1 || 'N/A';
    });

    userDetails.nombre = userDetails.primer_nombre + " " + userDetails.segundo_nombre + " " + userDetails.primer_apellido + " " + userDetails.segundo_apellido || 'N/A';
    userDetails.grado_academico = userDetails.grado_academico || 'N/A';
    userDetails.centroEducativo = userDetails.centroEducativo || 'N/A';
    userDetails.municipio = userDetails.municipio || 'N/A';
    userDetails.departamento = userDetails.departamento || 'N/A';
    userDetails.n_identificacion = userDetails.n_identificacion || 'N/A';

    // Definir el tipo correcto para los objetos de la tabla
    interface TableCell {
        text?: string;
        style?: string;
        rowSpan?: number;
        colSpan?: number;
        fillColor?: string;
        alignment?: string;
    }

    // Transformar los datos en el formato requerido por pdfMake
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

    data.forEach((item, index) => {
      // Verificar que la fecha sea válida y convertirla al formato deseado
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
              { text: fechaNacimiento, style: 'tableRowLarge', alignment: 'center' }, // Usar la fecha formateada
              { text: item.identidad, style: 'tableRowLarge', alignment: 'center' },
              { text: item.persona.parentesco, style: 'tableRowLarge', alignment: 'center' },
              { text: item.porcentaje, style: 'tableRowLarge', alignment: 'center' },
          ],
          [
              {},
              { text: 'DIRECCIÓN', style: 'tableRowLarge', fillColor: '#CCCCCC', alignment: 'center' },
              { text: item.persona.direccion_residencia, style: 'tableRowLarge', colSpan: 2, alignment: 'center' },
              { text: '', style: 'tableRowLarge' },
              { text: 'TELEFONO/CEL', style: 'tableRowLarge', fillColor: '#CCCCCC', alignment: 'center' },
              { text: item.persona.telefono_1, style: 'tableRowLarge', alignment: 'center' },
          ]
      );
  });

    return {
        content: [
            {
                text: [
                    'Señores de la Comisión Interventora del INPREMA\nPresente.\n\nYo ',
                    { text: userDetails.nombre, bold: true },
                    ', mayor de edad, laborando como docente en el nivel ',
                    { text: userDetails.grado_academico, bold: true },
                    ', del Centro Educativo ',
                    { text: userDetails.centroEducativo, bold: true },
                   ', ubicado en el Municipio ',
                  { text: userDetails.municipioResidencia, bold: true },
                  ' del Departamento ',
                  { text: userDetails.departamentoResidencia, bold: true },
                    ', con Identidad N°. ',
                    { text: userDetails.n_identificacion, bold: true },
                    ', comparezco ante el Instituto Nacional de Previsión del magisterio a registrar mis beneficiarios legales de la manera siguiente:\n\n'
                ],
                style: 'introText'
            },
            {
                table: {
                    widths: [20, '*', '*', '*', '*', '*'],
                    body: body
                }
            },
            {
                text: '', // Separación adicional
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
                                        margin: [0, 20, 0, 15]  // Añadir margen adicional
                                    },
                                    {
                                        text: '(f) _______________________________',
                                        margin: [0, 15, 0, 0]  // Añadir margen adicional
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
                                        margin: [0, -25, 0, 0]  // Ajustar la posición vertical del cuadro de huella
                                    },
                                    {
                                        text: 'Huella',
                                        alignment: 'center',
                                        margin: [0, -60, 0, 0]  // Ajustar la posición vertical de la palabra "Huella"
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
                                                    { text: '________________________________', alignment: 'right', margin: [0, 10] },
                                                    { text: 'Firma', alignment: 'center', margin: [0, 10] }
                                                ],
                                                style: 'subHeader'
                                            }
                                        ]
                                    }
                                ]
                            ]
                        },
                        layout: {
                            hLineWidth: function (i: any, node: any) {
                                return (i === 0 || i === node.table.body.length) ? 1 : 0.5;
                            },
                            vLineWidth: function (i: any, node: any) {
                                return (i === 0 || i === node.table.widths.length) ? 1 : 0.5;
                            }
                        },
                        margin: [0, 20, 0, 0]  // Añadir margen adicional para evitar solapamiento
                    }
                ]
            }
        ],
        styles: {
            introText: {
                fontSize: 12, // Ajusta el tamaño del texto aquí
                margin: [0, 0, 0, 10]
            },
            mainText: {
                fontSize: 12, // Ajusta el tamaño del texto aquí
                margin: [0, 0, 0, 10]
            },
            subHeader: {
                fontSize: 10,
                bold: false,
                margin: [0, 0, 0, 10]
            },
            tableHeader: {
                bold: true,
                fontSize: 10,
                color: 'black',
                fillColor: '#CCCCCC',
                alignment: 'center'
            },
            tableRow: {
                fontSize: 9,
                color: 'black',
                alignment: 'center'
            },
            tableRowLarge: {
                fontSize: 11,
                color: 'black',
                alignment: 'center'
            },
            grayBackground: {
                fillColor: '#CCCCCC'
            },
            usoExclusivo: {
                margin: [0, 20, 0, 0]
            }
        }
    };
}



}
