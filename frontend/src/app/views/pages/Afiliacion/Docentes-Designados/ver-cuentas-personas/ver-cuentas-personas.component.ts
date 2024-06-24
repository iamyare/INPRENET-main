import { Component, Input, OnInit, OnChanges, SimpleChanges, OnDestroy } from '@angular/core';
import { MatDialog } from '@angular/material/dialog';
import { ToastrService } from 'ngx-toastr';
import { AfiliadoService } from 'src/app/services/afiliado.service';
import { TransaccionesService } from 'src/app/services/transacciones.service';
import { FieldConfig } from 'src/app/shared/Interfaces/field-config';
import { TableColumn } from 'src/app/shared/Interfaces/table-column';
import { convertirFechaInputs } from 'src/app/shared/functions/formatoFecha';
import { unirNombres } from 'src/app/shared/functions/formatoNombresP';
import { DatePipe } from '@angular/common';
import { Subscription } from 'rxjs';
import { HttpClient } from '@angular/common/http';
import * as pdfMake from 'pdfmake/build/pdfmake';
import * as pdfFonts from 'pdfmake/build/vfs_fonts';
import { Validators } from '@angular/forms';
import { AgregarMovimientoComponent } from '../agregar-movimiento/agregar-movimiento.component';
import { ConfirmDialogComponent } from '@docs-components/confirm-dialog/confirm-dialog.component';
import { AgregarCuentasComponent } from '@docs-components/agregar-cuentas/agregar-cuentas.component';
import { EditarDialogComponent } from '@docs-components/editar-dialog/editar-dialog.component';

@Component({
  selector: 'app-ver-cuentas-personas',
  templateUrl: './ver-cuentas-personas.component.html',
  styleUrls: ['./ver-cuentas-personas.component.scss']
})
export class VerCuentasPersonasComponent implements OnInit, OnChanges, OnDestroy {
  convertirFechaInputs = convertirFechaInputs;
  public myFormFields: FieldConfig[] = [];
  form: any;
  @Input() Afiliado: any;
  unirNombres: any = unirNombres;
  datosTabl: any[] = [];
  prevAfil: boolean = false;
  public myColumns: TableColumn[] = [];
  public filas: any[] = [];
  public movimientos: any[] = [];
  ejecF: any;
  private subscriptions: Subscription = new Subscription();
  public loading: boolean = false;

  constructor(
    private svcAfiliado: AfiliadoService,
    private svcTransacciones: TransaccionesService,
    private toastr: ToastrService,
    private dialog: MatDialog,
    private datePipe: DatePipe,
    private http: HttpClient
  ) {
    (pdfMake as any).vfs = pdfFonts.pdfMake.vfs;
  }

  ngOnInit(): void {
    this.initializeComponent();
  }

  ngOnChanges(changes: SimpleChanges): void {
    if (changes['Afiliado'] && this.Afiliado) {
      this.initializeComponent();
    }
  }

  ngOnDestroy(): void {
    this.subscriptions.unsubscribe();
  }

  initializeComponent(): void {
    if (!this.Afiliado) {
      return;
    }

    this.myFormFields = [
      { type: 'text', label: 'Número de identificación del afiliado', name: 'n_identificacion', validations: [Validators.required, Validators.minLength(13), Validators.maxLength(14)], display: true },
    ];

    this.myColumns = [
      { header: 'Número de cuenta', col: 'NUMERO_CUENTA', isEditable: true },
      { header: 'Estado', col: 'ACTIVA_B', isEditable: true },
      { header: 'Fecha de creación', col: 'FECHA_CREACION', isEditable: true },
      { header: 'Creada por', col: 'CREADA_POR', isEditable: true },
      { header: 'Tipo Cuenta', col: 'DESCRIPCION', isEditable: true },
    ];

    this.getFilas();
    this.getMovimientos();
  }

  async obtenerDatos(event: any): Promise<any> {
    this.form = event;
  }

  resetDatos() {
    if (this.form) {
      this.form.reset();
    }
    this.filas = [];
    this.movimientos = [];
    this.Afiliado = undefined;
  }

