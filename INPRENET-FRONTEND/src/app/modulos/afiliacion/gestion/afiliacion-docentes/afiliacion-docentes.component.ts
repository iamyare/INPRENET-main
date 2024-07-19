import { Component, OnInit } from '@angular/core';
import { FormBuilder, FormGroup } from '@angular/forms';
import { AfiliacionService } from 'src/app/services/afiliacion.service';
import { DatosEstaticosService } from 'src/app/services/datos-estaticos.service';

@Component({
  selector: 'app-afiliacion-docentes',
  templateUrl: './afiliacion-docentes.component.html',
  styleUrls: ['./afiliacion-docentes.component.scss']
})
export class AfiliacionDocentesComponent implements OnInit {
  steps = [
    { label: 'Datos Generales Del Docente', isActive: true },
    { label: 'Familiares', isActive: false },
    { label: 'Colegio Magisterial', isActive: false },
    { label: 'Datos Cuentas Bancarias', isActive: false },
    { label: 'Centros De Trabajo', isActive: false },
    { label: 'Referencias Personales / Familiares', isActive: false },
    { label: 'Beneficiarios', isActive: false },
    { label: 'Finalizar', isActive: false },
  ];

  activeStep = 0;

  datosGeneralesForm!: FormGroup;
  colegioMagisterialForm!: FormGroup;
  bancosForm!: FormGroup;
  centrosTrabajoForm!: FormGroup;
  otrasFuentesIngresoForm!: FormGroup;
  refPersForm!: FormGroup;
  benefForm!: FormGroup;

  datosGeneralesData: any = {};
  colegioMagisterialData: any = {};
  bancosData: any = {};
  centrosTrabajoData: any = {};
  otrasFuentesIngresoData: any = {};
  refPersData: any = {};
  benefData: any = {};
  fotoPerfil: string = '';
  tipoDiscapacidad: any[] = [];

  constructor(private fb: FormBuilder, private afiliacionService: AfiliacionService, private datosEstaticos: DatosEstaticosService) {
    this.datosGeneralesForm = this.fb.group({});
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
    const selectedDiscapacidades = this.datosGeneralesData.refpers[0].discapacidades
      .map((d: any, index: number) => d ? { id_discapacidad: this.tipoDiscapacidad[index].value } : null)
      .filter((d: any) => d !== null);

    const persona = {
      id_tipo_identificacion: this.datosGeneralesData.refpers[0].id_tipo_identificacion,
      id_pais_nacionalidad: this.datosGeneralesData.refpers[0].id_pais_nacionalidad,
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
      discapacidades: selectedDiscapacidades
    };

    const detalle = {
      eliminado: "NO",
      tipo_persona: "AFILIADO",
      nombre_estado: "ACTIVO"
    };

    const allData = {
      persona: persona,
      detallePersona: detalle,
      colegiosMagisteriales: this.colegioMagisterialData,
      bancos: this.bancosData.banco,
      centrosTrabajo: this.centrosTrabajoData.trabajo,
      otrasFuentesIngreso: this.otrasFuentesIngresoData.sociedadSocios,
      referencias: this.refPersData.referencias,
      beneficiarios: this.benefData?.value?.beneficiarios || []
    };

    console.log('Datos Completos:', allData);
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
}
