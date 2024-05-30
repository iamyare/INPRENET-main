import { Component, EventEmitter, OnInit, Output } from '@angular/core';
import { Validators } from '@angular/forms';
import { ToastrService } from 'ngx-toastr';
import { AfiliadoService } from 'src/app/services/afiliado.service';
import { FieldConfig } from 'src/app/shared/Interfaces/field-config';
import { TableColumn } from 'src/app/shared/Interfaces/table-column';
import { convertirFechaInputs } from 'src/app/shared/functions/formatoFecha';
import { unirNombres } from 'src/app/shared/functions/formatoNombresP';
import * as pdfMake from 'pdfmake/build/pdfmake';
import * as pdfFonts from 'pdfmake/build/vfs_fonts';
import { HttpClient } from '@angular/common/http';


@Component({
  selector: 'app-ver-datos-afiliados',
  templateUrl: './ver-datos-afiliados.component.html',
  styleUrls: ['./ver-datos-afiliados.component.scss']
})
export class VerDatosAfiliadosComponent implements OnInit {
  DatosGenerales: boolean = true; DatosBacAfil: boolean = false;
  Archivos: boolean = false; DatosPuestoTrab: boolean = false;
  DatosHS: boolean = false; referenc: boolean = false;
  datosBeneficiario: boolean = false; datosF: boolean = false;
  ColegiosMagisteriales: boolean = false;
  datosA = false;
  cuentas = false;

  constructor(private svcAfiliado: AfiliadoService,
              private toastr: ToastrService,
              private http: HttpClient) {
                (pdfMake as any).vfs = pdfFonts.pdfMake.vfs;
               }

  ngOnInit(): void {
    this.myFormFields = [
      { type: 'text', label: 'DNI del afiliado', name: 'dni', validations: [Validators.required, Validators.minLength(13), Validators.maxLength(14)], display: true, value: '' },
    ];

    this.myColumns = [
      {
        header: 'DNI',
        col: 'dni',
        isEditable: true,
        validationRules: [Validators.required, Validators.minLength(3)]
      },
      {
        header: 'Nombre Completo',
        col: 'nombre_completo',
        isEditable: true
      },
      {
        header: 'Genero',
        col: 'genero',
        isEditable: true
      },
      {
        header: 'Fecha de Nacimiento',
        col: 'fecha_nacimiento',
        isEditable: true
      }
    ];
  }

  // Manejan el control del progreso de los datos
  setEstadoDatGen(e: any) {
    this.DatosGenerales = true;
    this.DatosPuestoTrab = false;
    this.DatosHS = false;
    this.referenc = false;
    this.datosBeneficiario = false;
    this.datosF = false;
    this.datosA = false;
    this.cuentas = false;
    this.ColegiosMagisteriales = false;
  }
  setEstadoDatCentTrab(e: any) {
    this.DatosGenerales = false;
    this.DatosPuestoTrab = true;
    this.DatosHS = false;
    this.referenc = false;
    this.datosBeneficiario = false;
    this.datosF = false;
    this.datosA = false;
    this.cuentas = false;
    this.ColegiosMagisteriales = false;
  }
  setDatosHS(datosHistSal: any) {
    this.DatosGenerales = false;
    this.DatosPuestoTrab = false;
    this.DatosHS = true;
    this.referenc = false;
    this.datosBeneficiario = false;
    this.datosF = false;
    this.datosA = false;
    this.cuentas = false;
    this.ColegiosMagisteriales = false;
  }
  setDatosReferenc(datosHistSal: any) {
    this.DatosGenerales = false;
    this.DatosPuestoTrab = false;
    this.DatosHS = false;
    this.referenc = true;
    this.datosBeneficiario = false;
    this.datosF = false;
    this.datosA = false;
    this.cuentas = false;
    this.ColegiosMagisteriales = false;
  }
  setDatosBenef(datosHistSal: any) {
    this.DatosGenerales = false;
    this.DatosPuestoTrab = false;
    this.DatosHS = false;
    this.referenc = false;
    this.datosBeneficiario = true;
    this.datosF = false;
    this.datosA = false;
    this.cuentas = false;
    this.ColegiosMagisteriales = false;
  }
  setDatosF(datosHistSal: any) {
    this.DatosGenerales = false;
    this.DatosPuestoTrab = false;
    this.DatosHS = false;
    this.referenc = false;
    this.datosBeneficiario = false;
    this.datosF = true;
    this.datosA = false;
    this.cuentas = false;
    this.ColegiosMagisteriales = false;
  }
  setDatosA(datosHistSal: any) {
    this.DatosGenerales = false;
    this.DatosPuestoTrab = false;
    this.DatosHS = false;
    this.referenc = false;
    this.datosBeneficiario = false;
    this.datosF = false;
    this.datosA = true;
    this.cuentas = false;
    this.ColegiosMagisteriales = false;
  }
  setDatosAColegiosMag(datosHistSal: any) {
    this.DatosGenerales = false;
    this.DatosPuestoTrab = false;
    this.DatosHS = false;
    this.referenc = false;
    this.datosBeneficiario = false;
    this.datosF = false;
    this.datosA = false;
    this.cuentas = false;
    this.ColegiosMagisteriales = true;
  }
  setDatosCuentas(datosHistSal: any) {
    this.DatosGenerales = false;
    this.DatosPuestoTrab = false;
    this.DatosHS = false;
    this.referenc = false;
    this.datosBeneficiario = false;
    this.datosF = false;
    this.datosA = false;
    this.ColegiosMagisteriales = false;
    this.cuentas = true;
  }

