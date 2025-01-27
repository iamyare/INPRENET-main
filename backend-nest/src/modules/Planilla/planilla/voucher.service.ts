import { Injectable, InternalServerErrorException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Raw, Repository } from 'typeorm';
import * as fs from 'fs';
import * as path from 'path';
import { MailService } from 'src/common/services/mail.service';
import { net_persona } from 'src/modules/Persona/entities/net_persona.entity';
import * as QRCode from 'qrcode';

// Importamos pdfmake como en el frontend
import * as pdfMake from 'pdfmake/build/pdfmake';

@Injectable()
export class VoucherService {
  constructor(
    @InjectRepository(net_persona)
    private personaRepository: Repository<net_persona>,
    private readonly mailService: MailService,
  ) {
  }

  private async getMembreteBase64(): Promise<string> {
    const imagesPath = process.env.IMAGES_PATH || path.resolve(__dirname, '../../../../assets/images');
    const imagePath = path.join(imagesPath, 'membratadoFinal.jpg');
    const base64 = fs.readFileSync(imagePath, { encoding: 'base64' });
    return `data:image/jpeg;base64,${base64}`;
  }

  async generarVoucherByMes(dni: string, mes: number, anio: number): Promise<any> {
    try {
      const persona = await this.personaRepository.findOne({
        where: {
          n_identificacion: dni,
          detallePersona: {
            detalleBeneficio: {
              detallePagBeneficio: {
                estado: 'PAGADA',
                planilla: {
                  periodoInicio: Raw(alias => `EXTRACT(MONTH FROM ${alias}) = :mes AND EXTRACT(YEAR FROM ${alias}) = :anio`, { mes, anio }),
                },
              },
            },
          },
        },
        relations: [
          'personasPorBanco',
          'detallePersona',
          'detallePersona.detalleBeneficio',
          'detallePersona.padreIdPersona',
          'detallePersona.padreIdPersona.persona',
          'detallePersona.detalleBeneficio.beneficio',
          'detallePersona.detalleBeneficio.detallePagBeneficio',
          'detallePersona.detalleBeneficio.detallePagBeneficio.personaporbanco',
          'detallePersona.detalleBeneficio.detallePagBeneficio.personaporbanco.banco',
          'detallePersona.detalleBeneficio.detallePagBeneficio.planilla',
        ],
      });

      const deduccion = await this.personaRepository.findOne({
        where: {
          n_identificacion: dni,
          detalleDeduccion: {
            estado_aplicacion: 'COBRADA',
            planilla: {
              periodoInicio: Raw(alias => `EXTRACT(MONTH FROM ${alias}) = :mes AND EXTRACT(YEAR FROM ${alias}) = :anio`, { mes, anio })
            },
          }
        },
        relations: [
          'detalleDeduccion.personaPorBanco',
          'detalleDeduccion.deduccion',
          'detalleDeduccion.deduccion.centroTrabajo',
          'detalleDeduccion.planilla',
        ]
      });

      return { persona, deduccion };
    } catch (error) {
      console.log(error);
      throw new InternalServerErrorException('Error generando el voucher');
    }
  }

  private obtenerNombreMes(fecha: Date): string {
    const meses = [
      'ENERO', 'FEBRERO', 'MARZO', 'ABRIL', 'MAYO', 'JUNIO',
      'JULIO', 'AGOSTO', 'SEPTIEMBRE', 'OCTUBRE', 'NOVIEMBRE', 'DICIEMBRE'
    ];
    return meses[fecha.getMonth()];
  }

