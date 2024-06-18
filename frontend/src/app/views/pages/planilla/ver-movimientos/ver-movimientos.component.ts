import { Component, OnInit } from '@angular/core';
import { Validators } from '@angular/forms';
import { AfiliadoService } from 'src/app/services/afiliado.service';
import { FieldConfig } from 'src/app/shared/Interfaces/field-config';
import { TableColumn } from 'src/app/shared/Interfaces/table-column';
import { ToastrService } from 'ngx-toastr';
import { TransaccionesService } from 'src/app/services/transacciones.service';
import * as pdfMake from 'pdfmake/build/pdfmake';
import * as pdfFonts from 'pdfmake/build/vfs_fonts';
import { Alignment, Content, TDocumentDefinitions } from 'pdfmake/interfaces';
import { HttpClient } from '@angular/common/http';

@Component({
  selector: 'app-ver-movimientos',
  templateUrl: './ver-movimientos.component.html',
  styleUrl: './ver-movimientos.component.scss'
})
export class VerMovimientosComponent implements OnInit {
  public myFormFields: FieldConfig[] = [];
  columns: TableColumn[] = [];
  persona: any;
  movimientos: any;
  form: any
  public mostrarMovimientos: boolean = false;
  ejecF: any;
  filasT: any[] = [];


  constructor(private afiliadoService: AfiliadoService, private toastr: ToastrService,
              private transaccionesService: TransaccionesService, private http: HttpClient) {
                (pdfMake as any).vfs = pdfFonts.pdfMake.vfs;
               }


  ngOnInit(): void {
    this.myFormFields = [
      { type: 'text', label: 'DNI de la persona', name: 'dni', validations: [Validators.required, Validators.minLength(13), Validators.maxLength(14)], display: true }
    ];

    this.columns = [
      { header: 'Fecha de Movimiento', col: 'FECHA_MOVIMIENTO', isEditable: false },
      { header: 'Monto', col: 'MONTO', isEditable: false },
      { header: 'Tipo de Movimiento', col: 'TIPO_MOVIMIENTO', isEditable: false },
      { header: 'Estado', col: 'ACTIVA_B', isEditable: false },
      { header: 'Cuenta Contable', col: 'CUENTA_CONTABLE', isEditable: false },
      { header: 'Tipo de Cuenta', col: 'DESCRIPCION_TIPO_CUENTA', isEditable: false },
      { header: 'Numero de cuenta', col: 'NUMERO_CUENTA', isEditable: false },
      { header: 'Descripcion', col: 'DESCRIPCION', isEditable: false },
    ];


  }

  previsualizarInfoPersona() {
    this.mostrarMovimientos = false;

    if (this.form && this.form.value.dni) {
      this.afiliadoService.buscarMovimientosPorDNI(this.form.value.dni).subscribe({
        next: (data) => {
          if (data && data.data && data.data.persona) {
            this.persona = data.data.persona;
            this.mostrarMovimientos = true;
            this.getFilas().then(() => this.cargar());
          } else {
            this.limpiarInformacion();
            this.toastr.error('No se encontró información para el DNI ingresado.');
          }
        },
        error: (error) => {
          console.error('Error al obtener los movimientos por DNI', error);
          this.limpiarInformacion();
          this.toastr.error('Ocurrió un error al buscar la información.');
        }
      });
    } else {
      this.limpiarInformacion();
      this.toastr.error('Por favor, ingrese un DNI válido.');
    }
  }

  async obtenerDatos(event: any): Promise<any> {
    this.form = event;
  }

  getFilas = async () => {
    try {

      if (this.form && this.form.value.dni) {
        const data = await this.transaccionesService.obtenerVouchersDeMovimientos(this.form.value.dni).toPromise();


        if (data.length > 0) {

          this.filasT = data.map((movimientos: any) => ({
            FECHA_MOVIMIENTO: movimientos.FECHA_MOVIMIENTO,
            MONTO: movimientos.MONTO,
            DEBITO_CREDITO_B: movimientos.DEBITO_CREDITO_B,
            ACTIVA_B: movimientos.ESTADO_TIPO_MOVIMIENTO,
            CUENTA_CONTABLE: movimientos.CUENTA_CONTABLE,
            DESCRIPCION_TIPO_CUENTA: movimientos.TIPO_CUENTA_DESCRIPCION,
            NUMERO_CUENTA : movimientos.NUMERO_CUENTA,
            CORREO_1 : movimientos.CORREO_1,
            NOMBRE_COMPLETO: movimientos.NOMBRE_COMPLETO,
            TELEFONO_1 : movimientos.TELEFONO_1,
            DESCRIPCION : movimientos.DESCRIPCION,
            TIPO_MOVIMIENTO : movimientos.TIPO_MOVIMIENTO,
            DNI : movimientos.DNI
          }));
        } else {
          this.filasT = [];
        }
      } else {
        this.filasT = [];
      }
    } catch (error) {
      this.filasT = [];
    }
    return this.filasT;
  };

