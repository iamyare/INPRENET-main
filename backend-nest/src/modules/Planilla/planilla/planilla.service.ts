import { BadRequestException, ConflictException, Injectable, InternalServerErrorException, Logger, NotFoundException, Res } from '@nestjs/common';
import { CreatePlanillaDto } from './dto/create-planilla.dto';
import { UpdatePlanillaDto } from './dto/update-planilla.dto';
import { InjectEntityManager, InjectRepository } from '@nestjs/typeorm';
import { Net_Detalle_Deduccion } from '../detalle-deduccion/entities/detalle-deduccion.entity';
import { EntityManager, In, QueryFailedError, Raw, Repository } from 'typeorm';
import { net_persona } from '../../Persona/entities/net_persona.entity';
import { Net_Persona_Por_Banco } from '../../banco/entities/net_persona-banco.entity';
import { Net_Planilla } from './entities/net_planilla.entity';
import { Net_TipoPlanilla } from '../tipo-planilla/entities/tipo-planilla.entity';
import { Net_Detalle_Pago_Beneficio } from '../detalle_beneficio/entities/net_detalle_pago_beneficio.entity';
import { PaginationDto } from 'src/common/dtos/pagination.dto';
import { Workbook } from 'exceljs';
import { Response } from 'express';
import { startOfMonth, endOfMonth, getMonth, getYear, format, parse, subMonths } from 'date-fns';
import { Net_Detalle_Beneficio_Afiliado } from '../detalle_beneficio/entities/net_detalle_beneficio_afiliado.entity';
import * as ExcelJS from 'exceljs';
import * as XLSX from 'xlsx';
import { MailService } from 'src/common/services/mail.service';
import * as path from 'path';
import * as fs from 'fs';
import { JwtService } from '@nestjs/jwt';
import { Net_Usuario_Empresa } from 'src/modules/usuario/entities/net_usuario_empresa.entity';

interface Persona {
  N_IDENTIFICACION: string;
  ID_PERSONA: number;
  TOTAL_BENEFICIOS: number;
  NOMBRE_COMPLETO: string;
  TOTAL_DEDUCCIONES_INPREMA?: number;
  TOTAL_DEDUCCIONES_TERCEROS?: number;
  TOTAL_NETO?: number;
}

interface Deduccion {
  ID_PERSONA: number;
  TOTAL_DEDUCCIONES_INPREMA?: number;
  TOTAL_DEDUCCIONES_TERCEROS?: number;
}

@Injectable()
export class PlanillaService {
  private readonly logger = new Logger(PlanillaService.name)

  @InjectRepository(Net_Usuario_Empresa)
  private readonly usuarioEmpRepository: Repository<Net_Usuario_Empresa>

  constructor(
    private jwtService: JwtService,
    @InjectEntityManager() private entityManager: EntityManager,
    @InjectRepository(Net_Planilla)
    private planillaRepository: Repository<Net_Planilla>,
    @InjectRepository(net_persona)
    private personaRepository: Repository<net_persona>,
    @InjectRepository(Net_Detalle_Pago_Beneficio)
    private detallePagBeneficios: Repository<Net_Detalle_Pago_Beneficio>,
    @InjectRepository(Net_TipoPlanilla)
    private tipoPlanillaRepository: Repository<Net_TipoPlanilla>,
    @InjectRepository(Net_Detalle_Deduccion)
    private readonly detalleDeduccionRepository: Repository<Net_Detalle_Deduccion>,
    @InjectRepository(net_persona)
    @InjectRepository(Net_Detalle_Beneficio_Afiliado)
    private readonly detalleBeneficioRepository: Repository<Net_Detalle_Beneficio_Afiliado>,
    private readonly mailService: MailService,
  ) {
  };

  async generarExcelDetallesCompletos(
    idPlanilla: number,
    estado: number,
    @Res() res: Response
  ): Promise<void> {
    if (!idPlanilla || typeof idPlanilla !== 'number') {
      throw new BadRequestException('idPlanilla debe ser un número válido');
    }
    if (estado !== 1 && estado !== 2) {
      throw new BadRequestException('El estado debe ser 1 o 2');
    }

    try {
      const estadoBeneficios = estado === 1 ? 'EN PRELIMINAR' : 'PAGADA';
      const estadoDeducciones = estado === 1 ? 'EN PRELIMINAR' : 'COBRADA';

      const beneficiosQuery = `
        SELECT DISTINCT
          np.n_identificacion AS "DNI",
          TRIM(
              np.primer_apellido ||
              CASE
                  WHEN np.segundo_apellido IS NOT NULL THEN ' ' || TRIM(np.segundo_apellido)
                  ELSE ''
              END ||
              CASE
                  WHEN np.primer_nombre IS NOT NULL THEN ' ' || TRIM(np.primer_nombre)
                  ELSE ''
              END ||
              CASE
                  WHEN np.segundo_nombre IS NOT NULL THEN ' ' || TRIM(np.segundo_nombre)
                  ELSE ''
              END ||
              CASE
                  WHEN np.tercer_nombre IS NOT NULL THEN ' ' || TRIM(np.tercer_nombre)
                  ELSE ''
              END
          ) AS "nombre_completo",
          pb.num_cuenta AS "NUMERO_CUENTA",
          nb.nombre_banco AS "NOMBRE_BANCO",
          b.id_beneficio AS "CODIGO_BENEFICIO",
          b.nombre_beneficio AS "NOMBRE_BENEFICIO",
          dpb.monto_a_pagar AS "MONTO_A_PAGAR",
          dpb.estado AS "ESTADO"
        FROM net_detalle_pago_beneficio dpb
        INNER JOIN net_persona np ON dpb.id_persona = np.id_persona
        LEFT JOIN net_persona_por_banco pb ON dpb.id_af_banco = pb.id_af_banco
        LEFT JOIN net_banco nb ON pb.id_banco = nb.id_banco
        INNER JOIN net_beneficio b ON dpb.id_beneficio = b.id_beneficio
        WHERE dpb.id_planilla = ${idPlanilla} AND dpb.estado = '${estadoBeneficios}'
      `;

      const deduccionesQuery = `
        SELECT DISTINCT
          np.n_identificacion AS "DNI",
          TRIM(
              np.primer_apellido ||
              CASE
                  WHEN np.segundo_apellido IS NOT NULL THEN ' ' || TRIM(np.segundo_apellido)
                  ELSE ''
              END ||
              CASE
                  WHEN np.primer_nombre IS NOT NULL THEN ' ' || TRIM(np.primer_nombre)
                  ELSE ''
              END ||
              CASE
                  WHEN np.segundo_nombre IS NOT NULL THEN ' ' || TRIM(np.segundo_nombre)
                  ELSE ''
              END ||
              CASE
                  WHEN np.tercer_nombre IS NOT NULL THEN ' ' || trim(np.tercer_nombre)
                  ELSE ''
              END
          ) AS "nombre_completo",
          pb.num_cuenta AS "NUMERO_CUENTA",
          nb.nombre_banco AS "NOMBRE_BANCO",
          d.id_deduccion,
          d.nombre_deduccion AS "NOMBRE_DEDUCCION",
          d.cod_deduccion AS "COD_DEDUCCION",
          dd.monto_aplicado AS "MONTO_APLICADO",
          dd.estado_aplicacion AS "ESTADO_APLICACION",
          d.id_centro_trabajo AS "ID_CENTRO_TRABAJO"
        FROM net_detalle_deduccion dd
        INNER JOIN net_persona np ON dd.id_persona = np.id_persona
        LEFT JOIN net_persona_por_banco pb ON dd.id_af_banco = pb.id_af_banco
        LEFT JOIN net_banco nb ON pb.id_banco = nb.id_banco
        INNER JOIN net_deduccion d ON dd.id_deduccion = d.id_deduccion
        WHERE dd.id_planilla = ${idPlanilla} AND dd.estado_aplicacion = '${estadoDeducciones}'
      `;

      const beneficios = await this.entityManager.query(beneficiosQuery);
      const deducciones = await this.entityManager.query(deduccionesQuery);
      const deduccionesInprema = deducciones.filter((item: any) => item.ID_CENTRO_TRABAJO === 1);
      const deduccionesTerceros = deducciones.filter((item: any) => item.ID_CENTRO_TRABAJO !== 1);

      const workbook = new ExcelJS.Workbook();
      const beneficiosSheet = workbook.addWorksheet('Beneficios');
      beneficiosSheet.columns = [
        { header: 'DNI', key: 'DNI', width: 15 },
        { header: 'nombre_completo', key: 'nombre_completo', width: 15 },
        { header: 'Número de Cuenta', key: 'NUMERO_CUENTA', width: 20 },
        { header: 'Nombre del Banco', key: 'NOMBRE_BANCO', width: 25 },
        { header: 'Código Beneficio', key: 'CODIGO_BENEFICIO', width: 15 },
        { header: 'Nombre Beneficio', key: 'NOMBRE_BENEFICIO', width: 30 },
        { header: 'Monto a Pagar', key: 'MONTO_A_PAGAR', width: 15 },
        { header: 'Estado', key: 'ESTADO', width: 15 },
      ];
      beneficiosSheet.addRows(beneficios);

      const deduccionesInpremaSheet = workbook.addWorksheet('Deducciones INPREMA');
      deduccionesInpremaSheet.columns = [
        { header: 'DNI', key: 'DNI', width: 15 },
        { header: 'nombre_completo', key: 'nombre_completo', width: 15 },
        { header: 'Código Deducción', key: 'COD_DEDUCCION', width: 15 },
        { header: 'Nombre Deducción', key: 'NOMBRE_DEDUCCION', width: 30 },
        { header: 'Monto Aplicado', key: 'MONTO_APLICADO', width: 15 },
        { header: 'Estado Aplicación', key: 'ESTADO_APLICACION', width: 20 },
      ];
      deduccionesInpremaSheet.addRows(deduccionesInprema);

      const deduccionesTercerosSheet = workbook.addWorksheet('Deducciones Terceros');
      deduccionesTercerosSheet.columns = [
        { header: 'DNI', key: 'DNI', width: 15 },
        { header: 'nombre_completo', key: 'nombre_completo', width: 15 },
        { header: 'Código Deducción', key: 'COD_DEDUCCION', width: 15 },
        { header: 'Nombre Deducción', key: 'NOMBRE_DEDUCCION', width: 30 },
        { header: 'Monto Aplicado', key: 'MONTO_APLICADO', width: 15 },
        { header: 'Estado Aplicación', key: 'ESTADO_APLICACION', width: 20 },
      ];
      deduccionesTercerosSheet.addRows(deduccionesTerceros);

      res.setHeader(
        'Content-Disposition',
        `attachment; filename="Detalles_Planilla_${idPlanilla}.xlsx"`
      );

      await workbook.xlsx.write(res);
      res.end();
    } catch (error) {
      this.logger.error(`Error al generar el archivo Excel: ${error.message}`, error.stack);
      throw new InternalServerErrorException('Error al generar el archivo Excel.');
    }
  }

  async procesarPagoBeneficio(): Promise<void> {
    try {
      // Rutas de las imágenes para el contenido del correo
      const logoInprenetPath = path.join(process.cwd(), 'assets', 'images', 'LOGO-INPRENET.png');
      const logoInpremaPath = path.join(process.cwd(), 'assets', 'images', 'logo-INPREMA-H-Transparente.png');

      // Ruta del archivo PDF para enviar como adjunto
      const pdfPath = path.join(process.cwd(), 'assets', 'images', 'voucher.pdf');

      // Verificar que las imágenes existan
      if (!fs.existsSync(logoInprenetPath)) {
        this.logger.error('El archivo LOGO-INPRENET.png no se encontró en la ruta: ' + logoInprenetPath);
        throw new InternalServerErrorException('Error: El archivo LOGO-INPRENET.png no se encuentra en la ruta especificada.');
      }

      if (!fs.existsSync(logoInpremaPath)) {
        this.logger.error('El archivo logo-INPREMA H-Transparente.png no se encontró en la ruta: ' + logoInpremaPath);
        throw new InternalServerErrorException('Error: El archivo logo-INPREMA H-Transparente.png no se encuentra en la ruta especificada.');
      }

      if (!fs.existsSync(pdfPath)) {
        this.logger.error('El archivo voucher.pdf no se encontró en la ruta: ' + pdfPath);
        throw new InternalServerErrorException('Error: El archivo voucher.pdf no se encuentra en la ruta especificada.');
      }

      // Contenido del correo
      const to = 'oespinoza@inprema.gob.hn';
      const subject = 'Confirmación de Pago de Beneficio - 60 Rentas';
      const text = 'Se ha realizado el pago de su beneficio de 60 rentas.';
      const html = `
        <div style="font-family: Arial, sans-serif; color: #333;">
          <h2 style="color: #0D7665; margin-bottom: 10px;">Pago de Beneficio Anticipo de Suma Adicional (60 Rentas) Realizado</h2>
          <p style="margin-bottom: 10px;">Estimado usuario,</p>
          <p style="margin-bottom: 10px;">Nos complace informarle que se ha realizado exitosamente el pago de su beneficio correspondiente a <strong>60 rentas</strong>.</p>
          <p style="margin-bottom: 10px;">Por favor, revise su cuenta bancaria para confirmar la recepción de los fondos.</p>
          <p style="margin-bottom: 10px;">Gracias por confiar en nosotros.</p>
          <p style="margin-bottom: 10px;"><strong>INPRENET</strong></p>
          <p style="margin-bottom: 10px;">A continuación, se detalla el pago realizado:</p>
          <div style="display: flex; justify-content: center; align-items: center; gap: 20px; margin: 10px 0;">
            <img src="cid:logoInprenet" alt="Logo INPRENET" style="width: 250px; margin: 0;" />
            <img src="cid:logoInprema" alt="Logo INPREMA" style="width: 300px; margin: 0;" />
          </div>
        </div>
      `;

      // Enviar el correo con las imágenes visibles y el PDF adjunto como archivo descargable
      await this.mailService.sendMail(to, subject, text, html, [
        {
          filename: 'LOGO-INPRENET.png',
          path: logoInprenetPath,
          cid: 'logoInprenet' // Muestra la imagen en el cuerpo del correo
        },
        {
          filename: 'logo-INPREMA H-Transparente.png',
          path: logoInpremaPath,
          cid: 'logoInprema' // Muestra la imagen en el cuerpo del correo
        },
        {
          filename: 'voucher.pdf',  // El archivo PDF que se enviará como adjunto
          path: pdfPath,            // Ruta del PDF para descargar
          contentType: 'application/pdf' // Definir el tipo de contenido como PDF
        }
      ]);

      this.logger.log('Correo de notificación enviado exitosamente.');
    } catch (error) {
      this.logger.error('Error al enviar el correo de notificación:', error.message);
      throw new InternalServerErrorException('Error al enviar el correo de notificación.');
    }
  }

  async realizarPagoBeneficiosEstatico() {
    const emailSubject = 'Confirmación de Pago de Beneficios';
    const emailText = 'Este es un mensaje estático de confirmación de pago de beneficios.';
    const emailHtml = `
      <div style="font-family: Arial, sans-serif; padding: 20px; background-color: #f4f4f4;">
        <div style="text-align: center; background-color: #0D7665; padding: 20px; border-radius: 8px 8px 0 0;">
          <img src="/assets/images/logo-INPREMA-H-Transparente.png" alt="Logo INPREMA" style="max-width: 120px; margin-bottom: 10px;">
          <h1 style="color: #ffffff; margin: 0;">Pago de Beneficios</h1>
        </div>
        <div style="background-color: #ffffff; padding: 20px; border-radius: 0 0 8px 8px;">
          <p>Estimado/a beneficiario/a,</p>
          <p>Nos complace informarle que el pago de sus beneficios ha sido procesado exitosamente.</p>
          <p>Si tiene alguna pregunta, no dude en ponerse en contacto con nosotros.</p>
          <p>Atentamente,</p>
          <p>El equipo de INPREMA</p>
        </div>
        <footer style="text-align: center; margin-top: 20px; font-size: 12px; color: #888;">
          <small>Este es un correo generado automáticamente, por favor no responda.</small>
        </footer>
      </div>
    `;
    const destinatario = 'emanuel070801@gmail.com';
    try {
      await this.mailService.sendMail(destinatario, emailSubject, emailText, emailHtml);
      this.logger.log(`Correo de confirmación enviado a ${destinatario}`);
    } catch (error) {
      this.logger.error('Error al enviar el correo de confirmación', error);
      throw new InternalServerErrorException('No se pudo enviar el correo de confirmación');
    }
  }

  async obtenerPlanillasPorPersona(dni: string): Promise<any> {
    try {
      // Buscar la persona con sus detalles de beneficios y pagos
      const persona = await this.personaRepository.findOne({
        where: { n_identificacion: dni },
        relations: [
          'detallePersona',
          'detallePersona.detalleBeneficio',
          'detallePersona.detalleBeneficio.detallePagBeneficio',
          'detallePersona.detalleBeneficio.detallePagBeneficio.planilla'
        ]
      });

      if (!persona) {
        throw new Error('No se encontró persona con ese DNI');
      }

      // Extraer las planillas de los pagos realizados
      const planillas = persona.detallePersona.flatMap(detalle =>
        detalle.detalleBeneficio.flatMap(beneficio =>
          beneficio.detallePagBeneficio.map(pago => ({
            id_planilla: pago.planilla.id_planilla,
            codigo_planilla: pago.planilla.codigo_planilla,
            fecha_apertura: pago.planilla.fecha_apertura,
            fecha_cierre: pago.planilla.fecha_cierre,
            secuencia: pago.planilla.secuencia,
            estado: pago.planilla.estado,
            periodoInicio: pago.planilla.periodoInicio,
            periodoFinalizacion: pago.planilla.periodoFinalizacion
          }))
        )
      );

      // Organizar planillas por id para evitar duplicados
      const planillasUnicas = {};
      planillas.forEach(planilla => {
        planillasUnicas[planilla.id_planilla] = planilla;
      });

      // Convertir el objeto a un array
      const planillasResult = Object.values(planillasUnicas);

      // Retornar el resultado de las planillas
      return planillasResult;

    } catch (error) {
      console.error(error);
      throw new Error('Error al obtener las planillas');
    }
  }

  async obtenerPagosYBeneficiosPorPersona(idPlanilla: number, dni: string): Promise<any> {
    try {
      const persona = await this.personaRepository.findOne({
        where: { n_identificacion: dni },
        relations: [
          'detallePersona',
          'detallePersona.detalleBeneficio',
          'detallePersona.detalleBeneficio.beneficio',
          'detallePersona.detalleBeneficio.detallePagBeneficio',
          'detallePersona.detalleBeneficio.detallePagBeneficio.planilla',
          'detallePersona.detalleBeneficio.detallePagBeneficio.personaporbanco',
          'detallePersona.detalleBeneficio.detallePagBeneficio.personaporbanco.banco',
          'detalleDeduccion',
          'detalleDeduccion.deduccion',
          'detalleDeduccion.planilla'
        ]
      });

      // Ordenar los pagos dentro de cada beneficio por fecha_cierre de la planilla
      persona.detallePersona.forEach(detalle => {
        detalle.detalleBeneficio.forEach(beneficio => {
          beneficio.detallePagBeneficio.sort((a, b) => {
            const fechaA = a.planilla?.fecha_cierre ? new Date(a.planilla.fecha_cierre).getTime() : 0;
            const fechaB = b.planilla?.fecha_cierre ? new Date(b.planilla.fecha_cierre).getTime() : 0;
            return fechaB - fechaA; // Ordenar de la más reciente a la más antigua
          });
        });
      });

      if (!persona) {
        throw new Error('No se encontró persona con ese DNI');
      }

      // Extraer los datos básicos de la persona
      const personaDatos = {
        id_persona: persona.id_persona,
        dni: persona.n_identificacion,
        primer_nombre: persona.primer_nombre,
        segundo_nombre: persona.segundo_nombre,
        primer_apellido: persona.primer_apellido,
        segundo_apellido: persona.segundo_apellido,
        direccion: persona.direccion_residencia,
        correo: persona.correo_1,
        telefono: persona.telefono_1,
      };
      // Obtener la planilla correspondiente
      const planilla = await this.planillaRepository.findOne({
        where: { id_planilla: idPlanilla }
      });

      // Extraer y ordenar beneficios
      const beneficios = persona.detallePersona.flatMap(detalle =>
        detalle.detalleBeneficio.flatMap(beneficio => {
          const pagos = beneficio.detallePagBeneficio.filter(pago => pago.planilla.id_planilla === idPlanilla);
          if (pagos.length > 0) {
            return {
              beneficio: beneficio.beneficio.nombre_beneficio,
              monto_total: beneficio.monto_total,
              monto_por_periodo: beneficio.monto_por_periodo,
              metodo_pago: beneficio.metodo_pago,
              fecha_cierre: pagos[0].planilla.fecha_cierre, // Extrae la fecha de cierre
              pagos: pagos.map(pago => ({
                monto_a_pagar: pago.monto_a_pagar,
                estado: pago.estado,
                banco: pago.personaporbanco?.banco?.nombre_banco || null,
                num_cuenta: pago.personaporbanco?.num_cuenta || null,
                fecha_pago: pago.fecha_carga,
              }))
            };
          }
          return [];
        })
      ).sort((a, b) => new Date(b.fecha_cierre).getTime() - new Date(a.fecha_cierre).getTime()); // Ordenar por fecha_cierre

      // Extraer y ordenar deducciones
      const deducciones = persona.detalleDeduccion
        .filter(deduccion => deduccion.planilla.id_planilla === idPlanilla)
        .map(deduccion => ({
          deduccion: deduccion.deduccion.nombre_deduccion,
          monto_total: deduccion.monto_total,
          estado_aplicacion: deduccion.estado_aplicacion,
          monto_aplicado: deduccion.monto_aplicado,
          fecha_cierre: deduccion.planilla.fecha_cierre, // Extrae la fecha de cierre
        }))
        .sort((a, b) => new Date(b.fecha_cierre).getTime() - new Date(a.fecha_cierre).getTime()); // Ordenar por fecha_cierre



      const planillaDatos = {
        codigo_planilla: planilla.codigo_planilla,
        fecha_apertura: planilla.fecha_apertura,
        fecha_cierre: planilla.fecha_cierre,
        secuencia: planilla.secuencia,
        estado: planilla.estado,
        periodoInicio: planilla.periodoInicio,
        periodoFinalizacion: planilla.periodoFinalizacion
      };

      let data = {
        persona: personaDatos,
        planilla: planillaDatos,
        beneficios,
        deducciones
      }
      console.log(data);

      return data;

    } catch (error) {
      console.error(error);
      throw new Error('Error al obtener los pagos, deducciones y bancos');
    }
  }

  async updateFallecidoStatusFromExcel(file: Express.Multer.File) {
    const workbook = XLSX.read(file.buffer, { type: 'buffer', cellText: false, cellDates: true });
    const worksheet = workbook.Sheets[workbook.SheetNames[0]];
    const data = XLSX.utils.sheet_to_json(worksheet, { raw: false, defval: "" });
    for (const row of data) {
      const nIdentificacion = row['IDENTIDAD'].toString().trim();
      const persona = await this.personaRepository.findOne({
        where: { n_identificacion: nIdentificacion },
      });
      if (persona) {
        persona.fallecido = 'SI';
        await this.personaRepository.save(persona);
      }
    }
    return { message: 'Actualización completada' };
  }

