import { BadRequestException, Injectable, InternalServerErrorException, NotFoundException, UnauthorizedException } from '@nestjs/common';
import { CreateBancoDto } from './dto/create-banco.dto';
import { EntityManager, Not, Repository } from 'typeorm';
import { Net_Banco } from './entities/net_banco.entity';
import { InjectEntityManager, InjectRepository } from '@nestjs/typeorm';
import { ResultadosPagosDto } from './dto/ResultadosPagos.dto';
import { NetHistorialPagoPlanilla } from './entities/net_historial_pago_planilla.entity';
import { Net_Historial_Pagos_Fallidos } from './entities/net_historial_pagos_fallidos.entity';
import { NotificacionPagosPendientesDto } from './dto/pago_pendiente.dto';
import { net_persona } from '../Persona/entities/net_persona.entity';
import { Net_Persona_Por_Banco } from './entities/net_persona-banco.entity';
import { Net_Historial_Pagos_Pendientes } from './entities/net_historial_pagos_pendientes.entity';
import { MailService } from 'src/common/services/mail.service';
import * as bcrypt from 'bcrypt';
import * as crypto from 'crypto';
import { Net_Usuario_Empresa } from '../usuario/entities/net_usuario_empresa.entity';

@Injectable()
export class BancoService {
  @InjectRepository(Net_Banco)
  private bancoRepository: Repository<Net_Banco>
  private otpStore = new Map();

  constructor(@InjectEntityManager() private readonly entityManager: EntityManager,
    @InjectRepository(NetHistorialPagoPlanilla)
    private readonly historialPagoPlanillaRepository: Repository<NetHistorialPagoPlanilla>,
    @InjectRepository(Net_Historial_Pagos_Fallidos)
    private readonly historialPagosFallidosRepository: Repository<Net_Historial_Pagos_Fallidos>,
    @InjectRepository(net_persona)
    private readonly personaRepository: Repository<net_persona>,
    @InjectRepository(Net_Persona_Por_Banco)
    private readonly personaPorBancoRepository: Repository<Net_Persona_Por_Banco>,
    @InjectRepository(Net_Historial_Pagos_Pendientes)
    private readonly historialPagosPendientesRepository: Repository<Net_Historial_Pagos_Pendientes>,
    @InjectRepository(Net_Usuario_Empresa)
    private readonly usuarioEmpresaRepository: Repository<Net_Usuario_Empresa>,
    private readonly mailService: MailService,
  ) { }

  async findAll() {
    const bancos = await this.bancoRepository.find();
    return bancos
  }

  async generarOtp(correo: string): Promise<{ message: string }> {
    const usuario = await this.usuarioEmpresaRepository.findOne({
      where: { empleadoCentroTrabajo: { correo_1: correo } },
      relations: ['empleadoCentroTrabajo'],
    });

    if (!usuario) {
      throw new NotFoundException('Usuario no encontrado con el correo proporcionado.');
    }

    // 🔐 Generar código OTP de 6 dígitos
    const otp = crypto.randomInt(100000, 999999).toString();
    const expiration = Date.now() + 5 * 60 * 1000; // Expira en 5 minutos

    // Guardar en almacenamiento temporal
    this.otpStore.set(correo, { otp, expiration });

    // ✉️ Enviar OTP por correo
    const subject = 'Código de Verificación para Cambio de Contraseña';
    const htmlContent = `
      <p>Hola,</p>
      <p>Recibimos una solicitud para cambiar tu contraseña.</p>
      <p>Tu código de verificación es: <strong>${otp}</strong></p>
      <p>Este código es válido por 5 minutos.</p>
      <p>Si no solicitaste este cambio, ignora este mensaje.</p>
    `;

    await this.mailService.sendMail(correo, subject, '', htmlContent);

    return { message: 'Código OTP enviado al correo.' };
  }