  ejecutarFuncionAsincronaDesdeOtroComponente(funcion: (data: any) => Promise<void>) {
    this.ejecF = funcion;
  }

  cargar() {
    if (this.ejecF) {
      this.ejecF(this.filasT).then(() => {
      });
    }
  }

  async manejarAccionUno(row: any): Promise<void> {
    try {
      const base64Logo = await this.convertirImagenABase64('/assets/images/INPRENET-LOGO.svg');

      const informacionGeneral: Content = {
        table: {
          widths: [150, '*'],  // Ajusta las anchuras según el contenido
          body: [
            [{ text: 'Cliente', style: 'subheader', colSpan: 2, alignment: 'center' }, {}],
            ['Nombre', row.NOMBRE_COMPLETO],
            ['Identificación', row.DNI],
            ['Correo', row.CORREO_1],
            ['Número de cuenta', row.NUMERO_CUENTA],
            ['Cuenta contable', row.CUENTA_CONTABLE],
            ['Teléfono', row.TELEFONO_1],
          ]
        },
        layout: 'noBorders', // Esto elimina las líneas de la tabla para un look más limpio
        margin: [0, 20, 0, 20]  // Margen para separar de otras secciones
      };

      const detallesMovimiento: Content = {
        table: {
          widths: ['*', 180],
          body: [
            [{ text: 'Recibo', style: 'header', colSpan: 2, alignment: 'center' as Alignment }, {}],
            ['Fecha del movimiento', { text: row.FECHA_MOVIMIENTO, style: 'tableText' }],
            ['Descripción', { text: row.DESCRIPCION, style: 'tableText' }],
            ['Tipo de cuenta', { text: row.DESCRIPCION_TIPO_CUENTA, style: 'tableText' }],
            ['Número de cuenta', { text: row.NUMERO_CUENTA, style: 'tableText' }],
            ['Tipo de movimiento', { text: row.TIPO_MOVIMIENTO, style: 'tableText' }],
            ['Débito/Crédito', { text: row.DEBITO_CREDITO_B, style: 'tableText' }],
            ['Monto', { text: `${row.MONTO}`, style: 'monto' }],
          ]
        },
        layout: 'lightHorizontalLines',
        margin: [0, 5, 0, 20]
      };

      const estilos = {
        header: {
          fontSize: 22,
          bold: true,
          alignment: 'center' as Alignment,
          margin: [0, 0, 0, 10] as [number, number, number, number]
        },
        subheader: {
          fontSize: 22,
          bold: true,
          margin: [0, 10, 0, 5] as [number, number, number, number]
        },
        monto: {
          fontSize: 16,
          bold: true,
          color: 'red'
        },
        tableText: {
          fontSize: 12,
          margin: [0, 5, 0, 5] as [number, number, number, number]
        },
        footer: {
          fontSize: 10,
          bold: true,
          color: '#FFFFFF', // Text color
          fillColor: '#1c9588' // Background color
        }
      };

      const documento: TDocumentDefinitions = {
        content: [
          {
            image: base64Logo,
            width: 200,  // Ajusta la anchura del logo según necesites
            alignment: 'left',
            margin: [0, 0, 10, 0]  // Ajusta la posición del logo en la esquina superior derecha
          },
          informacionGeneral,
          detallesMovimiento
        ],

        styles: estilos,
        header: (currentPage: number, pageCount: number): Content | null => {
          if (currentPage === 1) {
            return {
              columns: [
                { text: '', width: '*' },
                { text: `Recibo N°: 5151 - Fecha: ${new Date().toLocaleDateString()}`, alignment: 'right' as Alignment, margin: [0, 10, 10, 0] as [number, number, number, number]}
              ]
            };
          }
          return null;
        },
        footer: (currentPage: number, pageCount: number) => {
          return {
            table: {
              widths: ['*'],
              body: [
                [
                  {
                    text: `© 2024 INPRENET - Todos los derechos reservados | Página ${currentPage} de ${pageCount}`,
                    alignment: 'center',
                    style: 'footer'
                  }
                ]
              ]
            },
            layout: {
              hLineWidth: () => 0,
              vLineWidth: () => 0,
              paddingBottom: () => 5,
              paddingTop: () => 5
            }
          };
        }
      };

      pdfMake.createPdf(documento).open();
    } catch (error) {
      console.error('Error al convertir la imagen a base64 o al generar el PDF:', error);
      this.toastr.error('Error al procesar la imagen.');
    }
  }