  async getFilas() {
    this.loading = true;
    this.filas = [];
    if (this.Afiliado) {
      try {
        const data = await this.svcAfiliado.buscarCuentasPorDNI(this.Afiliado.n_identificacion).toPromise();
        this.filas = data.data.persona.cuentas.map((item: any) => {
          return {
            NUMERO_CUENTA: item.NUMERO_CUENTA,
            FECHA_CREACION: item.FECHA_CREACION,
            ACTIVA_B: item.ACTIVA_B,
            CREADA_POR: item.CREADA_POR,
            DESCRIPCION: item.tipoCuenta.DESCRIPCION
          };
        });
      } catch (error) {
        this.toastr.error('Error al cargar los datos de las cuentas de la persona');
        console.error('Error al cargar los datos de las cuentas de la persona', error);
      }
    } else {
      this.resetDatos();
    }
    setTimeout(() => {
      this.loading = false;
      this.cargar();
    }, 1000);
  }

  async getMovimientos() {
    // Simulando la obtención de movimientos. En un escenario real, harías una llamada a un servicio aquí.
    this.movimientos = [
      { NUMERO_CUENTA: '123456', TIPO_CUENTA: 'APORTACION', MONTO: 1000, DESCRIPCION: 'Depósito inicial', FECHA_MOVIMIENTO: new Date(), TIPO: 'DEPOSITOS' },
      { NUMERO_CUENTA: '123456', TIPO_CUENTA: 'COTIZACION', MONTO: -500, DESCRIPCION: 'Retiro', FECHA_MOVIMIENTO: new Date(), TIPO: 'RETIROS' }
    ];
  }

  openAgregarMovimientoDialog(cuenta: any): void {
    const dialogRef = this.dialog.open(AgregarMovimientoComponent, {
      width: '400px',
      data: { cuenta }
    });

    dialogRef.afterClosed().subscribe(result => {
      if (result) {
        const movimiento = {
          NUMERO_CUENTA: cuenta.NUMERO_CUENTA,
          TIPO_CUENTA: result.tipoCuenta,
          MONTO: result.monto,
          DESCRIPCION: result.descripcion,
          FECHA_MOVIMIENTO: new Date(),
          TIPO: result.tipo
        };
        this.movimientos.push(movimiento);
        this.toastr.success('Movimiento agregado correctamente');
      }
    });
  }

  ejecutarFuncionAsincronaDesdeOtroComponente(funcion: (data: any) => Promise<void>) {
    this.ejecF = funcion;
  }

  cargar() {
    if (this.ejecF) {
      this.ejecF(this.filas).then(() => {
      });
    }
  }

  editarFila(row: any) {
    const campos = [
      { nombre: 'NUMERO_CUENTA', tipo: 'text', etiqueta: 'Número de Cuenta', editable: true }
    ];
    const valoresIniciales = {
      NUMERO_CUENTA: row.NUMERO_CUENTA
    };

    this.openDialog(campos, valoresIniciales);
  }

  manejarAccionDos(row: any) {
    const dialogRef = this.dialog.open(ConfirmDialogComponent, {
      width: '350px',
      data: {
        title: 'Confirmación de activación',
        message: '¿Estás seguro de querer activar este elemento?'
      }
    });

    dialogRef.afterClosed().subscribe((result: any) => {
      if (result) {
        this.svcTransacciones.ActivarCuenta(row.NUMERO_CUENTA, {}).subscribe({
          next: (response: any) => {
            this.toastr.success("Cuenta activada correctamente");
            this.getFilas();
          },
          error: (error: any) => {
            console.error('Error al activar la cuenta al que pertenece la persona:', error);
            this.toastr.error('Ocurrió un error al activar la cuenta al que pertenece la persona.');
          }
        });
      }
    });
  }

  manejarAccionTres(row: any) {
    const dialogRef = this.dialog.open(ConfirmDialogComponent, {
      width: '350px',
      data: {
        title: 'Confirmación de desactivación',
        message: '¿Estás seguro de querer desactivar este elemento?'
      }
    });

    dialogRef.afterClosed().subscribe((result: any) => {
      if (result) {
        this.svcTransacciones.desactivarCuenta(row.NUMERO_CUENTA, {}).subscribe({
          next: (response: any) => {
            this.toastr.success("Cuenta desactivada correctamente");
            this.getFilas();
          },
          error: (error: any) => {
            console.error('Error al desactivar la cuenta al que pertenece la persona:', error);
            this.toastr.error('Ocurrió un error al desactivar la cuenta al que pertenece la persona.');
          }
        });
      }
    });
  }