  async obtenerDetallePagoBeneficioPorPlanilla(id_planilla: number, @Res() res: Response) {
    const results = await this.detallePagBeneficios
      .createQueryBuilder('detallePago')
      .select([
        'banco.cod_banco AS "codigo_banco"',
        'personaPorBanco.num_cuenta AS "numero_cuenta"',
        'detallePago.monto_a_pagar AS "monto_a_pagar"',
        `persona.primer_apellido || ' ' || COALESCE(persona.segundo_apellido, '') || ' ' || persona.primer_nombre || ' ' || COALESCE(persona.segundo_nombre, '') AS "nombre_completo"`,
        'tipoPlanilla.id_tipo_planilla AS "id_tipo_planilla"',
        'persona.n_identificacion AS "n_identificacion"',
      ])
      .innerJoin('detallePago.personaporbanco', 'personaPorBanco')
      .innerJoin('personaPorBanco.banco', 'banco')
      .innerJoin('personaPorBanco.persona', 'persona')
      .innerJoin('detallePago.planilla', 'planilla')
      .innerJoin('planilla.tipoPlanilla', 'tipoPlanilla')
      .where('planilla.id_planilla = :id_planilla', { id_planilla })
      .getRawMany();
    const workbook = new ExcelJS.Workbook();
    const worksheet = workbook.addWorksheet('Sheet 1');
    const currentDate = format(new Date(), 'dd/MM/yyyy');
    results.forEach(result => {
      const concatenatedRow = [
        result.codigo_banco,
        result.numero_cuenta,
        Number(parseFloat(result.monto_a_pagar).toFixed(2)),
        result.nombre_completo.replace(/\s+/g, ''),
        currentDate,
        result.id_tipo_planilla,
        result.n_identificacion,
      ].join(',');

      worksheet.addRow([concatenatedRow]);
    });
    res.setHeader('Content-Type', 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet');
    res.setHeader('Content-Disposition', 'attachment; filename=concatenated_results.xlsx');
    await workbook.xlsx.write(res);
    res.end();
  }

  async verificarBeneficioEnExcel(filePath: string): Promise<void> {
    const workbook = XLSX.readFile(filePath);
    const worksheet = workbook.Sheets[workbook.SheetNames[0]];

    const data: any[] = XLSX.utils.sheet_to_json(worksheet, { header: 1 });

    let totalRegistros = 0;
    let beneficiosAsignados = 0;
    let beneficiosNoAsignados = 0;

    for (let i = 1; i < data.length; i++) {
      const row = data[i];
      const nIdentificacion = row[0]?.toString().trim();
      const idBeneficio = row[1]?.toString().trim();

      if (!nIdentificacion || !idBeneficio) {
        this.logger.warn(`Fila ${i + 1} ignorada: valores incompletos.`);
        continue;
      }

      totalRegistros++;

      try {
        const beneficioAsignado = await this.verificarBeneficioAsignado(nIdentificacion, parseInt(idBeneficio, 10));
        if (beneficioAsignado) {
          beneficiosAsignados++;
        } else {
          beneficiosNoAsignados++;
        }
      } catch (error) {
        this.logger.error(`Error en la fila ${i + 1} con DNI ${nIdentificacion} y ID_BENEFICIO ${idBeneficio}: ${error.message}`);
      }
    }

    this.logger.log(`Total de registros procesados: ${totalRegistros}`);
    this.logger.log(`Beneficios asignados: ${beneficiosAsignados}`);
    this.logger.log(`Beneficios no asignados: ${beneficiosNoAsignados}`);
  }

  private async verificarBeneficioAsignado(nIdentificacion: string, idBeneficio: number): Promise<boolean> {
    const persona = await this.personaRepository.findOne({
      where: { n_identificacion: nIdentificacion },
    });

    if (!persona) {
      this.logger.error(`Persona con N_IDENTIFICACION ${nIdentificacion} no encontrada.`);
      throw new NotFoundException(`Persona con N_IDENTIFICACION ${nIdentificacion} no encontrada.`);
    }

    // Verificar si el beneficio está asignado a la persona usando SQL nativo
    const beneficioAsignado = await this.detalleBeneficioRepository.query(
      `SELECT * FROM NET_DETALLE_BENEFICIO_AFILIADO WHERE ID_DETALLE_PERSONA IN 
      (SELECT ID_DETALLE_PERSONA FROM NET_DETALLE_PERSONA WHERE ID_PERSONA = :1) 
      AND ID_BENEFICIO = :2`,
      [persona.id_persona, idBeneficio]
    );

    if (beneficioAsignado.length > 0) {
      this.logger.log(`La persona con N_IDENTIFICACION ${nIdentificacion} tiene asignado el beneficio con ID_BENEFICIO ${idBeneficio}.`);
      return true;
    } else {
      this.logger.log(`La persona con N_IDENTIFICACION ${nIdentificacion} NO tiene asignado el beneficio con ID_BENEFICIO ${idBeneficio}.`);
      return false;
    }
  }

  async getActivePlanillas(clasePlanilla?: string): Promise<Net_Planilla[]> {
    const query = this.planillaRepository.createQueryBuilder('planilla')
      .leftJoinAndSelect('planilla.tipoPlanilla', 'tipoPlanilla')
      .where('planilla.estado = :estado', { estado: 'ACTIVA' });

    if (clasePlanilla) {
      query.andWhere('tipoPlanilla.clase_planilla = :clasePlanilla', { clasePlanilla });
    }

    try {
      return await query.getMany();
    } catch (error) {
      this.logger.error('Error al obtener planillas activas', error);
      throw new InternalServerErrorException('Error al obtener planillas activas');
    }
  }

  async getCerradasPlanillas(clasePlanilla?: string): Promise<Net_Planilla[]> {
    const query = this.planillaRepository.createQueryBuilder('planilla')
      .leftJoinAndSelect('planilla.tipoPlanilla', 'tipoPlanilla')
      .where('planilla.estado = :estado', { estado: 'CERRADA' })
      .orderBy('planilla.periodoInicio', 'DESC');

    if (clasePlanilla) {
      query.andWhere('tipoPlanilla.clase_planilla = :clasePlanilla', { clasePlanilla });
    }

    try {
      return await query.getMany();
    } catch (error) {
      this.logger.error('Error al obtener planillas activas', error);
      throw new InternalServerErrorException('Error al obtener planillas activas');
    }
  }

  async getcerradas_fecha(fechaInicio: string, fechaFinalizacion: string): Promise<Net_Planilla[]> {

    try {
      if (fechaInicio && fechaFinalizacion) {
        const query = this.planillaRepository.createQueryBuilder('planilla')
          .innerJoinAndSelect('planilla.tipoPlanilla', 'tipoPlanilla')
          .where('planilla.estado = :estado', { estado: 'CERRADA' })
          .andWhere('planilla.PERIODO_INICIO BETWEEN :fechaInicio AND :fechaFinalizacion', { fechaInicio, fechaFinalizacion });

        const planillas = await query.getMany();
        if (planillas.length === 0) {
          // Si no existen filas
          return null; // o cualquier otro valor que desees retornar cuando no haya resultados
        }

        // Retorna las filas si existen
        return planillas;
      }
    } catch (error) {
      this.logger.error('Error al obtener planillas activas', error);
      throw new InternalServerErrorException('Error al obtener planillas activas');
    }
  }

  async findOne(codigoPlanilla: string): Promise<Net_Planilla | undefined> {
    const planilla = await this.planillaRepository.findOne({
      where: { codigo_planilla: codigoPlanilla, estado: 'ACTIVA' },
      relations: ['tipoPlanilla'],
    });

    if (!planilla) {
      throw new NotFoundException(`Planilla con código ${codigoPlanilla} no encontrada.`);
    }

    return planilla;
  }

  async update(id_planilla: number, updatePlanillaDto: UpdatePlanillaDto): Promise<any> {
    try {
      const planilla = await this.planillaRepository.preload({
        id_planilla: id_planilla,
        ...updatePlanillaDto
      });
      if (!planilla) throw new NotFoundException(`Planilla con el ID: ${id_planilla} no encontrada`);
      await this.planillaRepository.save(planilla);
      return planilla;
    } catch (error) {
      console.log(error);
      this.handleException(error);
    }
  }

  async GetBeneficiosPorPlanilla(idPlanilla: number): Promise<any> {
    const query = `
      SELECT 
        ben."ID_BENEFICIO" AS "ID_BENEFICIO",
        ben."NOMBRE_BENEFICIO" AS "NOMBRE_BENEFICIO",
        ben."CODIGO" AS "CODIGO_BENEFICIO",
        SUM(dpb."MONTO_A_PAGAR") AS "TOTAL_MONTO_BENEFICIO"
      FROM 
        "NET_DETALLE_PAGO_BENEFICIO" dpb
      INNER JOIN 
        "NET_BENEFICIO" ben 
        ON dpb."ID_BENEFICIO" = ben."ID_BENEFICIO"
      INNER JOIN 
        "NET_PLANILLA" plan 
        ON dpb."ID_PLANILLA" = plan."ID_PLANILLA"
      WHERE 
        plan."ID_PLANILLA" = :idPlanilla
      GROUP BY 
        ben."ID_BENEFICIO", 
        ben."NOMBRE_BENEFICIO", 
        ben."CODIGO"
    `;

    try {
      return await this.entityManager.query(query, [idPlanilla]);
    } catch (error) {
      console.error('Error al obtener los totales de beneficios:', error);
      throw new InternalServerErrorException('Error al obtener los totales de beneficios');
    }
  }

  async GetDeduccionesInpremaPorPlanilla(idPlanilla: number): Promise<any> {
    const query = `
      SELECT 
        ded."ID_DEDUCCION" AS "ID_DEDUCCION",
        ded."NOMBRE_DEDUCCION" AS "NOMBRE_DEDUCCION",
        SUM(dedd."MONTO_APLICADO") AS "TOTAL_MONTO_DEDUCCION"
      FROM 
        "NET_DETALLE_DEDUCCION" dedd
      INNER JOIN 
        "NET_DEDUCCION" ded 
        ON dedd."ID_DEDUCCION" = ded."ID_DEDUCCION"
      INNER JOIN 
        "NET_PLANILLA" plan 
        ON dedd."ID_PLANILLA" = plan."ID_PLANILLA"
      WHERE 
        plan."ID_PLANILLA" = :idPlanilla
        AND ded."ID_CENTRO_TRABAJO" = 1  -- ID para INPREMA
      GROUP BY 
        ded."ID_DEDUCCION", 
        ded."NOMBRE_DEDUCCION"
    `;

    try {
      return await this.entityManager.query(query, [idPlanilla]);
    } catch (error) {
      console.error('Error al obtener los totales de deducciones INPREMA:', error);
      throw new InternalServerErrorException('Error al obtener los totales de deducciones INPREMA');
    }
  }

  async GetDeduccionesTercerosPorPlanilla(idPlanilla: number): Promise<any> {
    const query = `
      SELECT 
        ded."ID_DEDUCCION" AS "ID_DEDUCCION",
        ded."NOMBRE_DEDUCCION" AS "NOMBRE_DEDUCCION",
        SUM(dedd."MONTO_APLICADO") AS "TOTAL_MONTO_DEDUCCION"
      FROM 
        "NET_DETALLE_DEDUCCION" dedd
      INNER JOIN 
        "NET_DEDUCCION" ded 
        ON dedd."ID_DEDUCCION" = ded."ID_DEDUCCION"
      INNER JOIN 
        "NET_PLANILLA" plan 
        ON dedd."ID_PLANILLA" = plan."ID_PLANILLA"
      WHERE 
        plan."ID_PLANILLA" = :idPlanilla
        AND ded."ID_CENTRO_TRABAJO" != 1
      GROUP BY 
        ded."ID_DEDUCCION", 
        ded."NOMBRE_DEDUCCION"
    `;

    try {
      return await this.entityManager.query(query, [idPlanilla]);
    } catch (error) {
      console.error('Error al obtener los totales de deducciones Terceros:', error);
      throw new InternalServerErrorException('Error al obtener los totales de deducciones Terceros');
    }
  }

  async GetDeduccionesPorPlanilla(idPlanilla: number): Promise<any> {
    const query = `
      SELECT 
        ded."ID_DEDUCCION" AS "ID_DEDUCCION",
        ded."NOMBRE_DEDUCCION" AS "NOMBRE_DEDUCCION",
        SUM(dedd."MONTO_APLICADO") AS "TOTAL_MONTO_DEDUCCION"
      FROM 
        "NET_DETALLE_DEDUCCION" dedd
      INNER JOIN 
        "NET_DEDUCCION" ded 
        ON dedd."ID_DEDUCCION" = ded."ID_DEDUCCION"
      INNER JOIN 
        "NET_PLANILLA" plan 
        ON dedd."ID_PLANILLA" = plan."ID_PLANILLA"
      WHERE 
        plan."ID_PLANILLA" = :idPlanilla
      GROUP BY 
        ded."ID_DEDUCCION", 
        ded."NOMBRE_DEDUCCION", 
        ded."ID_CENTRO_TRABAJO"
    `;

    try {
      return await this.entityManager.query(query, [idPlanilla]);
    } catch (error) {
      console.error('Error al obtener los totales de deducciones:', error);
      throw new InternalServerErrorException('Error al obtener los totales de deducciones');
    }
  }

  async getTotalPorBeneficiosYDeducciones(idPlanilla: number): Promise<any> {
    try {
      const beneficios = await this.GetBeneficiosPorPlanilla(idPlanilla);
      const deduccionesInprema = await this.GetDeduccionesInpremaPorPlanilla(idPlanilla);
      const deduccionesTerceros = await this.GetDeduccionesTercerosPorPlanilla(idPlanilla);

      return { beneficios, deduccionesInprema, deduccionesTerceros };

    } catch (error) {
      console.error('Error al obtener los totales por planilla:', error);
      throw new InternalServerErrorException('Error al obtener los totales por planilla');
    }
  }

  async getBeneficiosPorPeriodo(
    periodoInicio: string,
    periodoFinalizacion: string,
    idTiposPlanilla: number[],
  ): Promise<any[]> {

    let query = "";

    if (JSON.stringify(idTiposPlanilla) == '[1,2]') {
      query = `
                SELECT 
    BENEFICIOS, 
    NOMBRE_BENEFICIO, 
    NUMERO_PAGOS, 
    NUMERO_LOTE, 
    ID_PLANILLA, 
    SUM(TOTAL_MONTO_A_PAGAR) AS TOTAL_MONTO_BENEFICIO
FROM 
    (
        SELECT 
            LISTAGG(CASE WHEN PB.ID_BENEFICIO <> 6 THEN PB.ID_BENEFICIO END, ', ') 
                WITHIN GROUP (ORDER BY PB.ID_BENEFICIO) AS BENEFICIOS, 
            MAX(B.NOMBRE_BENEFICIO) AS NOMBRE_BENEFICIO, 
            PER.NUMERO_PAGOS, 
            PER.NUMERO_LOTE, 
            PER.ID_PLANILLA, 
            (
                SELECT SUM(SUB.MONTO_A_PAGAR) 
                FROM NET_DETALLE_PAGO_BENEFICIO SUB 
                JOIN NET_PLANILLA PER ON SUB.ID_PLANILLA = PER.ID_PLANILLA 
                WHERE SUB.ID_PERSONA = PB.ID_PERSONA 
                  AND SUB.ID_DETALLE_PERSONA = PB.ID_DETALLE_PERSONA 
                  AND SUB.ID_CAUSANTE = PB.ID_CAUSANTE 
                  AND PER.PERIODO_INICIO >= TO_DATE(:periodoInicio, 'DD/MM/YYYY') 
                  AND PER.PERIODO_FINALIZACION <= TO_DATE(:periodoFinalizacion, 'DD/MM/YYYY') 
                  AND PER.ID_TIPO_PLANILLA = 1
            ) AS TOTAL_MONTO_A_PAGAR 
        FROM 
            NET_DETALLE_PAGO_BENEFICIO PB 
        JOIN 
            NET_BENEFICIO B ON PB.ID_BENEFICIO = B.ID_BENEFICIO 
        JOIN 
            NET_PLANILLA PER ON PB.ID_PLANILLA = PER.ID_PLANILLA 
        LEFT JOIN 
            NET_PERSONA_POR_BANCO ppb ON PB.ID_AF_BANCO = ppb.ID_AF_BANCO 
        WHERE 
            PB.ESTADO = 'PAGADA' 
            AND PER.PERIODO_INICIO >= TO_DATE(:periodoInicio, 'DD/MM/YYYY') 
            AND PER.PERIODO_FINALIZACION <= TO_DATE(:periodoFinalizacion, 'DD/MM/YYYY') 
            AND PER.ID_TIPO_PLANILLA = 1 
        GROUP BY 
            PB.ID_PERSONA, 
            PB.ID_DETALLE_PERSONA, 
            PB.ID_CAUSANTE, 
            PER.NUMERO_PAGOS, 
            PER.NUMERO_LOTE, 
            PER.ID_PLANILLA 
    ) 
GROUP BY 
    BENEFICIOS, 
    NOMBRE_BENEFICIO, 
    NUMERO_PAGOS, 
    NUMERO_LOTE, 
    ID_PLANILLA 

UNION ALL 

SELECT 
    BENEFICIOS, 
    NOMBRE_BENEFICIO, 
    NUMERO_PAGOS, 
    NUMERO_LOTE, 
    ID_PLANILLA, 
    SUM(TOTAL_MONTO_A_PAGAR) AS TOTAL_MONTO_BENEFICIO 
FROM 
    (
        SELECT 
            CASE 
                WHEN LISTAGG(PB.ID_BENEFICIO, ', ') WITHIN GROUP (ORDER BY PB.ID_BENEFICIO) LIKE '%10%' 
                     AND LISTAGG(PB.ID_BENEFICIO, ', ') WITHIN GROUP (ORDER BY PB.ID_BENEFICIO) LIKE '%101%' 
                     THEN '10, 101' 
                WHEN LISTAGG(PB.ID_BENEFICIO, ', ') WITHIN GROUP (ORDER BY PB.ID_BENEFICIO) LIKE '%10%' 
                     OR LISTAGG(PB.ID_BENEFICIO, ', ') WITHIN GROUP (ORDER BY PB.ID_BENEFICIO) LIKE '%101%' 
                     THEN '10, 101' 
                ELSE LISTAGG(PB.ID_BENEFICIO, ', ') WITHIN GROUP (ORDER BY PB.ID_BENEFICIO) 
            END AS BENEFICIOS, 
            CASE 
                WHEN LISTAGG(PB.ID_BENEFICIO, ', ') WITHIN GROUP (ORDER BY PB.ID_BENEFICIO) LIKE '%10%' 
                     OR LISTAGG(PB.ID_BENEFICIO, ', ') WITHIN GROUP (ORDER BY PB.ID_BENEFICIO) LIKE '%101%' 
                     THEN 'CONTINUACION DE JUBILACION' 
                ELSE MAX(B.NOMBRE_BENEFICIO) 
            END AS NOMBRE_BENEFICIO, 
            PER.NUMERO_PAGOS, 
            PER.NUMERO_LOTE, 
            PER.ID_PLANILLA, 
            (
                SELECT SUM(SUB.MONTO_A_PAGAR) 
                FROM NET_DETALLE_PAGO_BENEFICIO SUB 
                JOIN NET_PLANILLA PER ON SUB.ID_PLANILLA = PER.ID_PLANILLA 
                WHERE SUB.ID_PERSONA = PB.ID_PERSONA 
                  AND SUB.ID_DETALLE_PERSONA = PB.ID_DETALLE_PERSONA 
                  AND SUB.ID_CAUSANTE = PB.ID_CAUSANTE 
                  AND PER.PERIODO_INICIO >= TO_DATE(:periodoInicio, 'DD/MM/YYYY') 
                  AND PER.PERIODO_FINALIZACION <= TO_DATE(:periodoFinalizacion, 'DD/MM/YYYY') 
                  AND PER.ID_TIPO_PLANILLA = 2
            ) AS TOTAL_MONTO_A_PAGAR 
        FROM 
            NET_DETALLE_PAGO_BENEFICIO PB 
        JOIN 
            NET_BENEFICIO B ON PB.ID_BENEFICIO = B.ID_BENEFICIO 
        JOIN 
            NET_PLANILLA PER ON PB.ID_PLANILLA = PER.ID_PLANILLA 
        LEFT JOIN 
            NET_PERSONA_POR_BANCO ppb ON PB.ID_AF_BANCO = ppb.ID_AF_BANCO 
        WHERE 
            PB.ESTADO = 'PAGADA'
            AND PER.PERIODO_INICIO >= TO_DATE(:periodoInicio, 'DD/MM/YYYY') 
            AND PER.PERIODO_FINALIZACION <= TO_DATE(:periodoFinalizacion, 'DD/MM/YYYY') 
            AND PER.ID_TIPO_PLANILLA = 2 
        GROUP BY 
            PB.ID_PERSONA, 
            PB.ID_DETALLE_PERSONA, 
            PB.ID_CAUSANTE, 
            PER.NUMERO_PAGOS, 
            PER.NUMERO_LOTE, 
            PER.ID_PLANILLA 
    ) 
GROUP BY 
    BENEFICIOS, 
    NOMBRE_BENEFICIO, 
    NUMERO_PAGOS, 
    NUMERO_LOTE, 
    ID_PLANILLA

      `;
    } else {
      query = `
        SELECT 
          ben."ID_BENEFICIO" AS "ID_BENEFICIO",
          ben."NOMBRE_BENEFICIO" AS "NOMBRE_BENEFICIO",
          ben."CODIGO" AS "CODIGO_BENEFICIO",
          plan."ID_PLANILLA" AS "ID_PLANILLA",
          plan."NUMERO_PAGOS" AS "NUMERO_PAGOS",
          plan."NUMERO_LOTE" AS "NUMERO_LOTE",
          SUM(detBs."MONTO_A_PAGAR") AS "TOTAL_MONTO_BENEFICIO"
        FROM 
          "NET_DETALLE_PAGO_BENEFICIO" detBs
        INNER JOIN 
          "NET_BENEFICIO" ben 
          ON detBs."ID_BENEFICIO" = ben."ID_BENEFICIO"
        INNER JOIN 
          "NET_PLANILLA" plan 
          ON detBs."ID_PLANILLA" = plan."ID_PLANILLA"
        LEFT JOIN 
          "NET_PERSONA_POR_BANCO" ppb 
          ON detBs."ID_AF_BANCO" = ppb."ID_AF_BANCO"
        WHERE 
        plan.ESTADO = 'CERRADA' AND
          plan."PERIODO_INICIO" >= :periodoInicio AND
          plan."PERIODO_FINALIZACION" <= :periodoFinalizacion AND
          plan."ID_TIPO_PLANILLA" IN (${idTiposPlanilla.join(', ')}) AND
          detBs."ESTADO" != 'RECHAZADO' AND detBs.ESTADO != 'NO PAGADA'
        GROUP BY 
          ben."ID_BENEFICIO", 
          ben."NOMBRE_BENEFICIO", 
          ben."CODIGO",
          plan."ID_PLANILLA",
          plan."NUMERO_PAGOS",
          plan."NUMERO_LOTE"
        ORDER BY ben."ID_BENEFICIO" ASC
      `;
    }
    try {
      const result = await this.entityManager.query(query, [periodoInicio, periodoFinalizacion]);
      return result;
    } catch (error) {
      console.error('Error al obtener beneficios:', error);
      throw new InternalServerErrorException('Error al obtener beneficios');
    }
  }

  async getDeduccionesInpremaPorPeriodoCCB(
    periodoInicio: string,
    periodoFinalizacion: string,
    idTiposPlanilla: number[],
  ): Promise<any[]> {
    const query = `
      SELECT 
        ded."ID_DEDUCCION" AS "ID_DEDUCCION",
        ded."NOMBRE_DEDUCCION" AS "NOMBRE_DEDUCCION",
        plan."ID_PLANILLA" AS "ID_PLANILLA",
        COUNT(DISTINCT dedd."ID_PERSONA") AS "CANTIDAD_DOCENTES",
        SUM(dedd."MONTO_APLICADO") AS "TOTAL_MONTO_DEDUCCION"
      FROM 
        "NET_DETALLE_DEDUCCION" dedd
      INNER JOIN 
        "NET_DEDUCCION" ded 
        ON dedd."ID_DEDUCCION" = ded."ID_DEDUCCION"
      LEFT JOIN "NET_CENTRO_TRABAJO" ct ON ct."ID_CENTRO_TRABAJO" = ded."ID_CENTRO_TRABAJO"
      INNER JOIN 
        "NET_PLANILLA" plan 
        ON dedd."ID_PLANILLA" = plan."ID_PLANILLA"
      WHERE 
        plan."PERIODO_INICIO" >= :periodoInicio AND
        plan."PERIODO_FINALIZACION" <= :periodoFinalizacion AND
        plan."ID_TIPO_PLANILLA" IN (${idTiposPlanilla.join(', ')})
        AND ded."ID_CENTRO_TRABAJO" = 1
        AND ct.NOMBRE_CENTRO_TRABAJO = 'INPREMA'
        AND dedd."ID_AF_BANCO" IS NOT NULL
        AND dedd."ESTADO_APLICACION" = 'COBRADA'
      GROUP BY 
        ded."ID_DEDUCCION", 
        ded."NOMBRE_DEDUCCION", 
        plan."ID_PLANILLA"
      ORDER BY ded."ID_DEDUCCION" ASC
    `;
    try {
      const result = await this.entityManager.query(query, [periodoInicio, periodoFinalizacion]);
      return result;
    } catch (error) {
      console.error('Error al obtener deducciones INPREMA:', error);
      throw new InternalServerErrorException('Error al obtener deducciones INPREMA');
    }
  }

  async getDeduccionesTercerosPorPeriodoCCB(
    periodoInicio: string,
    periodoFinalizacion: string,
    idTiposPlanilla: number[],
  ): Promise<any[]> {
    const query = `
      SELECT 
        ded."ID_DEDUCCION" AS "ID_DEDUCCION",
        ded."NOMBRE_DEDUCCION" AS "NOMBRE_DEDUCCION",
        plan."ID_PLANILLA" AS "ID_PLANILLA",
        COUNT(DISTINCT dedd."ID_PERSONA") AS "CANTIDAD_DOCENTES",
        SUM(dedd."MONTO_APLICADO") AS "TOTAL_MONTO_DEDUCCION"
      FROM 
        "NET_DETALLE_DEDUCCION" dedd
      INNER JOIN 
        "NET_DEDUCCION" ded 
        ON dedd."ID_DEDUCCION" = ded."ID_DEDUCCION"
      INNER JOIN 
        "NET_PLANILLA" plan 
        ON dedd."ID_PLANILLA" = plan."ID_PLANILLA"
      LEFT JOIN  "NET_CENTRO_TRABAJO" ct ON ct."ID_CENTRO_TRABAJO" = ded."ID_CENTRO_TRABAJO"
      WHERE 
        plan."PERIODO_INICIO" >= :periodoInicio AND
        plan."PERIODO_FINALIZACION" <= :periodoFinalizacion AND
        plan."ID_TIPO_PLANILLA" IN (${idTiposPlanilla.join(', ')})
        AND ded."ID_DEDUCCION" NOT IN (1, 2, 3, 44, 51)
        AND ct.NOMBRE_CENTRO_TRABAJO != 'INPREMA'
        AND dedd."ESTADO_APLICACION" = 'COBRADA'
      GROUP BY 
        ded."ID_DEDUCCION", 
        ded."NOMBRE_DEDUCCION", 
        plan."ID_PLANILLA"
      ORDER BY ded."ID_DEDUCCION" ASC
    `;
    try {
      const result = await this.entityManager.query(query, [periodoInicio, periodoFinalizacion]);
      return result;
    } catch (error) {
      console.error('Error al obtener deducciones de terceros:', error);
      throw new InternalServerErrorException('Error al obtener deducciones de terceros');
    }
  }

  async getBeneficiosPorPeriodoSC(
    periodoInicio: string,
    periodoFinalizacion: string,
    idTiposPlanilla: number[],
  ): Promise<any[]> {

    let query = "";

    if (JSON.stringify(idTiposPlanilla) == '[1,2]') {
      query = `
        SELECT
        BENEFICIOS,
        NOMBRE_BENEFICIO,
        NUMERO_PAGOS,
        NUMERO_LOTE,
        ID_PLANILLA,
        SUM(TOTAL_MONTO_A_PAGAR) AS TOTAL_MONTO_BENEFICIO
    FROM
        (
            SELECT
                LISTAGG(CASE WHEN PB.ID_BENEFICIO <> 6 THEN PB.ID_BENEFICIO END, ', ')
                    WITHIN GROUP (ORDER BY PB.ID_BENEFICIO) AS BENEFICIOS,
                MAX(B.NOMBRE_BENEFICIO) AS NOMBRE_BENEFICIO,
                PER.NUMERO_PAGOS,
                PER.NUMERO_LOTE,
                PER.ID_PLANILLA,
                (SELECT SUM(SUB.MONTO_A_PAGAR)
                 FROM NET_DETALLE_PAGO_BENEFICIO SUB
                 JOIN NET_PLANILLA PER ON SUB.ID_PLANILLA = PER.ID_PLANILLA
                 WHERE SUB.ID_PERSONA = PB.ID_PERSONA
                   AND SUB.ID_DETALLE_PERSONA = PB.ID_DETALLE_PERSONA
                   AND SUB.ID_CAUSANTE = PB.ID_CAUSANTE
                   AND PER.PERIODO_INICIO >= TO_DATE(:periodoInicio, 'DD/MM/YYYY')
                   AND PER.PERIODO_FINALIZACION <= TO_DATE(:periodoFinalizacion, 'DD/MM/YYYY')
                   AND PER.ID_TIPO_PLANILLA = 1) AS TOTAL_MONTO_A_PAGAR
            FROM
                NET_DETALLE_PAGO_BENEFICIO PB
            JOIN
                NET_BENEFICIO B ON PB.ID_BENEFICIO = B.ID_BENEFICIO
            JOIN
                NET_PLANILLA PER ON PB.ID_PLANILLA = PER.ID_PLANILLA
            WHERE
                PB."ID_AF_BANCO" IS NULL AND
                PB."ESTADO" = 'PAGADA' AND
                PER.PERIODO_INICIO >= TO_DATE(:periodoInicio, 'DD/MM/YYYY')
                AND PER.PERIODO_FINALIZACION <= TO_DATE(:periodoFinalizacion, 'DD/MM/YYYY')
                AND PER.ID_TIPO_PLANILLA = 1
            GROUP BY
                PB.ID_PERSONA,
                PB.ID_DETALLE_PERSONA,
                PB.ID_CAUSANTE,
                PER.NUMERO_PAGOS,
                PER.NUMERO_LOTE,
                PER.ID_PLANILLA
        )
    GROUP BY
        BENEFICIOS,
        NOMBRE_BENEFICIO,
        NUMERO_PAGOS,
        NUMERO_LOTE,
        ID_PLANILLA
    
    UNION ALL
    
    SELECT
        BENEFICIOS,
        NOMBRE_BENEFICIO,
        NUMERO_PAGOS,
        NUMERO_LOTE,
        ID_PLANILLA,
        SUM(TOTAL_MONTO_A_PAGAR) AS TOTAL_MONTO_BENEFICIO
    FROM
        (
            SELECT
                CASE
                    WHEN LISTAGG(PB.ID_BENEFICIO, ', ') WITHIN GROUP (ORDER BY PB.ID_BENEFICIO) LIKE '%10%'
                         AND LISTAGG(PB.ID_BENEFICIO, ', ') WITHIN GROUP (ORDER BY PB.ID_BENEFICIO) LIKE '%101%'
                         THEN '10, 101'
                    WHEN LISTAGG(PB.ID_BENEFICIO, ', ') WITHIN GROUP (ORDER BY PB.ID_BENEFICIO) LIKE '%10%'
                         OR LISTAGG(PB.ID_BENEFICIO, ', ') WITHIN GROUP (ORDER BY PB.ID_BENEFICIO) LIKE '%101%'
                         THEN '10, 101'
                    ELSE LISTAGG(PB.ID_BENEFICIO, ', ') WITHIN GROUP (ORDER BY PB.ID_BENEFICIO)
                END AS BENEFICIOS,
                CASE
                    WHEN LISTAGG(PB.ID_BENEFICIO, ', ') WITHIN GROUP (ORDER BY PB.ID_BENEFICIO) LIKE '%10%'
                         OR LISTAGG(PB.ID_BENEFICIO, ', ') WITHIN GROUP (ORDER BY PB.ID_BENEFICIO) LIKE '%101%'
                         THEN 'CONTINUACION DE JUBILACION'
                    ELSE MAX(B.NOMBRE_BENEFICIO)
                END AS NOMBRE_BENEFICIO,
                PER.NUMERO_PAGOS,
                PER.NUMERO_LOTE,
                PER.ID_PLANILLA,
                (SELECT SUM(SUB.MONTO_A_PAGAR)
                 FROM NET_DETALLE_PAGO_BENEFICIO SUB
                 JOIN NET_PLANILLA PER ON SUB.ID_PLANILLA = PER.ID_PLANILLA
                 WHERE SUB.ID_PERSONA = PB.ID_PERSONA
                   AND SUB.ID_DETALLE_PERSONA = PB.ID_DETALLE_PERSONA
                   AND SUB.ID_CAUSANTE = PB.ID_CAUSANTE
                   AND PER.PERIODO_INICIO >= TO_DATE(:periodoInicio, 'DD/MM/YYYY')
                   AND PER.PERIODO_FINALIZACION <= TO_DATE(:periodoFinalizacion, 'DD/MM/YYYY')
                   AND PER.ID_TIPO_PLANILLA = 2) AS TOTAL_MONTO_A_PAGAR
            FROM
                NET_DETALLE_PAGO_BENEFICIO PB
            JOIN
                NET_BENEFICIO B ON PB.ID_BENEFICIO = B.ID_BENEFICIO
            JOIN
                NET_PLANILLA PER ON PB.ID_PLANILLA = PER.ID_PLANILLA
           
            WHERE
                PB."ID_AF_BANCO" IS NULL AND
                PB."ESTADO" = 'PAGADA' AND
                PER.PERIODO_INICIO >= TO_DATE(:periodoInicio, 'DD/MM/YYYY')
                AND PER.PERIODO_FINALIZACION <= TO_DATE(:periodoFinalizacion, 'DD/MM/YYYY')
                AND PER.ID_TIPO_PLANILLA = 2
            GROUP BY
                PB.ID_PERSONA,
                PB.ID_DETALLE_PERSONA,
                PB.ID_CAUSANTE,
                PER.NUMERO_PAGOS,
                PER.NUMERO_LOTE,
                PER.ID_PLANILLA
        )
    GROUP BY
        BENEFICIOS,
        NOMBRE_BENEFICIO,
        NUMERO_PAGOS,
        NUMERO_LOTE,
        ID_PLANILLA
      `;
    } else {
      query = `
          SELECT 
            ben."ID_BENEFICIO" AS "ID_BENEFICIO",
            ben."NOMBRE_BENEFICIO" AS "NOMBRE_BENEFICIO",
            ben."CODIGO" AS "CODIGO_BENEFICIO",
            plan."ID_PLANILLA" AS "ID_PLANILLA",
            plan."NUMERO_PAGOS" AS "NUMERO_PAGOS",
            plan."NUMERO_LOTE" AS "NUMERO_LOTE",
            SUM(detBs."MONTO_A_PAGAR") AS "TOTAL_MONTO_BENEFICIO"
          FROM 
            "NET_DETALLE_PAGO_BENEFICIO" detBs
          INNER JOIN 
            "NET_BENEFICIO" ben 
            ON detBs."ID_BENEFICIO" = ben."ID_BENEFICIO"
          INNER JOIN 
            "NET_PLANILLA" plan 
            ON detBs."ID_PLANILLA" = plan."ID_PLANILLA"
          WHERE 
            plan."PERIODO_INICIO" >= :periodoInicio AND
            plan."PERIODO_FINALIZACION" <= :periodoFinalizacion AND
            plan."ID_TIPO_PLANILLA" IN (${idTiposPlanilla.join(', ')})
            AND detBs."ID_AF_BANCO" IS NULL
            AND detBs."ESTADO" = 'PAGADA'
          GROUP BY 
            ben."ID_BENEFICIO", 
            ben."NOMBRE_BENEFICIO", 
            ben."CODIGO",
            plan."ID_PLANILLA",
            plan."NUMERO_PAGOS",
            plan."NUMERO_LOTE"
          ORDER BY ben."NOMBRE_BENEFICIO" ASC
        `;
    }
    try {
      const result = await this.entityManager.query(query, [periodoInicio, periodoFinalizacion]);
      return result;
    } catch (error) {
      console.error('Error al obtener beneficios sin cuenta:', error);
      throw new InternalServerErrorException('Error al obtener beneficios sin cuenta');
    }
  }

  async getDeduccionesInpremaPorPeriodoSC(
    periodoInicio: string,
    periodoFinalizacion: string,
    idTiposPlanilla: number[],
  ): Promise<any[]> {
    const query = `
      SELECT 
        ded."ID_DEDUCCION" AS "ID_DEDUCCION",
        ded."NOMBRE_DEDUCCION" AS "NOMBRE_DEDUCCION",
        plan."ID_PLANILLA" AS "ID_PLANILLA",
        SUM(dedd."MONTO_APLICADO") AS "TOTAL_MONTO_DEDUCCION"
      FROM 
        "NET_DETALLE_DEDUCCION" dedd
      INNER JOIN 
        "NET_DEDUCCION" ded 
        ON dedd."ID_DEDUCCION" = ded."ID_DEDUCCION"
      LEFT JOIN  "NET_CENTRO_TRABAJO" ct ON ct."ID_CENTRO_TRABAJO" = ded."ID_CENTRO_TRABAJO"
      INNER JOIN 
        "NET_PLANILLA" plan 
        ON dedd."ID_PLANILLA" = plan."ID_PLANILLA"
      WHERE 
        plan."PERIODO_INICIO" >= :periodoInicio AND
          plan."PERIODO_FINALIZACION" <= :periodoFinalizacion AND
        plan."ID_TIPO_PLANILLA" IN (${idTiposPlanilla.join(', ')})
        AND ded."ID_CENTRO_TRABAJO" = 1
        AND ct.NOMBRE_CENTRO_TRABAJO = 'INPREMA'
        AND dedd."ID_AF_BANCO" IS NULL
        AND dedd."ESTADO_APLICACION" = 'COBRADA'
      GROUP BY 
        ded."ID_DEDUCCION", 
        ded."NOMBRE_DEDUCCION",
        plan."ID_PLANILLA"
      ORDER BY ded."NOMBRE_DEDUCCION" ASC
    `;
    try {
      const result = await this.entityManager.query(query, [periodoInicio, periodoFinalizacion]);
      return result;
    } catch (error) {
      console.error('Error al obtener deducciones INPREMA sin cuenta:', error);
      throw new InternalServerErrorException('Error al obtener deducciones INPREMA sin cuenta');
    }
  }

  async getDeduccionesTercerosPorPeriodoSC(
    periodoInicio: string,
    periodoFinalizacion: string,
    idTiposPlanilla: number[],
  ): Promise<any[]> {
    const query = `
      SELECT 
        ded."ID_DEDUCCION" AS "ID_DEDUCCION",
        ded."NOMBRE_DEDUCCION" AS "NOMBRE_DEDUCCION",
        plan."ID_PLANILLA" AS "ID_PLANILLA",
        SUM(dedd."MONTO_APLICADO") AS "TOTAL_MONTO_DEDUCCION"
      FROM 
        "NET_DETALLE_DEDUCCION" dedd
      INNER JOIN 
        "NET_DEDUCCION" ded 
        ON dedd."ID_DEDUCCION" = ded."ID_DEDUCCION"
      LEFT JOIN  "NET_CENTRO_TRABAJO" ct ON ct."ID_CENTRO_TRABAJO" = ded."ID_CENTRO_TRABAJO"
      INNER JOIN 
        "NET_PLANILLA" plan 
        ON dedd."ID_PLANILLA" = plan."ID_PLANILLA"
      WHERE 
        plan."PERIODO_INICIO" >= :periodoInicio AND
        plan."PERIODO_FINALIZACION" <= :periodoFinalizacion AND
        plan."ID_TIPO_PLANILLA" IN (${idTiposPlanilla.join(', ')})
        AND dedd."ID_AF_BANCO" IS NULL
        AND ded."ID_DEDUCCION" NOT IN (1, 2, 3, 44, 51)
        AND ct.NOMBRE_CENTRO_TRABAJO != 'INPREMA'
        AND dedd."ESTADO_APLICACION" = 'COBRADA'
      GROUP BY 
        ded."ID_DEDUCCION",
        ded."NOMBRE_DEDUCCION",
        plan."ID_PLANILLA"
      ORDER BY ded."NOMBRE_DEDUCCION" ASC
    `;
    try {
      const result = await this.entityManager.query(query, [periodoInicio, periodoFinalizacion]);
      return result;
    } catch (error) {
      console.error('Error al obtener deducciones de terceros sin cuenta:', error);
      throw new InternalServerErrorException('Error al obtener deducciones de terceros sin cuenta');
    }
  }

  async getDeduccionesTotalesPorPeriodo(
    periodoInicio: string,
    periodoFinalizacion: string,
    idTiposPlanilla: number[],
  ): Promise<any> {
    try {
      const deduccionesInprema = await this.getDeduccionesInpremaPorPeriodoCCB(
        periodoInicio,
        periodoFinalizacion,
        idTiposPlanilla
      );

      const deduccionesTerceros = await this.getDeduccionesTercerosPorPeriodoCCB(
        periodoInicio,
        periodoFinalizacion,
        idTiposPlanilla
      );

      return { deduccionesInprema, deduccionesTerceros };
    } catch (error) {
      console.error('Error al obtener deducciones totales por periodo:', error);
      throw new InternalServerErrorException('Error al obtener deducciones totales por periodo');
    }
  }

  async getTotalPorBeneficiosYDeduccionesPorPeriodo(
    periodoInicio: string,
    periodoFinalizacion: string,
    idTiposPlanilla: number[],
  ): Promise<any> {
    try {
      const beneficios = await this.getBeneficiosPorPeriodo(periodoInicio, periodoFinalizacion, idTiposPlanilla);
      const deduccionesInprema = await this.getDeduccionesInpremaPorPeriodoCCB(periodoInicio, periodoFinalizacion, idTiposPlanilla);
      const deduccionesTerceros = await this.getDeduccionesTercerosPorPeriodoCCB(periodoInicio, periodoFinalizacion, idTiposPlanilla);

      const beneficiosSC = await this.getBeneficiosPorPeriodoSC(periodoInicio, periodoFinalizacion, idTiposPlanilla);
      const deduccionesInpremaSC = await this.getDeduccionesInpremaPorPeriodoSC(periodoInicio, periodoFinalizacion, idTiposPlanilla);
      const deduccionesTercerosSC = await this.getDeduccionesTercerosPorPeriodoSC(periodoInicio, periodoFinalizacion, idTiposPlanilla);

      return { beneficios, deduccionesInprema, deduccionesTerceros, beneficiosSC, deduccionesInpremaSC, deduccionesTercerosSC };
    } catch (error) {
      console.error('Error al obtener los totales por periodo:', error);
      throw new InternalServerErrorException('Error al obtener los totales por periodo');
    }
  }

  async getBeneficiosPorPeriodoDetallado(
    periodoInicio: string,
    periodoFinalizacion: string,
    idTiposPlanilla: number[],
  ): Promise<any[]> {
    const idTiposPlanillaStr = idTiposPlanilla.join(', ');
    const query = `
      SELECT 
        per."N_IDENTIFICACION" AS "IDENTIFICACION",
        per."PRIMER_NOMBRE" || ' ' || per."SEGUNDO_NOMBRE" || ' ' || per."PRIMER_APELLIDO" || ' ' || per."SEGUNDO_APELLIDO" AS "NOMBRE_COMPLETO",
        ben."ID_BENEFICIO" AS "ID_BENEFICIO",
        ben."NOMBRE_BENEFICIO" AS "NOMBRE_BENEFICIO",
        detBs."MONTO_A_PAGAR" AS "MONTO"
      FROM 
        "NET_DETALLE_PAGO_BENEFICIO" detBs
      INNER JOIN 
        "NET_BENEFICIO" ben 
        ON detBs."ID_BENEFICIO" = ben."ID_BENEFICIO"
      INNER JOIN 
        "NET_PLANILLA" plan 
        ON detBs."ID_PLANILLA" = plan."ID_PLANILLA"
      INNER JOIN 
        "NET_PERSONA" per 
        ON detBs."ID_PERSONA" = per."ID_PERSONA"
      WHERE 
        plan."PERIODO_INICIO" >= TO_DATE(:periodoInicio, 'DD/MM/YYYY') AND
        plan."PERIODO_FINALIZACION" <= TO_DATE(:periodoFinalizacion, 'DD/MM/YYYY') AND
        plan."ID_TIPO_PLANILLA" IN (${idTiposPlanillaStr})
        AND detBs."ESTADO" = 'PAGADA'
      ORDER BY 
        per."PRIMER_NOMBRE" || ' ' || per."SEGUNDO_NOMBRE" || ' ' || per."PRIMER_APELLIDO" || ' ' || per."SEGUNDO_APELLIDO" ASC, 
        ben."NOMBRE_BENEFICIO" ASC
    `;
    try {
      const result = await this.entityManager.query(query, [periodoInicio, periodoFinalizacion]);
      return result;
    } catch (error) {
      console.error('Error al obtener beneficios detallados:', error);
      throw new InternalServerErrorException('Error al obtener beneficios detallados');
    }
  }

  async getDeduccionesInpremaPorPeriodoDetallado(
    periodoInicio: string,
    periodoFinalizacion: string,
    idTiposPlanilla: number[],
  ): Promise<any[]> {
    const idTiposPlanillaStr = idTiposPlanilla.join(', ');

    const query = `
      SELECT 
        per."N_IDENTIFICACION" AS "IDENTIFICACION",
        per."PRIMER_NOMBRE" || ' ' || per."SEGUNDO_NOMBRE" || ' ' || per."PRIMER_APELLIDO" || ' ' || per."SEGUNDO_APELLIDO" AS "NOMBRE_COMPLETO",
        ded."COD_DEDUCCION" AS "COD_DEDUCCION",
        ded."NOMBRE_DEDUCCION" AS "NOMBRE_DEDUCCION",
        dedd."MONTO_APLICADO" AS "MONTO"
      FROM 
        "NET_DETALLE_DEDUCCION" dedd
      INNER JOIN 
        "NET_DEDUCCION" ded 
        ON dedd."ID_DEDUCCION" = ded."ID_DEDUCCION"
      INNER JOIN 
        "NET_PLANILLA" plan 
        ON dedd."ID_PLANILLA" = plan."ID_PLANILLA"
      INNER JOIN 
        "NET_PERSONA" per 
        ON dedd."ID_PERSONA" = per."ID_PERSONA"
      WHERE 
        dedd.ESTADO_APLICACION = 'COBRADA' AND
        plan."PERIODO_INICIO" >= TO_DATE(:periodoInicio, 'DD/MM/YYYY') AND
        plan."PERIODO_FINALIZACION" <= TO_DATE(:periodoFinalizacion, 'DD/MM/YYYY') AND
        plan."ID_TIPO_PLANILLA" IN (${idTiposPlanillaStr})
        AND ded."ID_CENTRO_TRABAJO" = 1
      ORDER BY 
        per."PRIMER_NOMBRE" || ' ' || per."SEGUNDO_NOMBRE" || ' ' || per."PRIMER_APELLIDO" || ' ' || per."SEGUNDO_APELLIDO" ASC, 
        ded."NOMBRE_DEDUCCION" ASC
    `;

    try {
      const result = await this.entityManager.query(query, [periodoInicio, periodoFinalizacion]);
      return result;
    } catch (error) {
      console.error('Error al obtener deducciones INPREMA detalladas:', error);
      throw new InternalServerErrorException('Error al obtener deducciones INPREMA detalladas');
    }
  }

  async getDeduccionesTercerosPorPeriodoDetallado(
    periodoInicio: string,
    periodoFinalizacion: string,
    idTiposPlanilla: number[],
  ): Promise<any[]> {
    const idTiposPlanillaList = idTiposPlanilla.join(',');

    const query = `
      SELECT 
        per."N_IDENTIFICACION" AS "IDENTIFICACION",
        per."PRIMER_NOMBRE" || ' ' || per."SEGUNDO_NOMBRE" || ' ' || per."PRIMER_APELLIDO" || ' ' || per."SEGUNDO_APELLIDO" AS "NOMBRE_COMPLETO",
        ded."COD_DEDUCCION" AS "COD_DEDUCCION",
        ded."NOMBRE_DEDUCCION" AS "NOMBRE_DEDUCCION",
        dedd."MONTO_APLICADO" AS "MONTO"
      FROM 
        "NET_DETALLE_DEDUCCION" dedd
      INNER JOIN 
        "NET_DEDUCCION" ded 
        ON dedd."ID_DEDUCCION" = ded."ID_DEDUCCION"
      INNER JOIN 
        "NET_PLANILLA" plan 
        ON dedd."ID_PLANILLA" = plan."ID_PLANILLA"
      INNER JOIN 
        "NET_PERSONA" per 
        ON dedd."ID_PERSONA" = per."ID_PERSONA"
      WHERE 
        dedd.ESTADO_APLICACION = 'COBRADA' AND
        plan."PERIODO_INICIO" >= TO_DATE(:periodoInicio, 'DD/MM/YYYY') AND
        plan."PERIODO_FINALIZACION" <= TO_DATE(:periodoFinalizacion, 'DD/MM/YYYY') AND
        plan."ID_TIPO_PLANILLA" IN (${idTiposPlanillaList})
        AND ded."ID_DEDUCCION" NOT IN (1, 2, 3, 44, 51)
      ORDER BY 
        per."PRIMER_NOMBRE" || ' ' || per."SEGUNDO_NOMBRE" || ' ' || per."PRIMER_APELLIDO" || ' ' || per."SEGUNDO_APELLIDO" ASC, 
        ded."NOMBRE_DEDUCCION" ASC
    `;

    try {
      const result = await this.entityManager.query(query, [periodoInicio, periodoFinalizacion]);
      return result;
    } catch (error) {
      console.error('Error al obtener deducciones de terceros detalladas:', error);
      throw new InternalServerErrorException('Error al obtener deducciones de terceros detalladas');
    }
  }

  async getDetallePorBeneficiosYDeduccionesPorPeriodo(
    periodoInicio: string,
    periodoFinalizacion: string,
    idTiposPlanilla: number[],
  ): Promise<any> {
    try {
      // Obtener detalles de beneficios
      const beneficiosDetallados = await this.getBeneficiosPorPeriodoDetallado(
        periodoInicio,
        periodoFinalizacion,
        idTiposPlanilla,
      );

      // Obtener detalles de deducciones INPREMA
      const deduccionesInpremaDetalladas = await this.getDeduccionesInpremaPorPeriodoDetallado(
        periodoInicio,
        periodoFinalizacion,
        idTiposPlanilla,
      );

      // Obtener detalles de deducciones de terceros
      const deduccionesTercerosDetalladas = await this.getDeduccionesTercerosPorPeriodoDetallado(
        periodoInicio,
        periodoFinalizacion,
        idTiposPlanilla,
      );

      return {
        beneficiosDetallados,
        deduccionesInpremaDetalladas,
        deduccionesTercerosDetalladas,
      };
    } catch (error) {
      console.error('Error al obtener los detalles por periodo:', error);
      throw new InternalServerErrorException('Error al obtener los detalles por periodo');
    }
  }

  async getTotalPorBancoYPeriodo(
    periodoInicio: string,
    periodoFinalizacion: string,
    idTiposPlanilla: number[],
  ): Promise<any[]> {
    const beneficiosQuery = `
        SELECT
        COALESCE(b."NOMBRE_BANCO", 'SIN BANCO') AS NOMBRE_BANCO,
        SUM(dpb."MONTO_A_PAGAR") AS SUMA_BENEFICIOS
      FROM "NET_PLANILLA" p
      JOIN "NET_DETALLE_PAGO_BENEFICIO" dpb ON p."ID_PLANILLA" = dpb."ID_PLANILLA"
      LEFT JOIN "NET_PERSONA_POR_BANCO" pb ON dpb."ID_AF_BANCO" = pb."ID_AF_BANCO"
      LEFT JOIN "NET_BANCO" b ON pb."ID_BANCO" = b."ID_BANCO"
      WHERE
        p."PERIODO_INICIO" BETWEEN TO_DATE(:periodoInicio, 'DD/MM/YYYY') AND TO_DATE(:periodoFinalizacion, 'DD/MM/YYYY')
        AND p."ID_TIPO_PLANILLA" IN (${idTiposPlanilla.join(', ')})
        AND dpb."ESTADO" = 'PAGADA'
        AND dpb."ESTADO" != 'RECHAZADO'
      GROUP BY 
        COALESCE(b."NOMBRE_BANCO", 'SIN BANCO')
    `;

    const deduccionesInpremaQuery = `
      SELECT
        COALESCE(b."NOMBRE_BANCO", 'SIN BANCO') AS NOMBRE_BANCO,
        SUM(ddp."MONTO_APLICADO") AS SUMA_DEDUCCIONES_INPREMA
      FROM "NET_PLANILLA" p
      JOIN "NET_DETALLE_DEDUCCION" ddp ON p."ID_PLANILLA" = ddp."ID_PLANILLA"
      JOIN "NET_DEDUCCION" d ON ddp."ID_DEDUCCION" = d."ID_DEDUCCION"
      LEFT JOIN  "NET_CENTRO_TRABAJO" ct ON ct."ID_CENTRO_TRABAJO" = d."ID_CENTRO_TRABAJO"
      LEFT JOIN "NET_PERSONA_POR_BANCO" pb ON ddp."ID_AF_BANCO" = pb."ID_AF_BANCO"
      LEFT JOIN "NET_BANCO" b ON pb."ID_BANCO" = b."ID_BANCO"
      WHERE
        p."PERIODO_INICIO" BETWEEN TO_DATE(:periodoInicio, 'DD/MM/YYYY') AND TO_DATE(:periodoFinalizacion, 'DD/MM/YYYY')
        AND p."ID_TIPO_PLANILLA" IN (${idTiposPlanilla.join(', ')})
        AND ddp."ESTADO_APLICACION" = 'COBRADA'
        AND ct.NOMBRE_CENTRO_TRABAJO = 'INPREMA'
        AND d."ID_CENTRO_TRABAJO" = 1
      GROUP BY 
        COALESCE(b."NOMBRE_BANCO", 'SIN BANCO')
  `;

    const deduccionesTercerosQuery = `
     SELECT
        COALESCE(b."NOMBRE_BANCO", 'SIN BANCO') AS NOMBRE_BANCO,
        SUM(ddp."MONTO_APLICADO") AS SUMA_DEDUCCIONES_TERCEROS
      FROM  "NET_PLANILLA" p
      JOIN "NET_DETALLE_DEDUCCION" ddp ON p."ID_PLANILLA" = ddp."ID_PLANILLA"
      JOIN "NET_DEDUCCION" d ON ddp."ID_DEDUCCION" = d."ID_DEDUCCION"
      LEFT JOIN  "NET_CENTRO_TRABAJO" ct ON ct."ID_CENTRO_TRABAJO" = d."ID_CENTRO_TRABAJO"
      LEFT JOIN  "NET_PERSONA_POR_BANCO" pb ON ddp."ID_AF_BANCO" = pb."ID_AF_BANCO"
      LEFT JOIN "NET_BANCO" b ON pb."ID_BANCO" = b."ID_BANCO"
      WHERE
        p."PERIODO_INICIO" BETWEEN TO_DATE(:periodoInicio, 'DD/MM/YYYY') AND TO_DATE(:periodoFinalizacion, 'DD/MM/YYYY')
        AND p."ID_TIPO_PLANILLA" IN (${idTiposPlanilla.join(', ')})
        AND ddp."ESTADO_APLICACION" = 'COBRADA'
        AND d."ID_DEDUCCION" NOT IN (1,2,3,44,51)
        AND ct.NOMBRE_CENTRO_TRABAJO != 'INPREMA'
      GROUP BY
      COALESCE(b."NOMBRE_BANCO", 'SIN BANCO')
      ORDER BY  COALESCE(b."NOMBRE_BANCO", 'SIN BANCO') ASC
      `;

    try {
      const beneficios = await this.entityManager.query(beneficiosQuery, [periodoInicio, periodoFinalizacion]);
      const deduccionesInprema = await this.entityManager.query(deduccionesInpremaQuery, [periodoInicio, periodoFinalizacion]);
      const deduccionesTerceros = await this.entityManager.query(deduccionesTercerosQuery, [periodoInicio, periodoFinalizacion]);

      const result = beneficios.map(beneficio => {
        const deduccionInprema = deduccionesInprema.find(d => d.NOMBRE_BANCO === beneficio.NOMBRE_BANCO) || { SUMA_DEDUCCIONES_INPREMA: 0 };
        const deduccionTerceros = deduccionesTerceros.find(d => d.NOMBRE_BANCO === beneficio.NOMBRE_BANCO) || { SUMA_DEDUCCIONES_TERCEROS: 0 };

        return {
          NOMBRE_BANCO: beneficio.NOMBRE_BANCO,
          TOTAL_BENEFICIO: beneficio.SUMA_BENEFICIOS,
          DEDUCCIONES_INPREMA: deduccionInprema.SUMA_DEDUCCIONES_INPREMA,
          DEDUCCIONES_TERCEROS: deduccionTerceros.SUMA_DEDUCCIONES_TERCEROS,
          MONTO_NETO: beneficio.SUMA_BENEFICIOS - (deduccionInprema.SUMA_DEDUCCIONES_INPREMA + deduccionTerceros.SUMA_DEDUCCIONES_TERCEROS)
        };
      });

      const deduccionesSoloInprema = deduccionesInprema.filter(d => !beneficios.find(b => b.NOMBRE_BANCO === d.NOMBRE_BANCO)).map(d => ({
        NOMBRE_BANCO: d.NOMBRE_BANCO,
        TOTAL_BENEFICIO: 0,
        DEDUCCIONES_INPREMA: d.SUMA_DEDUCCIONES_INPREMA,
        DEDUCCIONES_TERCEROS: 0,
        MONTO_NETO: -d.SUMA_DEDUCCIONES_INPREMA
      }));

      const deduccionesSoloTerceros = deduccionesTerceros.filter(d => !beneficios.find(b => b.NOMBRE_BANCO === d.NOMBRE_BANCO)).map(d => ({
        NOMBRE_BANCO: d.NOMBRE_BANCO,
        TOTAL_BENEFICIO: 0,
        DEDUCCIONES_INPREMA: 0,
        DEDUCCIONES_TERCEROS: d.SUMA_DEDUCCIONES_TERCEROS,
        MONTO_NETO: -d.SUMA_DEDUCCIONES_TERCEROS
      }));

      return [...result, ...deduccionesSoloInprema, ...deduccionesSoloTerceros];
    } catch (error) {
      console.error('Error al obtener los totales por banco en el periodo:', error);
      throw new InternalServerErrorException('Error al obtener los totales por banco en el periodo');
    }
  }

  async generarVoucher(idPlanilla: number, dni: string): Promise<any> {
    try {


      const persona = await this.personaRepository.findOne({
        where: {
          n_identificacion: dni, detallePersona: {
            detalleBeneficio: {
              detallePagBeneficio: {
                estado: 'PAGADA',
                planilla: { id_planilla: idPlanilla }
              },
            }
          }
        },
        relations: [
          'detallePersona',
          'detallePersona.detalleBeneficio',
          'detallePersona.padreIdPersona',
          'detallePersona.padreIdPersona.persona',
          'detallePersona.detalleBeneficio.beneficio',
          'detallePersona.detalleBeneficio.detallePagBeneficio',
          'detallePersona.detalleBeneficio.detallePagBeneficio.personaporbanco',
          'detallePersona.detalleBeneficio.detallePagBeneficio.personaporbanco.banco',
          'detallePersona.detalleBeneficio.detallePagBeneficio.planilla',
        ]
      })

      const deduccion = await this.personaRepository.findOne({
        where: {
          n_identificacion: dni,
          detalleDeduccion: {
            estado_aplicacion: 'COBRADA',
            planilla: {
              id_planilla: idPlanilla
            }
          }
        },
        relations: [
          'detalleDeduccion.deduccion',
          'detalleDeduccion.deduccion.centroTrabajo',
          'detalleDeduccion.planilla',
        ]
      })

      return { persona, deduccion };

    } catch (error) {
      console.log(error);

      this.logger.error('Error al obtener los totales por DNI y planilla', error.stack);
      throw new InternalServerErrorException();
    }
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
                  fecha_cierre: Raw(
                    alias => `EXTRACT(MONTH FROM ${alias}) = :mes AND EXTRACT(YEAR FROM ${alias}) = :anio`,
                    { mes, anio }
                  ), generar_voucher: 'SI'
                },
                /* personaporbanco: {
                  // id_af_banco: Not(null) // Asegura que id_af_banco no sea null
                } */
              }
            }
          }
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
          'detallePersona.detalleBeneficio.detallePagBeneficio.planilla.tipoPlanilla',
        ]
      });

      const deduccion = await this.personaRepository.findOne({
        where: {
          n_identificacion: dni,
          detalleDeduccion: {
            estado_aplicacion: 'COBRADA',
            planilla: {
              fecha_cierre: Raw(alias => `EXTRACT(MONTH FROM ${alias}) = :mes AND EXTRACT(YEAR FROM ${alias}) = :anio`, {
                mes,
                anio
              }),
              generar_voucher: 'SI'
            },
            /* personaPorBanco: {
              //id_af_banco: Not(null) // Asegura que id_af_banco no sea null
            } */
          }
        },
        relations: [
          'detalleDeduccion.personaPorBanco',
          'detalleDeduccion.deduccion',
          'detalleDeduccion.deduccion.centroTrabajo',
          'detalleDeduccion.planilla',
          'detalleDeduccion.planilla.tipoPlanilla',
        ]
      });

      return { persona, deduccion };

    } catch (error) {
      console.log(error);

      this.logger.error('Error al obtener los totales por DNI y planilla', error.stack);
      throw new InternalServerErrorException();
    }
  }



  async getPlanillaById(id_planilla: number) {
    const planilla = await this.planillaRepository.findOne({ where: { id_planilla } });

    if (!planilla) {
      throw new NotFoundException(`Planilla con ID ${id_planilla} no encontrada`);
    }

    const totalBeneficios = await this.detallePagBeneficios
      .createQueryBuilder('detallePagoBeneficio')
      .innerJoin(Net_Persona_Por_Banco, 'perpb', 'perpb.ID_AF_BANCO = detallePagoBeneficio.ID_AF_BANCO')
      .select('SUM(detallePagoBeneficio.monto_a_pagar)', 'totalBeneficios')
      .where('detallePagoBeneficio.planilla.id_planilla = :id_planilla AND detallePagoBeneficio.ESTADO = \'PAGADA\'', { id_planilla })
      .getRawOne();

    const totalDeducciones = await this.detalleDeduccionRepository
      .createQueryBuilder('detalleDeduccion')
      .innerJoin(Net_Planilla, 'plan', 'plan.ID_PLANILLA = detalleDeduccion.ID_PLANILLA')
      .innerJoin(Net_Persona_Por_Banco, 'perpb', 'perpb.ID_AF_BANCO = detalleDeduccion.ID_AF_BANCO')
      .select('SUM(detalleDeduccion.monto_aplicado)', 'totalDeducciones')
      .where('plan.ID_PLANILLA = :id_planilla AND detalleDeduccion.ESTADO_APLICACION = \'COBRADA\'', { id_planilla })
      .getRawOne();


    return {
      planilla,
      totalBeneficios: totalBeneficios.totalBeneficios || 0,
      totalDeducciones: totalDeducciones.totalDeducciones || 0,
      totalPlanilla: totalBeneficios.totalBeneficios - totalDeducciones.totalDeducciones,
    };
  }

  async ObtenerPlanDefin(codPlanilla: string): Promise<any> {
    try {
      if (codPlanilla) {
        const queryBuilder = await this.planillaRepository
          .createQueryBuilder('planilla')
          .leftJoinAndSelect('planilla.tipoPlanilla', 'tipP')
          .where('planilla.CODIGO_PLANILLA = :codPlanilla', { codPlanilla })
          .andWhere('planilla.ESTADO = :estado', { estado: 'CERRADA' })
          .select([
            'planilla.id_planilla',
            'planilla.codigo_planilla',
            'planilla.fecha_apertura',
            'planilla.fecha_cierre',
            'planilla.secuencia',
            'planilla.estado',
            'planilla.periodoInicio',
            'planilla.periodoFinalizacion',
            'tipP.nombre_planilla', // Asegúrate de seleccionar el campo correcto
          ])
          .getOne();

        if (!queryBuilder) {
          throw new NotFoundException(`Planilla con código ${codPlanilla} no encontrada.`);
        }

        return queryBuilder;
      } else {
        throw new NotFoundException(`Código de planilla no proporcionado.`);
      }
    } catch (error) {
      console.error(error);
      throw new Error('Error al obtener la planilla definida.');
    }
  }

  async ObtenerMontosPorBanco(codPlanilla: string): Promise<any> {
    const query = `
      SELECT
          COALESCE(deducciones.NOMBRE_BANCO, beneficios.NOMBRE_BANCO, 'SIN BANCO') AS NOMBRE_BANCO,
          COALESCE(deducciones.SUMA_DEDUCCIONES_INPREMA, 0) AS SUMA_DEDUCCIONES_INPREMA,
          COALESCE(deducciones.SUMA_DEDUCCIONES_TERCEROS, 0) AS SUMA_DEDUCCIONES_TERCEROS,
          COALESCE(beneficios.SUMA_BENEFICIOS, 0) AS SUMA_BENEFICIOS,
          COALESCE(beneficios.SUMA_BENEFICIOS, 0) - (COALESCE(deducciones.SUMA_DEDUCCIONES_INPREMA, 0) + COALESCE(deducciones.SUMA_DEDUCCIONES_TERCEROS, 0)) AS MONTO_NETO
      FROM
          (SELECT
              COALESCE(b."NOMBRE_BANCO", 'SIN BANCO') AS NOMBRE_BANCO,
              SUM(CASE WHEN d."ID_CENTRO_TRABAJO" = 1 THEN dd."MONTO_APLICADO" ELSE 0 END) AS SUMA_DEDUCCIONES_INPREMA,
              SUM(CASE WHEN d."ID_CENTRO_TRABAJO" <> 1 THEN dd."MONTO_APLICADO" ELSE 0 END) AS SUMA_DEDUCCIONES_TERCEROS
          FROM
              "NET_PLANILLA" p
          JOIN
              "NET_DETALLE_DEDUCCION" dd ON p."ID_PLANILLA" = dd."ID_PLANILLA"
          JOIN
              "NET_DEDUCCION" d ON dd."ID_DEDUCCION" = d."ID_DEDUCCION"
          LEFT JOIN
              "NET_PERSONA_POR_BANCO" pb ON dd."ID_PERSONA" = pb."ID_PERSONA"
          LEFT JOIN
              "NET_BANCO" b ON pb."ID_BANCO" = b."ID_BANCO"
          WHERE
              p."CODIGO_PLANILLA" = :codPlanilla
              AND dd."ESTADO_APLICACION" = 'COBRADA'
          GROUP BY
              b."NOMBRE_BANCO") deducciones
      FULL OUTER JOIN
          (SELECT
              COALESCE(b."NOMBRE_BANCO", 'SIN BANCO') AS NOMBRE_BANCO,
              SUM(dpb."MONTO_A_PAGAR") AS SUMA_BENEFICIOS
          FROM
              "NET_PLANILLA" p
          JOIN
              "NET_DETALLE_PAGO_BENEFICIO" dpb ON p."ID_PLANILLA" = dpb."ID_PLANILLA"
          LEFT JOIN
              "NET_PERSONA_POR_BANCO" pb ON dpb."ID_PERSONA" = pb."ID_PERSONA"
          LEFT JOIN
              "NET_BANCO" b ON pb."ID_BANCO" = b."ID_BANCO"
          WHERE
              p."CODIGO_PLANILLA" = :codPlanilla
              AND dpb."ESTADO" = 'PAGADA'
          GROUP BY
              b."NOMBRE_BANCO") beneficios
      ON deducciones."NOMBRE_BANCO" = beneficios."NOMBRE_BANCO"
    `;

    interface Banco {
      ID_BANCO: number;
      NOMBRE_BANCO: string;
      TOTAL_BENEFICIO: number;
      DEDUCCIONES_INPREMA?: number;
      DEDUCCIONES_TERCEROS?: number;
      MONTO_NETO?: number;
    }

    try {
      const result: any[] = await this.entityManager.query(query, [codPlanilla]);

      const formattedResult: Banco[] = result.map(banco => ({
        ID_BANCO: banco.ID_BANCO,
        NOMBRE_BANCO: banco.NOMBRE_BANCO,
        TOTAL_BENEFICIO: banco.SUMA_BENEFICIOS,
        DEDUCCIONES_INPREMA: banco.SUMA_DEDUCCIONES_INPREMA,
        DEDUCCIONES_TERCEROS: banco.SUMA_DEDUCCIONES_TERCEROS,
        MONTO_NETO: banco.MONTO_NETO
      }));

      return formattedResult;
    } catch (error) {
      this.logger.error(`Error al obtener totales por banco: ${error.message}`, error.stack);
      throw new InternalServerErrorException('Se produjo un error al obtener los totales por banco.');
    }
  }

  async ObtenerPlanDefinPersonasOrd(perI: string, perF: string, page?: number, limit?: number): Promise<any> {

    let query = `
        SELECT 
            per."N_IDENTIFICACION" AS "DNI",
            plan."ID_PLANILLA",
            TO_CHAR(TO_DATE(plan."PERIODO_INICIO", 'DD-MM-YYYY'), 'MM') AS "MES",
            TO_CHAR(TO_DATE(plan."PERIODO_INICIO", 'DD-MM-YYYY'), 'YYYY') AS "ANIO",
            tipoP."TIPO_PERSONA" AS "TIPO_PERSONA",
            per."ID_PERSONA",
            perPorBan."NUM_CUENTA",
            banco."NOMBRE_BANCO",
            banco."COD_BANCO",
            ben."ID_BENEFICIO",
            SUM(detBs."MONTO_A_PAGAR") AS "TOTAL_BENEFICIO",
             TRIM(
                per."PRIMER_APELLIDO" || ' ' ||
                COALESCE(per."SEGUNDO_APELLIDO", '') || ' ' ||
                per."PRIMER_NOMBRE" || ' ' ||
                COALESCE(per."SEGUNDO_NOMBRE", '') || ' ' ||
                COALESCE(per."TERCER_NOMBRE", '')
            )  AS "NOMBRE_COMPLETO"
        FROM
            "NET_DETALLE_PAGO_BENEFICIO" detBs

        JOIN
            "NET_PLANILLA" plan
        ON
            plan."ID_PLANILLA" = detBs."ID_PLANILLA"
        JOIN
            "NET_TIPO_PLANILLA" tipoPlan
        ON
            plan."ID_TIPO_PLANILLA" = tipoPlan."ID_TIPO_PLANILLA"
        JOIN
            "NET_DETALLE_BENEFICIO_AFILIADO" detBA
        ON
            detBs."ID_DETALLE_PERSONA" = detBA."ID_DETALLE_PERSONA"
            AND detBs."ID_PERSONA" = detBA."ID_PERSONA"
            AND detBs."ID_CAUSANTE" = detBA."ID_CAUSANTE"
            AND detBs."ID_BENEFICIO" = detBA."ID_BENEFICIO"
        JOIN
            "NET_BENEFICIO" ben
        ON
            detBA."ID_BENEFICIO" = ben."ID_BENEFICIO"
        JOIN
            "NET_DETALLE_PERSONA" detP
        ON
            detBA."ID_PERSONA" = detP."ID_PERSONA"
            AND detBA."ID_DETALLE_PERSONA" = detP."ID_DETALLE_PERSONA"
            AND detBA."ID_CAUSANTE" = detP."ID_CAUSANTE"
        JOIN
            "NET_TIPO_PERSONA" tipoP
        ON
            detP."ID_TIPO_PERSONA" = tipoP."ID_TIPO_PERSONA"
        JOIN
            "NET_PERSONA" per
        ON
            per."ID_PERSONA" = detP."ID_PERSONA"
        INNER JOIN
            "NET_PERSONA_POR_BANCO" perPorBan
        ON
            detBs."ID_AF_BANCO" = perPorBan."ID_AF_BANCO"
        INNER JOIN
            "NET_BANCO" banco
        ON
            banco."ID_BANCO" = perPorBan."ID_BANCO"

        WHERE
                detBs."ESTADO" = 'PAGADA' AND
                tipoPlan."ID_TIPO_PLANILLA" IN (1,2) AND
                TO_DATE(plan."PERIODO_INICIO", 'DD-MM-YYYY') >= TO_DATE('${perI}', 'DD-MM-YYYY') AND
                TO_DATE(plan."PERIODO_FINALIZACION", 'DD-MM-YYYY') <= TO_DATE('${perF}', 'DD-MM-YYYY')

        GROUP BY
        per."N_IDENTIFICACION",
        plan."ID_PLANILLA",
        per."ID_PERSONA",
        tipoP."TIPO_PERSONA",
        perPorBan."NUM_CUENTA",
        banco."NOMBRE_BANCO",
        banco."COD_BANCO",
        ben."ID_BENEFICIO",
         TO_CHAR(TO_DATE(plan."PERIODO_INICIO", 'DD-MM-YYYY'), 'MM'),
            TO_CHAR(TO_DATE(plan."PERIODO_INICIO", 'DD-MM-YYYY'), 'YYYY'),
            TRIM(
                per."PRIMER_APELLIDO" || ' ' ||
                COALESCE(per."SEGUNDO_APELLIDO", '') || ' ' ||
                per."PRIMER_NOMBRE" || ' ' ||
                COALESCE(per."SEGUNDO_NOMBRE", '') || ' ' ||
                COALESCE(per."TERCER_NOMBRE", '')
            )
        ORDER BY  TRIM(
                per."PRIMER_APELLIDO" || ' ' ||
                COALESCE(per."SEGUNDO_APELLIDO", '') || ' ' ||
                per."PRIMER_NOMBRE" || ' ' ||
                COALESCE(per."SEGUNDO_NOMBRE", '') || ' ' ||
                COALESCE(per."TERCER_NOMBRE", '')
            ) 
    `;

    let queryI = `
          SELECT 
              per."ID_PERSONA",
              plan."ID_PLANILLA",
                      SUM(dd."MONTO_APLICADO") AS "DEDUCCIONES"
              FROM "NET_PLANILLA" plan
              JOIN "NET_TIPO_PLANILLA" tipoPlan ON plan."ID_TIPO_PLANILLA" = tipoPlan."ID_TIPO_PLANILLA"
              INNER JOIN "NET_DETALLE_DEDUCCION" dd ON dd."ID_PLANILLA" = plan."ID_PLANILLA"
              INNER JOIN "NET_DEDUCCION" ded ON ded."ID_DEDUCCION" = dd."ID_DEDUCCION"
              INNER JOIN "NET_CENTRO_TRABAJO" instFin ON instFin."ID_CENTRO_TRABAJO" = ded."ID_CENTRO_TRABAJO" 
          JOIN
                      "NET_PERSONA_POR_BANCO" perPorBan
                  ON
                      dd."ID_AF_BANCO" = perPorBan."ID_AF_BANCO"
                  JOIN
                      "NET_BANCO" banco
                  ON
                      banco."ID_BANCO" = perPorBan."ID_BANCO"

                      INNER JOIN "NET_PERSONA" per ON per."ID_PERSONA" = dd."ID_PERSONA"

                      WHERE
                          dd."ESTADO_APLICACION" = 'COBRADA' AND
                          tipoPlan."ID_TIPO_PLANILLA" IN (1,2) AND
                          TO_DATE(plan."PERIODO_INICIO", 'DD-MM-YYYY') >= TO_DATE('${perI}', 'DD-MM-YYYY') AND 
                          TO_DATE(plan."PERIODO_FINALIZACION", 'DD-MM-YYYY') <= TO_DATE('${perF}', 'DD-MM-YYYY')
                      GROUP BY
                      plan."ID_PLANILLA",
                          per."ID_PERSONA"
    `;


    interface Persona {
      N_IDENTIFICACION: string;
      ID_PERSONA: number;
      TOTAL_BENEFICIOS: number;
      NOMBRE_COMPLETO: string;
      TOTAL_DEDUCCIONES_INPREMA?: number;
      TOTAL_DEDUCCIONES_TERCEROS?: number;
      TOTAL_NETO?: number;
    }
    interface Deduccion {
      ID_PERSONA: number;
      ID_PLANILLA: number;
      DEDUCCIONES?: number;
    }

    try {
      const result: any = await this.entityManager.query(query);
      const resultI: any = await this.entityManager.query(queryI);

      const newResult = result.map(persona => {
        const deduccionI = resultI.find(d => d.ID_PERSONA === persona.ID_PERSONA && d.ID_PLANILLA === persona.ID_PLANILLA);


        let totD = 0;
        if (deduccionI) {
          totD = (deduccionI?.['DEDUCCIONES'] || 0);
        }

        return {
          DNI: persona.DNI,
          NOMBRE_COMPLETO: persona.NOMBRE_COMPLETO,
          ID_BENEFICIO: persona.ID_BENEFICIO,
          MES: persona.MES,
          ANIO: persona.ANIO,
          NUM_CUENTA: persona.NUM_CUENTA,
          COD_BANCO: persona.COD_BANCO,
          NOMBRE_BANCO: persona.NOMBRE_BANCO,
          TOTAL_NETO: persona.TOTAL_BENEFICIO - totD,
        };
      });

      return newResult;
    } catch (error) {
      this.logger.error(`Error al obtener totales por planilla: ${error.message}`, error.stack);
      throw new InternalServerErrorException('Se produjo un error al obtener los totales por planilla.');
    }
  }

  async ObtenerPlanDefinPersonas(codPlanilla: string, page?: number, limit?: number): Promise<any> {
    let query = `
               SELECT DISTINCT
            per."N_IDENTIFICACION" AS "DNI",
            tipoP."TIPO_PERSONA" AS "TIPO_PERSONA",
            per."ID_PERSONA",
            perPorBan."NUM_CUENTA",
            banco."NOMBRE_BANCO",
            SUM(detBs."MONTO_A_PAGAR") AS "TOTAL_BENEFICIO",
             TRIM(
                per."PRIMER_APELLIDO" || ' ' ||
                COALESCE(per."SEGUNDO_APELLIDO", '') || ' ' ||
                per."PRIMER_NOMBRE" || ' ' ||
                COALESCE(per."SEGUNDO_NOMBRE", '') || ' ' ||
                COALESCE(per."TERCER_NOMBRE", '')
            )  AS "NOMBRE_COMPLETO"
        FROM 
            "NET_DETALLE_PAGO_BENEFICIO" detBs
        
        JOIN 
            "NET_PLANILLA" plan
        ON 
            plan."ID_PLANILLA" = detBs."ID_PLANILLA"
        JOIN 
            "NET_DETALLE_BENEFICIO_AFILIADO" detBA
        ON 
            detBs."ID_DETALLE_PERSONA" = detBA."ID_DETALLE_PERSONA" 
            AND detBs."ID_PERSONA" = detBA."ID_PERSONA"
            AND detBs."ID_CAUSANTE" = detBA."ID_CAUSANTE"
            AND detBs."ID_BENEFICIO" = detBA."ID_BENEFICIO"
        JOIN 
            "NET_BENEFICIO" ben
        ON 
            detBA."ID_BENEFICIO" = ben."ID_BENEFICIO"
        JOIN 
            "NET_DETALLE_PERSONA" detP
        ON 
            detBA."ID_PERSONA" = detP."ID_PERSONA"
            AND detBA."ID_DETALLE_PERSONA" = detP."ID_DETALLE_PERSONA"
            AND detBA."ID_CAUSANTE" = detP."ID_CAUSANTE"
        JOIN 
            "NET_TIPO_PERSONA" tipoP
        ON 
            detP."ID_TIPO_PERSONA" = tipoP."ID_TIPO_PERSONA"
        JOIN 
            "NET_PERSONA" per
        ON 
            per."ID_PERSONA" = detP."ID_PERSONA"
        JOIN 
            "NET_PERSONA_POR_BANCO" perPorBan
        ON 
            detBs."ID_AF_BANCO" = perPorBan."ID_AF_BANCO"
        JOIN 
            "NET_BANCO" banco
        ON 
            banco."ID_BANCO" = perPorBan."ID_BANCO"
        
        WHERE
                detBs."ESTADO" = 'PAGADA' AND
                plan."CODIGO_PLANILLA" = '${codPlanilla}' 
                --AND
                --plan."DEDUCC_INPREMA_CARGADAS" = 'SI' AND
                --plan."DEDUCC_TERCEROS_CARGADAS" = 'SI' AND
                --plan."ALTAS_CARGADAS" = 'SI' AND
                --plan."BAJAS_CARGADAS" = 'SI' 
                
        GROUP BY 
        per."N_IDENTIFICACION",
        per."ID_PERSONA",
        tipoP."TIPO_PERSONA",
        perPorBan."NUM_CUENTA",
        banco."NOMBRE_BANCO",
            TRIM(
                per."PRIMER_APELLIDO" || ' ' ||
                COALESCE(per."SEGUNDO_APELLIDO", '') || ' ' ||
                per."PRIMER_NOMBRE" || ' ' ||
                COALESCE(per."SEGUNDO_NOMBRE", '') || ' ' ||
                COALESCE(per."TERCER_NOMBRE", '')
            ) 
        ORDER BY  TRIM(
                per."PRIMER_APELLIDO" || ' ' ||
                COALESCE(per."SEGUNDO_APELLIDO", '') || ' ' ||
                per."PRIMER_NOMBRE" || ' ' ||
                COALESCE(per."SEGUNDO_NOMBRE", '') || ' ' ||
                COALESCE(per."TERCER_NOMBRE", '')
            ) 
    `;

    let queryI = `
            SELECT 
            per."ID_PERSONA",
                    SUM(dd."MONTO_APLICADO") AS "DEDUCCIONES_INPREMA"
            FROM "NET_PLANILLA" plan 
            INNER JOIN "NET_DETALLE_DEDUCCION" dd ON dd."ID_PLANILLA" = plan."ID_PLANILLA"
            INNER JOIN "NET_DEDUCCION" ded ON ded."ID_DEDUCCION" = dd."ID_DEDUCCION"
            INNER JOIN "NET_CENTRO_TRABAJO" instFin ON instFin."ID_CENTRO_TRABAJO" = ded."ID_CENTRO_TRABAJO"
            JOIN
                      "NET_PERSONA_POR_BANCO" perPorBan
                  ON
                      dd."ID_AF_BANCO" = perPorBan."ID_AF_BANCO"
                  JOIN
                      "NET_BANCO" banco
                  ON
                      banco."ID_BANCO" = perPorBan."ID_BANCO"

                      INNER JOIN "NET_PERSONA" per ON per."ID_PERSONA" = dd."ID_PERSONA" 


            INNER JOIN "NET_PERSONA" per ON per."ID_PERSONA" = dd."ID_PERSONA"

            WHERE
                dd."ESTADO_APLICACION" = 'COBRADA' AND
                instFin."NOMBRE_CENTRO_TRABAJO" = 'INPREMA' AND
                plan."CODIGO_PLANILLA" = '${codPlanilla}'
                --AND
                --plan."DEDUCC_INPREMA_CARGADAS" = 'SI' AND
                --plan."DEDUCC_TERCEROS_CARGADAS" = 'SI' AND
                --plan."ALTAS_CARGADAS" = 'SI' AND
                --plan."BAJAS_CARGADAS" = 'SI' 
            GROUP BY 
                per."ID_PERSONA"
    `;

    let queryT = `
          SELECT 
          per."ID_PERSONA",
                  SUM(dd."MONTO_APLICADO") AS "DEDUCCIONES_TERCEROS"
          FROM "NET_PLANILLA" plan 
          INNER JOIN "NET_DETALLE_DEDUCCION" dd ON dd."ID_PLANILLA" = plan."ID_PLANILLA"
          INNER JOIN "NET_DEDUCCION" ded ON ded."ID_DEDUCCION" = dd."ID_DEDUCCION"
          INNER JOIN "NET_CENTRO_TRABAJO" instFin ON instFin."ID_CENTRO_TRABAJO" = ded."ID_CENTRO_TRABAJO" 
          JOIN
                      "NET_PERSONA_POR_BANCO" perPorBan
                  ON
                      dd."ID_AF_BANCO" = perPorBan."ID_AF_BANCO"
                  JOIN
                      "NET_BANCO" banco
                  ON
                      banco."ID_BANCO" = perPorBan."ID_BANCO"

                      INNER JOIN "NET_PERSONA" per ON per."ID_PERSONA" = dd."ID_PERSONA"


          INNER JOIN "NET_PERSONA" per ON per."ID_PERSONA" = dd."ID_PERSONA"

          WHERE
              dd."ESTADO_APLICACION" = 'COBRADA' AND
              instFin."NOMBRE_CENTRO_TRABAJO" != 'INPREMA' AND
              plan."CODIGO_PLANILLA" = '${codPlanilla}' 
                --AND
                --plan."DEDUCC_INPREMA_CARGADAS" = 'SI' AND
                --plan."DEDUCC_TERCEROS_CARGADAS" = 'SI' AND
                --plan."ALTAS_CARGADAS" = 'SI' AND
                --plan."BAJAS_CARGADAS" = 'SI' 
          GROUP BY 
          per."ID_PERSONA"
    `;
    interface Persona {
      DNI: string;
      ID_PERSONA: number;
      NUM_CUENTA: string;
      NOMBRE_BANCO: string;
      TOTAL_BENEFICIO: number;
      NOMBRE_COMPLETO: string;
      DEDUCCIONES_INPREMA?: number;
      DEDUCCIONES_TERCEROS?: number;
    }

    interface Deduccion {
      ID_PERSONA: number;
      DEDUCCIONES_INPREMA?: number;
      DEDUCCIONES_TERCEROS?: number;
    }

    try {
      const result: Persona[] = await this.entityManager.query(query);
      const resultI: Deduccion[] = await this.entityManager.query(queryI);
      const resultT: Deduccion[] = await this.entityManager.query(queryT);

      const newResult = result.map(persona => {
        const deduccionI = resultI.find(d => d.ID_PERSONA === persona.ID_PERSONA);
        const deduccionT = resultT.find(d => d.ID_PERSONA === persona.ID_PERSONA);

        return {
          ...persona,
          DEDUCCIONES_INPREMA: deduccionI ? deduccionI['DEDUCCIONES_INPREMA'] : null,
          DEDUCCIONES_TERCEROS: deduccionT ? deduccionT['DEDUCCIONES_TERCEROS'] : null
        };
      });

      return newResult;
    } catch (error) {
      this.logger.error(`Error al obtener totales por planilla: ${error.message}`, error.stack);
      throw new InternalServerErrorException('Se produjo un error al obtener los totales por planilla.');
    }
  }

  async ObtenerPlanDefinPersonasCONTA(codPlanilla: string, page?: number, limit?: number): Promise<any> {
    let query = `
            SELECT DISTINCT
            per."N_IDENTIFICACION" AS "DNI",
            tipoP."TIPO_PERSONA" AS "TIPO_PERSONA",
            per."ID_PERSONA",
            perPorBan."NUM_CUENTA",
            banco."NOMBRE_BANCO",
            SUM(detBs."MONTO_A_PAGAR") AS "TOTAL_BENEFICIO",
             TRIM(
                per."PRIMER_APELLIDO" || ' ' ||
                COALESCE(per."SEGUNDO_APELLIDO", '') || ' ' ||
                per."PRIMER_NOMBRE" || ' ' ||
                COALESCE(per."SEGUNDO_NOMBRE", '') || ' ' ||
                COALESCE(per."TERCER_NOMBRE", '')
            )  AS "NOMBRE_COMPLETO"
        FROM 
            "NET_DETALLE_PAGO_BENEFICIO" detBs
        
        JOIN 
            "NET_PLANILLA" plan
        ON 
            plan."ID_PLANILLA" = detBs."ID_PLANILLA"
        JOIN 
            "NET_DETALLE_BENEFICIO_AFILIADO" detBA
        ON 
            detBs."ID_DETALLE_PERSONA" = detBA."ID_DETALLE_PERSONA" 
            AND detBs."ID_PERSONA" = detBA."ID_PERSONA"
            AND detBs."ID_CAUSANTE" = detBA."ID_CAUSANTE"
            AND detBs."ID_BENEFICIO" = detBA."ID_BENEFICIO"
        JOIN 
            "NET_BENEFICIO" ben
        ON 
            detBA."ID_BENEFICIO" = ben."ID_BENEFICIO"
        JOIN 
            "NET_DETALLE_PERSONA" detP
        ON 
            detBA."ID_PERSONA" = detP."ID_PERSONA"
            AND detBA."ID_DETALLE_PERSONA" = detP."ID_DETALLE_PERSONA"
            AND detBA."ID_CAUSANTE" = detP."ID_CAUSANTE"
        JOIN 
            "NET_TIPO_PERSONA" tipoP
        ON 
            detP."ID_TIPO_PERSONA" = tipoP."ID_TIPO_PERSONA"
        JOIN 
            "NET_PERSONA" per
        ON 
            per."ID_PERSONA" = detP."ID_PERSONA"
        JOIN 
            "NET_PERSONA_POR_BANCO" perPorBan
        ON 
            detBs."ID_AF_BANCO" = perPorBan."ID_AF_BANCO"
        JOIN 
            "NET_BANCO" banco
        ON 
            banco."ID_BANCO" = perPorBan."ID_BANCO"
        
        WHERE
                detBs."ESTADO" = 'PAGADA' AND
                plan."CODIGO_PLANILLA" = '${codPlanilla}' 
                --AND
                --plan."DEDUCC_INPREMA_CARGADAS" = 'SI' AND
                --plan."DEDUCC_TERCEROS_CARGADAS" = 'SI' AND
                --plan."ALTAS_CARGADAS" = 'SI' AND
                --plan."BAJAS_CARGADAS" = 'SI' 
                
        GROUP BY 
        per."N_IDENTIFICACION",
        per."ID_PERSONA",
        tipoP."TIPO_PERSONA",
        perPorBan."NUM_CUENTA",
        banco."NOMBRE_BANCO",
            TRIM(
                per."PRIMER_APELLIDO" || ' ' ||
                COALESCE(per."SEGUNDO_APELLIDO", '') || ' ' ||
                per."PRIMER_NOMBRE" || ' ' ||
                COALESCE(per."SEGUNDO_NOMBRE", '') || ' ' ||
                COALESCE(per."TERCER_NOMBRE", '')
            ) 
        ORDER BY  TRIM(
                per."PRIMER_APELLIDO" || ' ' ||
                COALESCE(per."SEGUNDO_APELLIDO", '') || ' ' ||
                per."PRIMER_NOMBRE" || ' ' ||
                COALESCE(per."SEGUNDO_NOMBRE", '') || ' ' ||
                COALESCE(per."TERCER_NOMBRE", '')
            ) 
    `;

    let queryI = `
            SELECT 
            per."ID_PERSONA",
                    SUM(dd."MONTO_APLICADO") AS "DEDUCCIONES_INPREMA"
            FROM "NET_PLANILLA" plan 
            INNER JOIN "NET_DETALLE_DEDUCCION" dd ON dd."ID_PLANILLA" = plan."ID_PLANILLA"
            INNER JOIN "NET_DEDUCCION" ded ON ded."ID_DEDUCCION" = dd."ID_DEDUCCION"
            INNER JOIN "NET_CENTRO_TRABAJO" instFin ON instFin."ID_CENTRO_TRABAJO" = ded."ID_CENTRO_TRABAJO"
            JOIN
                      "NET_PERSONA_POR_BANCO" perPorBan
                  ON
                      dd."ID_AF_BANCO" = perPorBan."ID_AF_BANCO"
                  JOIN
                      "NET_BANCO" banco
                  ON
                      banco."ID_BANCO" = perPorBan."ID_BANCO"

                      INNER JOIN "NET_PERSONA" per ON per."ID_PERSONA" = dd."ID_PERSONA" 


            INNER JOIN "NET_PERSONA" per ON per."ID_PERSONA" = dd."ID_PERSONA"

            WHERE
                dd."ESTADO_APLICACION" = 'COBRADA' AND
                instFin."NOMBRE_CENTRO_TRABAJO" = 'INPREMA' AND
                plan."CODIGO_PLANILLA" = '${codPlanilla}'
                --AND
                --plan."DEDUCC_INPREMA_CARGADAS" = 'SI' AND
                --plan."DEDUCC_TERCEROS_CARGADAS" = 'SI' AND
                --plan."ALTAS_CARGADAS" = 'SI' AND
                --plan."BAJAS_CARGADAS" = 'SI' 
            GROUP BY 
                per."ID_PERSONA"
    `;

    let queryT = `
          SELECT 
          per."ID_PERSONA",
                  SUM(dd."MONTO_APLICADO") AS "DEDUCCIONES_TERCEROS"
          FROM "NET_PLANILLA" plan 
          INNER JOIN "NET_DETALLE_DEDUCCION" dd ON dd."ID_PLANILLA" = plan."ID_PLANILLA"
          INNER JOIN "NET_DEDUCCION" ded ON ded."ID_DEDUCCION" = dd."ID_DEDUCCION"
          INNER JOIN "NET_CENTRO_TRABAJO" instFin ON instFin."ID_CENTRO_TRABAJO" = ded."ID_CENTRO_TRABAJO" 
          JOIN
                      "NET_PERSONA_POR_BANCO" perPorBan
                  ON
                      dd."ID_AF_BANCO" = perPorBan."ID_AF_BANCO"
                  JOIN
                      "NET_BANCO" banco
                  ON
                      banco."ID_BANCO" = perPorBan."ID_BANCO"

                      INNER JOIN "NET_PERSONA" per ON per."ID_PERSONA" = dd."ID_PERSONA"


          INNER JOIN "NET_PERSONA" per ON per."ID_PERSONA" = dd."ID_PERSONA"

          WHERE
              dd."ESTADO_APLICACION" = 'COBRADA' AND
              instFin."NOMBRE_CENTRO_TRABAJO" != 'INPREMA' AND
              plan."CODIGO_PLANILLA" = '${codPlanilla}' 
                --AND
                --plan."DEDUCC_INPREMA_CARGADAS" = 'SI' AND
                --plan."DEDUCC_TERCEROS_CARGADAS" = 'SI' AND
                --plan."ALTAS_CARGADAS" = 'SI' AND
                --plan."BAJAS_CARGADAS" = 'SI' 
          GROUP BY 
          per."ID_PERSONA"
    `;

    interface Persona {
      DNI: string;
      ID_PERSONA: number;
      NUM_CUENTA: string;
      NOMBRE_BANCO: string;
      TOTAL_BENEFICIO: number;
      NOMBRE_COMPLETO: string;
      DEDUCCIONES_INPREMA?: number;
      DEDUCCIONES_TERCEROS?: number;
    }

    interface Deduccion {
      ID_PERSONA: number;
      DEDUCCIONES_INPREMA?: number;
      DEDUCCIONES_TERCEROS?: number;
    }

    try {
      const result: Persona[] = await this.entityManager.query(query);
      const resultI: Deduccion[] = await this.entityManager.query(queryI);
      const resultT: Deduccion[] = await this.entityManager.query(queryT);

      const newResult = result.map(persona => {
        const deduccionI = resultI.find(d => d.ID_PERSONA === persona.ID_PERSONA);
        const deduccionT = resultT.find(d => d.ID_PERSONA === persona.ID_PERSONA);

        return {
          ...persona,
          DEDUCCIONES_INPREMA: deduccionI ? deduccionI['DEDUCCIONES_INPREMA'] : null,
          DEDUCCIONES_TERCEROS: deduccionT ? deduccionT['DEDUCCIONES_TERCEROS'] : null
        };
      });

      console.log(newResult)

      return newResult;
    } catch (error) {
      this.logger.error(`Error al obtener totales por planilla: ${error.message}`, error.stack);
      throw new InternalServerErrorException('Se produjo un error al obtener los totales por planilla.');
    }
  }

  async GetDeduccionesPorPlanillaSeparadas(idPlanilla: number) {
    const deducciones = await this.detalleDeduccionRepository
      .createQueryBuilder('detalle_deduccion')
      .innerJoin('detalle_deduccion.deduccion', 'deduccion')
      .innerJoin('detalle_deduccion.planilla', 'planilla')
      .select('deduccion.id_deduccion', 'ID_DEDUCCION')
      .addSelect('deduccion.nombre_deduccion', 'NOMBRE_DEDUCCION')
      .addSelect('deduccion.codigo_deduccion', 'COD_DEDUCCION')
      .addSelect('SUM(detalle_deduccion.monto_aplicado)', 'TOTAL_MONTO_APLICADO')
      .where('planilla.id_planilla = :idPlanilla', { idPlanilla })
      .groupBy('deduccion.id_deduccion')
      .addGroupBy('deduccion.nombre_deduccion')
      .addGroupBy('deduccion.codigo_deduccion')
      .getRawMany();

    const deduccionesINPREMA = deducciones.filter(d => [1, 3, 51, 45].includes(d.ID_DEDUCCION));
    const deduccionesTerceros = deducciones.filter(d => ![1, 3, 51, 45].includes(d.ID_DEDUCCION));

    return {
      deduccionesINPREMA,
      deduccionesTerceros,
    };
  }

  async generarExcel(data: any[], response: Response): Promise<void> {
    const workbook = new Workbook();
    const worksheet = workbook.addWorksheet('Planilla');

    // Definir las columnas
    worksheet.columns = [
      { header: 'ID_PERSONA', key: 'ID_PERSONA', width: 15 },
      { header: 'DNI', key: 'DNI', width: 15 },
      { header: 'NOMBRE_COMPLETO', key: 'NOMBRE_COMPLETO', width: 30 },
      { header: 'TOTAL BENEFICIO', key: 'TOTAL_BENEFICIO', width: 15 },
      { header: 'DEDUCCIONES TERCEROS', key: 'DEDUCCIONES_TERCEROS', width: 15 },
      { header: 'DEDUCCIONES INPREMA', key: 'DEDUCCIONES_INPREMA', width: 15 },
      { header: 'NUMERO DE CUENTA', key: 'NUM_CUENTA', width: 25 },
      { header: 'NOMBRE BANCO', key: 'NOMBRE_BANCO', width: 15 },
    ];

    // Agregar los datos al worksheet
    data.forEach(item => {
      worksheet.addRow(item);
    });

    // Formatear el archivo como buffer y enviarlo al cliente
    const buffer = await workbook.xlsx.writeBuffer();

    response.setHeader('Content-Type', 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet');
    response.setHeader('Content-Disposition', 'attachment; filename=planilla.xlsx');
    response.send(buffer);
  }

  async generarExcelInv(data: any[], response: Response): Promise<void> {
    const workbook = new Workbook();
    const worksheet = workbook.addWorksheet('Planilla');

    // Definir las columnas
    worksheet.columns = [
      { header: 'DNI', key: 'DNI', width: 15 },
      { header: 'NOMBRE_COMPLETO', key: 'NOMBRE_COMPLETO', width: 30 },
      { header: 'ID_BENEFICIO', key: 'ID_BENEFICIO', width: 15 },
      { header: 'MES', key: 'MES', width: 15 },
      { header: 'ANIO', key: 'ANIO', width: 15 },
      { header: 'NUMERO DE CUENTA', key: 'NUM_CUENTA', width: 25 },
      { header: 'COD_BANCO', key: 'COD_BANCO', width: 25 },
      { header: 'NOMBRE BANCO', key: 'NOMBRE_BANCO', width: 15 },
      { header: 'TOTAL_NETO', key: 'TOTAL_NETO', width: 15 },
    ];

    // Agregar los datos al worksheet
    data.forEach(item => {
      worksheet.addRow(item);
    });

    // Formatear el archivo como buffer y enviarlo al cliente
    const buffer = await workbook.xlsx.writeBuffer();

    response.setHeader('Content-Type', 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet');
    response.setHeader('Content-Disposition', 'attachment; filename=planilla.xlsx');
    response.send(buffer);
  }

  async create(createPlanillaDto: CreatePlanillaDto) {
    const { nombre_planilla, periodo_inicio, periodo_finalizacion } = createPlanillaDto;

    try {
      const tipoPlanilla = await this.tipoPlanillaRepository.findOneBy({ nombre_planilla });

      if (!tipoPlanilla) {
        throw new BadRequestException(
          `No se encontró ningún tipo de planilla con el nombre '${nombre_planilla}'.`
        );
      }

      const planillaActiva = await this.planillaRepository.findOne({
        where: {
          tipoPlanilla: { id_tipo_planilla: tipoPlanilla.id_tipo_planilla },
          estado: 'ACTIVA',
        },
      });

      if (planillaActiva) {
        throw new ConflictException(
          `Ya existe una planilla activa para el tipo de planilla '${nombre_planilla}'.`
        );
      }

      let codPlanilla = '';
      const fechaActual: Date = new Date();
      const mes: number = getMonth(fechaActual) + 1;
      const anio: number = getYear(fechaActual);
      const primerDia: Date = startOfMonth(fechaActual);
      const ultimoDia: Date = endOfMonth(fechaActual);
      let secuencia = 1;
      let planillaExistente;

      do {
        switch (nombre_planilla) {
          case 'ORDINARIA DE JUBILADOS Y PENSIONADOS':
            codPlanilla = `ORD-JUB-PEN-${mes}-${anio}-${secuencia}`;
            break;
          case 'ORDINARIA DE BENEFICIARIOS':
            codPlanilla = `ORD-BEN-${mes}-${anio}-${secuencia}`;
            break;
          case 'COMPLEMENTARIA DE JUBILADOS Y PENSIONADOS':
            codPlanilla = `COMP-JUB-PEN-${mes}-${anio}-${secuencia}`;
            break;
          case 'COMPLEMENTARIA DE BENEFICIARIOS':
            codPlanilla = `COMP-BEN-${mes}-${anio}-${secuencia}`;
            break;
          case 'COMPLEMENTARIA AFILIADO':
            codPlanilla = `COMP-AFIL-${mes}-${anio}-${secuencia}`;
            break;
          case 'EXTRAORDINARIA DE JUBILADOS Y PENSIONADOS':
            codPlanilla = `EXTRA-JUB-PEN-${mes}-${anio}-${secuencia}`;
            break;
          case 'EXTRAORDINARIA DE BENEFICIARIOS':
            codPlanilla = `EXTRA-JUB-${mes}-${anio}-${secuencia}`;
            break;
          case '60 RENTAS':
            codPlanilla = `60-RENTAS-${mes}-${anio}-${secuencia}`;
            break;
          default:
            throw new BadRequestException('Tipo de planilla no reconocido');
        }
        planillaExistente = await this.planillaRepository.findOneBy({
          codigo_planilla: codPlanilla,
        });
        if (planillaExistente) {
          secuencia++;
        }
      } while (planillaExistente);

      const tipoPlanillaInstance = new Net_TipoPlanilla();
      tipoPlanillaInstance.id_tipo_planilla = tipoPlanilla.id_tipo_planilla;

      // Convertir las fechas al formato adecuado
      const formato = 'dd/MM/yyyy';
      const periodoInicio: Date = periodo_inicio
        ? parse(periodo_inicio, formato, new Date())
        : primerDia;

      const periodoFinalizacion: Date = periodo_finalizacion
        ? parse(periodo_finalizacion, formato, new Date())
        : ultimoDia;

      const data = {
        codigo_planilla: codPlanilla,
        secuencia,
        periodoInicio,
        periodoFinalizacion,
        tipoPlanilla: tipoPlanillaInstance,
        estado: 'ACTIVA',
      };
      console.log(data);

      const newPlanilla = this.planillaRepository.create(data);

      await this.planillaRepository.save(newPlanilla);
      return newPlanilla;
    } catch (error) {
      if (error instanceof QueryFailedError && error.message.includes('ORA-00001')) {
        throw new ConflictException(
          `La planilla con la secuencia ya existe, por favor cambie la secuencia o revise los datos.`
        );
      }
      throw error;
    }
  }

  findAll(paginationDto: PaginationDto) {
    const { offset = 0 } = paginationDto;
    return this.planillaRepository.find({
      skip: offset,
      where: {
        tipoPlanilla: { clase_planilla: "EGRESO" }
      },
      relations: ['tipoPlanilla'],
      order: {
        fecha_cierre: 'DESC'
      }
    });
  }

  remove(id: number) {
    return `This action removes a #${id} planilla`;
  }

  async getDesgloseDeducciones(idPlanilla: number, idBeneficio: number): Promise<any> {
    try {
      const result = await this.planillaRepository.query(
        `
        SELECT 
          ded."ID_DEDUCCION",
          ded."NOMBRE_DEDUCCION", 
          SUM(dd."MONTO_APLICADO") AS "TOTAL_MONTO_APLICADO",
          CASE 
            WHEN ded."ID_CENTRO_TRABAJO" = 1 THEN 'INPREMA'
            ELSE 'TERCEROS'
          END AS "TIPO_DEDUCCION"
        FROM 
          "NET_DETALLE_DEDUCCION" dd
        INNER JOIN 
          "NET_DEDUCCION" ded 
        ON 
          dd."ID_DEDUCCION" = ded."ID_DEDUCCION"
        INNER JOIN 
          "NET_DETALLE_PAGO_BENEFICIO" dpb 
        ON 
          dd."ID_DETALLE_PAGO_BENEFICIO" = dpb."ID_BENEFICIO_PLANILLA"
        WHERE 
          dpb."ID_PLANILLA" = :idPlanilla
        AND 
          dpb."ID_BENEFICIO" = :idBeneficio
        GROUP BY
          ded."ID_DEDUCCION",
          ded."NOMBRE_DEDUCCION",
          CASE 
            WHEN ded."ID_CENTRO_TRABAJO" = 1 THEN 'INPREMA'
            ELSE 'TERCEROS'
          END
        `,
        [idPlanilla, idBeneficio]
      );
      return result;
    } catch (error) {
      console.error('Error al obtener el desglose de deducciones:', error);
      throw new Error('Error al obtener el desglose de deducciones');
    }
  }

  async getTotalesBeneficiosDeducciones(idPlanilla: number): Promise<any> {
    const query = `
      SELECT 
        ben."ID_BENEFICIO" AS "ID_BENEFICIO",
        ben."NOMBRE_BENEFICIO" AS "NOMBRE_BENEFICIO",
        ben."CODIGO" AS "CODIGO_BENEFICIO",
        SUM(dpb."MONTO_A_PAGAR") AS "TOTAL_MONTO_BENEFICIO",
        (
            SELECT COALESCE(SUM(dedd."MONTO_APLICADO"), 0)
            FROM "NET_DETALLE_DEDUCCION" dedd
            INNER JOIN "NET_PLANILLA" plan ON dedd."ID_PLANILLA" = plan."ID_PLANILLA"
            INNER JOIN "NET_DETALLE_PAGO_BENEFICIO" dpb 
            ON dedd."ID_PLANILLA" = dpb."ID_PLANILLA"
            WHERE dpb."ID_PLANILLA" = plan."ID_PLANILLA"
            AND dpb."ID_BENEFICIO" = ben."ID_BENEFICIO"
            AND dedd."ID_DEDUCCION" IN (
                SELECT ded."ID_DEDUCCION"
                FROM "NET_DEDUCCION" ded
                WHERE ded."ID_CENTRO_TRABAJO" = 1
            )
        ) AS "DEDUCCIONES_INPREMA",
        (
            SELECT COALESCE(SUM(dedd."MONTO_APLICADO"), 0)
            FROM "NET_DETALLE_DEDUCCION" dedd
            INNER JOIN "NET_PLANILLA" plan ON dedd."ID_PLANILLA" = plan."ID_PLANILLA"
            INNER JOIN "NET_DETALLE_PAGO_BENEFICIO" dpb 
            ON dedd."ID_PLANILLA" = dpb."ID_PLANILLA"
            WHERE dpb."ID_PLANILLA" = plan."ID_PLANILLA"
            AND dpb."ID_BENEFICIO" = ben."ID_BENEFICIO"
            AND dedd."ID_DEDUCCION" NOT IN (
                SELECT ded."ID_DEDUCCION"
                FROM "NET_DEDUCCION" ded
                WHERE ded."ID_CENTRO_TRABAJO" = 1
            )
        ) AS "DEDUCCIONES_DE_TERCEROS",
        (
            SUM(dpb."MONTO_A_PAGAR") - (
                SELECT COALESCE(SUM(dedd."MONTO_APLICADO"), 0)
                FROM "NET_DETALLE_DEDUCCION" dedd
                INNER JOIN "NET_PLANILLA" plan ON dedd."ID_PLANILLA" = plan."ID_PLANILLA"
                INNER JOIN "NET_DETALLE_PAGO_BENEFICIO" dpb 
                ON dedd."ID_PLANILLA" = dpb."ID_PLANILLA"
                WHERE dpb."ID_PLANILLA" = plan."ID_PLANILLA"
                AND dpb."ID_BENEFICIO" = ben."ID_BENEFICIO"
            )
        ) AS "NETO"
      FROM 
        "NET_DETALLE_PAGO_BENEFICIO" dpb
      INNER JOIN 
        "NET_BENEFICIO" ben 
        ON dpb."ID_BENEFICIO" = ben."ID_BENEFICIO"
      INNER JOIN 
        "NET_PLANILLA" plan 
        ON dpb."ID_PLANILLA" = plan."ID_PLANILLA"
      WHERE 
        plan."ID_PLANILLA" = :idPlanilla
      GROUP BY 
        ben."ID_BENEFICIO", 
        ben."NOMBRE_BENEFICIO", 
        ben."CODIGO", 
        plan."ID_PLANILLA"
    `;

    try {
      return await this.entityManager.query(query, [idPlanilla]);
    } catch (error) {
      console.error('Error al obtener los totales de beneficios y deducciones:', error);
      throw new InternalServerErrorException('Error al obtener los totales de beneficios y deducciones');
    }
  }

  async generarPlanillaComplementaria(token: string, tipos_persona: string): Promise<void> {

    const decoded = this.jwtService.verify(token);
    const estadoPP = await this.usuarioEmpRepository.findOne({ where: { empleadoCentroTrabajo: { correo_1: decoded?.correo } } });
    const id_usuario_empresa_in = estadoPP.id_usuario_empresa;

    console.log(token);
    console.log(tipos_persona);

    try {
      await this.entityManager.query(
        `BEGIN
           InsertarPlanillaComplementaria(:tipos_persona, :id_usuario_empresa_in);
         END;`,
        [tipos_persona, id_usuario_empresa_in]
      );
    } catch (error) {
      if (error.message.includes('No se encontró una planilla activa para Beneficiarios')) {
        throw new InternalServerErrorException('No se encontró una planilla activa para Beneficiarios');
      } else if (error.message.includes('No se encontró una planilla activa para Jubilados')) {
        throw new InternalServerErrorException('No se encontró una planilla activa para Jubilados');
      } else {
        throw new InternalServerErrorException('Error ejecutando el procedimiento de planilla complementaria');
      }
    }
  }

  async generarPlanillaOrdinaria(token: string, tipos_persona: string): Promise<void> {
    const decoded = this.jwtService.verify(token);

    const estadoPP = await this.usuarioEmpRepository.findOne({ where: { empleadoCentroTrabajo: { correo_1: decoded?.correo } } });

    const id_usuario_empresa_in = estadoPP.id_usuario_empresa;
    try {
      await this.entityManager.query(
        `BEGIN
           InsertarPlanillaOrdinaria(:tipos_persona, :id_usuario_empresa_in);
         END;`,
        [tipos_persona, id_usuario_empresa_in]
      );
    } catch (error) {
      if (error.message.includes('No se encontró una planilla activa para Beneficiarios')) {
        throw new InternalServerErrorException('No se encontró una planilla activa para Beneficiarios');
      } else if (error.message.includes('No se encontró una planilla activa para Jubilados')) {
        throw new InternalServerErrorException('No se encontró una planilla activa para Jubilados');
      } else {
        throw new InternalServerErrorException('Error ejecutando el procedimiento de planilla ordinaria');
      }
    }
  }

  async calculoPrioridadMontoAplicado(id_planilla: number): Promise<any> {
    console.log(id_planilla);

    const queryBenef = `
      SELECT DISTINCT
        per."N_IDENTIFICACION" AS "N_IDENTIFICACION",
        tipoP."TIPO_PERSONA" AS "TIPO_PERSONA",
        per."ID_PERSONA",
        perPorBan."NUM_CUENTA",
        banco."ID_BANCO",
        banco."COD_BANCO",
        banco."NOMBRE_BANCO",
        SUM(detBs."MONTO_A_PAGAR") AS "TOTAL_BENEFICIOS",
        TRIM(
          per."PRIMER_NOMBRE" || ' ' ||
          COALESCE(per."SEGUNDO_NOMBRE", '') || ' ' ||
          COALESCE(per."TERCER_NOMBRE", '') || ' ' ||
          per."PRIMER_APELLIDO" || ' ' ||
          COALESCE(per."SEGUNDO_APELLIDO", '')
        ) AS "NOMBRE_COMPLETO"
      FROM 
        "NET_DETALLE_PAGO_BENEFICIO" detBs
      JOIN 
        "NET_PLANILLA" plan ON plan."ID_PLANILLA" = detBs."ID_PLANILLA"
      JOIN 
        "NET_DETALLE_BENEFICIO_AFILIADO" detBA ON detBs."ID_DETALLE_PERSONA" = detBA."ID_DETALLE_PERSONA" 
        AND detBs."ID_PERSONA" = detBA."ID_PERSONA"
        AND detBs."ID_CAUSANTE" = detBA."ID_CAUSANTE"
        AND detBs."ID_BENEFICIO" = detBA."ID_BENEFICIO"
      JOIN 
        "NET_BENEFICIO" ben ON detBA."ID_BENEFICIO" = ben."ID_BENEFICIO"
      JOIN 
        "NET_DETALLE_PERSONA" detP ON detBA."ID_PERSONA" = detP."ID_PERSONA"
        AND detBA."ID_DETALLE_PERSONA" = detP."ID_DETALLE_PERSONA"
        AND detBA."ID_CAUSANTE" = detP."ID_CAUSANTE"
      JOIN 
        "NET_TIPO_PERSONA" tipoP ON detP."ID_TIPO_PERSONA" = tipoP."ID_TIPO_PERSONA"
      JOIN 
        "NET_PERSONA" per ON per."ID_PERSONA" = detP."ID_PERSONA"
      LEFT JOIN 
        "NET_PERSONA_POR_BANCO" perPorBan ON detBs."ID_AF_BANCO" = perPorBan."ID_AF_BANCO"
      LEFT JOIN 
        "NET_BANCO" banco ON banco."ID_BANCO" = perPorBan."ID_BANCO"
      WHERE
        detBs."ESTADO" = 'EN PRELIMINAR' AND
        plan."ID_PLANILLA" = :id_planilla
      GROUP BY 
        per."N_IDENTIFICACION",
        per."ID_PERSONA",
        tipoP."TIPO_PERSONA",
        perPorBan."NUM_CUENTA",
        banco."NOMBRE_BANCO",
        banco."ID_BANCO",
        banco."COD_BANCO",
        TRIM(
          per."PRIMER_NOMBRE" || ' ' ||
          COALESCE(per."SEGUNDO_NOMBRE", '') || ' ' ||
          COALESCE(per."TERCER_NOMBRE", '') || ' ' ||
          per."PRIMER_APELLIDO" || ' ' ||
          COALESCE(per."SEGUNDO_APELLIDO", '')
        )
    `;

    const DeduccionesTotal = `
      SELECT 
        per."ID_PERSONA",
        SUM(dd."MONTO_TOTAL") AS "TOTAL_DEDUCCIONES"
      FROM 
        "NET_PLANILLA" plan 
      INNER JOIN 
        "NET_DETALLE_DEDUCCION" dd ON dd."ID_PLANILLA" = plan."ID_PLANILLA"
      INNER JOIN 
        "NET_DEDUCCION" ded ON ded."ID_DEDUCCION" = dd."ID_DEDUCCION"
      INNER JOIN 
        "NET_CENTRO_TRABAJO" instFin ON instFin."ID_CENTRO_TRABAJO" = ded."ID_CENTRO_TRABAJO"
      INNER JOIN 
        "NET_PERSONA" per ON per."ID_PERSONA" = dd."ID_PERSONA"
      WHERE
        dd."ESTADO_APLICACION" = 'EN PRELIMINAR' AND
        plan."ID_PLANILLA" = :id_planilla 
      GROUP BY 
        per."ID_PERSONA"
    `;

    /* const DeduccionesDes = `
      SELECT 
        per."ID_PERSONA",
        dd."MONTO_TOTAL" 
      FROM 
        "NET_PLANILLA" plan 
      INNER JOIN 
        "NET_DETALLE_DEDUCCION" dd ON dd."ID_PLANILLA" = plan."ID_PLANILLA"
      INNER JOIN 
        "NET_DEDUCCION" ded ON ded."ID_DEDUCCION" = dd."ID_DEDUCCION"
      INNER JOIN 
        "NET_CENTRO_TRABAJO" instFin ON instFin."ID_CENTRO_TRABAJO" = ded."ID_CENTRO_TRABAJO"
      INNER JOIN 
        "NET_PERSONA" per ON per."ID_PERSONA" = dd."ID_PERSONA"
      WHERE
        dd."ESTADO_APLICACION" = 'EN PRELIMINAR' AND
        plan."ID_PLANILLA" = :id_planilla 
    `; */

    const result: Persona[] = await this.entityManager.query(queryBenef, [id_planilla]);
    const resultD: Deduccion[] = await this.entityManager.query(DeduccionesTotal, [id_planilla]);

    const deduccionesInpremaMap = new Map(resultD.map(d => [d.ID_PERSONA, d]));

    const newResult = result.map(persona => {
      const deduccionI = deduccionesInpremaMap.get(persona.ID_PERSONA);

      return {
        ...persona,
        TOTAL_DEDUCCIONES: deduccionI ? deduccionI['TOTAL_DEDUCCIONES'] : 0,
        TOTAL_NETO: persona.TOTAL_BENEFICIOS - (
          (deduccionI ? deduccionI['TOTAL_DEDUCCIONES'] : 0)
        )
      };
    });

    //validar cuando el arreglo es vacio
    console.log(newResult);

    let valoresNegativos: any = []
    let valoresNegativosObj: any = []
    for (let data of newResult) {
      if (data.TOTAL_DEDUCCIONES > data.TOTAL_BENEFICIOS - 100) {
        valoresNegativos.push(data.ID_PERSONA)
        valoresNegativosObj.push(data)
      }
    }

    // Crear una lista de parámetros dinámicamente para la cláusula IN
    const placeholders = valoresNegativos.map((_, index) => `:param${index}`).join(', ');

    // Crear la consulta dinámica
    const queryBenef1 = `
      SELECT * 
      FROM net_detalle_deduccion 
      WHERE id_persona IN (${placeholders}) AND id_planilla = :planilla
    `;

    // Crear los parámetros para la consulta
    const params = valoresNegativos.reduce((acc, valor, index) => {
      acc[`param${index}`] = valor;
      return acc;
    }, { planilla: id_planilla });

    // Ejecutar la consulta con los parámetros
    const result1: any[] = await this.entityManager.query(queryBenef1, params);



    const prioridades = `
      SELECT ID_DEDUCCION, PRIORIDAD
      FROM NET_DEDUCCION
      ORDER BY PRIORIDAD ASC
    `;
    const prioridadesResult: any[] = await this.entityManager.query(prioridades);

    console.log(result1);
    console.log(valoresNegativosObj);
    console.log(prioridadesResult);

    let temp = await this.distribuirMontoDisponible(valoresNegativosObj, result1, prioridadesResult);
    console.log(temp);

    try {
      for (const item of temp) {
        await this.entityManager.query(
          `UPDATE NET_DETALLE_DEDUCCION
             SET MONTO_APLICADO = :montoAplicado
             WHERE ID_DED_DEDUCCION = :idDedDeduccion`,
          [item.MONTO_APLICADO, item.ID_DED_DEDUCCION]
        );
      }
      console.log('Actualización completada correctamente.');
    } catch (error) {
      console.error('Error en la actualización:', error);
      throw new Error('No se pudo actualizar el monto aplicado.');
    }
    return temp;

  }

  /* distribuirMontoDisponible(valoresNegativosObj: any[], resultModificado: any[], prioridadesResult: any[]): any[] {
    const resultadoFinal: any[] = [];

    valoresNegativosObj.forEach((persona) => {
      let montoDisponible = persona.TOTAL_BENEFICIOS - 100;  // Restamos 100 como especificaste

      const deducciones = resultModificado.filter((deduccion) => deduccion.ID_PERSONA === persona.ID_PERSONA);

      // Ordenamos las deducciones por prioridad (de menor a mayor)
      deducciones.sort((a, b) => {
        const prioridadA = prioridadesResult.find(p => p.ID_DEDUCCION === a.ID_DEDUCCION)?.PRIORIDAD ?? 0;
        const prioridadB = prioridadesResult.find(p => p.ID_DEDUCCION === b.ID_DEDUCCION)?.PRIORIDAD ?? 0;
        return prioridadA - prioridadB;
      });

      let totalMontoAplicado = 0;

      // Asignamos montos proporcionalmente según prioridad
      deducciones.forEach(deduccion => {
        if (montoDisponible <= 0) return;

        const montoTotal = deduccion.MONTO_TOTAL;
        const prioridad = prioridadesResult.find(p => p.ID_DEDUCCION === deduccion.ID_DEDUCCION)?.PRIORIDAD ?? 0;

        if (prioridad === 0) {
          console.error('Error: PRIORIDAD no encontrada o es 0', deduccion);
          return;
        }

        if (isNaN(montoTotal) || montoTotal <= 0) {
          console.error('Error: MONTO_TOTAL no es válido o es 0', deduccion);
          return;
        }

        const montoAplicable = Math.min(montoTotal, montoDisponible);

        deduccion.MONTO_APLICADO = montoAplicable;
        montoDisponible -= montoAplicable;
        totalMontoAplicado += montoAplicable;
      });

      // Ajuste final para asegurar que la suma total sea exactamente montoDisponible - 100
      let diferencia = persona.TOTAL_BENEFICIOS - 100 - totalMontoAplicado;
      if (diferencia !== 0) {
        // Ajustamos las deducciones con mayor prioridad (las primeras en la lista)
        for (let i = 0; i < deducciones.length && diferencia !== 0; i++) {
          let deduccion = deducciones[i];
          if (diferencia > 0) {
            // Si la diferencia es positiva, podemos aumentar el MONTO_APLICADO
            const montoRestante = deduccion.MONTO_TOTAL - deduccion.MONTO_APLICADO;
            const incremento = Math.min(montoRestante, diferencia);
            deduccion.MONTO_APLICADO += incremento;
            diferencia -= incremento;
          } else if (diferencia < 0) {
            // Si la diferencia es negativa, reducimos el MONTO_APLICADO
            const decremento = Math.min(deduccion.MONTO_APLICADO, -diferencia);
            deduccion.MONTO_APLICADO -= decremento;
            diferencia += decremento;
          }
        }
      }

      // Agregar las deducciones modificadas para esta persona al resultado final
      resultadoFinal.push(...deducciones);
    });
    console.log(resultadoFinal);
    // Sumar MONTO_APLICADO agrupado por ID_PERSONA
    const sumaPorPersona = resultadoFinal.reduce((acc, item) => {
      const { ID_PERSONA, MONTO_APLICADO } = item;

      if (acc[ID_PERSONA]) {
        acc[ID_PERSONA] += MONTO_APLICADO;
      } else {
        acc[ID_PERSONA] = MONTO_APLICADO;
      }

      return acc;
    }, {});

    console.log(sumaPorPersona);
    return resultadoFinal;// Retorna el nuevo arreglo sin modificar el original
  } */

  /* async distribuirMontoDisponible(valoresNegativosObj: any[], resultModificado: any[], prioridadesResult: any[]): Promise<any> {
    const resultadoFinal: any[] = [];

    try {
      valoresNegativosObj.forEach((persona) => {
        let montoDisponible = persona.TOTAL_BENEFICIOS - 100;
        const deducciones = resultModificado.filter((deduccion) => deduccion.ID_PERSONA === persona.ID_PERSONA);

        deducciones.sort((a, b) => {
          const prioridadA = prioridadesResult.find(p => p.ID_DEDUCCION === a.ID_DEDUCCION)?.PRIORIDAD ?? 0;
          const prioridadB = prioridadesResult.find(p => p.ID_DEDUCCION === b.ID_DEDUCCION)?.PRIORIDAD ?? 0;
          return prioridadA - prioridadB;
        });

        const sumaMontoTotal = deducciones.reduce((acc, deduccion) => acc + deduccion.MONTO_TOTAL, 0);

        if (sumaMontoTotal > montoDisponible) {
          let totalMontoAplicado = 0;
          let deduccionesConMinimo: any[] = [];

          deducciones.forEach(deduccion => {
            if (montoDisponible <= 0) return;

            const montoTotal = deduccion.MONTO_TOTAL;
            if (isNaN(montoTotal) || montoTotal <= 0) {
              console.error('Error: MONTO_TOTAL no es válido o es 0', deduccion);
              return;
            }

            let montoAplicable = Math.min((montoTotal / sumaMontoTotal) * montoDisponible, montoTotal);
            montoAplicable = Math.max(montoAplicable, 1.00); // Garantizar mínimo 1.00
            deduccion.MONTO_APLICADO = montoAplicable;
            montoDisponible -= montoAplicable;
            totalMontoAplicado += montoAplicable;
            deduccionesConMinimo.push(deduccion);
          });

          let diferencia = persona.TOTAL_BENEFICIOS - 100 - totalMontoAplicado;
          if (diferencia !== 0) {
            for (let i = 0; i < deduccionesConMinimo.length && diferencia !== 0; i++) {
              let deduccion = deduccionesConMinimo[i];
              if (diferencia > 0) {
                const montoRestante = deduccion.MONTO_TOTAL - deduccion.MONTO_APLICADO;
                const incremento = Math.min(montoRestante, diferencia);
                deduccion.MONTO_APLICADO += incremento;
                diferencia -= incremento;
              } else if (diferencia < 0) {
                const decremento = Math.min(deduccion.MONTO_APLICADO - 1.00, -diferencia);
                deduccion.MONTO_APLICADO -= decremento;
                diferencia += decremento;
              }
            }
          }
        }

        resultadoFinal.push(...deducciones);
      });

      resultadoFinal.forEach(item => {
        item.MONTO_APLICADO = parseFloat(item.MONTO_APLICADO.toFixed(2));
      });

      return resultadoFinal;
    } catch (e) {
      console.error('Error en distribuirMontoDisponible:', e);
      return [];
    }
  } */

  async distribuirMontoDisponible(valoresNegativosObj: any[], resultModificado: any[], prioridadesResult: any[]): Promise<any> {
    const resultadoFinal: any[] = [];

    try {
      valoresNegativosObj.forEach((persona) => {
        let montoDisponible = persona.TOTAL_BENEFICIOS - 100;
        const deducciones = resultModificado.filter((deduccion) => deduccion.ID_PERSONA === persona.ID_PERSONA);

        deducciones.sort((a, b) => {
          const prioridadA = prioridadesResult.find(p => p.ID_DEDUCCION === a.ID_DEDUCCION)?.PRIORIDAD ?? 0;
          const prioridadB = prioridadesResult.find(p => p.ID_DEDUCCION === b.ID_DEDUCCION)?.PRIORIDAD ?? 0;
          return prioridadA - prioridadB;
        });

        const sumaMontoTotal = deducciones.reduce((acc, deduccion) => acc + deduccion.MONTO_TOTAL, 0);

        let totalMontoAplicado = 0;
        let deduccionesConMinimo: any[] = [];

        deducciones.forEach(deduccion => {
          if (montoDisponible <= 0) return;

          const montoTotal = deduccion.MONTO_TOTAL;
          if (isNaN(montoTotal) || montoTotal <= 0) {
            console.error('Error: MONTO_TOTAL no es válido o es 0', deduccion);
            return;
          }

          const prioridad = prioridadesResult.find(p => p.ID_DEDUCCION === deduccion.ID_DEDUCCION)?.PRIORIDAD ?? 0;
          let montoAplicable;

          if (prioridad === 1 && montoDisponible >= montoTotal) {
            montoAplicable = montoTotal;
          } else {
            montoAplicable = Math.min((montoTotal / sumaMontoTotal) * montoDisponible, montoTotal);
            montoAplicable = Math.max(montoAplicable, 1.00);
          }

          deduccion.MONTO_APLICADO = montoAplicable;
          montoDisponible -= montoAplicable;
          totalMontoAplicado += montoAplicable;
          deduccionesConMinimo.push(deduccion);
        });

        let diferencia = persona.TOTAL_BENEFICIOS - 100 - totalMontoAplicado;
        if (diferencia !== 0) {
          for (let i = 0; i < deduccionesConMinimo.length && diferencia !== 0; i++) {
            let deduccion = deduccionesConMinimo[i];
            if (diferencia > 0) {
              const montoRestante = deduccion.MONTO_TOTAL - deduccion.MONTO_APLICADO;
              const incremento = Math.min(montoRestante, diferencia);
              deduccion.MONTO_APLICADO += incremento;
              diferencia -= incremento;
            } else if (diferencia < 0) {
              const decremento = Math.min(deduccion.MONTO_APLICADO - 1.00, -diferencia);
              deduccion.MONTO_APLICADO -= decremento;
              diferencia += decremento;
            }
          }
        }

        resultadoFinal.push(...deducciones);
      });

      resultadoFinal.forEach(item => {
        item.MONTO_APLICADO = parseFloat(item.MONTO_APLICADO.toFixed(2));
      });

      return resultadoFinal;
    } catch (e) {
      console.error('Error en distribuirMontoDisponible:', e);
      return [];
    }
  }


  async getPlanillasPreliminares(codigo_planilla: string): Promise<Persona[]> {
    const query = `
      SELECT DISTINCT
        per."N_IDENTIFICACION" AS "N_IDENTIFICACION",
        tipoP."TIPO_PERSONA" AS "TIPO_PERSONA",
        per."ID_PERSONA",
        perPorBan."NUM_CUENTA",
        banco."ID_BANCO",
        banco."COD_BANCO",
        banco."NOMBRE_BANCO",
        SUM(detBs."MONTO_A_PAGAR") AS "TOTAL_BENEFICIOS",
        TRIM(
          per."PRIMER_NOMBRE" || ' ' ||
          COALESCE(per."SEGUNDO_NOMBRE", '') || ' ' ||
          COALESCE(per."TERCER_NOMBRE", '') || ' ' ||
          per."PRIMER_APELLIDO" || ' ' ||
          COALESCE(per."SEGUNDO_APELLIDO", '')
        ) AS "NOMBRE_COMPLETO"
      FROM 
        "NET_DETALLE_PAGO_BENEFICIO" detBs
      JOIN 
        "NET_PLANILLA" plan ON plan."ID_PLANILLA" = detBs."ID_PLANILLA"
      JOIN 
        "NET_DETALLE_BENEFICIO_AFILIADO" detBA ON detBs."ID_DETALLE_PERSONA" = detBA."ID_DETALLE_PERSONA" 
        AND detBs."ID_PERSONA" = detBA."ID_PERSONA"
        AND detBs."ID_CAUSANTE" = detBA."ID_CAUSANTE"
        AND detBs."ID_BENEFICIO" = detBA."ID_BENEFICIO"
      JOIN 
        "NET_BENEFICIO" ben ON detBA."ID_BENEFICIO" = ben."ID_BENEFICIO"
      JOIN 
        "NET_DETALLE_PERSONA" detP ON detBA."ID_PERSONA" = detP."ID_PERSONA"
        AND detBA."ID_DETALLE_PERSONA" = detP."ID_DETALLE_PERSONA"
        AND detBA."ID_CAUSANTE" = detP."ID_CAUSANTE"
      JOIN 
        "NET_TIPO_PERSONA" tipoP ON detP."ID_TIPO_PERSONA" = tipoP."ID_TIPO_PERSONA"
      JOIN 
        "NET_PERSONA" per ON per."ID_PERSONA" = detP."ID_PERSONA"
      LEFT JOIN 
        "NET_PERSONA_POR_BANCO" perPorBan ON detBs."ID_AF_BANCO" = perPorBan."ID_AF_BANCO"
      LEFT JOIN 
        "NET_BANCO" banco ON banco."ID_BANCO" = perPorBan."ID_BANCO"
      WHERE
        detBs."ESTADO" = 'EN PRELIMINAR' AND
        plan."CODIGO_PLANILLA" = :codigo_planilla
      GROUP BY 
        per."N_IDENTIFICACION",
        per."ID_PERSONA",
        tipoP."TIPO_PERSONA",
        perPorBan."NUM_CUENTA",
        banco."NOMBRE_BANCO",
        banco."ID_BANCO",
        banco."COD_BANCO",
        TRIM(
          per."PRIMER_NOMBRE" || ' ' ||
          COALESCE(per."SEGUNDO_NOMBRE", '') || ' ' ||
          COALESCE(per."TERCER_NOMBRE", '') || ' ' ||
          per."PRIMER_APELLIDO" || ' ' ||
          COALESCE(per."SEGUNDO_APELLIDO", '')
        )
    `;

    const queryI = `
      SELECT 
        per."ID_PERSONA",
        SUM(dd."MONTO_APLICADO") AS "TOTAL_DEDUCCIONES_INPREMA"
      FROM 
        "NET_PLANILLA" plan 
      INNER JOIN 
        "NET_DETALLE_DEDUCCION" dd ON dd."ID_PLANILLA" = plan."ID_PLANILLA"
      INNER JOIN 
        "NET_DEDUCCION" ded ON ded."ID_DEDUCCION" = dd."ID_DEDUCCION"
      INNER JOIN 
        "NET_CENTRO_TRABAJO" instFin ON instFin."ID_CENTRO_TRABAJO" = ded."ID_CENTRO_TRABAJO"
      INNER JOIN 
        "NET_PERSONA" per ON per."ID_PERSONA" = dd."ID_PERSONA"
      WHERE
        dd."ESTADO_APLICACION" = 'EN PRELIMINAR' AND
        plan."CODIGO_PLANILLA" = :codigo_planilla AND
        instFin."NOMBRE_CENTRO_TRABAJO" = 'INPREMA'
      GROUP BY 
        per."ID_PERSONA"
    `;

    const queryT = `
      SELECT 
        per."ID_PERSONA",
        SUM(dd."MONTO_APLICADO") AS "TOTAL_DEDUCCIONES_TERCEROS"
      FROM 
        "NET_PLANILLA" plan 
      INNER JOIN 
        "NET_DETALLE_DEDUCCION" dd ON dd."ID_PLANILLA" = plan."ID_PLANILLA"
      INNER JOIN 
        "NET_DEDUCCION" ded ON ded."ID_DEDUCCION" = dd."ID_DEDUCCION"
      INNER JOIN 
        "NET_CENTRO_TRABAJO" instFin ON instFin."ID_CENTRO_TRABAJO" = ded."ID_CENTRO_TRABAJO"
      INNER JOIN 
        "NET_PERSONA" per ON per."ID_PERSONA" = dd."ID_PERSONA"
      WHERE
        dd."ESTADO_APLICACION" = 'EN PRELIMINAR' AND
        plan."CODIGO_PLANILLA" = :codigo_planilla AND
        instFin."NOMBRE_CENTRO_TRABAJO" != 'INPREMA'
      GROUP BY 
        per."ID_PERSONA"
    `;
    try {
      const result: Persona[] = await this.entityManager.query(query, [codigo_planilla]);
      const resultI: Deduccion[] = await this.entityManager.query(queryI, [codigo_planilla]);
      const resultT: Deduccion[] = await this.entityManager.query(queryT, [codigo_planilla]);

      const deduccionesInpremaMap = new Map(resultI.map(d => [d.ID_PERSONA, d]));
      const deduccionesTercerosMap = new Map(resultT.map(d => [d.ID_PERSONA, d]));

      const newResult = result.map(persona => {
        const deduccionI = deduccionesInpremaMap.get(persona.ID_PERSONA);
        const deduccionT = deduccionesTercerosMap.get(persona.ID_PERSONA);

        return {
          ...persona,
          TOTAL_DEDUCCIONES_INPREMA: deduccionI ? deduccionI['TOTAL_DEDUCCIONES_INPREMA'] : 0,
          TOTAL_DEDUCCIONES_TERCEROS: deduccionT ? deduccionT['TOTAL_DEDUCCIONES_TERCEROS'] : 0,
          TOTAL_NETO: persona.TOTAL_BENEFICIOS - (
            (deduccionI ? deduccionI['TOTAL_DEDUCCIONES_INPREMA'] : 0) +
            (deduccionT ? deduccionT['TOTAL_DEDUCCIONES_TERCEROS'] : 0)
          )
        };
      });

      const orderedResult = newResult.sort((a, b) => a.TOTAL_NETO - b.TOTAL_NETO);

      return orderedResult;
    } catch (error) {
      this.logger.error('Error ejecutando la consulta', error.stack);
      throw new InternalServerErrorException('Error ejecutando la consulta');
    }

  }

  async getDesglosePorPersonaPlanilla(id_persona: string, codigo_planilla: string): Promise<any> {
    try {
      const beneficiosQuery = `
        SELECT 
          dpb.ID_BENEFICIO_PLANILLA,
          dpb.ID_DETALLE_PERSONA,
          dpb.ID_PERSONA,
          dpb.ID_CAUSANTE,
          dpb.ID_BENEFICIO,
          dpb.MONTO_A_PAGAR  as "MontoAPagar",
          b.NOMBRE_BENEFICIO
        FROM 
          NET_DETALLE_PAGO_BENEFICIO dpb
        JOIN 
          NET_BENEFICIO b ON dpb.ID_BENEFICIO = b.ID_BENEFICIO
        JOIN 
          NET_PLANILLA p ON dpb.ID_PLANILLA = p.ID_PLANILLA
        WHERE 
          dpb.ESTADO != 'NO PAGADA' AND
          dpb.ID_PERSONA = :id_persona AND p.CODIGO_PLANILLA = :codigo_planilla
      `;

      const deduccionesInpremaQuery = `
            SELECT 
                d.NOMBRE_DEDUCCION,
                SUM(dd.MONTO_APLICADO) AS MONTO_APLICADO
            FROM 
                NET_DEDUCCION d
            INNER JOIN 
                NET_DETALLE_DEDUCCION dd ON d.ID_DEDUCCION = dd.ID_DEDUCCION
            INNER JOIN 
                NET_PLANILLA p ON dd.ID_PLANILLA = p.ID_PLANILLA
            WHERE 
                dd.ESTADO_APLICACION != 'NO COBRADA' AND
                dd.ID_PERSONA = :id_persona
                AND p.CODIGO_PLANILLA = :codigo_planilla
                AND d.ID_CENTRO_TRABAJO = 1
            GROUP BY 
                d.NOMBRE_DEDUCCION
        `;

      const deduccionesTercerosQuery = `
            SELECT 
                d.NOMBRE_DEDUCCION,
                SUM(dd.MONTO_APLICADO) AS MONTO_APLICADO
            FROM 
                NET_DEDUCCION d
            INNER JOIN 
                NET_DETALLE_DEDUCCION dd ON d.ID_DEDUCCION = dd.ID_DEDUCCION
            INNER JOIN 
                NET_PLANILLA p ON dd.ID_PLANILLA = p.ID_PLANILLA
            WHERE 
                dd.ESTADO_APLICACION != 'NO COBRADA' AND
                dd.ID_PERSONA = :id_persona
                AND p.CODIGO_PLANILLA = :codigo_planilla
                AND (d.ID_CENTRO_TRABAJO IS NULL OR d.ID_CENTRO_TRABAJO != 1)
            GROUP BY 
                d.NOMBRE_DEDUCCION
        `;

      const beneficios = await this.entityManager.query(beneficiosQuery, [id_persona, codigo_planilla]);
      const deduccionesInprema = await this.entityManager.query(deduccionesInpremaQuery, [id_persona, codigo_planilla]);
      const deduccionesTerceros = await this.entityManager.query(deduccionesTercerosQuery, [id_persona, codigo_planilla]);

      return {
        beneficios,
        deduccionesInprema,
        deduccionesTerceros,
      };
    } catch (error) {
      this.logger.error('Error ejecutando la consulta', error.stack);
      throw new InternalServerErrorException('Error ejecutando la consulta');
    }
  }

  async ObtenerPreliminar(codPlanilla: string): Promise<any> {
    try {
      if (codPlanilla) {
        const result = await this.planillaRepository
          .createQueryBuilder('planilla')
          .leftJoinAndSelect('planilla.tipoPlanilla', 'tipP')
          .where('planilla.CODIGO_PLANILLA = :codPlanilla', { codPlanilla })
          .andWhere('planilla.ESTADO = :estado', { estado: 'ACTIVA' })
          .select([
            'planilla.id_planilla',
            'planilla.beneficios_cargados',
            'planilla.deducc_inprema_cargadas',
            'planilla.deducc_terceros_cargadas',
            'planilla.codigo_planilla',
            'planilla.fecha_apertura',
            'planilla.fecha_cierre',
            'planilla.secuencia',
            'planilla.estado',
            'planilla.periodoInicio',
            'planilla.periodoFinalizacion',
            'tipP.nombre_planilla',
          ])
          .getOne();

        if (!result) {
          throw new NotFoundException(`Planilla con código ${codPlanilla} no encontrada.`);
        }
        return result;
      }
    } catch (error) {
      this.logger.error(`Error al obtener totales por planilla: ${error.message}`, error.stack);
      throw new InternalServerErrorException('Se produjo un error al obtener los totales por planilla.');
    }
  }
  async ObtenerTodasPlanillas(codPlanilla: string): Promise<any> {
    try {
      const query = ``;

      const result = await this.entityManager.query(query);
      return result;
    } catch (error) {
      this.logger.error(`Error al obtener totales por planilla: ${error.message}`, error.stack);
      throw new InternalServerErrorException('Se produjo un error al obtener los totales por planilla.');
    }
  }


  async updatePlanillaACerrada(codigo_planilla: string): Promise<void> {
    const queryUpdateBeneficios = `
    UPDATE NET_DETALLE_PAGO_BENEFICIO dpb
    SET dpb.ESTADO = 'PAGADA'
    WHERE dpb.ID_PLANILLA IN (
      SELECT pl.ID_PLANILLA
      FROM NET_PLANILLA pl
      WHERE pl.CODIGO_PLANILLA = :codigo_planilla AND
      dpb.ESTADO = 'EN PRELIMINAR'
    )
  `;

    const queryUpdateDeducciones = `
    UPDATE NET_DETALLE_DEDUCCION dd
    SET dd.ESTADO_APLICACION = 'COBRADA'
    WHERE dd.ID_PLANILLA IN (
      SELECT pl.ID_PLANILLA
      FROM NET_PLANILLA pl
      WHERE pl.CODIGO_PLANILLA = :codigo_planilla AND
      dd.ESTADO_APLICACION = 'EN PRELIMINAR'
    )
  `;

    const queryUpdatePlanilla = `
    UPDATE NET_PLANILLA pl
    SET pl.ESTADO = 'CERRADA',
    pl.FECHA_CIERRE = SYSDATE
    WHERE pl.CODIGO_PLANILLA = :codigo_planilla
  `;

    const queryParams: any = { codigo_planilla };
    try {
      await this.entityManager.query(queryUpdateBeneficios, queryParams);
      await this.entityManager.query(queryUpdateDeducciones, queryParams);
      await this.entityManager.query(queryUpdatePlanilla, queryParams);
    } catch (error) {
      this.logger.error('Error ejecutando la actualización', error.stack);
      throw new InternalServerErrorException('Error ejecutando la actualización');
    }
  }

  private handleException(error: any): void {
    this.logger.error(error);
    if (error.driverError && error.driverError.errorNum === 1) {
      throw new BadRequestException('Algun dato clave ya existe');
    } else {
      throw new InternalServerErrorException('Ocurrió un error al procesar su solicitud');
    }
  }

  async obtenerDetallePagoBeneficioPorPlanillaPreliminar(idPlanilla: number): Promise<any[]> {
    const beneficiosQuery = `
        SELECT
            banco.codigo_ach AS "codigo_banco",
            personaPorBanco.num_cuenta AS "numero_cuenta",
            SUM(detallePago.monto_a_pagar) AS "monto_a_pagar",
            TRIM(
            TRIM(persona.primer_apellido) ||
            CASE
                WHEN persona.segundo_apellido IS NOT NULL THEN ' ' ||  TRIM(persona.segundo_apellido)
                ELSE ''
            END ||
            CASE
                WHEN persona.primer_nombre IS NOT NULL THEN ' ' || TRIM(persona.primer_nombre)
                ELSE ''
            END ||
            CASE
                WHEN persona.segundo_nombre IS NOT NULL THEN ' ' || TRIM(persona.segundo_nombre)
                ELSE ''
            END ||
            CASE
                WHEN persona.tercer_nombre IS NOT NULL THEN ' ' || TRIM(persona.tercer_nombre)
                ELSE ''
            END
        ) AS "nombre_completo",
            persona.n_identificacion AS "n_identificacion",
            persona.ID_PERSONA AS "ID_PERSONA"
        FROM
            "NET_PLANILLA" planilla
        JOIN
            "NET_DETALLE_PAGO_BENEFICIO" detallePago ON planilla."ID_PLANILLA" = detallePago."ID_PLANILLA"
        LEFT JOIN
            "NET_PERSONA_POR_BANCO" personaPorBanco ON detallePago."ID_AF_BANCO" = personaPorBanco."ID_AF_BANCO"
        LEFT JOIN
            "NET_BANCO" banco ON personaPorBanco."ID_BANCO" = banco."ID_BANCO"
        JOIN
            "NET_PERSONA" persona ON personaPorBanco."ID_PERSONA" = persona."ID_PERSONA"
        WHERE
            planilla."ID_PLANILLA" = :1
            AND detallePago."ESTADO" = 'EN PRELIMINAR'
        GROUP BY
            banco.codigo_ach, personaPorBanco.num_cuenta, persona.primer_apellido, persona.segundo_apellido, persona.primer_nombre, persona.segundo_nombre, persona.tercer_nombre, persona.n_identificacion, persona.ID_PERSONA
    `;
    const deduccionesInpremaQuery = `
        SELECT
            dd."ID_PERSONA",
            SUM(dd.MONTO_APLICADO) AS "deducciones_inprema"
        FROM
            "NET_PLANILLA" planilla
        LEFT JOIN
            "NET_DETALLE_DEDUCCION" dd ON planilla."ID_PLANILLA" = dd."ID_PLANILLA"
        LEFT JOIN
            "NET_DEDUCCION" ded ON dd."ID_DEDUCCION" = ded."ID_DEDUCCION"
        WHERE
            planilla."ID_PLANILLA" = :idPlanilla
            AND dd."ESTADO_APLICACION" = 'EN PRELIMINAR'
            AND ded."ID_CENTRO_TRABAJO" = 1
        GROUP BY
            dd."ID_PERSONA"
    `;
    const deduccionesTercerosQuery = `
        SELECT
            dd."ID_PERSONA",
            SUM(dd.MONTO_APLICADO) AS "deducciones_terceros"
        FROM
            "NET_PLANILLA" planilla
        LEFT JOIN
            "NET_DETALLE_DEDUCCION" dd ON planilla."ID_PLANILLA" = dd."ID_PLANILLA"
        LEFT JOIN
            "NET_DEDUCCION" ded ON dd."ID_DEDUCCION" = ded."ID_DEDUCCION"
        WHERE
            planilla."ID_PLANILLA" = :idPlanilla
            AND dd."ESTADO_APLICACION" = 'EN PRELIMINAR'
             AND dd.ID_AF_BANCO IS NOT NULL
            AND ded.ID_CENTRO_TRABAJO != 1
        GROUP BY
            dd."ID_PERSONA"
    `;
    try {
      const beneficios = await this.entityManager.query(beneficiosQuery, [idPlanilla]);
      const deduccionesInprema = await this.entityManager.query(deduccionesInpremaQuery, [idPlanilla]);
      const deduccionesTerceros = await this.entityManager.query(deduccionesTercerosQuery, [idPlanilla]);
      const result = beneficios.map(beneficio => {
        const personaID = beneficio.ID_PERSONA;
        const totalDeduccionInprema = deduccionesInprema
          .filter(d => d.ID_PERSONA === personaID)
          .reduce((acc, curr) => acc + curr.deducciones_inprema, 0);
        const totalDeduccionTerceros = deduccionesTerceros
          .filter(d => d.ID_PERSONA === personaID)
          .reduce((acc, curr) => acc + curr.deducciones_terceros, 0);
        const totalDeducciones = totalDeduccionInprema + totalDeduccionTerceros;
        return {
          codigo_banco: beneficio?.codigo_banco?.trim(),
          numero_cuenta: beneficio?.numero_cuenta?.trim(),
          neto: parseFloat((beneficio.monto_a_pagar - totalDeducciones).toFixed(2)),
          nombre_completo: beneficio?.nombre_completo?.trim(),
          id_tipo_planilla: 1,
          n_identificacion: beneficio?.n_identificacion?.trim(),
        };
      }).sort((a, b) => a.neto - b.neto);
      
      return result;
    } catch (error) {
      console.error('Error al obtener los detalles preliminares de pago por planilla:', error);
      throw new InternalServerErrorException('Error al obtener los detalles preliminares de pago por planilla.');
    }
  }

  async obtenerDetallePagoBeneficioPorPlanillaPrueba(
    periodoInicio: string,
    periodoFinalizacion: string,
    idTiposPlanilla: number[],
  ): Promise<any[]> {
    const beneficiosQuery = `
        SELECT
            banco.codigo_ach AS "codigo_banco", 
            personaPorBanco.num_cuenta AS "numero_cuenta",
            SUM(detallePago.monto_a_pagar) AS "monto_a_pagar",
            TRIM(
              persona.primer_apellido ||
              CASE 
                  WHEN persona.segundo_apellido IS NOT NULL THEN ' ' || persona.segundo_apellido 
                  ELSE '' 
              END || 
              ' ' || persona.primer_nombre ||
              CASE 
                  WHEN persona.segundo_nombre IS NOT NULL THEN ' ' || persona.segundo_nombre 
                  ELSE '' 
              END ||
              CASE
                  WHEN persona.tercer_nombre IS NOT NULL THEN ' ' || persona.tercer_nombre
                  ELSE ''
              END
          ) AS "nombre_completo",
            persona.n_identificacion AS "n_identificacion",
            persona.ID_PERSONA AS "ID_PERSONA" 
        FROM
            "NET_PLANILLA" planilla
        JOIN
            "NET_DETALLE_PAGO_BENEFICIO" detallePago ON planilla."ID_PLANILLA" = detallePago."ID_PLANILLA"
        LEFT JOIN
            "NET_PERSONA_POR_BANCO" personaPorBanco ON detallePago."ID_AF_BANCO" = personaPorBanco."ID_AF_BANCO"
        LEFT JOIN
            "NET_BANCO" banco ON personaPorBanco."ID_BANCO" = banco."ID_BANCO"
        JOIN
            "NET_PERSONA" persona ON personaPorBanco."ID_PERSONA" = persona."ID_PERSONA"
        WHERE
            planilla."PERIODO_INICIO" >= :1
            AND planilla."PERIODO_FINALIZACION" <= :2
            AND planilla."ID_TIPO_PLANILLA" IN (${idTiposPlanilla.join(', ')})
            AND detallePago."ESTADO" = 'PAGADA'
        GROUP BY
            banco.codigo_ach, personaPorBanco.num_cuenta, persona.primer_apellido, persona.segundo_apellido, persona.primer_nombre, persona.segundo_nombre, persona.tercer_nombre, persona.n_identificacion, persona.ID_PERSONA
    `;

    const deduccionesInpremaQuery = `
        SELECT 
            dd."ID_PERSONA",
            SUM(dd.MONTO_APLICADO) AS "deducciones_inprema"
        FROM 
            "NET_PLANILLA" planilla
        LEFT JOIN 
            "NET_DETALLE_DEDUCCION" dd ON planilla."ID_PLANILLA" = dd."ID_PLANILLA"
        LEFT JOIN 
            "NET_DEDUCCION" ded ON dd."ID_DEDUCCION" = ded."ID_DEDUCCION"
        LEFT JOIN  
            "NET_CENTRO_TRABAJO" ct ON ct."ID_CENTRO_TRABAJO" = ded."ID_CENTRO_TRABAJO"
        WHERE 
            planilla."PERIODO_INICIO" >= :periodoInicio
            AND planilla."PERIODO_FINALIZACION" <= :periodoFinalizacion
            AND planilla."ID_TIPO_PLANILLA" IN (${idTiposPlanilla.join(', ')})
            AND dd."ESTADO_APLICACION" = 'COBRADA'
            --AND ct.NOMBRE_CENTRO_TRABAJO = 'INPREMA'
            AND dd.ID_AF_BANCO IS NOT NULL
            AND ded."ID_CENTRO_TRABAJO" = 1
        GROUP BY 
            dd."ID_PERSONA"
    `;

    const deduccionesTercerosQuery = `
        SELECT 
            dd."ID_PERSONA",
            SUM(dd.MONTO_APLICADO) AS "deducciones_terceros"
        FROM 
            "NET_PLANILLA" planilla
        LEFT JOIN 
            "NET_DETALLE_DEDUCCION" dd ON planilla."ID_PLANILLA" = dd."ID_PLANILLA"
        LEFT JOIN 
            "NET_DEDUCCION" ded ON dd."ID_DEDUCCION" = ded."ID_DEDUCCION"
        LEFT JOIN  
            "NET_CENTRO_TRABAJO" ct ON ct."ID_CENTRO_TRABAJO" = ded."ID_CENTRO_TRABAJO"
        WHERE 
            planilla."PERIODO_INICIO" >= :periodoInicio
            AND planilla."PERIODO_FINALIZACION" <= :periodoFinalizacion
            AND planilla."ID_TIPO_PLANILLA" IN (${idTiposPlanilla.join(', ')})
            AND dd."ESTADO_APLICACION" = 'COBRADA'
            --AND ded."ID_DEDUCCION" NOT IN (1, 2, 3, 44, 51)
            AND dd.ID_AF_BANCO IS NOT NULL
            AND ded.ID_CENTRO_TRABAJO != 1
        GROUP BY 
            dd."ID_PERSONA"
    `;

    try {
      const beneficios = await this.entityManager.query(beneficiosQuery, [periodoInicio, periodoFinalizacion]);
      const deduccionesInprema = await this.entityManager.query(deduccionesInpremaQuery, [periodoInicio, periodoFinalizacion]);
      const deduccionesTerceros = await this.entityManager.query(deduccionesTercerosQuery, [periodoInicio, periodoFinalizacion]);
      const result = beneficios.map(beneficio => {
        const personaID = beneficio.ID_PERSONA;
        const totalDeduccionInprema = deduccionesInprema
          .filter(d => d.ID_PERSONA === personaID)
          .reduce((acc, curr) => acc + curr.deducciones_inprema, 0);
        const totalDeduccionTerceros = deduccionesTerceros
          .filter(d => d.ID_PERSONA === personaID)
          .reduce((acc, curr) => acc + curr.deducciones_terceros, 0);
        const totalDeducciones = totalDeduccionInprema + totalDeduccionTerceros;
        return {
          codigo_banco: beneficio.codigo_banco?.trim(),
          numero_cuenta: beneficio.numero_cuenta?.trim(),
          neto: parseFloat((beneficio.monto_a_pagar - totalDeducciones).toFixed(2)),
          nombre_completo: beneficio.nombre_completo?.trim(),
          id_tipo_planilla: 1,
          n_identificacion: beneficio.n_identificacion?.trim(),
        };
      }).sort((a, b) => a.neto - b.neto);

      return result;
    } catch (error) {
      console.error('Error al obtener los detalles de pago por planilla:', error);
      throw new InternalServerErrorException('Error al obtener los detalles de pago por planilla.');
    }
  }

  async generarReporteSinCuenta(
    periodoInicio: string,
    periodoFinalizacion: string,
    idTiposPlanilla: number[],
  ): Promise<any[]> {
    const beneficiosQuery = `
         SELECT
            banco.codigo_ach AS "codigo_banco", 
            personaPorBanco.num_cuenta AS "numero_cuenta",
            SUM(detallePago.monto_a_pagar) AS "monto_a_pagar",
            TRIM(
              persona.primer_apellido ||
              CASE 
                  WHEN persona.segundo_apellido IS NOT NULL THEN ' ' || persona.segundo_apellido 
                  ELSE '' 
              END || 
              ' ' || persona.primer_nombre ||
              CASE 
                  WHEN persona.segundo_nombre IS NOT NULL THEN ' ' || persona.segundo_nombre 
                  ELSE '' 
              END ||
              CASE
                  WHEN persona.tercer_nombre IS NOT NULL THEN ' ' || persona.tercer_nombre
                  ELSE ''
              END
          ) AS "nombre_completo",
            persona.n_identificacion AS "n_identificacion",
            persona.ID_PERSONA AS "ID_PERSONA" 
        FROM
            "NET_PLANILLA" planilla
        JOIN
            "NET_DETALLE_PAGO_BENEFICIO" detallePago ON planilla."ID_PLANILLA" = detallePago."ID_PLANILLA"
        LEFT JOIN
            "NET_PERSONA_POR_BANCO" personaPorBanco ON detallePago."ID_AF_BANCO" = personaPorBanco."ID_AF_BANCO"
        LEFT JOIN
            "NET_BANCO" banco ON personaPorBanco."ID_BANCO" = banco."ID_BANCO"
        LEFT JOIN
            "NET_PERSONA" persona ON detallePago."ID_PERSONA" = persona."ID_PERSONA"
        WHERE
            planilla."PERIODO_INICIO" >= :1
            AND planilla."PERIODO_FINALIZACION" <= :2
            AND planilla."ID_TIPO_PLANILLA" IN (1,2)
            AND detallePago."ESTADO" = 'PAGADA'
            AND personaPorBanco."ID_PERSONA" IS NULL 
            AND personaPorBanco."NUM_CUENTA" IS NULL
         GROUP BY
            banco.codigo_ach, personaPorBanco.num_cuenta, persona.primer_apellido,
            persona.segundo_apellido, persona.primer_nombre,
            persona.segundo_nombre, persona.tercer_nombre, 
            persona.n_identificacion, persona.ID_PERSONA
    `;

    const deduccionesInpremaQuery = `
        SELECT 
            dd."ID_PERSONA",
            SUM(dd.MONTO_APLICADO) AS "deducciones_inprema"
        FROM 
            "NET_PLANILLA" planilla
        LEFT JOIN 
            "NET_DETALLE_DEDUCCION" dd ON planilla."ID_PLANILLA" = dd."ID_PLANILLA"
        LEFT JOIN 
            "NET_DEDUCCION" ded ON dd."ID_DEDUCCION" = ded."ID_DEDUCCION"
        LEFT JOIN  
            "NET_CENTRO_TRABAJO" ct ON ct."ID_CENTRO_TRABAJO" = ded."ID_CENTRO_TRABAJO"
        WHERE 
            planilla."PERIODO_INICIO" >= :periodoInicio
            AND planilla."PERIODO_FINALIZACION" <= :periodoFinalizacion
            AND planilla."ID_TIPO_PLANILLA" IN (1,2)
            AND dd."ESTADO_APLICACION" = 'COBRADA'
            --AND ct.NOMBRE_CENTRO_TRABAJO = 'INPREMA'
            AND ded."ID_CENTRO_TRABAJO" = 1
            AND dd."ID_AF_BANCO" IS NULL        
            GROUP BY 
            dd."ID_PERSONA"
    `;

    const deduccionesTercerosQuery = `
        SELECT 
            dd."ID_PERSONA",
            SUM(dd.MONTO_APLICADO) AS "deducciones_terceros"
        FROM  
            "NET_PLANILLA" planilla
        LEFT JOIN 
            "NET_DETALLE_DEDUCCION" dd ON planilla."ID_PLANILLA" = dd."ID_PLANILLA"
        LEFT JOIN 
            "NET_DEDUCCION" ded ON dd."ID_DEDUCCION" = ded."ID_DEDUCCION"
        LEFT JOIN  
            "NET_CENTRO_TRABAJO" ct ON ct."ID_CENTRO_TRABAJO" = ded."ID_CENTRO_TRABAJO"
        WHERE 
            planilla."PERIODO_INICIO" >= :periodoInicio
            AND planilla."PERIODO_FINALIZACION" <= :periodoFinalizacion
            AND planilla."ID_TIPO_PLANILLA" IN (${idTiposPlanilla.join(', ')})
            AND dd."ESTADO_APLICACION" = 'COBRADA'
            AND ded."ID_DEDUCCION" NOT IN (1, 2, 3, 44, 51)
            AND ded."ID_CENTRO_TRABAJO" != 1
            --AND ct.NOMBRE_CENTRO_TRABAJO != 'INPREMA'
            AND dd."ID_AF_BANCO" IS NULL
        GROUP BY 
            dd."ID_PERSONA"
    `;

    try {
      const beneficios = await this.entityManager.query(beneficiosQuery, [periodoInicio, periodoFinalizacion]);
      const deduccionesInprema = await this.entityManager.query(deduccionesInpremaQuery, [periodoInicio, periodoFinalizacion]);
      const deduccionesTerceros = await this.entityManager.query(deduccionesTercerosQuery, [periodoInicio, periodoFinalizacion]);
      const result = beneficios.map(beneficio => {
        const personaID = beneficio.ID_PERSONA;
        const totalDeduccionInprema = deduccionesInprema
          .filter(d => d.ID_PERSONA === personaID)
          .reduce((acc, curr) => acc + curr.deducciones_inprema, 0);
        const totalDeduccionTerceros = deduccionesTerceros
          .filter(d => d.ID_PERSONA === personaID)
          .reduce((acc, curr) => acc + curr.deducciones_terceros, 0);
        const totalDeducciones = totalDeduccionInprema + totalDeduccionTerceros;
        return {
          codigo_banco: beneficio.codigo_banco?.trim(),
          numero_cuenta: beneficio.numero_cuenta?.trim(),
          neto: parseFloat((beneficio.monto_a_pagar - totalDeducciones).toFixed(2)),
          nombre_completo: beneficio.nombre_completo?.trim(),
          id_tipo_planilla: 1,
          n_identificacion: beneficio.n_identificacion?.trim(),
        };
      }).sort((a, b) => a.neto - b.neto);
      return result;
    } catch (error) {
      console.error('Error al obtener los detalles de pago por planilla:', error);
      throw new InternalServerErrorException('Error al obtener los detalles de pago por planilla.');
    }
  }

  async generarReporteDetallePago(
    data: any[],
    res: Response,
  ): Promise<void> {
    try {
      const workbook = new ExcelJS.Workbook();
      const detailedSheet = workbook.addWorksheet('Detalle de Pago');
      const concatenatedSheet = workbook.addWorksheet('Concatenado');

      // Definir columnas de la hoja detallada
      detailedSheet.columns = [
        { header: 'Código Banco', key: 'codigo_banco', width: 20 },
        { header: 'Número de Cuenta', key: 'numero_cuenta', width: 20 },
        { header: 'Monto a Pagar', key: 'monto_a_pagar', width: 20 },
        { header: 'Nombre Completo', key: 'nombre_completo', width: 30 },
        { header: 'Fecha Actual', key: 'fecha_actual', width: 15 },
        { header: 'Tipo de Planilla', key: 'id_tipo_planilla', width: 20 },
        { header: 'DNI', key: 'n_identificacion', width: 20 },
      ];

      const currentDate = format(new Date(), 'dd/MM/yyyy');

      // Agregar las filas con los datos
      data.forEach(item => {
        detailedSheet.addRow({
          codigo_banco: item.codigo_banco,
          numero_cuenta: item.numero_cuenta,
          monto_a_pagar: Number(parseFloat(item.neto).toFixed(2)),
          nombre_completo: item.nombre_completo,
          fecha_actual: currentDate,
          id_tipo_planilla: 1,
          n_identificacion: item.n_identificacion,
        });
      });

      // Calcular la suma de la columna "Monto a Pagar"
      const total = data.reduce((sum, item) => sum + parseFloat(item.neto), 0);

      // Agregar una fila al final con la suma total
      const lastRowIndex = detailedSheet.rowCount + 1;
      detailedSheet.addRow({
        codigo_banco: '',
        numero_cuenta: '',
        monto_a_pagar: '',
        nombre_completo: '',
        fecha_actual: '',
        id_tipo_planilla: '',
        n_identificacion: '',
      });

      // Obtener la fila del total
      const totalRow = detailedSheet.getRow(lastRowIndex);

      // Asignar valores sin combinar celdas
      totalRow.getCell(1).value = 'TOTAL';
      totalRow.getCell(1).alignment = { horizontal: 'center', vertical: 'middle' };
      totalRow.getCell(1).font = { bold: true };

      totalRow.getCell(3).value = Number(parseFloat(total.toFixed(2)));
      totalRow.getCell(3).alignment = { vertical: 'middle' };
      totalRow.getCell(3).font = { bold: true };

      // Agregar las filas concatenadas en la hoja "Concatenado"
      data.forEach(item => {
        const concatenatedRow = [
          item.codigo_banco,
          item.numero_cuenta,
          Number(parseFloat(item.neto).toFixed(2)),
          item.nombre_completo,
          currentDate,
          '1',
          item.n_identificacion
        ].join(',');

        concatenatedSheet.addRow([concatenatedRow]);
      });

      res.setHeader('Content-Type', 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet');
      res.setHeader('Content-Disposition', 'attachment; filename=detalle_pago.xlsx');
      await workbook.xlsx.write(res);
      res.end();
    } catch (error) {
      console.error('Error al generar el archivo Excel:', error);
      throw new InternalServerErrorException('Error al generar el archivo Excel');
    }
  }

  async eliminarPlanillaPrelByIdPlanilla(id_planilla: number): Promise<void> {
    try {
      const detalleIds = await this.detallePagBeneficios.find({
        select: ["id_beneficio_planilla"],
        where: { planilla: { id_planilla, estado: "ACTIVA" } },
      });

      if (!detalleIds.length) {
        throw new NotFoundException(
          `No se encontraron registros para la planilla con ID: ${id_planilla}`
        );
      }

      // Dividir en lotes de 1000 registros (Oracle tiene un límite de 1000 elementos en IN())
      const chunkSize = 1000;
      for (let i = 0; i < detalleIds.length; i += chunkSize) {
        const chunk = detalleIds.slice(i, i + chunkSize).map((d) => d.id_beneficio_planilla);
        await this.detallePagBeneficios.delete({ id_beneficio_planilla: In(chunk) });
      }

      console.log(`Se eliminaron ${detalleIds.length} registros.`);
    } catch (error) {
      console.error(error);
      this.handleException(error);
    }
  }

  async obtenerBajasPorPeriodoExcel(
    res: Response,
    fecha: { mes_inicio: string; anio_inicio: string; mes_finalizacion: string; anio_finalizacion: string }
  ): Promise<void> {
    try {
      const query = `
        ---------BAJAS---------------------
        SELECT 
            t4.n_identificacion, 
            TRIM(
              t4.primer_apellido ||
              CASE
                  WHEN t4.segundo_apellido IS NOT NULL THEN ' ' || TRIM(t4.segundo_apellido)
                  ELSE ''
              END ||
              CASE
                  WHEN t4.primer_nombre IS NOT NULL THEN ' ' || TRIM(t4.primer_nombre)
                  ELSE ''
              END ||
              CASE
                  WHEN t4.segundo_nombre IS NOT NULL THEN ' ' || TRIM(t4.segundo_nombre)
                  ELSE ''
              END ||
              CASE
                  WHEN t4.tercer_nombre IS NOT NULL THEN ' ' || TRIM(t4.tercer_nombre)
                  ELSE ''
              END
            ) AS "NOMBRE_COMPLETO",
            t4.fallecido, t3.id_beneficio, 
            t3.monto_por_periodo, t3.periodo_inicio, t3.periodo_finalizacion, 
            t3.fecha_calculo as fecha_efectividad, t3.num_rentas_aplicadas as rentas_aprobadas,
            t7.id_tipo_persona, t2.estado, t3.estado_solicitud,
            t5.CODIGO_PLANILLA
        FROM net_detalle_pago_beneficio t2
        JOIN net_detalle_beneficio_afiliado t3 ON
            t2.id_detalle_persona = t3.id_detalle_persona
            AND t2.id_causante = t3.id_causante
            AND t2.id_persona = t3.id_persona
            AND t2.id_beneficio = t3.id_beneficio
            AND t2.id_beneficio != 27
        JOIN net_detalle_persona t7 ON
            t7.id_detalle_persona = t3.id_detalle_persona
            AND t7.id_causante = t3.id_causante
            AND t7.id_persona = t3.id_persona
        JOIN net_persona t4 ON t4.id_persona = t3.id_persona
        JOIN net_planilla t5 ON t5.id_planilla = t2.id_planilla
        WHERE t2.estado = 'PAGADA'
            AND t5.id_tipo_planilla IN (1,2)
            AND TO_DATE('01/' || ${fecha.mes_inicio} || '/' || ${fecha.anio_inicio}, 'DD/MM/YY') 
                BETWEEN t5.periodo_inicio AND t5.periodo_finalizacion
            AND NOT EXISTS (
                SELECT 1 
                FROM net_detalle_pago_beneficio t1
                JOIN net_planilla t6 ON t6.id_planilla = t1.id_planilla 
                WHERE 
                TO_DATE('01/' || ${fecha.mes_finalizacion} || '/' || ${fecha.anio_finalizacion}, 'DD/MM/YY') 
                    BETWEEN t6.periodo_inicio AND t6.periodo_finalizacion
                AND t6.id_tipo_planilla IN (1,2)
                AND t1.id_detalle_persona = t2.id_detalle_persona
                AND t1.id_causante = t2.id_causante
                AND t1.id_persona = t2.id_persona
                AND t1.id_beneficio = t2.id_beneficio
            )
      `;
  
      const beneficios = await this.entityManager.query(query);
      const workbook = new ExcelJS.Workbook();
      const beneficiosSheet = workbook.addWorksheet('Beneficios');
      const fallecidosSheet = workbook.addWorksheet('Fallecidos');
  
      const columns = [
        { header: 'IDENTIFICACION', key: 'N_IDENTIFICACION', width: 15 },
        { header: 'Nombre Completo', key: 'NOMBRE_COMPLETO', width: 30 },
        { header: 'FALLECIDO', key: 'FALLECIDO', width: 15 },
        { header: 'CODIGO DE BENEFICIO', key: 'ID_BENEFICIO', width: 15 },
        { header: 'PERIODO INICIO', key: 'PERIODO_INICIO', width: 15 },
        { header: 'PERIODO FINALIZACION', key: 'PERIODO_FINALIZACION', width: 15 },
      ];
      
      beneficiosSheet.columns = columns;
      fallecidosSheet.columns = columns;
  
      beneficios.forEach((beneficio) => {
        if (beneficio.FALLECIDO === 'SI') {
          fallecidosSheet.addRow(beneficio);
        } else {
          beneficiosSheet.addRow(beneficio);
        }
      });
  
      res.setHeader(
        'Content-Type',
        'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet'
      );
      res.setHeader(
        'Content-Disposition',
        `attachment; filename=bajas-mes-${fecha.mes_finalizacion}-${fecha.anio_finalizacion}.xlsx`
      );
  
      await workbook.xlsx.write(res);
      res.end();
  
    } catch (error) {
      throw new BadRequestException(error.message || 'Error al generar el archivo Excel.');
    }
  }
  
  async obtenerAltaPorPeriodoExcel(
    res: Response,
    fecha: { mes_inicio: string; anio_inicio: string; mes_finalizacion: string; anio_finalizacion: string }
  ): Promise<void> {
    try {
      const query = `
        ---------ALTAS---------------------
        SELECT 
            t4.n_identificacion, 
            TRIM(
              t4.primer_apellido ||
              CASE WHEN t4.segundo_apellido IS NOT NULL THEN ' ' || TRIM(t4.segundo_apellido) ELSE '' END ||
              CASE WHEN t4.primer_nombre IS NOT NULL THEN ' ' || TRIM(t4.primer_nombre) ELSE '' END ||
              CASE WHEN t4.segundo_nombre IS NOT NULL THEN ' ' || TRIM(t4.segundo_nombre) ELSE '' END ||
              CASE WHEN t4.tercer_nombre IS NOT NULL THEN ' ' || TRIM(t4.tercer_nombre) ELSE '' END
            ) AS "NOMBRE_COMPLETO",
            t1.id_beneficio, 
            t5.periodo_inicio AS PERIODO_INICIO, 
            t5.periodo_finalizacion AS PERIODO_FINALIZACION,
            t3.fecha_calculo AS FECHA_EFECTIVIDAD,
            t5.CODIGO_PLANILLA, 
            t3.MONTO_POR_PERIODO,
            t1.estado
        FROM net_detalle_pago_beneficio t1
        JOIN net_detalle_beneficio_afiliado t3 ON 
            t1.id_detalle_persona = t3.id_detalle_persona
            AND t1.id_causante = t3.id_causante
            AND t1.id_persona = t3.id_persona
            AND t1.id_beneficio = t3.id_beneficio
        JOIN net_planilla t5 ON t5.id_planilla = t1.id_planilla
        JOIN net_persona t4 ON t4.id_persona = t1.id_persona
        WHERE 
            TO_DATE('01/' || ${fecha.mes_finalizacion} || '/' || ${fecha.anio_finalizacion}, 'DD/MM/YY') 
              BETWEEN t5.periodo_inicio AND t5.periodo_finalizacion
            AND t5.id_tipo_planilla IN (1,2)
            AND (t1.estado = 'PAGADA' OR t1.estado = 'EN PRELIMINAR')
            AND t1.ID_BENEFICIO NOT IN (27)
            AND NOT EXISTS (
                SELECT 1 
                FROM net_detalle_pago_beneficio t2
                JOIN net_planilla t6 ON t6.id_planilla = t2.id_planilla
                WHERE t2.estado = 'PAGADA' 
                AND t6.id_tipo_planilla IN (1,2)
                AND TO_DATE('01/' || ${fecha.mes_inicio} || '/' || ${fecha.anio_inicio}, 'DD/MM/YY') 
                    BETWEEN t6.periodo_inicio AND t6.periodo_finalizacion
                AND t2.id_detalle_persona = t1.id_detalle_persona
                AND t2.id_causante = t1.id_causante
                AND t2.id_persona = t1.id_persona
                AND t2.id_beneficio = t1.id_beneficio
            )
      `;
  
      const beneficios = await this.entityManager.query(query);
      const workbook = new ExcelJS.Workbook();
      const beneficiosSheet = workbook.addWorksheet('Beneficios');
  
      // Definir encabezados de la hoja de cálculo
      beneficiosSheet.columns = [
        { header: 'IDENTIFICACION', key: 'N_IDENTIFICACION', width: 15 },
        { header: 'Nombre Completo', key: 'NOMBRE_COMPLETO', width: 30 },
        { header: 'PERIODO INICIO', key: 'PERIODO_INICIO', width: 15 },
        { header: 'PERIODO FINALIZACION', key: 'PERIODO_FINALIZACION', width: 15 },
        { header: 'CODIGO DE BENEFICIO', key: 'ID_BENEFICIO', width: 15 },
        { header: 'CODIGO PLANILLA', key: 'CODIGO_PLANILLA', width: 15 },
        { header: 'MONTO POR PERIODO', key: 'MONTO_POR_PERIODO', width: 20 },
      ];
  
      // Agregar datos
      beneficios.forEach((beneficio) => {
        beneficiosSheet.addRow(beneficio);
      });
  
      res.setHeader(
        'Content-Type',
        'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet'
      );
      res.setHeader(
        'Content-Disposition',
        `attachment; filename=altas-mes-${fecha.mes_finalizacion}-${fecha.anio_finalizacion}.xlsx`
      );
  
      await workbook.xlsx.write(res);
      res.end();
  
    } catch (error) {
      throw new BadRequestException(error.message || 'Error al generar el archivo Excel.');
    }
  }
  
  

}