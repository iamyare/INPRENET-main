import { BadRequestException, ConflictException, Injectable, InternalServerErrorException, Logger, NotFoundException, Res } from '@nestjs/common';
import { CreatePlanillaDto } from './dto/create-planilla.dto';
import { UpdatePlanillaDto } from './dto/update-planilla.dto';
import { InjectEntityManager, InjectRepository } from '@nestjs/typeorm';
import { Net_Detalle_Deduccion } from '../detalle-deduccion/entities/detalle-deduccion.entity';
import { EntityManager, QueryFailedError, Repository } from 'typeorm';
import { net_persona } from '../../Persona/entities/net_persona.entity';
import { Net_Persona_Por_Banco } from '../../banco/entities/net_persona-banco.entity';
import { Net_Planilla } from './entities/net_planilla.entity';
import { Net_TipoPlanilla } from '../tipo-planilla/entities/tipo-planilla.entity';
import { Net_Detalle_Pago_Beneficio } from '../detalle_beneficio/entities/net_detalle_pago_beneficio.entity';
import { PaginationDto } from 'src/common/dtos/pagination.dto';
import { Workbook } from 'exceljs';
import { Response } from 'express';
import { startOfMonth, endOfMonth, getMonth, getYear, format } from 'date-fns';
import { Net_Detalle_Beneficio_Afiliado } from '../detalle_beneficio/entities/net_detalle_beneficio_afiliado.entity';
import * as ExcelJS from 'exceljs';
import * as XLSX from 'xlsx';
import { MailService } from 'src/common/services/mail.service';
import * as path from 'path';
import * as fs from 'fs';
import * as PDFDocument from 'pdfkit';

@Injectable()
export class PlanillaService {
  private readonly logger = new Logger(PlanillaService.name)

