import { BadRequestException, Injectable, InternalServerErrorException, NotFoundException, UnauthorizedException } from '@nestjs/common';
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
import { CuadrePlanillasDto } from './dto/cuadre-planillas.dto';
import { NetHistorialCuadrePlanillas } from './entities/net_historial_cuadre_planillas.entity';

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
    const otp = crypto.randomInt(100000, 999999).toString();
    const expiration = Date.now() + 5 * 60 * 1000;

    this.otpStore.set(correo, { otp, expiration });

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
    const hashedPassword = await bcrypt.hash(nuevaContrasena, 10);
    usuario.contrasena = hashedPassword;

    await this.usuarioEmpresaRepository.save(usuario);
    this.otpStore.delete(correo);

    return { message: 'Contraseña actualizada correctamente.' };
  }

  async obtenerDetallePagoPlanilla(): Promise<any[]> {
    console.log('Prueba obtener planilla');
    
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
            COALESCE(banco."CODIGO_ACH", ' ') AS "codigo_banco_ach",
            COALESCE(TRIM(personaPorBanco."NUM_CUENTA"), ' ') AS "numero_cuenta",
            dp."ID_AF_BANCO",
            SUM(dp."MONTO_A_PAGAR") AS "monto",
            TRIM(
                REGEXP_REPLACE(
                    NVL(persona."PRIMER_NOMBRE", '') || ' ' ||
                    NVL(persona."SEGUNDO_NOMBRE", '') || ' ' ||
                    NVL(persona."TERCER_NOMBRE", '') || ' ' ||
                    NVL(persona."PRIMER_APELLIDO", '') || ' ' ||
                    NVL(persona."SEGUNDO_APELLIDO", ''),
                    ' +', ' '
                )
            ) AS "nombre_titular"
        FROM "NET_DETALLE_PAGO_BENEFICIO" dp
        LEFT JOIN "NET_PERSONA" persona 
            ON dp."ID_PERSONA" = persona."ID_PERSONA"
        LEFT JOIN "NET_PERSONA_POR_BANCO" personaPorBanco 
            ON dp."ID_AF_BANCO" = personaPorBanco."ID_AF_BANCO"
        LEFT JOIN "NET_BANCO" banco 
            ON personaPorBanco."ID_BANCO" = banco."ID_BANCO"
        JOIN "NET_PLANILLA" planilla 
            ON dp."ID_PLANILLA" = planilla."ID_PLANILLA"
        WHERE planilla."ESTADO" = 'ENVIADO A BANCO'
            AND dp."ESTADO" = 'ENVIADO A BANCO'
        GROUP BY dp."ID_PLANILLA", persona."N_IDENTIFICACION", persona."ID_PERSONA", 
            banco."CODIGO_ACH", personaPorBanco."NUM_CUENTA", dp."ID_AF_BANCO",
            persona."PRIMER_NOMBRE", persona."SEGUNDO_NOMBRE", persona."TERCER_NOMBRE",
            persona."PRIMER_APELLIDO", persona."SEGUNDO_APELLIDO"
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
            AND EXISTS (
                SELECT 1 
                FROM "NET_DETALLE_PAGO_BENEFICIO" dp
                WHERE dp."ID_PERSONA" = dd."ID_PERSONA"
                    AND dp."ID_PLANILLA" = dd."ID_PLANILLA"
                    AND dp."ESTADO" = 'ENVIADO A BANCO'
            )
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
                nombre_titular: pago.nombre_titular,
                numero_cuenta: pago.numero_cuenta.trim(),
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
            errors: {
                id_planilla: id_planilla || "FALTA",
                fecha_procesamiento: fecha_procesamiento || "FALTA",
                pagos_fallidos: Array.isArray(pagos_fallidos) ? "OK" : "NO ES UN ARRAY",
            }
        });
    }

    try {
        const errores: string[] = [];

        const historialExistente = await this.historialPagoPlanillaRepository.findOne({ where: { id_planilla } });

        if (historialExistente) {
            throw new BadRequestException({
                statusCode: 400,
                message: `La planilla ${id_planilla} ya ha sido procesada previamente y no puede volver a procesarse.`,
            });
        }
        const detallePlanilla = await this.obtenerDetallePagoPlanilla();
        const planillaActual = detallePlanilla.find(p => p.id_planilla === id_planilla);

        if (!planillaActual) {
            throw new BadRequestException({
                statusCode: 400,
                message: `No se encontraron detalles de pago para la planilla con ID ${id_planilla}.`,
            });
        }

        const { total_registros, monto_total } = planillaActual;

        // 📌 Validaciones de coherencia
        const totalPagosCalculado = total_pagos_exitosos + total_pagos_fallidos;
        if (totalPagosCalculado !== total_registros) {
            errores.push(
                `El total de pagos registrados (${totalPagosCalculado}) no coincide con el total de registros en la planilla (${total_registros}).`
            );
        }

        const montoPagosCalculado = (monto_pagos_exitosos + monto_pagos_fallidos).toFixed(2);
        if (montoPagosCalculado !== monto_total.toFixed(2)) {
            errores.push(
                `El monto total de pagos (${montoPagosCalculado}) no coincide con el monto total esperado (${monto_total.toFixed(2)}).`
            );
        }

        if (pagos_fallidos.length !== total_pagos_fallidos) {
            errores.push(
                `Cantidad de pagos fallidos incorrecta: el total_pagos_fallidos es ${total_pagos_fallidos}, pero pagos_fallidos tiene ${pagos_fallidos.length} objetos.`
            );
        }
        const pagosQuery = `
            SELECT persona."ID_PERSONA", persona."N_IDENTIFICACION"
            FROM "NET_DETALLE_PAGO_BENEFICIO" dp
            JOIN "NET_PERSONA" persona ON dp."ID_PERSONA" = persona."ID_PERSONA"
            WHERE dp."ID_PLANILLA" = :1
            AND dp."ESTADO" = 'ENVIADO A BANCO'
        `;

        const personasPlanilla = await this.entityManager.query(pagosQuery, [id_planilla.toString()]);
        const identificacionesPersonasPlanilla = personasPlanilla.map(p => p.N_IDENTIFICACION);

        if (!identificacionesPersonasPlanilla.length) {
            throw new BadRequestException({
                statusCode: 400,
                message: `No hay personas asociadas a la planilla ${id_planilla} para procesar pagos.`,
            });
        }

        const idsPagosFallidos = pagos_fallidos.map(p => p.numero_identificacion);
        const idsPagosExitosos = identificacionesPersonasPlanilla.filter(id => !idsPagosFallidos.includes(id));
        const pagosFallidosInvalidos = idsPagosFallidos.filter(id => !identificacionesPersonasPlanilla.includes(id));

        if (pagosFallidosInvalidos.length > 0) {
            errores.push(
                `Los siguientes pagos fallidos NO pertenecen a la planilla ${id_planilla}: ${pagosFallidosInvalidos.join(', ')}.`
            );
        }

        if (errores.length > 0) {
            throw new BadRequestException({
                statusCode: 400,
                message: "No se procesó ningún pago debido a los siguientes errores.",
                errors: errores,
            });
        }

        // 📌 Guardar en el historial de pagos de la planilla
        await this.historialPagoPlanillaRepository.save({
            id_planilla,
            fecha_procesamiento,
            total_pagos_exitosos,
            monto_pagos_exitosos,
            total_pagos_fallidos,
            monto_pagos_fallidos,
        });

        if (pagos_fallidos.length > 0) {
          const pagosFallidosRecords = pagos_fallidos.map((pago) => ({
              id_planilla,
              fecha_procesamiento,
              numero_identificacion: pago.numero_identificacion,
              motivo_fallo: pago.motivo_fallo,
          }));

          await this.historialPagosFallidosRepository.save(pagosFallidosRecords);

          // 📌 Actualizar pagos fallidos en la base de datos
          await this.actualizarPagosFallidos(id_planilla.toString(), idsPagosFallidos);
      }

        // 📌 Registrar pagos exitosos
        if (idsPagosExitosos.length > 0) {
          await this.actualizarPagosExitosos(id_planilla.toString(), idsPagosExitosos);
      }

        // 📌 Cerrar la planilla
        await this.entityManager.query(
            `UPDATE "NET_PLANILLA"
                SET "FECHA_CIERRE" = TO_DATE(:1, 'YYYYMMDD'),
                    "ESTADO" = 'CERRADA'
                WHERE "ID_PLANILLA" = :2`,
            [fecha_procesamiento, id_planilla.toString()]
        );

        return {
            statusCode: 200,
            message: `Los pagos de la planilla ${id_planilla} han sido procesados correctamente.`,
        };

    } catch (error) {
        console.error('⚠️ Error al procesar pagos:', error);

        if (error instanceof BadRequestException) {
            throw error;
        }

        throw new InternalServerErrorException({
            statusCode: 500,
            message: `Error interno al procesar los pagos de la planilla ${id_planilla}.`,
            error: error.message,
        });
    }
}


