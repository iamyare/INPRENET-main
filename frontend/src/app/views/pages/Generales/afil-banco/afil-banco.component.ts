import { ChangeDetectionStrategy, Component, OnInit } from '@angular/core';
import { FormArray, FormBuilder, FormGroup, Validators } from '@angular/forms';
import { generateDatBancFormGroup } from '@docs-components/dat-banc/dat-banc.component';
import { AfiliadoService } from 'src/app/services/afiliado.service';
import { generateFormArchivo } from '@docs-components/botonarchivos/botonarchivos.component';
import { FormStateService } from 'src/app/services/form-state.service';
import * as pdfMake from 'pdfmake/build/pdfmake';
import * as pdfFonts from 'pdfmake/build/vfs_fonts';
import { ToastrService } from 'ngx-toastr';

(pdfMake as any).vfs = pdfFonts.pdfMake.vfs;

@Component({
  selector: 'app-afil-banco',
  templateUrl: './afil-banco.component.html',
  styleUrls: ['./afil-banco.component.scss'],
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class AfilBancoComponent implements OnInit {
  DatosGenerales: boolean = true;
  DatosBacAfil: boolean = false;
  Archivos: boolean = false;
  DatosPuestoTrab: boolean = false;
  DatosHS: boolean = false;
  referenc: boolean = false;
  datosBeneficiario: boolean = false;
  datosF: boolean = false;
  datosFamiliares: boolean = false;
  ColegiosMagisteriales: boolean = false;
  datosA: boolean = false;

  // Formularios
  public formParent: FormGroup = new FormGroup({});
  form = this.fb.group({
    /*  DatosGenerales: generateAddressFormGroup(), */
    DatosBacAfil: generateDatBancFormGroup(),
    Archivos: generateFormArchivo(),
    FotoPerfil: [''],
    Arch: "",
  });
  formPuestTrab: any = new FormGroup({
    trabajo: new FormArray([], [Validators.required])
  });
  formHistPag: any = new FormGroup({
    banco: new FormArray([], [Validators.required])
  });
  formReferencias: any = new FormGroup({
    refpers: new FormArray([], [Validators.required])
  });
  formBeneficiarios: any = new FormGroup({
    beneficiario: new FormArray([], [Validators.required])
  });
  formColegiosMagisteriales: any = new FormGroup({
    ColMags: new FormArray([], [Validators.required])
  });
  formDatosGenerales: any = new FormGroup({
    refpers: new FormArray([], [Validators.required])
  });

  labelBoton1 = "Adjunte archivo DNI";
  DatosBancBen: any = [];

  constructor(
    private fb: FormBuilder,
    private formStateService: FormStateService,
    private afilService: AfiliadoService,
    private toastr: ToastrService
  ) { }

  ngOnInit(): void {
    this.form = this.fb.group({
      DatosBacAfil: generateDatBancFormGroup(),
      Archivos: generateFormArchivo(),
      FotoPerfil: [''],
      Arch: ""
    });

    this.formPuestTrab = this.fb.group({
      trabajo: this.fb.array([], [Validators.required])
    });

    this.formHistPag = this.fb.group({
      banco: this.fb.array([], [Validators.required])
    });

    this.formReferencias = this.fb.group({
      refpers: this.fb.array([], [Validators.required])
    });

    this.formBeneficiarios = this.fb.group({
      beneficiario: this.fb.array([], [Validators.required])
    });

    this.formColegiosMagisteriales = this.fb.group({
      ColMags: this.fb.array([], [Validators.required])
    });

    this.formDatosGenerales = this.fb.group({
      refpers: this.fb.array([], [Validators.required])
    });

    this.formStateService.getFotoPerfil().subscribe((foto) => {
      if (foto) {
        this.form.get('FotoPerfil')?.setValue(foto);
      }
    });
  }



  handleImageCaptured(image: string) {
    this.form.get('FotoPerfil')?.setValue(image);
  }

  setEstadoDatGen(event: any) {
    this.resetEstados();
    this.DatosGenerales = true;
  }

  setEstadoDatCentTrab(event: any) {
    this.resetEstados();
    this.DatosPuestoTrab = true;
  }

  setDatosHS(event: any) {
    this.resetEstados();
    this.DatosHS = true;
  }

  setDatosReferenc(event: any) {
    this.resetEstados();
    this.referenc = true;
  }

  setDatosBenef(event: any) {
    this.resetEstados();
    this.datosBeneficiario = true;
  }

  setDatosF(event: any) {
    this.resetEstados();
    this.datosF = true;
  }

  setDatosA(event: any) {
    this.resetEstados();
    this.datosA = true;
  }

  setDatosAColegiosMag(event: any) {
    this.resetEstados();
    this.ColegiosMagisteriales = true;
  }

  resetEstados() {
    this.DatosGenerales = false;
    this.datosFamiliares = false;
    this.DatosPuestoTrab = false;
    this.DatosHS = false;
    this.referenc = false;
    this.datosBeneficiario = false;
    this.datosF = false;
    this.datosA = false;
    this.ColegiosMagisteriales = false;
  }

  setDatosColegiosMag(datosColegiosMag: any) {
    const formArray = this.formColegiosMagisteriales.get('ColMags') as FormArray;
    formArray.clear();
    datosColegiosMag.forEach((item: any) => {
      formArray.push(this.fb.group({
        idColegio: [item.idColegio, Validators.required]
      }));
    });
  }

  setDatosRefPer(datosRefPer: any) {
    this.formReferencias = datosRefPer;
  }

  setDatosBen(DatosBancBen: any) {
    this.formBeneficiarios = DatosBancBen;
  }

  setHistSal(datosHistSal: any) {
    this.formHistPag = datosHistSal
  }

  setDatosPuetTrab1(datosPuestTrab: any) {
    this.formPuestTrab = datosPuestTrab;
  }

  setDatosGenerales(datosGenerales: any) {
    this.formDatosGenerales = datosGenerales
  }

  handleArchivoSeleccionado(archivo: any) {
    this.form.get('Arch')?.setValue(archivo);
  }

  getLabel(): any {
    if (this.form.get("Archivos")?.value["Archivos"] != "") {
      this.labelBoton1 = this.form.get("Archivos")?.value["Archivos"];
    } else {
      this.labelBoton1 = "Adjunte archivo DNI";
    }
    return this.labelBoton1;
  }

  enviar() {
    const formData = new FormData();
    const formGenerales = this.formDatosGenerales?.value?.refpers[0] || {};
    const direccion_residencia = `AVENIDA: ${formGenerales.avenida},CALLE: ${formGenerales.calle},SECTOR: ${formGenerales.sector},BLOQUE: ${formGenerales.bloque},N° DE CASA: ${formGenerales.numero_casa},COLOR CASA: ${formGenerales.color_casa},ALDEA: ${formGenerales.aldea},CASERIO: ${formGenerales.caserio}`;

    const datosGenerales = {...formGenerales,direccion_residencia};

    const encapsulatedDto = {
      datosGenerales,
      colegiosMagisteriales: this.formColegiosMagisteriales?.value?.ColMags || [],
      bancos: this.formHistPag?.value?.banco || [],
      centrosTrabajo: this.formPuestTrab?.value?.trabajo.map((trabajo: any) => ({
        ...trabajo,
        fechaIngreso: this.formatDate(trabajo.fechaIngreso),
        fechaEgreso: this.formatDate(trabajo.fechaEgreso)
      })) || [],
      referenciasPersonales: this.formReferencias?.value?.refpers || [],
      beneficiarios: this.formBeneficiarios?.value?.beneficiario.map((ben: any) => {
        const { Arch, Archivos, DatosBac, beneficiario, ...resto } = ben;
        return resto;
      }) || [],
    };

    const docDefinition: any = this.createPDFDefinition(encapsulatedDto);
    pdfMake.createPdf(docDefinition).download('datos_afiliado.pdf');

    formData.append('encapsulatedDto', JSON.stringify(encapsulatedDto));

    const fotoPerfilBase64 = this.form.get('FotoPerfil')?.value ?? '';

    if (fotoPerfilBase64) {
      const fotoBlob = this.dataURLToBlob(fotoPerfilBase64);
      formData.append('foto_perfil', fotoBlob, 'perfil.jpg');
    }

    console.log(formData);

    // Log para ver qué contiene el FormData antes de enviar
    formData.forEach((value, key) => {
      console.log(`Key ${key}:`, value);
    });

    this.afilService.createPersonaWithDetailsAndWorkCenters(formData).subscribe(
      response => {
        console.log('Datos enviados con éxito:', response);
        this.toastr.success('Datos enviados con éxito');
      },
      error => {
        console.error('Error al enviar los datos:', error);
        this.toastr.error('Error al enviar los datos');
      }
    );
  }

  createPDFDefinition(data: any) {
    console.log(data);

    return {
      content: [
        { text: 'I. DATOS GENERALES DEL AFILIADO', style: 'header' },
        this.createTable([
          ['ID Tipo Identificación', data.datosGenerales.id_tipo_identificacion || ''],
          ['DNI', data.datosGenerales.dni || ''],
          ['Estado Civil', data.datosGenerales.estado_civil || ''],
          ['Primer Nombre', data.datosGenerales.primer_nombre || ''],
          ['Segundo Nombre', data.datosGenerales.segundo_nombre || ''],
          ['Tercer Nombre', data.datosGenerales.tercer_nombre || ''],
          ['Primer Apellido', data.datosGenerales.primer_apellido || ''],
          ['Segundo Apellido', data.datosGenerales.segundo_apellido || ''],
          ['Género', data.datosGenerales.genero || ''],
          ['Cantidad de Dependientes', data.datosGenerales.cantidad_dependientes || ''],
          ['ID Profesión', data.datosGenerales.id_profesion || ''],
          ['Representación', data.datosGenerales.representacion || ''],
          ['Teléfono 1', data.datosGenerales.telefono_1 || ''],
          ['Teléfono 2', data.datosGenerales.telefono_2 || ''],
          ['Correo 1', data.datosGenerales.correo_1 || ''],
          ['Correo 2', data.datosGenerales.correo_2 || ''],
          ['Número Carnet', data.datosGenerales.numero_carnet || ''],
          ['Fecha de Nacimiento', data.datosGenerales.fecha_nacimiento || ''],
          ['Archivo de Identificación', data.datosGenerales.archivo_identificacion || ''],
          ['Dirección de Residencia', data.datosGenerales.direccion_residencia || ''],
          ['ID País', data.datosGenerales.id_pais || ''],
          ['ID Municipio de Residencia', data.datosGenerales.id_municipio_residencia || ''],
          ['ID Estado de Persona', data.datosGenerales.id_estado_persona || ''],
          ['ID Tipo de Persona', data.datosGenerales.ID_TIPO_PERSONA || '']
        ]),
        { text: 'III. DATOS DE CENTROS DE TRABAJO', style: 'header' },
        ...data.centrosTrabajo.map((centro: any) => this.createTable([
          ['ID Centro de Trabajo', centro.idCentroTrabajo || ''],
          ['Número de Acuerdo', centro.numeroAcuerdo || ''],
          ['Salario Base', centro.salarioBase || ''],
          ['Cargo', centro.cargo || ''],
          ['Fecha de Ingreso', centro.fechaIngreso || ''],
          ['Fecha de Egreso', centro.fechaEgreso || ''],
        ])),
        { text: 'IV. REFERENCIAS PERSONALES', style: 'header' },
        ...data.referenciasPersonales.map((referencia: any) => this.createTable([
          ['Nombre Completo', referencia.nombre_completo || ''],
          ['Dirección', referencia.direccion || ''],
          ['Parentesco', referencia.parentesco || ''],
          ['Teléfono Domicilio', referencia.telefono_domicilio || ''],
          ['Teléfono Trabajo', referencia.telefono_trabajo || ''],
          ['Teléfono Personal', referencia.telefono_personal || ''],
          ['DNI', referencia.dni || '']
        ])),
        { text: 'V. BANCOS', style: 'header' },
        ...data.bancos.map((banco: any) => this.createTable([
          ['ID Banco', banco.idBanco || ''],
          ['Número de Cuenta', banco.numCuenta || ''],
          ['Estado', banco.estado || '']
        ])),
        { text: 'VI. BENEFICIARIOS', style: 'header' },
        ...data.beneficiarios.map((beneficiario: any) => this.createTable([
          ['DNI', beneficiario.datosBeneficiario.dni || ''],
          ['Primer Nombre', beneficiario.datosBeneficiario.primer_nombre || ''],
          ['Segundo Nombre', beneficiario.datosBeneficiario.segundo_nombre || ''],
          ['Tercer Nombre', beneficiario.datosBeneficiario.tercer_nombre || ''],
          ['Primer Apellido', beneficiario.datosBeneficiario.primer_apellido || ''],
          ['Segundo Apellido', beneficiario.datosBeneficiario.segundo_apellido || ''],
          ['Género', beneficiario.datosBeneficiario.genero || ''],
          ['Cantidad de Dependientes', beneficiario.datosBeneficiario.cantidad_dependientes || ''],
          ['Representación', beneficiario.datosBeneficiario.representacion || ''],
          ['Teléfono 1', beneficiario.datosBeneficiario.telefono_1 || ''],
          ['Fecha de Nacimiento', beneficiario.datosBeneficiario.fecha_nacimiento || ''],
          ['Dirección de Residencia', beneficiario.datosBeneficiario.direccion_residencia || ''],
          ['ID País', beneficiario.datosBeneficiario.id_pais || ''],
          ['ID Municipio de Residencia', beneficiario.datosBeneficiario.id_municipio_residencia || ''],
          ['ID Estado de Persona', beneficiario.datosBeneficiario.id_estado_persona || ''],
          ['Porcentaje', beneficiario.porcentaje || '']
        ])),
        { text: 'VII. COLEGIOS MAGISTERIALES', style: 'header' },
        ...data.colegiosMagisteriales.map((colegio: any) => this.createTable([
          ['ID Colegio', colegio.idColegio || '']
        ]))
      ],
      styles: {
        header: {
          fontSize: 16,
          bold: true,
          margin: [0, 10, 0, 10]
        },
        table: {
          margin: [0, 5, 0, 15]
        }
      }
    };
  }

  createTable(data: [string, any][]) {
    const filteredData = data.filter(([key, value]) => value != null && value !== undefined);
    return {
      table: {
        widths: ['*', '*'],
        body: [
          ...filteredData.map(([key, value]) => [key, value])
        ]
      },
      style: 'table'
    };
  }

  dataURLToBlob(dataURL: string) {
    const byteString = atob(dataURL.split(',')[1]);
    const mimeString = dataURL.split(',')[0].split(':')[1].split(';')[0];

    const buffer = new ArrayBuffer(byteString.length);
    const data = new DataView(buffer);

    for (let i = 0; i < byteString.length; i++) {
      data.setUint8(i, byteString.charCodeAt(i));
    }

    return new Blob([buffer], { type: mimeString });
  }

  formatDate(date: string): string {
    if (!date) return date;
    const d = new Date(date);
    const day = ('0' + d.getDate()).slice(-2);
    const month = ('0' + (d.getMonth() + 1)).slice(-2);
    const year = d.getFullYear();
    return `${day}/${month}/${year}`;
  }

  createPDF() {
    const documentDefinition:any = this.getDocumentDefinition();
    pdfMake.createPdf(documentDefinition).download('example.pdf');
  }


  getDocumentDefinition() {
    const data = [
        {
            numero: '1',
            nombre: 'Juan Perez',
            fechaNacimiento: '01/01/1980',
            identidad: '0801-1980-12345',
            parentesco: 'Padre',
            porcentaje: '100%',
            direccion: 'Av. Principal 123',
            telefono: '555-1234'
        },
    ];

    const userDetails = {
        nombre: 'Juan Perez',
        nivel: 'Secundario',
        centroEducativo: 'Instituto Nacional',
        municipio: 'Tegucigalpa',
        departamento: 'Francisco Morazán',
        identidad: '0801-1980-12345'
    };

    // Función auxiliar para aplicar múltiples estilos
    const applyStyles = (styles: string | string[]) => Array.isArray(styles) ? styles.join(' ') : styles;

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
            { text: 'N°', style: applyStyles('tableHeader'), fillColor: '#CCCCCC', alignment: 'center' },
            { text: 'NOMBRE COMPLETO', style: applyStyles('tableHeader'), alignment: 'center' },
            { text: 'FECHA DE NACIMIENTO', style: applyStyles('tableHeader'), alignment: 'center' },
            { text: 'IDENTIDAD', style: applyStyles('tableHeader'), alignment: 'center' },
            { text: 'PARENTESCO', style: applyStyles('tableHeader'), alignment: 'center' },
            { text: '%', style: applyStyles('tableHeader'), alignment: 'center' },
        ]
    ];

    data.forEach((item) => {
        body.push(
            [
                { text: item.numero, rowSpan: 2, style: applyStyles('tableRowLarge'), fillColor: '#CCCCCC', alignment: 'center' },
                { text: item.nombre, style: applyStyles('tableRowLarge'), alignment: 'center' },
                { text: item.fechaNacimiento, style: applyStyles('tableRowLarge'), alignment: 'center' },
                { text: item.identidad, style: applyStyles('tableRowLarge'), alignment: 'center' },
                { text: item.parentesco, style: applyStyles('tableRowLarge'), alignment: 'center' },
                { text: item.porcentaje, style: applyStyles('tableRowLarge'), alignment: 'center' },
            ],
            [
                {},
                { text: 'DIRECCIÓN', style: applyStyles('tableRowLarge'), fillColor: '#CCCCCC', alignment: 'center' },
                { text: item.direccion, style: applyStyles('tableRowLarge'), colSpan: 2, alignment: 'center' },
                { text: '', style: applyStyles('tableRowLarge') },
                { text: 'TELEFONO/CEL', style: applyStyles('tableRowLarge'), fillColor: '#CCCCCC', alignment: 'center' },
                { text: item.telefono, style: applyStyles('tableRowLarge'), alignment: 'center' },
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
                    { text: userDetails.nivel, bold: true },
                    ', del Centro Educativo ',
                    { text: userDetails.centroEducativo, bold: true },
                    ', ubicado en el Municipio ',
                    { text: userDetails.municipio, bold: true },
                    ' del Departamento ',
                    { text: userDetails.departamento, bold: true },
                    ', con Identidad N°. ',
                    { text: userDetails.identidad, bold: true },
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
                            hLineWidth: function (i:any, node:any) {
                                return (i === 0 || i === node.table.body.length) ? 1 : 0.5;
                            },
                            vLineWidth: function (i:any, node:any) {
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
                fontSize: 11, // Tamaño de fuente más grande para los datos de la tabla
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