  constructor(
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

  async procesarPagoBeneficio(): Promise<void> {
    try {
      // Rutas de las imágenes para el contenido del correo
      const logoInprenetPath = path.join(process.cwd(), 'assets', 'images', 'LOGO-INPRENET.png');
      const logoInpremaPath = path.join(process.cwd(), 'assets', 'images', 'logo-INPREMA H-Transparente.png');

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
          <img src="/assets/images/logo INPREMA H Transparente.png" alt="Logo INPREMA" style="max-width: 120px; margin-bottom: 10px;">
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

      // Filtrar solo los beneficios que tengan pagos asociados
      const beneficios = persona.detallePersona.flatMap(detalle =>
        detalle.detalleBeneficio.flatMap(beneficio => {
          const pagos = beneficio.detallePagBeneficio.filter(pago => pago.planilla.id_planilla === idPlanilla);
          if (pagos.length > 0) {
            return {
              beneficio: beneficio.beneficio.nombre_beneficio,
              monto_total: beneficio.monto_total,
              monto_por_periodo: beneficio.monto_por_periodo,
              metodo_pago: beneficio.metodo_pago,
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
      );

      // Agrupar las deducciones sin incluir información redundante de la planilla
      const deducciones = persona.detalleDeduccion.filter(deduccion => deduccion.planilla.id_planilla === idPlanilla).map(deduccion => ({
        deduccion: deduccion.deduccion.nombre_deduccion,
        monto_total: deduccion.monto_total,
        estado_aplicacion: deduccion.estado_aplicacion,
        monto_aplicado: deduccion.monto_aplicado,
      }));

      // Obtener información completa de la planilla
      const planilla = await this.planillaRepository.findOne({
        where: { id_planilla: idPlanilla }
      });

      const planillaDatos = {
        codigo_planilla: planilla.codigo_planilla,
        fecha_apertura: planilla.fecha_apertura,
        fecha_cierre: planilla.fecha_cierre,
        secuencia: planilla.secuencia,
        estado: planilla.estado,
        periodoInicio: planilla.periodoInicio,
        periodoFinalizacion: planilla.periodoFinalizacion
      };

      // Retornar la respuesta organizada
      return {
        persona: personaDatos,
        planilla: planillaDatos,
        beneficios,
        deducciones
      };

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
      const nIdentificacion = row['IDENTIDAD'].toString().padStart(14, '0');
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
        result.monto_a_pagar,
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

  /* async uploadExcel(file: Express.Multer.File) {
    try {
      const workbook = XLSX.read(file.buffer, { type: 'buffer' });
      const worksheet = workbook.Sheets[workbook.SheetNames[0]];
      const rows = XLSX.utils.sheet_to_json(worksheet);
  
      for (const row of rows) {
        const dni = row['DNI'];
        const codigoBeneficio = row['BENEF'];
        const montoPagar = row['PAGAR'];
  
        // Buscar la persona por su número de identificación
        const persona = await this.personaRepository.findOne({
          where: { n_identificacion: dni },
        });
  
        if (!persona) {
          this.logger.warn(`Persona con DNI ${dni} no encontrada.`);
          continue; // Saltar al siguiente registro
        }
  
        // Buscar el beneficio por su código
        const beneficio = await this.beneficioRepository.findOne({
          where: { codigo: codigoBeneficio },
        });
  
        if (!beneficio) {
          this.logger.warn(`Beneficio con código ${codigoBeneficio} no encontrado.`);
          continue; // Saltar al siguiente registro
        }
  
        // Verificar si la persona tiene asignado ese beneficio
        const detalleBeneficioAfiliado = await this.detalleBeneficioAfiliadoRepository
          .createQueryBuilder('detalleBeneficio')
          .innerJoinAndSelect('detalleBeneficio.beneficio', 'beneficio')
          .innerJoinAndSelect('detalleBeneficio.persona', 'persona')
          .where('persona.n_identificacion = :dni', { dni })
          .andWhere('beneficio.codigo = :codigoBeneficio', { codigoBeneficio })
          .getOne();
  
        if (detalleBeneficioAfiliado) {
          // Log de personas que sí tienen el beneficio asignado
          this.logger.log(`Persona con DNI ${dni} tiene asignado el beneficio con código ${codigoBeneficio}.`);
          // Aquí podrías realizar la lógica adicional, como registrar el monto a pagar.
        } else {
          // Log de personas que no tienen el beneficio asignado
          this.logger.warn(`Persona con DNI ${dni} no tiene asignado el beneficio con código ${codigoBeneficio}.`);
        }
      }
  
      return { message: 'Archivo procesado correctamente' };
    } catch (error) {
      this.logger.error(`Error procesando el archivo: ${error.message}`);
      throw new InternalServerErrorException(error.message);
    }
  } */





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

  async getcerradas_fecha(fechaInicio: string, fechaFinalizacion: string): Promise<Net_Planilla[]> {
    console.log(fechaInicio);
    console.log(fechaFinalizacion);

    try {
      if (fechaInicio && fechaFinalizacion) {
        const query = this.planillaRepository.createQueryBuilder('planilla')
          .innerJoinAndSelect('planilla.tipoPlanilla', 'tipoPlanilla')
          .where('planilla.estado = :estado', { estado: 'CERRADA' })
          .andWhere('planilla.PERIODO_INICIO BETWEEN :fechaInicio AND :fechaFinalizacion', { fechaInicio, fechaFinalizacion });

        const planillas = await query.getMany();
        console.log(planillas)
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
    console.log(periodoInicio);
    console.log(periodoFinalizacion);
    console.log(idTiposPlanilla);

    const query = `
      SELECT 
        ben."ID_BENEFICIO" AS "ID_BENEFICIO",
        ben."NOMBRE_BENEFICIO" AS "NOMBRE_BENEFICIO",
        ben."CODIGO" AS "CODIGO_BENEFICIO",
        plan."ID_PLANILLA" AS "ID_PLANILLA",
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
        plan."PERIODO_INICIO" >= TO_DATE(:periodoInicio, 'DD/MM/YYYY') AND
        plan.ESTADO = 'CERRADA'
        AND plan."PERIODO_FINALIZACION" <= TO_DATE(:periodoFinalizacion, 'DD/MM/YYYY')
        AND plan."ID_TIPO_PLANILLA" IN (${idTiposPlanilla.join(', ')})
      GROUP BY 
        ben."ID_BENEFICIO", 
        ben."NOMBRE_BENEFICIO", 
        ben."CODIGO",
        plan."ID_PLANILLA"
      ORDER BY ben."NOMBRE_BENEFICIO" ASC
    `;
    try {
      const result = await this.entityManager.query(query, [periodoInicio, periodoFinalizacion]);
      /* const idPlanillas = result.map((item) => item.ID_PLANILLA);
      console.log('ID_PLANILLA considerados:', idPlanillas); */
      return result;
    } catch (error) {
      console.error('Error al obtener beneficios:', error);
      throw new InternalServerErrorException('Error al obtener beneficios');
    }
  }

  async getDeduccionesInpremaPorPeriodo(
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
      INNER JOIN 
        "NET_PLANILLA" plan 
        ON dedd."ID_PLANILLA" = plan."ID_PLANILLA"
      WHERE 
        plan."PERIODO_INICIO" >= TO_DATE(:periodoInicio, 'DD/MM/YYYY') 
        AND plan."PERIODO_FINALIZACION" <= TO_DATE(:periodoFinalizacion, 'DD/MM/YYYY')
        AND plan."ID_TIPO_PLANILLA" IN (${idTiposPlanilla.join(', ')})
        AND ded."ID_CENTRO_TRABAJO" = 1
        AND dedd."ID_AF_BANCO" IS NOT NULL
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
      console.error('Error al obtener deducciones INPREMA:', error);
      throw new InternalServerErrorException('Error al obtener deducciones INPREMA');
    }
  }

  async getDeduccionesTercerosPorPeriodo(
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
      INNER JOIN 
        "NET_PLANILLA" plan 
        ON dedd."ID_PLANILLA" = plan."ID_PLANILLA"
      WHERE 
        plan."PERIODO_INICIO" >= TO_DATE(:periodoInicio, 'DD/MM/YYYY') 
        AND plan."PERIODO_FINALIZACION" <= TO_DATE(:periodoFinalizacion, 'DD/MM/YYYY')
        AND plan."ID_TIPO_PLANILLA" IN (${idTiposPlanilla.join(', ')})
        AND ded."ID_CENTRO_TRABAJO" != 1
        AND dedd."ID_AF_BANCO" IS NOT NULL
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
      console.error('Error al obtener deducciones de terceros:', error);
      throw new InternalServerErrorException('Error al obtener deducciones de terceros');
    }
  }


  async getBeneficiosPorPeriodoSC(
    periodoInicio: string,
    periodoFinalizacion: string,
    idTiposPlanilla: number[],
  ): Promise<any[]> {
    const query = `
      SELECT 
        ben."ID_BENEFICIO" AS "ID_BENEFICIO",
        ben."NOMBRE_BENEFICIO" AS "NOMBRE_BENEFICIO",
        ben."CODIGO" AS "CODIGO_BENEFICIO",
        plan."ID_PLANILLA" AS "ID_PLANILLA",
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
        plan."PERIODO_INICIO" >= TO_DATE(:periodoInicio, 'DD/MM/YYYY') 
        AND plan."PERIODO_FINALIZACION" <= TO_DATE(:periodoFinalizacion, 'DD/MM/YYYY')
        AND plan."ID_TIPO_PLANILLA" IN (${idTiposPlanilla.join(', ')})
        AND detBs."ID_AF_BANCO" IS NULL
      GROUP BY 
        ben."ID_BENEFICIO", 
        ben."NOMBRE_BENEFICIO", 
        ben."CODIGO",
        plan."ID_PLANILLA"
      ORDER BY ben."NOMBRE_BENEFICIO" ASC
    `;
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
      INNER JOIN 
        "NET_PLANILLA" plan 
        ON dedd."ID_PLANILLA" = plan."ID_PLANILLA"
      WHERE 
        plan."PERIODO_INICIO" >= TO_DATE(:periodoInicio, 'DD/MM/YYYY') 
        AND plan."PERIODO_FINALIZACION" <= TO_DATE(:periodoFinalizacion, 'DD/MM/YYYY')
        AND plan."ID_TIPO_PLANILLA" IN (${idTiposPlanilla.join(', ')})
        AND ded."ID_CENTRO_TRABAJO" = 1
        AND dedd."ID_AF_BANCO" IS NULL
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
      INNER JOIN 
        "NET_PLANILLA" plan 
        ON dedd."ID_PLANILLA" = plan."ID_PLANILLA"
      WHERE 
        plan."PERIODO_INICIO" >= TO_DATE(:periodoInicio, 'DD/MM/YYYY') 
        AND plan."PERIODO_FINALIZACION" <= TO_DATE(:periodoFinalizacion, 'DD/MM/YYYY')
        AND plan."ID_TIPO_PLANILLA" IN (${idTiposPlanilla.join(', ')})
        AND dedd."ID_AF_BANCO" IS NULL
        AND ded."ID_DEDUCCION" NOT IN (1, 2, 3, 44, 51)
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


  async getTotalPorBeneficiosYDeduccionesPorPeriodo(
    periodoInicio: string,
    periodoFinalizacion: string,
    idTiposPlanilla: number[],
  ): Promise<any> {
    try {
      const beneficios = await this.getBeneficiosPorPeriodo(periodoInicio, periodoFinalizacion, idTiposPlanilla);
      const deduccionesInprema = await this.getDeduccionesInpremaPorPeriodo(periodoInicio, periodoFinalizacion, idTiposPlanilla);
      const deduccionesTerceros = await this.getDeduccionesTercerosPorPeriodo(periodoInicio, periodoFinalizacion, idTiposPlanilla);

      const beneficiosSC = await this.getBeneficiosPorPeriodoSC(periodoInicio, periodoFinalizacion, idTiposPlanilla);
      const deduccionesInpremaSC = await this.getDeduccionesInpremaPorPeriodoSC(periodoInicio, periodoFinalizacion, idTiposPlanilla);
      const deduccionesTercerosSC = await this.getDeduccionesTercerosPorPeriodoSC(periodoInicio, periodoFinalizacion, idTiposPlanilla);

      return { beneficios, deduccionesInprema, deduccionesTerceros, beneficiosSC, deduccionesInpremaSC, deduccionesTercerosSC };
    } catch (error) {
      console.error('Error al obtener los totales por periodo:', error);
      throw new InternalServerErrorException('Error al obtener los totales por periodo');
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
        LEFT JOIN "NET_PERSONA_POR_BANCO" pb ON ddp."ID_AF_BANCO" = pb."ID_AF_BANCO"
        LEFT JOIN "NET_BANCO" b ON pb."ID_BANCO" = b."ID_BANCO"
        WHERE
          p."PERIODO_INICIO" BETWEEN TO_DATE(:periodoInicio, 'DD/MM/YYYY') AND TO_DATE(:periodoFinalizacion, 'DD/MM/YYYY')
          AND p."ID_TIPO_PLANILLA" IN (${idTiposPlanilla.join(', ')})
          AND ddp."ESTADO_APLICACION" = 'COBRADA'
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
        LEFT JOIN  "NET_PERSONA_POR_BANCO" pb ON ddp."ID_AF_BANCO" = pb."ID_AF_BANCO"
        LEFT JOIN "NET_BANCO" b ON pb."ID_BANCO" = b."ID_BANCO"
        WHERE
          p."PERIODO_INICIO" BETWEEN TO_DATE(:periodoInicio, 'DD/MM/YYYY') AND TO_DATE(:periodoFinalizacion, 'DD/MM/YYYY')
          AND p."ID_TIPO_PLANILLA" IN (${idTiposPlanilla.join(', ')})
          AND ddp."ESTADO_APLICACION" = 'COBRADA'
          AND d."ID_DEDUCCION" NOT IN (1,2,3,44,51)
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
      DNI: string;
      MES: string;
      ANIO: string;
      ID_PLANILLA: number;
      ID_PERSONA: number;
      TOTAL_BENEFICIO: number;
      NOMBRE_COMPLETO: string;
      TOTAL_DEDUCCIONES?: number;
      DEDUCCIONES?: number;
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
      'TOTAL_BENEFICIO': number;
      NOMBRE_COMPLETO: string;
      'DEDUCCIONES_INPREMA'?: number;
      'DEDUCCIONES_TERCEROS'?: number;
    }

    interface Deduccion {
      ID_PERSONA: number;
      'DEDUCCIONES_INPREMA'?: number;
      'DEDUCCIONES_TERCEROS'?: number;
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
        throw new BadRequestException(`No se encontró ningún tipo de planilla con el nombre '${nombre_planilla}'.`);
      }
      const planillaActiva = await this.planillaRepository.findOne({
        where: {
          tipoPlanilla: { id_tipo_planilla: tipoPlanilla.id_tipo_planilla },
          estado: 'ACTIVA',
        },
      });

      if (planillaActiva) {
        throw new ConflictException(`Ya existe una planilla activa para el tipo de planilla '${nombre_planilla}'.`);
      }
      let codPlanilla = "";
      const fechaActual: Date = new Date();
      const mes: number = getMonth(fechaActual) + 1;
      const anio: number = getYear(fechaActual);
      const primerDia: string = format(startOfMonth(fechaActual), 'dd/MM/yyyy');
      const ultimoDia: string = format(endOfMonth(fechaActual), 'dd/MM/yyyy');
      let secuencia = 1;
      let planillaExistente;

      do {
        switch (nombre_planilla) {
          case "ORDINARIA JUBILADOS Y PENSIONADOS":
            codPlanilla = `ORD-JUB-PEN-${mes}-${anio}-${secuencia}`;
            break;
          case "ORDINARIA BENEFICIARIO":
            codPlanilla = `ORD-BEN-${mes}-${anio}-${secuencia}`;
            break;
          case "COMPLEMENTARIA JUBILADO Y PENSIONADO":
            codPlanilla = `COMP-JUB-PEN-${mes}-${anio}-${secuencia}`;
            break;
          case "COMPLEMENTARIA BENEFICIARIO":
            codPlanilla = `COMP-BEN-${mes}-${anio}-${secuencia}`;
            break;
          case "COMPLEMENTARIA AFILIADO":
            codPlanilla = `COMP-AFIL-${mes}-${anio}-${secuencia}`;
            break;
          case "EXTRAORDINARIA JUBILADO Y PENSIONADO":
            codPlanilla = `EXTRA-JUB-PEN-${mes}-${anio}-${secuencia}`;
            break;
          case "EXTRAORDINARIA BENEFICIARIO":
            codPlanilla = `EXTRA-JUB-${mes}-${anio}-${secuencia}`;
            break;
          case "60 RENTAS":
            codPlanilla = `60-RENTAS-${mes}-${anio}-${secuencia}`;
            break;
          default:
            throw new BadRequestException('Tipo de planilla no reconocido');
        }
        planillaExistente = await this.planillaRepository.findOneBy({ codigo_planilla: codPlanilla });
        if (planillaExistente) {
          secuencia++;
        }
      } while (planillaExistente);

      const tipoPlanillaInstance = new Net_TipoPlanilla();
      tipoPlanillaInstance.id_tipo_planilla = tipoPlanilla.id_tipo_planilla;
      const newPlanilla = this.planillaRepository.create({
        codigo_planilla: codPlanilla,
        secuencia,
        periodoInicio: periodo_inicio ? periodo_inicio : primerDia,
        periodoFinalizacion: periodo_finalizacion ? periodo_finalizacion : ultimoDia,
        tipoPlanilla: tipoPlanillaInstance,
        estado: 'ACTIVA',
      });

      await this.planillaRepository.save(newPlanilla);
      return newPlanilla;

    } catch (error) {
      if (error instanceof QueryFailedError && error.message.includes('ORA-00001')) {
        throw new ConflictException(`La planilla con la secuencia ya existe, por favor cambie la secuencia o revise los datos.`);
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

  async generarPlanillaComplementaria(tipos_persona: string): Promise<void> {
    try {
      await this.entityManager.query(
        `BEGIN
           InsertarPlanillaComplementaria(:tipos_persona);
         END;`,
        [tipos_persona]
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

  async generarPlanillaOrdinaria(tipos_persona: string): Promise<void> {
    console.log(tipos_persona);

    try {
      await this.entityManager.query(
        `BEGIN
           InsertarPlanillaOrdinaria(:tipos_persona);
         END;`,
        [tipos_persona]
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

  async getPlanillasPreliminares(codigo_planilla: string): Promise<any[]> {
    /* const query = `
          SELECT 
              p.ID_PERSONA,
              p.N_IDENTIFICACION,
              p.PRIMER_NOMBRE || ' ' || NVL(p.SEGUNDO_NOMBRE, '') || ' ' || p.PRIMER_APELLIDO || ' ' || NVL(p.SEGUNDO_APELLIDO, '') AS NOMBRE_COMPLETO,
              COALESCE(SUM(dpb.MONTO_A_PAGAR), 0) AS TOTAL_BENEFICIOS,
              COALESCE(SUM(CASE WHEN d.ID_CENTRO_TRABAJO = 1 THEN dd.MONTO_APLICADO ELSE 0 END), 0) AS TOTAL_DEDUCCIONES_INPREMA,
              COALESCE(SUM(CASE WHEN d.ID_CENTRO_TRABAJO IS NULL OR d.ID_CENTRO_TRABAJO != 1 THEN dd.MONTO_APLICADO ELSE 0 END), 0) AS TOTAL_DEDUCCIONES_TERCEROS
          FROM 
              NET_PERSONA p
          LEFT JOIN 
              NET_DETALLE_PAGO_BENEFICIO dpb ON p.ID_PERSONA = dpb.ID_PERSONA AND dpb.ID_PLANILLA = (SELECT ID_PLANILLA FROM NET_PLANILLA WHERE CODIGO_PLANILLA = :codigo_planilla AND ESTADO = 'ACTIVA')
          LEFT JOIN 
              NET_DETALLE_DEDUCCION dd ON p.ID_PERSONA = dd.ID_PERSONA AND dd.ID_PLANILLA = (SELECT ID_PLANILLA FROM NET_PLANILLA WHERE CODIGO_PLANILLA = :codigo_planilla AND ESTADO = 'ACTIVA')
          LEFT JOIN
              NET_DEDUCCION d ON dd.ID_DEDUCCION = d.ID_DEDUCCION
          WHERE 
              (dpb.ID_PLANILLA = (SELECT ID_PLANILLA FROM NET_PLANILLA WHERE CODIGO_PLANILLA = :codigo_planilla AND ESTADO = 'ACTIVA')
              OR dd.ID_PLANILLA = (SELECT ID_PLANILLA FROM NET_PLANILLA WHERE CODIGO_PLANILLA = :codigo_planilla AND ESTADO = 'ACTIVA'))
          GROUP BY 
              p.ID_PERSONA, p.N_IDENTIFICACION, p.PRIMER_NOMBRE, p.SEGUNDO_NOMBRE, p.PRIMER_APELLIDO, p.SEGUNDO_APELLIDO
      `;

    const result = await this.entityManager.query(query, [codigo_planilla]);
    
    return result; */

    let query = `
        SELECT DISTINCT
            per."N_IDENTIFICACION" AS "N_IDENTIFICACION",
            tipoP."TIPO_PERSONA" AS "TIPO_PERSONA",
            per."ID_PERSONA",
            perPorBan."NUM_CUENTA",
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
        LEFT JOIN 
            "NET_PERSONA_POR_BANCO" perPorBan
        ON 
            detBs."ID_AF_BANCO" = perPorBan."ID_AF_BANCO"
        LEFT JOIN 
            "NET_BANCO" banco
        ON 
            banco."ID_BANCO" = perPorBan."ID_BANCO"
        
        WHERE
                detBs."ESTADO" = 'EN PRELIMINAR' AND
                plan."CODIGO_PLANILLA" = '${codigo_planilla}'
                
        GROUP BY 
        per."N_IDENTIFICACION",
        per."ID_PERSONA",
        tipoP."TIPO_PERSONA",
        perPorBan."NUM_CUENTA",
        banco."NOMBRE_BANCO",
            TRIM(
                per."PRIMER_NOMBRE" || ' ' ||
                COALESCE(per."SEGUNDO_NOMBRE", '') || ' ' ||
                COALESCE(per."TERCER_NOMBRE", '') || ' ' ||
                per."PRIMER_APELLIDO" || ' ' ||
                COALESCE(per."SEGUNDO_APELLIDO", '')
            )
    `;

    let queryI = `
            SELECT 
            per."ID_PERSONA",
                    SUM(dd."MONTO_APLICADO") AS "TOTAL_DEDUCCIONES_INPREMA"
            FROM "NET_PLANILLA" plan 
            INNER JOIN "NET_DETALLE_DEDUCCION" dd ON dd."ID_PLANILLA" = plan."ID_PLANILLA"
            INNER JOIN "NET_DEDUCCION" ded ON ded."ID_DEDUCCION" = dd."ID_DEDUCCION"
            INNER JOIN "NET_CENTRO_TRABAJO" instFin ON instFin."ID_CENTRO_TRABAJO" = ded."ID_CENTRO_TRABAJO" 


            INNER JOIN "NET_PERSONA" per ON per."ID_PERSONA" = dd."ID_PERSONA"

            WHERE
                dd."ESTADO_APLICACION" = 'EN PRELIMINAR' AND
                plan."CODIGO_PLANILLA" = '${codigo_planilla}' AND
                instFin."NOMBRE_CENTRO_TRABAJO" = 'INPREMA'
            GROUP BY 
                per."ID_PERSONA"
    `;

    let queryT = `
          SELECT 
          per."ID_PERSONA",
                  SUM(dd."MONTO_APLICADO") AS "TOTAL_DEDUCCIONES_TERCEROS"
          FROM "NET_PLANILLA" plan 
          INNER JOIN "NET_DETALLE_DEDUCCION" dd ON dd."ID_PLANILLA" = plan."ID_PLANILLA"
          INNER JOIN "NET_DEDUCCION" ded ON ded."ID_DEDUCCION" = dd."ID_DEDUCCION"
          INNER JOIN "NET_CENTRO_TRABAJO" instFin ON instFin."ID_CENTRO_TRABAJO" = ded."ID_CENTRO_TRABAJO" 


          INNER JOIN "NET_PERSONA" per ON per."ID_PERSONA" = dd."ID_PERSONA"

          WHERE
              dd."ESTADO_APLICACION" = 'EN PRELIMINAR' AND
              plan."CODIGO_PLANILLA" = '${codigo_planilla}' AND
              instFin."NOMBRE_CENTRO_TRABAJO" != 'INPREMA'
          GROUP BY 
          per."ID_PERSONA"
    `;

    interface Persona {
      N_IDENTIFICACION: string;
      ID_PERSONA: number;
      TOTAL_BENEFICIOS: number;
      NOMBRE_COMPLETO: string;
      TOTAL_DEDUCCIONES_INPREMA?: number;
      TOTAL_DEDUCCIONES_TERCEROS?: number;
    }

    interface Deduccion {
      ID_PERSONA: number;
      TOTAL_DEDUCCIONES_INPREMA?: number;
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
          TOTAL_DEDUCCIONES_INPREMA: deduccionI ? deduccionI['TOTAL_DEDUCCIONES_INPREMA'] : 0,
          TOTAL_DEDUCCIONES_TERCEROS: deduccionT ? deduccionT['TOTAL_DEDUCCIONES_TERCEROS'] : 0,
          TOTAL_NETO: persona.TOTAL_BENEFICIOS - ((deduccionI ? deduccionI['TOTAL_DEDUCCIONES_INPREMA'] : 0) + (deduccionT ? deduccionT['TOTAL_DEDUCCIONES_TERCEROS'] : 0))

        };
      });

      return newResult;
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
      dpb.ESTADO != 'NO PAGADA'
    )
  `;

    const queryUpdateDeducciones = `
    UPDATE NET_DETALLE_DEDUCCION dd
    SET dd.ESTADO_APLICACION = 'COBRADA'
    WHERE dd.ID_PLANILLA IN (
      SELECT pl.ID_PLANILLA
      FROM NET_PLANILLA pl
      WHERE pl.CODIGO_PLANILLA = :codigo_planilla AND
      dd.ESTADO_APLICACION != 'NO COBRADA'
    )
  `;

    const queryUpdatePlanilla = `
    UPDATE NET_PLANILLA pl
    SET pl.ESTADO = 'CERRADA'
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
            TO_DATE(planilla."PERIODO_INICIO", 'DD/MM/YYYY') >= TO_DATE(:1, 'DD/MM/YYYY')
            AND TO_DATE(planilla."PERIODO_FINALIZACION", 'DD/MM/YYYY') <= TO_DATE(:2, 'DD/MM/YYYY')
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
        WHERE 
            TO_DATE(planilla."PERIODO_INICIO", 'DD/MM/YYYY') >= TO_DATE(:periodoInicio, 'DD/MM/YYYY')
            AND TO_DATE(planilla."PERIODO_FINALIZACION", 'DD/MM/YYYY') <= TO_DATE(:periodoFinalizacion, 'DD/MM/YYYY')
            AND planilla."ID_TIPO_PLANILLA" IN (${idTiposPlanilla.join(', ')})
            AND dd."ESTADO_APLICACION" = 'COBRADA'
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
            TO_DATE(planilla."PERIODO_INICIO", 'DD/MM/YYYY') >= TO_DATE(:periodoInicio, 'DD/MM/YYYY')
            AND TO_DATE(planilla."PERIODO_FINALIZACION", 'DD/MM/YYYY') <= TO_DATE(:periodoFinalizacion, 'DD/MM/YYYY')
            AND planilla."ID_TIPO_PLANILLA" IN (${idTiposPlanilla.join(', ')})
            AND dd."ESTADO_APLICACION" = 'COBRADA'
            AND ded."ID_DEDUCCION" NOT IN (1, 2, 3, 44, 51)
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
          codigo_banco: beneficio.codigo_banco,
          numero_cuenta: beneficio.numero_cuenta,
          neto: parseFloat((beneficio.monto_a_pagar - totalDeducciones).toFixed(2)),
          nombre_completo: beneficio.nombre_completo,
          id_tipo_planilla: 1,
          n_identificacion: beneficio.n_identificacion,
        };
      });
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

      data.forEach(item => {
        detailedSheet.addRow({
          codigo_banco: item.codigo_banco,
          numero_cuenta: item.numero_cuenta,
          monto_a_pagar: parseFloat(item.neto).toFixed(2),
          nombre_completo: item.nombre_completo,
          fecha_actual: currentDate,
          id_tipo_planilla: 1,
          n_identificacion: item.n_identificacion,
        });
      });
      data.forEach(item => {
        const concatenatedRow = [
          item.codigo_banco,
          item.numero_cuenta,
          parseFloat(item.neto).toFixed(2),
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

}