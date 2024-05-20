import { ChangeDetectionStrategy, Component, OnInit } from '@angular/core';
import { FormArray, FormBuilder, FormGroup, Validators } from '@angular/forms';
import { generateDatBancFormGroup } from '@docs-components/dat-banc/dat-banc.component';
import { generateAddressFormGroup } from '@docs-components/dat-generales-afiliado/dat-generales-afiliado.component';
import { AfiliadoService } from 'src/app/services/afiliado.service';
import { generateFormArchivo } from '@docs-components/botonarchivos/botonarchivos.component';
import { FormStateService } from 'src/app/services/form-state.service';
import * as pdfMake from 'pdfmake/build/pdfmake';
import * as pdfFonts from 'pdfmake/build/vfs_fonts';

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
    banco: new FormArray([], [Validators.required])  // Esto asegura que siempre tienes una instancia de FormArray disponible
  });
  formReferencias: any = new FormGroup({
    refpers: new FormArray([], [Validators.required])
  });
  formBeneficiarios: any = new FormGroup({
    beneficiario: new FormArray([], [Validators.required])
  });
  formDatosFamiliares: any = new FormGroup({
    familiar: new FormArray([], [Validators.required])
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
    private afilService: AfiliadoService
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

    this.formDatosFamiliares = this.fb.group({
      familiar: this.fb.array([], [Validators.required])
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

  setEstadoDatFam(event: any) {
    this.resetEstados();
    this.datosFamiliares = true;
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

  setDatosFamiliares(datosFamiliares: any) {
    this.formDatosFamiliares = datosFamiliares;
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
    const encapsulatedDto = {
      datosGenerales: this.formDatosGenerales?.value?.refpers[0] || {},
      familiares: this.formDatosFamiliares?.value?.familiar || [],
      colegiosMagisteriales: this.formColegiosMagisteriales?.value?.ColMags || [],
      bancos: this.formHistPag?.value?.banco || [],
      centrosTrabajo: this.formPuestTrab?.value?.trabajo || [],
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


    /* this.afilService.createPersonaWithDetailsAndWorkCenters(formData).subscribe(
      response => {
        console.log('Datos enviados con éxito:', response);
      },
      error => {
        console.error('Error al enviar los datos:', error);
      }
    ); */

  }

  createPDFDefinition(data: any) {
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
        { text: 'II. DATOS DE FAMILIARES', style: 'header' },
        ...data.familiares.map((familiar: any) => this.createTable([
          ['DNI', familiar.dni || ''],
          ['Primer Nombre', familiar.primer_nombre || ''],
          ['Segundo Nombre', familiar.segundo_nombre || ''],
          ['Primer Apellido', familiar.primer_apellido || ''],
          ['Segundo Apellido', familiar.segundo_apellido || ''],
          ['Fecha de Nacimiento', familiar.fecha_nacimiento || ''],
          ['Parentesco', familiar.parentesco || '']
        ])),
        { text: 'III. DATOS DE CENTROS DE TRABAJO', style: 'header' },
        ...data.centrosTrabajo.map((centro: any) => this.createTable([
          ['ID Centro de Trabajo', centro.idCentroTrabajo || ''],
          ['Número de Acuerdo', centro.numeroAcuerdo || ''],
          ['Salario Base', centro.salarioBase || ''],
          ['Cargo', centro.cargo || ''],
          ['Fecha de Ingreso', centro.fechaIngreso || ''],
          ['Fecha de Egreso', centro.fechaEgreso || ''],
          ['Clase de Cliente', centro.claseCliente || ''],
          ['Sector Económico', centro.sectorEconomico || '']
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
}