  // ✅ 2. Verificar OTP y Cambiar Contraseña
  async actualizarContrasena(correo: string, otp: string, nuevaContrasena: string): Promise<{ message: string }> {
    const storedOtp = this.otpStore.get(correo);

    if (!storedOtp || storedOtp.otp !== otp) {
      throw new UnauthorizedException('Código OTP inválido o ya expirado.');
    }

    if (Date.now() > storedOtp.expiration) {
      this.otpStore.delete(correo);
      throw new UnauthorizedException('El código OTP ha expirado.');
    }

    const usuario = await this.usuarioEmpresaRepository.findOne({
      where: { empleadoCentroTrabajo: { correo_1: correo } },
      relations: ['empleadoCentroTrabajo'],
    });

    if (!usuario) {
      throw new NotFoundException('Usuario no encontrado.');
    }

    // 🔐 Encriptar nueva contraseña
    const hashedPassword = await bcrypt.hash(nuevaContrasena, 10);
    usuario.contrasena = hashedPassword;

    await this.usuarioEmpresaRepository.save(usuario);

    // 🚀 Eliminar OTP después del uso
    this.otpStore.delete(correo);

    return { message: 'Contraseña actualizada correctamente.' };
  }

  async obtenerDetallePagoPlanilla(): Promise<any[]> {
    const planillaQuery = `
        SELECT
            p."ID_PLANILLA" AS "id_planilla",
            tp."NOMBRE_PLANILLA" AS "tipo_planilla",
            TO_CHAR(p."PERIODO_FINALIZACION", 'YYYYMMDD') AS "fecha_pago_planilla"
        FROM "NET_PLANILLA" p
        JOIN "NET_TIPO_PLANILLA" tp ON p."ID_TIPO_PLANILLA" = tp."ID_TIPO_PLANILLA"
        WHERE p."ESTADO" = 'ENVIADO A BANCO'
    `;

    const pagosQuery = `
        SELECT
            dp."ID_PLANILLA",
            persona."N_IDENTIFICACION" AS "numero_identificacion",
            persona."ID_PERSONA" AS "id_persona",
            banco."CODIGO_ACH" AS "codigo_banco_ach",
            personaPorBanco."NUM_CUENTA" AS "numero_cuenta",
            SUM(dp."MONTO_A_PAGAR") AS "monto"
        FROM "NET_DETALLE_PAGO_BENEFICIO" dp
        JOIN "NET_PERSONA_POR_BANCO" personaPorBanco ON dp."ID_AF_BANCO" = personaPorBanco."ID_AF_BANCO"
        JOIN "NET_BANCO" banco ON personaPorBanco."ID_BANCO" = banco."ID_BANCO"
        JOIN "NET_PERSONA" persona ON personaPorBanco."ID_PERSONA" = persona."ID_PERSONA"
        JOIN "NET_PLANILLA" planilla ON dp."ID_PLANILLA" = planilla."ID_PLANILLA"
        WHERE planilla."ESTADO" = 'ENVIADO A BANCO'
        AND dp."ESTADO" = 'ENVIADO A BANCO'
        GROUP BY dp."ID_PLANILLA", persona."N_IDENTIFICACION", persona."ID_PERSONA", banco."CODIGO_ACH", personaPorBanco."NUM_CUENTA"
    `;

    const deduccionesQuery = `
        SELECT 
            dd."ID_PLANILLA",
            dd."ID_PERSONA", 
            SUM(dd."MONTO_APLICADO") AS "total_deducciones"
        FROM "NET_DETALLE_DEDUCCION" dd
        JOIN "NET_PLANILLA" p ON dd."ID_PLANILLA" = p."ID_PLANILLA"
        WHERE p."ESTADO" = 'ENVIADO A BANCO'
        AND dd."ESTADO_APLICACION" = 'ENVIADO A BANCO'
        GROUP BY dd."ID_PLANILLA", dd."ID_PERSONA"
    `;

    const mesesMap = new Map([
      [1, "ENERO"], [2, "FEBRERO"], [3, "MARZO"], [4, "ABRIL"],
      [5, "MAYO"], [6, "JUNIO"], [7, "JULIO"], [8, "AGOSTO"],
      [9, "SEPTIEMBRE"], [10, "OCTUBRE"], [11, "NOVIEMBRE"], [12, "DICIEMBRE"]
    ]);

    try {
      const planillas = await this.entityManager.query(planillaQuery);
      const pagos = await this.entityManager.query(pagosQuery);
      const deducciones = await this.entityManager.query(deduccionesQuery);

      if (!planillas.length) {
        return [{ message: 'NO SE ENCONTRARON PLANILLAS POR PAGAR.' }];
      }

      // 📌 Crear mapas de pagos y deducciones para optimizar búsquedas
      const pagosPorPlanilla = new Map();
      pagos.forEach(pago => {
        if (!pagosPorPlanilla.has(pago.ID_PLANILLA)) {
          pagosPorPlanilla.set(pago.ID_PLANILLA, []);
        }
        pagosPorPlanilla.get(pago.ID_PLANILLA).push(pago);
      });

      const deduccionesPorPlanilla = new Map();
      deducciones.forEach(deduccion => {
        if (!deduccionesPorPlanilla.has(deduccion.ID_PLANILLA)) {
          deduccionesPorPlanilla.set(deduccion.ID_PLANILLA, []);
        }
        deduccionesPorPlanilla.get(deduccion.ID_PLANILLA).push(deduccion);
      });

      return planillas.map(planilla => {
        const pagosPlanilla = pagosPorPlanilla.get(planilla.id_planilla) || [];
        const deduccionesPlanilla = deduccionesPorPlanilla.get(planilla.id_planilla) || [];

        const totalPagos = pagosPlanilla.reduce((acc, curr) => acc + (curr.monto || 0), 0);
        const totalDeducciones = deduccionesPlanilla.reduce((acc, curr) => acc + (curr.total_deducciones || 0), 0);
        const montoTotalFinal = totalPagos - totalDeducciones;

        // 📌 Convertir fecha para obtener descripción correcta
        const mes = parseInt(planilla.fecha_pago_planilla.substring(4, 6), 10);
        const anio = planilla.fecha_pago_planilla.substring(0, 4);
        const descripcion = `PENSIÓN MES DE ${mesesMap.get(mes) || "DESCONOCIDO"} ${anio}`;

        if (pagosPlanilla.length === 0) {
          return {
            id_planilla: planilla.id_planilla,
            tipo_planilla: `PLANILLA ${planilla.tipo_planilla.toUpperCase()}`,
            descripcion,
            fecha_pago_planilla: planilla.fecha_pago_planilla,
            monto_total: 0,
            total_registros: 0,
            moneda: 'HNL',
            message: "NO HAY PAGOS REGISTRADOS PARA ESTA PLANILLA.",
            pagos: []
          };
        }

        return {
          id_planilla: planilla.id_planilla,
          tipo_planilla: `PLANILLA ${planilla.tipo_planilla.toUpperCase()}`,
          descripcion,
          fecha_pago_planilla: planilla.fecha_pago_planilla,
          monto_total: parseFloat(montoTotalFinal.toFixed(2)),
          total_registros: pagosPlanilla.length,
          moneda: 'HNL',
          pagos: pagosPlanilla
            .map((pago) => {
              const deduccion = deduccionesPlanilla.find(d => d.ID_PERSONA === pago.id_persona) || { total_deducciones: 0 };
              return {
                numero_identificacion: pago.numero_identificacion,
                numero_cuenta: pago.numero_cuenta,
                monto: parseFloat((pago.monto - deduccion.total_deducciones).toFixed(2)),
                codigo_banco_ach: pago.codigo_banco_ach,
              };
            })
            .filter(pago => pago.monto > 0),
        };
      });
    } catch (error) {
      console.error('ERROR AL OBTENER LOS DETALLES DE PAGO POR PLANILLA:', error);
      throw new InternalServerErrorException({
        statusCode: 500,
        message: "ERROR AL OBTENER LOS DETALLES DE PAGO POR PLANILLA.",
        error: error.message,
      });
    }
  }