async actualizarPagosFallidos(id_planilla: string, idsPagosFallidos: string[]) {
    const batchSize = 1000;
    for (let i = 0; i < idsPagosFallidos.length; i += batchSize) {
        const batch = idsPagosFallidos.slice(i, i + batchSize);
        const placeholders = batch.map((_, index) => `:${index + 2}`).join(", ");

        await this.entityManager.query(
            `UPDATE "NET_DETALLE_PAGO_BENEFICIO"
             SET "ESTADO" = 'RECHAZADO', "OBSERVACION" = 'ERROR EN EL PAGO'
             WHERE "ID_PLANILLA" = :1
             AND "ID_PERSONA" IN (
                 SELECT "ID_PERSONA" FROM "NET_PERSONA" WHERE "N_IDENTIFICACION" IN (${placeholders})
             )`,
            [id_planilla, ...batch]
        );

        await this.entityManager.query(
            `UPDATE "NET_DETALLE_DEDUCCION"
             SET "ESTADO_APLICACION" = 'RECHAZADO'
             WHERE "ID_PLANILLA" = :1
             AND "ID_PERSONA" IN (
                 SELECT "ID_PERSONA" FROM "NET_PERSONA" WHERE "N_IDENTIFICACION" IN (${placeholders})
             )`,
            [id_planilla, ...batch]
        );
    }
}

