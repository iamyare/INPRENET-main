import { Component, OnInit } from '@angular/core';
import { Validators } from '@angular/forms';
import { AfiliadoService } from 'src/app/services/afiliado.service';
import { FieldConfig } from 'src/app/shared/Interfaces/field-config';
import { TableColumn } from 'src/app/shared/Interfaces/table-column';
import { ToastrService } from 'ngx-toastr';
import { TransaccionesService } from 'src/app/services/transacciones.service';
import * as pdfMake from 'pdfmake/build/pdfmake';
import * as pdfFonts from 'pdfmake/build/vfs_fonts';
import { Alignment } from 'pdfmake/interfaces';

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
              private transaccionesService: TransaccionesService) {
                (pdfMake as any).vfs = pdfFonts.pdfMake.vfs;
               }


  ngOnInit(): void {
    this.myFormFields = [
      { type: 'text', label: 'DNI de la persona', name: 'dni', validations: [Validators.required, Validators.minLength(13), Validators.maxLength(14)], display: true }
    ];

    this.columns = [
      { header: 'Fecha de Movimiento', col: 'FECHA_MOVIMIENTO', isEditable: false },
      { header: 'Monto', col: 'MONTO', isEditable: false },
      { header: 'Tipo de Movimiento', col: 'DEBITO_CREDITO_B', isEditable: false },
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

          console.log(data);


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
            DESCRIPCION : movimientos.DESCRIPCION
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
manejarAccionUno(row: any): void {
    // Define el contenido del recibo
    const contenidoRecibo = [
      { text: 'Recibo', style: 'encabezado' },
      { text: 'Fecha: ' + row.FECHA_MOVIMIENTO },
      { text: 'Nombre: ' + row.NOMBRE_COMPLETO },
      { text: 'Correo: ' + row.CORREO_1 },
      { text: 'Teléfono: ' + row.TELEFONO_1 },
      { text: 'Descripción: ' + row.DESCRIPCION },
      { text: 'Tipo de cuenta: ' + row.DESCRIPCION_TIPO_CUENTA },
      { text: 'Número de cuenta: ' + row.NUMERO_CUENTA },
      { text: 'Cuenta contable: ' + row.CUENTA_CONTABLE },
      { text: 'Tipo de movimiento: ' + row.ACTIVA_B },
      { text: 'Débito/Crédito: ' + row.DEBITO_CREDITO_B },
      { text: 'Monto: ' + row.MONTO },
        // Puedes agregar más detalles del recibo aquí
    ];

    // Define los estilos
    const estilos = {
        encabezado: {
            fontSize: 18,
            bold: true,
            margin: [0, 0, 0, 10] as [number, number, number, number]
        }
    };

    // Define el documento PDF
    const documento = {
        content: contenidoRecibo,
        styles: estilos
    };

    // Genera el PDF
    pdfMake.createPdf(documento).open();
}






  limpiarInformacion() {
    this.persona = null;
    this.filasT = [];
  }
}