  async generarYEnviarVoucher(dni: string, mes: number, anio: number, correo?: string): Promise<void> {
    const resultados = await this.generarVoucherByMes(dni, mes, anio);

    if (!resultados.persona) {
      throw new Error('No se ha encontrado el registro en el mes brindado');
    }

    const backgroundImageBase64 = await this.getMembreteBase64();

    const persona = resultados.persona;
    const detallePersona = persona.detallePersona || [];

    const periodoInicio = persona?.detallePersona?.[0]?.detalleBeneficio?.[0]?.detallePagBeneficio?.[0]?.planilla?.periodoInicio;
    if (!periodoInicio) {
      throw new Error('No se encontró la fecha de inicio de periodo (periodoInicio)');
    }

    const fecha = (periodoInicio instanceof Date) ? periodoInicio : new Date(periodoInicio);
    if (isNaN(fecha.getTime())) {
      throw new Error('La fecha periodoInicio no es válida.');
    }

    const nombreCompleto = `${persona.primer_apellido} ${persona.segundo_apellido || ''} ${persona.primer_nombre} ${persona.segundo_nombre || ''}`.trim();
    const dniPersona = persona.n_identificacion || 'NO PROPORCIONADO';
    correo = correo || persona.correo_1 || 'NO PROPORCIONADO';

    let sumaBeneficios = 0;
    let sumaDeducciones = 0;

    const causantesMap = new Map();
    detallePersona.forEach((detalle: any) => {
      if (detalle.padreIdPersona?.persona?.n_identificacion) {
        causantesMap.set(detalle.ID_DETALLE_PERSONA, detalle.padreIdPersona.persona.n_identificacion);
      }
    });

    const data: any[] = [];
    detallePersona.forEach((detalle: any) => {
      console.log(detalle.detalleBeneficio);

      detalle.detalleBeneficio?.forEach((beneficio: any) => {
        beneficio.detallePagBeneficio.forEach((pagBeneficio: any) => {
          const montoPorPeriodo = pagBeneficio.monto_a_pagar;
          sumaBeneficios += montoPorPeriodo;
          data.push({
            CAUSANTE: causantesMap.get(detalle.ID_DETALLE_PERSONA) || 'NO APLICA',
            NOMBRE_BENEFICIO: beneficio.beneficio.nombre_beneficio,
            MontoAPagar: montoPorPeriodo,
            METODO_PAGO: beneficio.metodo_pago,
            NOMBRE_BANCO: pagBeneficio.personaporbanco ? pagBeneficio.personaporbanco.banco.nombre_banco : 'NO PROPORCIONADO',
            NUM_CUENTA: pagBeneficio.personaporbanco ? pagBeneficio.personaporbanco.num_cuenta : 'NO PROPORCIONADO'
          });
        });
      });
    });

    let tablaDed: any = {};
    if (resultados.deduccion && resultados.deduccion.detalleDeduccion) {
      const dataDed = resultados.deduccion.detalleDeduccion.map((deduccion: any) => {
        const montoDeduccion = deduccion.monto_aplicado;
        sumaDeducciones += montoDeduccion;

        return {
          NOMBRE_INSTITUCION: deduccion.deduccion.centroTrabajo.nombre_centro_trabajo,
          NOMBRE_DEDUCCION: deduccion.deduccion.nombre_deduccion,
          TotalMontoAplicado: montoDeduccion
        };
      });

      tablaDed = {
        table: {
          widths: ['*', '*', '*'],
          body: [
            [{ text: 'INSTITUCIÓN', style: 'tableHeader' }, { text: 'DEDUCCIÓN', style: 'tableHeader' }, { text: 'MONTO DEDUCCIÓN', style: ['tableHeader', 'alignRight'] }],
            ...dataDed.flatMap((b: any) => {
              return [[
                { text: b.NOMBRE_INSTITUCION || '---------------', alignment: 'left' },
                { text: b.NOMBRE_DEDUCCION || '---------------', alignment: 'left' },
                { text: this.formatCurrency(b.TotalMontoAplicado), style: 'alignRight' }
              ]];
            })
          ]
        },
        margin: [0, 5, 0, 0],
        style: 'tableExample'
      }
    }

    const neto = sumaBeneficios - sumaDeducciones;
    const qrData = `https://script.google.com/macros/s/AKfycbwkPhOJeCFvI2dvsU_o6m3d5pn_1XJoJzGhMoom7FeORLeIU_LovB-2fNeHwf1Hgl6wzQ/exec?name=${encodeURIComponent(
      nombreCompleto,
    )}&dni=${encodeURIComponent(dniPersona)}`;

    const qrImage = await QRCode.toDataURL(qrData);

    const docDefinition: any = {
      background: (currentPage, pageSize) => ({
        image: backgroundImageBase64,
        width: pageSize.width,
        height: pageSize.height,
        absolutePosition: { x: 0, y: 2 },
      }),
      content: [
        {
          stack: [
            {
              text: 'VOUCHER DEL MES DE: ' + this.obtenerNombreMes(new Date(anio, mes - 1)),
              style: 'subheader',
              alignment: 'center',
            },
            {
              columns: [
                [
                  { text: 'BENEFICIARIO', style: 'subheader' },
                  { text: 'NOMBRE: ' + nombreCompleto },
                  { text: 'DNI: ' + dniPersona },
                ],
                [
                  { text: 'DETALLE DE PAGO', style: 'subheader' },
                  { text: 'PAGO TOTAL: ' + this.formatCurrency(neto) },
                  { text: 'MÉTODO DE PAGO: ' + (data[0]?.METODO_PAGO || 'NO PROPORCIONADO') },
                  { text: 'BANCO: ' + (data[0]?.NOMBRE_BANCO || 'NO PROPORCIONADO') },
                ],
              ],
              margin: [0, 10, 0, 0],
            },
            {
              table: {
                widths: ['*', '*', '*'],
                body: [
                  [
                    { text: 'CAUSANTE', style: 'tableHeader' },
                    { text: 'INGRESO', style: 'tableHeader' },
                    { text: 'MONTO INGRESO', style: ['tableHeader', 'alignRight'] },
                  ],
                  ...data.map((b: any) => [
                    { text: b.CAUSANTE },
                    { text: b.NOMBRE_BENEFICIO },
                    { text: this.formatCurrency(b.MontoAPagar), style: 'alignRight' },
                  ]),
                ],
              },
              margin: [0, 5, 0, 0],
              style: 'tableExample',
            },
            tablaDed,
            {
              table: {
                widths: ['*', '*'],
                body: [
                  [
                    { text: 'TOTAL INGRESOS', style: 'tableHeader' },
                    { text: this.formatCurrency(sumaBeneficios), style: ['tableHeader', 'alignRight'] },
                  ],
                ],
              },
              style: 'tableExample',
            },
            {
              table: {
                widths: ['*', '*'],
                body: [
                  [
                    { text: 'TOTAL DEDUCCIONES', style: 'tableHeader' },
                    { text: this.formatCurrency(sumaDeducciones), style: ['tableHeader', 'alignRight'] },
                  ],
                ],
              },
              style: 'tableExample',
            },
            {
              table: {
                widths: ['*', '*'],
                body: [
                  [
                    { text: 'NETO A PAGAR', style: 'tableHeader' },
                    { text: this.formatCurrency(neto), style: ['tableHeader', 'alignRight'] },
                  ],
                ],
              },
              style: 'tableExample',
            },
            {
              text: 'CÓDIGO QR DE VALIDACIÓN',
              style: 'subheader',
              alignment: 'center',
              margin: [0, 20, 0, 10],
            },
            {
              image: qrImage,
              width: 80, // Reducir el tamaño del QR
              alignment: 'center',
            },
          ],
          margin: [0, 0, 0, 0],
        },
      ],
      footer: (currentPage, pageCount) => ({
        table: {
          widths: ['*', '*', '*'],
          body: [
            [
              { text: 'Fecha y Hora: ' + new Date().toLocaleString(), alignment: 'left', border: [false, false, false, false] },
              { text: 'Generó: INPRENET', alignment: 'center', border: [false, false, false, false] },
              { text: 'Página ' + currentPage.toString() + ' de ' + pageCount, alignment: 'right', border: [false, false, false, false] },
            ],
          ],
        },
        margin: [20, 0, 20, 20],
      }),
      pageMargins: [50, 80, 50, 85],
      styles: {
        header: {
          fontSize: 16,
          bold: true,
          margin: [0, 0, 0, 0],
        },
        subheader: {
          fontSize: 12,
          bold: true,
        },
        tableHeader: {
          bold: true,
          fontSize: 13,
          color: 'black',
        },
        tableExample: {
          margin: [0, 5, 0, 15],
        },
        alignRight: {
          alignment: 'right',
        },
      },
      defaultStyle: {
        fontSize: 10,
        //font: 'Roboto',
      },
      pageSize: 'LETTER',
      pageOrientation: 'portrait',
    };


    // Aquí usamos la misma lógica del frontend:
    const pdfBuffer: Buffer = await new Promise((resolve, reject) => {
      // createPdf es igual que en frontend, ahora que setamos el vfs y Roboto
      (pdfMake as any).createPdf(docDefinition).getBuffer((buffer: Uint8Array) => {
        resolve(Buffer.from(buffer));
      });
    });

    const mesNombre = this.obtenerNombreMes(new Date(anio, mes - 1));
    console.log(fecha);

    await this.mailService.sendMail(
      correo,
      'Voucher de pago correspondiente al mes de ' + mesNombre.toUpperCase(),
      `Estimado(a) ${nombreCompleto},
      
      Adjunto encontrará su voucher de pago correspondiente al mes de ${mesNombre.toUpperCase()}. Este documento incluye información detallada sobre sus beneficios, deducciones y otras transacciones relacionadas con el periodo mencionado.
      
      Este comprobante ha sido generado automáticamente y enviado desde el nuevo sistema INPRENET. Por favor, revise cuidadosamente los datos y conserve este comprobante como referencia.
      
      Saludos cordiales,
      
      INPRENET`,
      `<div style="font-family: Arial, sans-serif; color: #333; line-height: 1.5; text-align: center;">
          <h2 style="color: #0D7665;">Voucher de Pago</h2>
          <p>Estimado(a) <strong>${nombreCompleto}</strong>,</p>
          <p>Adjunto encontrará su <strong>voucher de pago</strong> correspondiente al mes de <strong>${mesNombre.toUpperCase()}</strong>.</p>
          <p>Este documento incluye información detallada sobre:</p>
          <ul style="list-style-type: circle; padding-left: 0; display: inline-block; text-align: left;">
              <li>Sus beneficios otorgados durante el periodo.</li>
              <li>Las deducciones aplicadas.</li>
              <li>Otros detalles relevantes a sus transacciones.</li>
          </ul>
          <p>Este comprobante ha sido generado automáticamente y enviado desde el nuevo sistema <strong>INPRENET</strong>.</p>
          <p>Por favor, revise cuidadosamente los datos y conserve este comprobante como referencia.</p>
          <div style="margin-top: 20px;">
              <p>Saludos cordiales,</p>
              <p><strong>INPRENET</strong></p>
          </div>
          <table style="margin-top: 20px; width: 100%; text-align: center; border-spacing: 20px;">
              <tr>
                  <td style="vertical-align: middle;">
                      <img src="cid:logoInprenet" alt="Logo INPRENET" style="width: 150px; height: auto;" />
                  </td>
                  <td style="vertical-align: middle;">
                      <img src="cid:logoInprema" alt="Logo INPREMA" style="width: 200px; height: auto;" />
                  </td>
              </tr>
          </table>
      </div>`,
      [
        {
          filename: 'LOGO-INPRENET.png',
          path: path.join(process.cwd(), 'assets', 'images', 'LOGO-INPRENET.png'),
          cid: 'logoInprenet',
        },
        {
          filename: 'logo-INPREMA-H-Transparente.png',
          path: path.join(process.cwd(), 'assets', 'images', 'logo-INPREMA-H-Transparente.png'),
          cid: 'logoInprema',
        },
        {
          filename: `voucher_${dni}_${mes}_${anio}.pdf`,
          content: pdfBuffer,
          contentType: 'application/pdf',
        },
      ],
    );

  }