async actualizarPagosExitosos(id_planilla: string, idsPagosExitosos: string[]) {
    const batchSize = 1000;
    for (let i = 0; i < idsPagosExitosos.length; i += batchSize) {
        const batch = idsPagosExitosos.slice(i, i + batchSize);
        const placeholders = batch.map((_, index) => `:${index + 2}`).join(", ");

        await this.entityManager.query(
            `UPDATE "NET_DETALLE_PAGO_BENEFICIO"
             SET "ESTADO" = 'PAGADA'
             WHERE "ID_PLANILLA" = :1
             AND "ID_PERSONA" IN (
                 SELECT "ID_PERSONA" FROM "NET_PERSONA" WHERE "N_IDENTIFICACION" IN (${placeholders})
             )`,
            [id_planilla, ...batch]
        );

        await this.entityManager.query(
            `UPDATE "NET_DETALLE_DEDUCCION"
             SET "ESTADO_APLICACION" = 'COBRADA'
             WHERE "ID_PLANILLA" = :1
             AND "ID_PERSONA" IN (
                 SELECT "ID_PERSONA" FROM "NET_PERSONA" WHERE "N_IDENTIFICACION" IN (${placeholders})
             )`,
            [id_planilla, ...batch]
        );
    }
}

  async procesarPagosPendientes(datos: NotificacionPagosPendientesDto[]): Promise<any> {
    if (!Array.isArray(datos) || datos.length === 0) {
      throw new BadRequestException({
        statusCode: 400,
        message: 'Debe proporcionar al menos un pago pendiente en el arreglo.',
      });
    }

    const erroresGlobales: string[] = [];
    const pagosProcesados: any[] = [];

    // 📌 Validar que no haya pagos duplicados (misma persona en la misma planilla)
    const pagosSet = new Set();
    for (const pago of datos) {
      const { numero_identificacion, pagos_acumulados } = pago;

      // Validar que todas las propiedades estén definidas
      const propiedadesObligatorias = [
        'numero_identificacion', 'numero_cuenta', 'fecha_actualizacion',
        'codigo_banco_ach', 'monto_pagado', 'monto_total_pagado', 'descripcion_resolucion', 'pagos_acumulados'
      ];

      const faltantes = propiedadesObligatorias.filter(prop => pago[prop] === undefined || pago[prop] === null);

      if (faltantes.length > 0) {
        throw new BadRequestException({
          statusCode: 400,
          message: `Faltan las siguientes propiedades obligatorias en el objeto de identidad ${pago.numero_identificacion}: ${faltantes.join(', ')}.`,
        });
      }

      // Validar que cada objeto dentro de pagos_acumulados tenga id_planilla
      if (!Array.isArray(pagos_acumulados) || pagos_acumulados.length === 0) {
        throw new BadRequestException({
          statusCode: 400,
          message: `El usuario ${pago.numero_identificacion} no tiene pagos acumulados.`,
        });
      }

      for (const p of pagos_acumulados) {
        if (!p.id_planilla) {
          throw new BadRequestException({
            statusCode: 400,
            message: `Falta el campo id_planilla en el objeto pagos_acumulados del usuario ${numero_identificacion}.`,
          });
        }

        // Generar clave única para verificar duplicados (persona + planilla)
        const claveUnica = `${numero_identificacion}-${p.id_planilla}`;
        if (pagosSet.has(claveUnica)) {
          throw new BadRequestException({
            statusCode: 400,
            message: `Se encontró un pago duplicado para la identidad ${numero_identificacion} en la planilla ${p.id_planilla}.`,
          });
        }
        pagosSet.add(claveUnica);
      }
    }

    try {
      for (const pago of datos) {
        const {
          numero_identificacion,
          numero_cuenta,
          fecha_actualizacion,
          codigo_banco_ach,
          pagos_acumulados,
          monto_pagado,
          monto_total_pagado,
          descripcion_resolucion,
        } = pago;

        try {
          const persona = await this.personaRepository.findOne({ where: { n_identificacion: numero_identificacion } });
          if (!persona) {
            erroresGlobales.push(`No se encontró una persona con el número de identificación ${numero_identificacion}.`);
            continue;
          }
          const idPersona = persona.id_persona;

          const idPlanillasArray = pagos_acumulados.map(p => p.id_planilla);
          const placeholders = idPlanillasArray.map((_, i) => `:${i + 2}`).join(', ');

          const errores: string[] = [];
          const queryBeneficio = `
                    SELECT "ID_PLANILLA" FROM "NET_DETALLE_PAGO_BENEFICIO"
                    WHERE "ID_PERSONA" = :1
                    AND "ID_PLANILLA" IN (${placeholders})
                `;
          const beneficiosEncontrados = await this.entityManager.query(queryBeneficio, [idPersona, ...idPlanillasArray]);

          const planillasNoRelacionadas = idPlanillasArray.filter(
            id => !beneficiosEncontrados.some(p => p.ID_PLANILLA === id)
          );

          if (planillasNoRelacionadas.length > 0) {
            errores.push(`Identidad ${numero_identificacion}: No tiene pagos registrados en las siguientes planillas: ${planillasNoRelacionadas.join(', ')}.`);
          }

          const queryPagadas = `
              SELECT "ID_PLANILLA" FROM "NET_DETALLE_PAGO_BENEFICIO"
              WHERE "ID_PERSONA" = :1
              AND "ID_PLANILLA" IN (${placeholders})
              AND "ESTADO" = 'PAGADA'
          `;
          const pagosYaPagados = await this.entityManager.query(queryPagadas, [idPersona, ...idPlanillasArray]);

          if (pagosYaPagados.length > 0) {
              const planillasPagadas = [...new Set(pagosYaPagados.map(p => p.ID_PLANILLA))];
              errores.push(`Identidad ${numero_identificacion}: Las siguientes planillas ya han sido procesadas previamente: ${planillasPagadas.join(', ')}.`);
          }

          if (errores.length > 0) {
            erroresGlobales.push(...errores);
            continue;
          }

          const banco = await this.bancoRepository.findOne({ where: { codigo_ach: String(codigo_banco_ach) } });

          if (!banco) {
              erroresGlobales.push(`Identidad ${numero_identificacion}: No se encontró un banco con el código ${codigo_banco_ach}.`);
              continue;
          }

          let cuentaBancaria = await this.personaPorBancoRepository.findOne({
              where: {
                  persona: { id_persona: idPersona },
                  num_cuenta: numero_cuenta,
                  banco: { id_banco: banco.id_banco },
              },
          });

          let idAfBanco;
          if (cuentaBancaria) {
              await this.personaPorBancoRepository.update(
                  { id_af_banco: cuentaBancaria.id_af_banco },
                  { estado: 'ACTIVO', fecha_activacion: new Date(), fecha_inactivacion: null }
              );
              idAfBanco = cuentaBancaria.id_af_banco;
          } else {
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

          await this.personaPorBancoRepository.update(
              { persona: { id_persona: idPersona }, id_af_banco: Not(idAfBanco) },
              { estado: 'INACTIVO', fecha_inactivacion: new Date() }
          );

          for (const idPlanilla of idPlanillasArray) {
            await this.entityManager.query(
                `UPDATE "NET_DETALLE_PAGO_BENEFICIO"
                    SET "ESTADO" = 'PAGADA', "ID_AF_BANCO" = :1
                    WHERE "ID_PLANILLA" = :2 AND "ID_PERSONA" = :3`,
                [idAfBanco, idPlanilla, idPersona]
            );

            await this.entityManager.query(
              `UPDATE "NET_DETALLE_DEDUCCION"
                  SET "ESTADO_APLICACION" = 'COBRADA', "ID_AF_BANCO" = :1
                  WHERE "ID_PLANILLA" = :2 AND "ID_PERSONA" = :3`,
              [idAfBanco, idPlanilla, idPersona]
          );
        }

          await this.historialPagosPendientesRepository.save({
            id_persona: idPersona,
            id_af_banco: idAfBanco,
            monto_pagado,
            monto_total_pagado,
            descripcion_resolucion,
            id_planillas: idPlanillasArray.join(','),
            fecha_actualizacion: fecha_actualizacion,
          });

          pagosProcesados.push({
            numero_identificacion,
            id_planillas: idPlanillasArray,
            monto_pagado,
          });
        } catch (error) {
          erroresGlobales.push(`Error procesando pago para ${numero_identificacion}: ${error.message}`);
        }
      }

      if (erroresGlobales.length > 0) {
        if (datos.length === 1) {
            throw new BadRequestException({
                statusCode: 400,
                message: "El pago no se procesó correctamente.",
                errors: erroresGlobales,
            });
        }
        throw new BadRequestException({
            statusCode: 400,
            message: "Algunos pagos no se procesaron correctamente.",
            detalles: {
                pagos_exitosos: pagosProcesados.length,
                pagos_fallidos: erroresGlobales.length,
            },
            errors: erroresGlobales,
        });
    }
      return {
        statusCode: 200,
        message: 'Todos los pagos pendientes fueron procesados correctamente.'
      };
    } catch (error) {
      throw error instanceof BadRequestException
          ? error
          : new InternalServerErrorException({
              statusCode: 500,
              message: `Error interno al procesar los pagos pendientes: ${error.message}`,
          });
  }
  }

  async procesarCuadrePlanillas(datos: CuadrePlanillasDto): Promise<any> {
    if (!datos || !Array.isArray(datos.planillas_en_proceso) || datos.planillas_en_proceso.length === 0) {
        throw new BadRequestException({
            statusCode: 400,
            message: 'Debe proporcionar al menos una planilla en proceso.',
        });
    }

    try {
        const fechaCierre = datos.fecha_cierre;
        const planillasConDiferencias: any[] = [];
        const planillaIds = datos.planillas_en_proceso.map(p => p.id_planilla);

        if (planillaIds.length === 0) {
            throw new BadRequestException({
                statusCode: 400,
                message: "No se proporcionaron planillas válidas.",
            });
        }

        const planillaQuery = `
            SELECT
                p."ID_PLANILLA" AS "id_planilla",
                tp."NOMBRE_PLANILLA" AS "tipo_planilla"
            FROM "NET_PLANILLA" p
            JOIN "NET_TIPO_PLANILLA" tp ON p."ID_TIPO_PLANILLA" = tp."ID_TIPO_PLANILLA"
            WHERE p."ID_PLANILLA" IN (${planillaIds.join(", ")})
        `;

        const pagosQuery = `
            SELECT
                dp."ID_PLANILLA",
                dp."ID_PERSONA",
                SUM(dp."MONTO_A_PAGAR") AS "monto"
            FROM "NET_DETALLE_PAGO_BENEFICIO" dp
            WHERE dp."ID_PLANILLA" IN (${planillaIds.join(", ")})
            AND dp."ESTADO" = 'RECHAZADO'
            GROUP BY dp."ID_PLANILLA", dp."ID_PERSONA"
        `;

        const deduccionesQuery = `
            SELECT 
                dd."ID_PLANILLA",
                dd."ID_PERSONA", 
                SUM(dd."MONTO_APLICADO") AS "total_deducciones"
            FROM "NET_DETALLE_DEDUCCION" dd
            WHERE dd."ID_PLANILLA" IN (${planillaIds.join(", ")})
            AND dd."ESTADO_APLICACION" = 'RECHAZADO'
            GROUP BY dd."ID_PLANILLA", dd."ID_PERSONA"
        `;

        const [planillas, pagos, deducciones] = await Promise.all([
            this.entityManager.query(planillaQuery),
            this.entityManager.query(pagosQuery),
            this.entityManager.query(deduccionesQuery),
        ]);

        const planillasEncontradasIds = new Set(planillas.map(p => p.id_planilla));
        const planillasNoEncontradas = planillaIds.filter(id => !planillasEncontradasIds.has(id));

        if (planillasNoEncontradas.length > 0) {
            throw new BadRequestException({
                statusCode: 400,
                message: `Las siguientes planillas no existen en la base de datos: ${planillasNoEncontradas.join(", ")}.`,
            });
        }

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

        for (const planilla of planillas) {
            const pagosPlanilla = pagosPorPlanilla.get(planilla.id_planilla) || [];
            const deduccionesPlanilla = deduccionesPorPlanilla.get(planilla.id_planilla) || [];

            const totalPagos = pagosPlanilla.reduce((acc, curr) => acc + (curr.monto || 0), 0);
            const totalDeducciones = deduccionesPlanilla.reduce((acc, curr) => acc + (curr.total_deducciones || 0), 0);
            const montoTotalFinal = totalPagos - totalDeducciones;

            const totalRegistrosCalculado = new Set(pagosPlanilla.map(pago => pago.ID_PERSONA)).size;

            const planillaBanco = datos.planillas_en_proceso.find(p => p.id_planilla === planilla.id_planilla);
            if (!planillaBanco) continue;

            const diferenciaMonto = planillaBanco.monto_total_pendiente_de_resolver - montoTotalFinal;
            const diferenciaRegistros = planillaBanco.total_no_pagos_pendientes - totalRegistrosCalculado;

            await this.entityManager.save(NetHistorialCuadrePlanillas, {
              fecha_cierre: fechaCierre,
              id_planilla: planilla.id_planilla,
              saldo_actual_rechazos_banco: planillaBanco.monto_total_pendiente_de_resolver,
              saldo_actual_rechazos_inprema: montoTotalFinal,
              total_pagos_pendientes_banco: planillaBanco.total_no_pagos_pendientes,
              total_pagos_pendientes_inprema: totalRegistrosCalculado,
              total_pagos_diferencia: diferenciaRegistros,
              diferencia_monto: diferenciaMonto,
              diferencia_registros: diferenciaRegistros,
              estado_cuadre: (diferenciaMonto !== 0 || diferenciaRegistros !== 0) ? "CON DIFERENCIAS" : "CUADRE CORRECTO",
          });

            if (diferenciaMonto !== 0 || diferenciaRegistros !== 0) {
                planillasConDiferencias.push({
                    id_planilla: planilla.id_planilla,
                    saldo_actual_rechazos_banco: planillaBanco.monto_total_pendiente_de_resolver,
                    saldo_actual_rechazos_inprema: montoTotalFinal,
                    total_pagos_pendientes_banco: planillaBanco.total_no_pagos_pendientes,
                    total_pagos_pendientes_inprema: totalRegistrosCalculado,
                    total_pagos_diferencia: diferenciaRegistros,
                    diferencia_monto: diferenciaMonto,
                });
            }
        }

        if (planillasConDiferencias.length > 0) {
            return {
                fecha_cierre: fechaCierre,
                planillas_con_diferencias: planillasConDiferencias,
                mensaje: "Se detectaron diferencias en algunas planillas.",
            };
        } else {
            return {
                mensaje: "Cuadre de planillas recibido correctamente.",
            };
        }
    } catch (error) {
        console.error("Error al procesar el cuadre de planillas:", error);
        throw new InternalServerErrorException({
            statusCode: 500,
            message: `Error interno al procesar el cuadre de planillas: ${error.message}`,
        });
    }
}

  
}