  async procesarPagos(datos: ResultadosPagosDto): Promise<any> {
    const {
      id_planilla,
      fecha_procesamiento,
      total_pagos_exitosos,
      monto_pagos_exitosos,
      total_pagos_fallidos,
      monto_pagos_fallidos,
      pagos_fallidos,
    } = datos;

    if (!id_planilla || !fecha_procesamiento || !Array.isArray(pagos_fallidos)) {
      throw new BadRequestException({
        statusCode: 400,
        message: 'Datos inválidos. Verifique los datos enviados.',
      });
    }

    try {
      // ✅ Obtener todas las personas de la planilla
      const pagosQuery = `
            SELECT persona."ID_PERSONA", persona."N_IDENTIFICACION"
            FROM "NET_DETALLE_PAGO_BENEFICIO" dp
            JOIN "NET_PERSONA_POR_BANCO" personaPorBanco ON dp."ID_AF_BANCO" = personaPorBanco."ID_AF_BANCO"
            JOIN "NET_PERSONA" persona ON personaPorBanco."ID_PERSONA" = persona."ID_PERSONA"
            JOIN "NET_PLANILLA" planilla ON dp."ID_PLANILLA" = planilla."ID_PLANILLA"
            WHERE planilla."ID_PLANILLA" = :1
            AND planilla."ESTADO" = 'ENVIADO A BANCO'
            AND dp."ESTADO" = 'ENVIADO A BANCO'
        `;

      const personasPlanilla = await this.entityManager.query(pagosQuery, [id_planilla]);
      const identificacionesPersonasPlanilla = personasPlanilla.map(p => p.N_IDENTIFICACION);

      if (!identificacionesPersonasPlanilla.length) {
        return {
          statusCode: 400,
          message: `No hay personas asociadas a la planilla ${id_planilla} para procesar pagos.`,
        };
      }

      // ✅ Obtener los ID_PERSONA de pagos fallidos
      const idsPagosFallidos = pagos_fallidos.map(p => p.numero_identificacion);

      // ✅ Filtrar pagos exitosos (los que no están en la lista de fallidos)
      const idsPagosExitosos = identificacionesPersonasPlanilla.filter(id => !idsPagosFallidos.includes(id));

      // ✅ Registrar el historial de pagos si no existe
      const historialExistente = await this.historialPagoPlanillaRepository.findOne({ where: { id_planilla } });
      if (!historialExistente) {
        await this.historialPagoPlanillaRepository.save({
          id_planilla,
          fecha_procesamiento,
          total_pagos_exitosos,
          monto_pagos_exitosos,
          total_pagos_fallidos,
          monto_pagos_fallidos,
        });
      }

      if (pagos_fallidos.length > 0) {
        const pagosFallidosRecords = pagos_fallidos.map((pago) => ({
          id_planilla,
          fecha_procesamiento,
          numero_identificacion: pago.numero_identificacion,
          motivo_fallo: pago.motivo_fallo,
        }));
        await this.historialPagosFallidosRepository.save(pagosFallidosRecords);

        if (idsPagosFallidos.length > 0) {
          const placeholdersFallidos = idsPagosFallidos.map((_, i) => `:${i + 2}`).join(', ');
          await this.entityManager.query(
            `UPDATE "NET_DETALLE_PAGO_BENEFICIO"
                    SET "ESTADO" = 'RECHAZADO', "OBSERVACION" = 'ERROR EN EL PAGO'
                    WHERE "ID_PLANILLA" = :1
                    AND "ID_PERSONA" IN (
                        SELECT "ID_PERSONA" FROM "NET_PERSONA" WHERE "N_IDENTIFICACION" IN (${placeholdersFallidos})
                    )`,
            [id_planilla, ...idsPagosFallidos]
          );

          await this.entityManager.query(
            `UPDATE "NET_DETALLE_DEDUCCION"
                    SET "ESTADO_APLICACION" = 'RECHAZADO'
                    WHERE "ID_PLANILLA" = :1
                    AND "ID_PERSONA" IN (
                        SELECT "ID_PERSONA" FROM "NET_PERSONA" WHERE "N_IDENTIFICACION" IN (${placeholdersFallidos})
                    )`,
            [id_planilla, ...idsPagosFallidos]
          );
        }
      }

      await this.entityManager.query(
        `UPDATE "NET_PLANILLA"
            SET "FECHA_CIERRE" = TO_DATE(:1, 'YYYYMMDD'),
                "ESTADO" = 'CERRADA'
            WHERE "ID_PLANILLA" = :2`,
        [fecha_procesamiento, id_planilla]
      );

      if (idsPagosExitosos.length > 0) {
        const placeholdersExitosos = idsPagosExitosos.map((_, i) => `:${i + 2}`).join(', ');
        await this.entityManager.query(
          `UPDATE "NET_DETALLE_PAGO_BENEFICIO"
                SET "ESTADO" = 'PAGADA'
                WHERE "ID_PLANILLA" = :1
                AND "ID_PERSONA" IN (
                    SELECT "ID_PERSONA" FROM "NET_PERSONA" WHERE "N_IDENTIFICACION" IN (${placeholdersExitosos})
                )`,
          [id_planilla, ...idsPagosExitosos]
        );

        await this.entityManager.query(
          `UPDATE "NET_DETALLE_DEDUCCION"
                SET "ESTADO_APLICACION" = 'COBRADA'
                WHERE "ID_PLANILLA" = :1
                AND "ID_PERSONA" IN (
                    SELECT "ID_PERSONA" FROM "NET_PERSONA" WHERE "N_IDENTIFICACION" IN (${placeholdersExitosos})
                )`,
          [id_planilla, ...idsPagosExitosos]
        );
      }

      return {
        statusCode: 200,
        message: 'Los pagos han sido procesados correctamente.',
      };
    } catch (error) {
      console.error('Error al procesar pagos:', error);

      if (error instanceof BadRequestException) {
        throw error;
      }

      throw new InternalServerErrorException({
        statusCode: 500,
        message: `Error interno al procesar los pagos de la planilla ${id_planilla}. Inténtelo más tarde.`,
      });
    }
  }