  convertirFechaInputs = convertirFechaInputs;
  public myFormFields: FieldConfig[] = [];
  form: any;
  Afiliado!: any;
  unirNombres: any = unirNombres;
  datosTabl: any[] = [];

  prevAfil: boolean = false;

  public myColumns: TableColumn[] = [];
  ejecF: any;

  async obtenerDatos(event: any): Promise<any> {
    this.form = event;
  }

  previsualizarInfoAfil() {
    if (this.form.value.dni) {
      this.svcAfiliado.getAfilByParam(this.form.value.dni).subscribe(
        async (result) => {
          this.prevAfil = true;
          this.Afiliado = result;
          this.Afiliado.nameAfil = this.unirNombres(result.PRIMER_NOMBRE, result.SEGUNDO_NOMBRE, result.TERCER_NOMBRE, result.PRIMER_APELLIDO, result.SEGUNDO_APELLIDO);
        },
        (error) => {
          this.toastr.error(`Error: ${error.error.message}`);
          this.resetDatos();
        }
      );
    }
  }

  resetDatos() {
    if (this.form) {
      this.form.reset();
    }
    this.Afiliado = undefined;
  }

  ejecutarFuncionAsincronaDesdeOtroComponente(funcion: (data: any) => Promise<void>) {
    this.ejecF = funcion;
  }

  async generarConstancia() {
    const afiliado = this.Afiliado;
    const response: any = await this.http.get('/assets/images/MEMBRETADO.jpg', { responseType: 'blob' }).toPromise();
    const reader = new FileReader();
    reader.onloadend = () => {
        const base64data = reader.result as string;

        const docDefinition: any = {
            pageSize: 'A4',
            background: {
                image: base64data,
                width: 595.28,
                height: 841.89
            },
            content: [
                { text: ' ', style: 'space' },
                { text: 'A QUIEN INTERESE', style: 'header' },
                {
                    text: 'El Instituto Nacional de Previsión del Magisterio (INPREMA), por este medio indica que:',
                    style: 'subheader'
                },
                {
                    text: `${afiliado.PRIMER_NOMBRE} ${afiliado.SEGUNDO_NOMBRE} ${afiliado.TERCER_NOMBRE} ${afiliado.PRIMER_APELLIDO} ${afiliado.SEGUNDO_APELLIDO}`,
                    style: 'name'
                },
                {
                    text: [
                        { text: 'Se encuentra afiliado a este Sistema de Previsión con el número ' },
                        { text: `${afiliado.DNI}`, style: 'dni' }
                    ],
                    style: 'body'
                },
                {
                    text: `Y para los fines que el interesado estime conveniente, se extiende el presente documento en la ciudad de Tegucigalpa, Departamento de Francisco Morazán, a los ${new Date().getDate()} días del mes de ${new Date().toLocaleString('es-HN', { month: 'long' })} del año ${new Date().getFullYear()}.`,
                    style: 'body'
                },
                { text: '\n\n\n' },
                { canvas: [{ type: 'line', x1: 0, y1: 0, x2: 250, y2: 0, lineWidth: 1 }], margin: [127, 200, 0, 0] },
                { text: 'Fabiola Caceres', style: 'signature' },
                { text: 'Jefe Departamento de Afiliación', style: 'signatureTitle' }
            ],
            styles: {
                space: {
                    margin: [0, 100, 0, 0]
                },
                header: {
                    fontSize: 18,
                    bold: true,
                    alignment: 'center',
                    margin: [0, 20, 0, 10],
                    decoration: 'underline'
                },
                subheader: {
                    fontSize: 11,
                    alignment: 'left',
                    margin: [40, 10, 40, 5]
                },
                name: {
                    fontSize: 14,
                    bold: true,
                    alignment: 'center',
                    margin: [40, 10, 40, 5],
                    decoration: 'underline'
                },
                body: {
                    fontSize: 11,
                    alignment: 'left',
                    margin: [40, 10, 40, 5]
                },
                dni: {
                    fontSize: 11,
                    bold: true,
                    decoration: 'underline'
                },
                signature: {
                    fontSize: 12,
                    bold: true,
                    alignment: 'center',
                    margin: [0, 10, 0, 0]
                },
                signatureTitle: {
                    fontSize: 12,
                    alignment: 'center'
                }
            }
        };

        pdfMake.createPdf(docDefinition).open();
    };

    reader.readAsDataURL(response);
}

}
