import { ChangeDetectionStrategy, Component, OnInit } from '@angular/core';
import { AfiliadoService } from 'src/app/services/afiliado.service';
import { FormStateService } from 'src/app/services/form-state.service';
import { ToastrService } from 'ngx-toastr';
import { generateDatBancFormGroup } from '../../nose/dat-banc/dat-banc.component';
import { generateFormArchivo } from 'src/app/components/dinamicos/botonarchivos/botonarchivos.component';
import { FormArray, FormBuilder, FormGroup, Validators } from '@angular/forms';
import pdfMake from 'pdfmake/build/pdfmake';
import pdfFonts from 'pdfmake/build/vfs_fonts';
import { AfiliacionService } from 'src/app/services/afiliacion.service';

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
  formOtrasFuentesIngreso: any = new FormGroup({
    sociedadSocios: new FormArray([], [Validators.required])
  });

  labelBoton1 = "Adjunte archivo DNI";
  DatosBancBen: any = [];

  constructor(
    private fb: FormBuilder,
    private formStateService: FormStateService,
    private afiliacionService: AfiliacionService,
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

    this.formOtrasFuentesIngreso = this.fb.group({
      sociedadSocios: this.fb.array([], [Validators.required])
    });

    this.formStateService.getFotoPerfil().subscribe((foto) => {
      if (foto) {
        this.form.get('FotoPerfil')?.setValue(foto);
      }
    });

    let otrasFuentesIngresoForm = this.formStateService.getForm('FormOtrasFuentesIngreso');
    if (otrasFuentesIngresoForm) {
      this.formOtrasFuentesIngreso = otrasFuentesIngresoForm;
    }
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

  setOtrasFuentesIngreso(datosOtrasFuentesIngreso: any) {
    this.formOtrasFuentesIngreso = datosOtrasFuentesIngreso;
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
        id_colegio: [item.id_colegio, Validators.required]
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
    const archivos = this.form.get("Archivos")?.value as { Archivos: string };
    if (archivos["Archivos"] != "") {
      this.labelBoton1 = archivos["Archivos"];
    } else {
      this.labelBoton1 = "Adjunte archivo DNI";
    }
    return this.labelBoton1;
  }

  enviar() {
    const formData = new FormData();
    const formGenerales = this.formDatosGenerales?.value?.refpers[0] || {};
    const direccion_residencia = `AVENIDA: ${formGenerales.avenida},CALLE: ${formGenerales.calle},SECTOR: ${formGenerales.sector},BLOQUE: ${formGenerales.bloque},N° DE CASA: ${formGenerales.numero_casa},COLOR CASA: ${formGenerales.color_casa},ALDEA: ${formGenerales.aldea},CASERIO: ${formGenerales.caserio}`;

    const persona = { ...formGenerales, direccion_residencia };

    const referencias = this.formReferencias?.value?.refpers.map((ref: any) => {
      return {
        tipo_referencia: ref.tipo_referencia,
        parentesco: ref.parentesco,
        dependiente_economico: ref.dependiente_economico ? "SI" : "NO",
        persona_referencia: {
          primer_nombre: ref.primer_nombre,
          segundo_nombre: ref.segundo_nombre,
          tercer_nombre: ref.tercer_nombre,
          primer_apellido: ref.primer_apellido,
          segundo_apellido: ref.segundo_apellido,
          sexo: ref.sexo,
          direccion: ref.direccion,
          telefono_domicilio: ref.telefono_domicilio,
          telefono_trabajo: ref.telefono_trabajo,
          telefono_personal: ref.telefono_personal,
          n_identificacion: ref.n_identificacion,
          tipo_identificacion: ref.tipo_identificacion,
          profesion: ref.profesion,
          discapacidad: ref.discapacidad,
          fecha_nacimiento: ref.fecha_nacimiento
        },
        discapacidades: ref.discapacidades
      };
    }) || [];

    const encapsulatedDto = {
      persona,
      detallePersona: {
        eliminado: 'NO',
        id_tipo_persona: 1,
        id_estado_afiliacion: 1
      },
      colegiosMagisteriales: this.formColegiosMagisteriales?.value?.ColMags || [],
      bancos: this.formHistPag?.value?.banco || [],
      centrosTrabajo: this.formPuestTrab?.value?.trabajo.map((trabajo: any) => ({
        ...trabajo,
        fecha_ingreso: this.formatDate(trabajo.fecha_ingreso),
        fecha_egreso: this.formatDate(trabajo.fecha_egreso)
      })) || [],
      otrasFuentesIngreso: this.formOtrasFuentesIngreso?.value?.sociedadSocios || [],
      referencias: referencias,
      beneficiarios: this.formBeneficiarios?.value?.beneficiario.map((ben: any) => {
        const { Arch, Archivos, DatosBac, beneficiario, ...resto } = ben;
        return resto;
      }) || [],
      familiares: [] // Agrega aquí los datos de familiares si tienes algún campo relacionado
    };

    formData.append('datos', JSON.stringify(encapsulatedDto));

    const fotoPerfilBase64 = this.form.get('FotoPerfil')?.value ?? '';

    let file: any;
    if (fotoPerfilBase64) {
      const fotoBlob = this.dataURLToBlob(fotoPerfilBase64);
      file = new File([fotoBlob], 'perfil.jpg', { type: 'image/jpeg' });
      formData.append('foto_perfil', file);
    }

    console.log(formData);

    // Log para ver qué contiene el FormData antes de enviar
    formData.forEach((value, key) => {
      console.log(`Key ${key}:`, value);
    });

    this.afiliacionService.crearAfiliacion(encapsulatedDto, file).subscribe(
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