  async generarReporte(): Promise<void> {
    if (!this.filasT || this.filasT.length === 0) {
      this.toastr.error('No hay movimientos disponibles para generar el reporte.');
      return;
    }

    try {
      const base64Logo = await this.convertirImagenABase64('/assets/images/INPRENET-LOGO.svg');
      const primerMovimiento = this.filasT[0];
      const currentDate = new Date().toLocaleDateString('es-ES');
      const receiptNumber = Math.floor(Math.random() * 1000000) + 100000;

      const movimientoRows = this.filasT.map((mov: any) => [
        mov.FECHA_MOVIMIENTO,
        mov.MONTO,
        mov.DESCRIPCION,
        mov.TIPO_MOVIMIENTO,
        mov.DEBITO_CREDITO_B ? 'Crédito' : 'Débito',
        mov.NUMERO_CUENTA,
        mov.CUENTA_CONTABLE,
      ]);

      const documento: TDocumentDefinitions = {
        pageOrientation: 'landscape',
        content: [
          { image: base64Logo, width: 200, alignment: 'left', margin: [0, 0, 10, 20] },
          { text: `Reporte de Movimientos para ${primerMovimiento.NOMBRE_COMPLETO}`, style: 'header' },
          {
            table: {
              widths: [80, 120, '*', 100, 100, 100, 100],
              body: [
                [{ text: 'Fecha', style: 'tableHeader' }, { text: 'Monto', style: 'tableHeader' }, { text: 'Descripción', style: 'tableHeader' }, { text: 'Tipo de Movimiento', style: 'tableHeader' }, { text: 'Débito/Crédito', style: 'tableHeader' }, { text: 'Número de Cuenta', style: 'tableHeader' }, { text: 'Cuenta Contable', style: 'tableHeader' }],
                ...movimientoRows
              ]
            },
            layout: 'lightHorizontalLines'
          }
        ],
        styles: {
          header: { fontSize: 18, bold: true, margin: [0, 20, 0, 10], alignment: 'center' },
          tableHeader: {
            fillColor: '#1c9588',
            color: '#FFFFFF',
            bold: true,
            fontSize: 10,
            alignment: 'center'
          },
          tableText: { margin: [0, 5, 0, 5] },
          footer: {
            fillColor: '#1c9588',
            color: '#FFFFFF',
            fontSize: 10,
            bold: true,
            alignment: 'center',
            margin: [0, 5, 0, 5]
          }
        },
        header: {
          columns: [
            { text: '', width: '*' },
            { text: `Fecha: ${currentDate} | Recibo N°: ${receiptNumber}`, alignment: 'right', margin: [0, 10, 20, 0] }
          ],
          margin: [40, 10, 0, 0]
        },
        footer: (currentPage, pageCount) => {
          return {
            table: {
              widths: ['*'],
              body: [
                [{ text: `© 2024 INPRENET - Todos los derechos reservados | Página ${currentPage} de ${pageCount}`, style: 'footer' }]
              ]
            },
            layout: {
              hLineWidth: () => 0,
              vLineWidth: () => 0,
              paddingTop: () => 5,
              paddingBottom: () => 5
            }
          };
        }
      };

      pdfMake.createPdf(documento).open();
    } catch ( error ) {
      console.error('Error al generar el reporte:', error);
      this.toastr.error('Error al generar el reporte.');
    }
  }





  convertirImagenABase64(url: string): Promise<string> {
    return this.http.get(url, { responseType: 'text' }).toPromise().then((svgText:any) => {
      const base64Data = btoa(unescape(encodeURIComponent(svgText)));
      return `data:image/svg+xml;base64,${base64Data}`;
    });
  }



  limpiarInformacion() {
    this.persona = null;
    this.filasT = [];
  }
}