  private formatCurrency(value: number): string {
    return new Intl.NumberFormat('es-HN', { style: 'currency', currency: 'HNL' }).format(value);
  }

  async enviarVouchersMasivos(
    personas: { dni: string; correo: string }[],
    mes: number,
    anio: number,
    batchSize: number = 500,
  ): Promise<void> {
    const batches = this.splitIntoBatches(personas, batchSize);

    for (const batch of batches) {
      const mailPromises = batch.map(async (persona) => {
        try {
          await this.generarYEnviarVoucher(persona.dni, mes, anio, persona.correo);
          console.log(`Voucher enviado a ${persona.correo}`);
        } catch (error) {
          console.error(`Error enviando voucher a ${persona.correo}:`, error.message);
        }
      });

      // Esperar que todos los envíos del lote actual finalicen
      await Promise.all(mailPromises);

      // Pausar entre lotes
      await this.delay(5000); // Espera 5 segundos entre lotes
    }
  }

  private splitIntoBatches<T>(items: T[], batchSize: number): T[][] {
    const batches: T[][] = [];
    for (let i = 0; i < items.length; i += batchSize) {
      batches.push(items.slice(i, i + batchSize));
    }
    return batches;
  }

  private delay(ms: number): Promise<void> {
    return new Promise((resolve) => setTimeout(resolve, ms));
  }
}