  AgregarBeneficiario() {
    const dialogRef = this.dialog.open(AgregarCuentasComponent, {
      width: '55%',
      height: '75%',
      data: {
        idPersona: this.Afiliado.ID_PERSONA
      }
    });

    dialogRef.afterClosed().subscribe((result: any) => {
      this.getFilas();
    });
  }

  openDialog(campos: any, row: any): void {
    const dialogRef = this.dialog.open(EditarDialogComponent, {
      width: '500px',
      data: { campos: campos, valoresIniciales: row }
    });

    dialogRef.afterClosed().subscribe(async (result: any) => {
    });
  }

  async getMembreteBase64() {
    const response: any = await this.http.get('/assets/images/MEMBRETADO.jpg', { responseType: 'blob' }).toPromise();
    return new Promise<string>((resolve) => {
      const reader = new FileReader();
      reader.onloadend = () => {
        resolve(reader.result as string);
      };
      reader.readAsDataURL(response);
    });
  }

  async generarReporteMovimientos() {
    const base64data = await this.getMembreteBase64();
    const afiliado = this.Afiliado;

    const movimientosData = this.movimientos.map(movimiento => {
      return [
        { text: movimiento.NUMERO_CUENTA, style: 'tableData' },
        { text: movimiento.TIPO_CUENTA, style: 'tableData' },
        { text: movimiento.MONTO, style: 'tableData' },
        { text: movimiento.DESCRIPCION, style: 'tableData' },
        { text: this.datePipe.transform(movimiento.FECHA_MOVIMIENTO, 'dd/MM/yyyy'), style: 'tableData' },
        { text: movimiento.TIPO, style: 'tableData' }
      ];
    });

    const docDefinition: any = {
      pageSize: 'A4',
      pageMargins: [40, 120, 40, 40],
      background: {
        image: base64data,
        width: 595.28,
        height: 841.89
      },
      content: [
        { text: 'Historial de Movimientos', style: 'header' },
        {
          text: [
            'El Instituto Nacional de Previsión del Magisterio (INPREMA) hace constar que el/la Docente: ',
            { text: `${afiliado.primer_nombre} ${afiliado.segundo_nombre} ${afiliado.tercer_nombre} ${afiliado.primer_apellido} ${afiliado.segundo_apellido}`, bold: true },
            ' con Identidad No. ',
            { text: `${afiliado.n_identificacion}`, bold: true },
            ' tiene el siguiente historial de movimientos:'
          ],
          style: 'body'
        },
        { text: '\n\n' },
        {
          table: {
            headerRows: 1,
            widths: ['*', '*', '*', '*', '*', '*'],
            body: [
              [
                { text: 'Número de Cuenta', style: 'tableHeader' },
                { text: 'Tipo de Cuenta', style: 'tableHeader' },
                { text: 'Monto', style: 'tableHeader' },
                { text: 'Descripción', style: 'tableHeader' },
                { text: 'Fecha', style: 'tableHeader' },
                { text: 'Tipo', style: 'tableHeader' }
              ],
              ...movimientosData
            ]
          },
          layout: {
            hLineColor: () => '#000000',
            vLineColor: () => '#000000',
            paddingLeft: () => 5,
            paddingRight: () => 5,
            paddingTop: () => 5,
            paddingBottom: () => 5
          },
          alignment: 'center'
        },
        { text: '\n\n' }, // Añadimos el espacio aquí
        {
          text: `Y para los fines que el interesado estime conveniente, se extiende el presente documento en la ciudad de Tegucigalpa, Departamento de Francisco Morazán, a los ${new Date().getDate()} días del mes de ${new Date().toLocaleString('es-HN', { month: 'long' })} del año ${new Date().getFullYear()}.`,
          style: 'body'
        },
        { text: '\n\n\n' },
        { canvas: [{ type: 'line', x1: 0, y1: 0, x2: 250, y2: 0, lineWidth: 1 }], margin: [127, 120, 0, 0] },
        { text: 'Departamento de Atención al Docente', style: 'signature' },
        { text: 'Firma Autorizada', style: 'signatureTitle' }
      ],
      styles: {
        header: {
          fontSize: 18,
          bold: true,
          alignment: 'center',
          margin: [0, 20, 0, 20],
        },
        body: {
          fontSize: 11,
          alignment: 'justify',
          margin: [40, 0, 40, 5]
        },
        tableHeader: {
          fontSize: 12,
          bold: true,
          alignment: 'center',
          fillColor: '#eeeeee'
        },
        tableData: {
          fontSize: 10,
          alignment: 'center'
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
  }

  async generarReciboMovimiento(movimiento: any) {
    const base64data = await this.getMembreteBase64();
    const afiliado = this.Afiliado;

    const docDefinition: any = {
      pageSize: 'A4',
      pageMargins: [40, 120, 40, 40],
      background: {
        image: base64data,
        width: 595.28,
        height: 841.89
      },
      content: [
        { text: 'Recibo de Movimiento', style: 'header' },
        {
          text: [
            'El Instituto Nacional de Previsión del Magisterio (INPREMA) hace constar que el/la Docente: ',
            { text: `${afiliado.primer_nombre} ${afiliado.segundo_nombre} ${afiliado.tercer_nombre} ${afiliado.primer_apellido} ${afiliado.segundo_apellido}`, bold: true },
            ' con Identidad No. ',
            { text: `${afiliado.n_identificacion}`, bold: true },
            ' tiene el siguiente movimiento registrado:'
          ],
          style: 'body'
        },
        { text: '\n\n' },
        {
          table: {
            headerRows: 1,
            widths: ['*', '*'],
            body: [
              [{ text: 'Campo', style: 'tableHeader' }, { text: 'Detalle', style: 'tableHeader' }],
              [{ text: 'Número de Cuenta', style: 'tableData' }, { text: movimiento.NUMERO_CUENTA, style: 'tableData' }],
              [{ text: 'Tipo de Cuenta', style: 'tableData' }, { text: movimiento.TIPO_CUENTA, style: 'tableData' }],
              [{ text: 'Monto', style: 'tableData' }, { text: movimiento.MONTO, style: 'tableData' }],
              [{ text: 'Descripción', style: 'tableData' }, { text: movimiento.DESCRIPCION, style: 'tableData' }],
              [{ text: 'Fecha', style: 'tableData' }, { text: this.datePipe.transform(movimiento.FECHA_MOVIMIENTO, 'dd/MM/yyyy'), style: 'tableData' }],
              [{ text: 'Tipo', style: 'tableData' }, { text: movimiento.TIPO, style: 'tableData' }]
            ]
          },
          layout: {
            hLineColor: () => '#000000',
            vLineColor: () => '#000000',
            paddingLeft: () => 5,
            paddingRight: () => 5,
            paddingTop: () => 5,
            paddingBottom: () => 5
          },
          alignment: 'center'
        },
        { text: '\n\n' }, // Añadimos el espacio aquí
        {
          text: `Y para los fines que el interesado estime conveniente, se extiende el presente documento en la ciudad de Tegucigalpa, Departamento de Francisco Morazán, a los ${new Date().getDate()} días del mes de ${new Date().toLocaleString('es-HN', { month: 'long' })} del año ${new Date().getFullYear()}.`,
          style: 'body'
        },
        { text: '\n\n\n' },
        { canvas: [{ type: 'line', x1: 0, y1: 0, x2: 250, y2: 0, lineWidth: 1 }], margin: [127, 120, 0, 0] },
        { text: 'Departamento de Atención al Docente', style: 'signature' },
        { text: 'Firma Autorizada', style: 'signatureTitle' }
      ],
      styles: {
        header: {
          fontSize: 18,
          bold: true,
          alignment: 'center',
          margin: [0, 20, 0, 20],
        },
        body: {
          fontSize: 11,
          alignment: 'justify',
          margin: [40, 0, 40, 5]
        },
        tableHeader: {
          fontSize: 12,
          bold: true,
          alignment: 'center',
          fillColor: '#eeeeee'
        },
        tableData: {
          fontSize: 10,
          alignment: 'center'
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
  }
}