  async procesarPagosPendientes(datos: NotificacionPagosPendientesDto): Promise<any> {
    const {
        numero_identificacion,
        numero_cuenta,
        fecha_actualizacion,
        codigo_banco_ach,
        pagos_acumulados,
        monto_pagado,
        monto_total_pagado,
        descripcion_resolucion,
    } = datos;

    if (!pagos_acumulados.length) {
        throw new BadRequestException({
            statusCode: 400,
            message: 'Debe proporcionar al menos un ID de planilla en pagos acumulados.',
        });
    }

    try {
        // ✅ 1. Buscar ID_PERSONA
        const persona = await this.personaRepository.findOne({
            where: { n_identificacion: numero_identificacion },
        });

        if (!persona) {
            throw new BadRequestException({
                statusCode: 404,
                message: `No se encontró una persona con el número de identificación ${numero_identificacion}.`,
            });
        }

        const idPersona = persona.id_persona;

        // ✅ 2. Obtener los ID_PLANILLA que ya han sido pagados para esta persona
        const idPlanillasArray = pagos_acumulados.map(pago => pago.id_planilla);

        // 📌 Construir dinámicamente los placeholders para Oracle
        const placeholders = idPlanillasArray.map((_, i) => `:${i + 2}`).join(', ');

        const queryPagadas = `
            SELECT "ID_PLANILLA" FROM "NET_DETALLE_PAGO_BENEFICIO"
            WHERE "ID_PERSONA" = :1
            AND "ID_PLANILLA" IN (${placeholders})
            AND "ESTADO" = 'PAGADA'
        `;

        const pagosYaPagados = await this.entityManager.query(queryPagadas, [idPersona, ...idPlanillasArray]);

        if (pagosYaPagados.length > 0) {
          // 📌 Convertir a un array de valores únicos con Set
          const planillasUnicas = [...new Set(pagosYaPagados.map(p => p.ID_PLANILLA))];
      
          throw new BadRequestException({
              statusCode: 400,
              message: `La persona con identificación ${numero_identificacion} ya tiene pagos registrados en estado 'PAGADA' para las planillas: ${planillasUnicas.join(', ')}.`,
          });
      }
      

        // ✅ 3. Verificar si el banco existe
        const banco = await this.bancoRepository.findOne({
            where: { id_banco: codigo_banco_ach },
        });

        if (!banco) {
            throw new BadRequestException({
                statusCode: 400,
                message: `No se encontró un banco con el código ${codigo_banco_ach}.`,
            });
        }

        // ✅ 4. Buscar si la cuenta bancaria ya existe y activarla si es necesario
        let cuentaBancaria = await this.personaPorBancoRepository.findOne({
            where: {
                persona: { id_persona: idPersona },
                num_cuenta: numero_cuenta,
                banco: { id_banco: banco.id_banco },
            },
        });

        let idAfBanco;
        if (cuentaBancaria) {
            // ✅ Si la cuenta ya existe, actualizar su estado a ACTIVO y fecha de activación
            await this.personaPorBancoRepository.update(
                { id_af_banco: cuentaBancaria.id_af_banco },
                { estado: 'ACTIVO', fecha_activacion: new Date(), fecha_inactivacion: null }
            );
            idAfBanco = cuentaBancaria.id_af_banco;
        } else {
            // ✅ Si la cuenta no existe, crearla y activarla
            cuentaBancaria = this.personaPorBancoRepository.create({
                persona: persona,
                num_cuenta: numero_cuenta,
                banco: banco,
                estado: 'ACTIVO',
                fecha_activacion: new Date(),
            });

            const nuevaCuenta = await this.personaPorBancoRepository.save(cuentaBancaria);
            idAfBanco = nuevaCuenta.id_af_banco;
        }

        // ✅ 5. Desactivar todas las demás cuentas bancarias del usuario, excepto la actual
        await this.personaPorBancoRepository.update(
            { persona: { id_persona: idPersona }, id_af_banco: Not(idAfBanco) },
            { estado: 'INACTIVO', fecha_inactivacion: new Date() }
        );

        // ✅ 6. Actualizar pagos (beneficios y deducciones) para cada ID_PLANILLA
        const idPlanillasString = idPlanillasArray.join(',');

        for (const idPlanilla of idPlanillasArray) {
            // ✅ 6.1 Actualizar beneficios a "PAGADA" y cambiar el ID_AF_BANCO
            await this.entityManager.query(
                `UPDATE "NET_DETALLE_PAGO_BENEFICIO"
                SET "ESTADO" = 'PAGADA', "ID_AF_BANCO" = :1
                WHERE "ID_PLANILLA" = :2 AND "ID_PERSONA" = :3`,
                [idAfBanco, idPlanilla, idPersona]
            );

            // ✅ 6.2 Actualizar deducciones a "COBRADA"
            await this.entityManager.query(
                `UPDATE "NET_DETALLE_DEDUCCION"
                SET "ESTADO_APLICACION" = 'COBRADA', "ID_AF_BANCO" = :1
                WHERE "ID_PLANILLA" = :2 AND "ID_PERSONA" = :3`,
                [idAfBanco, idPlanilla, idPersona]
            );
        }

        // ✅ 7. Registrar en historial de pagos pendientes
        await this.historialPagosPendientesRepository.save({
            id_persona: idPersona,
            id_af_banco: idAfBanco,
            monto_pagado,
            monto_total_pagado,
            descripcion_resolucion,
            id_planillas: idPlanillasString,
            fecha_actualizacion: fecha_actualizacion,
        });

        return {
            statusCode: 200,
            message: 'Los pagos pendientes fueron procesados correctamente y registrados en el historial.',
        };
    } catch (error) {
      if (!(error instanceof BadRequestException)) {
          console.error('Error al procesar pagos pendientes:', error);
      }
  
      throw error instanceof BadRequestException
          ? error
          : new InternalServerErrorException({
              statusCode: 500,
              message: `Error interno al procesar los pagos pendientes: ${error.message}`,
          });
  }
  
}



}
