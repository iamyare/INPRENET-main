import { BadRequestException, Injectable, InternalServerErrorException, Logger, NotFoundException } from '@nestjs/common';
import { CreateBeneficioDto } from './dto/create-beneficio.dto';
import { UpdateBeneficioDto } from './dto/update-beneficio.dto';
import { InjectRepository } from '@nestjs/typeorm';
import { DataSource, Repository } from 'typeorm';
import { Net_Beneficio } from './entities/net_beneficio.entity';
import { isUUID } from 'class-validator';
import * as XLSX from 'xlsx';
import { net_persona } from 'src/modules/Persona/entities/net_persona.entity';
import { net_detalle_persona } from 'src/modules/Persona/entities/net_detalle_persona.entity';
import { Net_Banco } from 'src/modules/banco/entities/net_banco.entity';
import { Net_Persona_Por_Banco } from 'src/modules/banco/entities/net_persona-banco.entity';
import { Net_Detalle_Beneficio_Afiliado } from '../detalle_beneficio/entities/net_detalle_beneficio_afiliado.entity';

@Injectable()
export class BeneficioService {
  private readonly logger = new Logger(BeneficioService.name)
  constructor(
    @InjectRepository(Net_Beneficio)
    private beneficioRepository: Repository<Net_Beneficio>,
    @InjectRepository(net_persona)
    private personaRepository: Repository<net_persona>,
    @InjectRepository(net_detalle_persona)
    private detallePersonaRepository: Repository<net_detalle_persona>,
    private dataSource: DataSource
  ) { }

  async uploadExcel(file: Express.Multer.File) {
    const insertedRows = [];
    const failedRows = [];
    try {
      const workbook = XLSX.read(file.buffer, { type: 'buffer', cellText: false, cellDates: true, cellNF: true });
      const worksheet = workbook.Sheets[workbook.SheetNames[0]];
      const data = XLSX.utils.sheet_to_json(worksheet, { raw: false, defval: "" });


      for (const [index, row] of data.entries()) {
        try {
          await this.dataSource.transaction(async (manager) => {
            const dniBeneficiario = row['DNI_BENEFICIARIO'] ? row['DNI_BENEFICIARIO'].toString().trim() : "";
            const dniCausante = row['DNI_CAUSANTE'] ? row['DNI_CAUSANTE'].toString().trim() : "";
            const tipoPersona = parseInt(row['ID_TIPO_PERSONA'], 10);


            const primerNombreBeneficiario = row['PRIMER_NOMBRE_BENEFICIARIO'] || "";
            const segundoNombreBeneficiario = row['SEGUNDO_NOMBRE_BENEFICIARIO'] || null;
            const tercerNombreBeneficiario = row['TERCER_NOMBRE_BENEFICIARIO'] || null;
            const primerApellidoBeneficiario = row['PRIMER_APELLIDO_BENEFICIARIO'] || "";
            const segundoApellidoBeneficiario = row['SEGUNDO_APELLIDO_BENEFICIARIO'] || null;


            const primerNombreCausante = row['PRIMER_NOMBRE_CAUSANTE'] || "";
            const segundoNombreCausante = row['SEGUNDO_NOMBRE_CAUSANTE'] || null;
            const tercerNombreCausante = row['TERCER_NOMBRE_CAUSANTE'] || null;
            const primerApellidoCausante = row['PRIMER_APELLIDO_CAUSANTE'] || "";
            const segundoApellidoCausante = row['SEGUNDO_APELLIDO_CAUSANTE'] || null;


            const idBeneficio = parseInt(row['CODIGO_BENEFICIO'], 10);
            const primerPago = parseFloat(row['PRIMER_PAGO']);
            const ultimoPago = row['ULTIMO_PAGO'] ? parseFloat(row['ULTIMO_PAGO']) : null;
            const fechaCalculo = new Date(row['FECHA_EFECTIVIDAD']);
            const numeroRentas = parseInt(row['NUMERO_RENTAS'], 10);
            const montoPorPeriodo = parseFloat(row['MONTO_POR_PERIODO(ORDINARIA)']);
            const periodoInicio = new Date(row['PERIODO_INICIO']);
            const codigoBanco = row['CODIGO_BANCO'].toString().trim();
            const numeroCuenta = row['NUMERO_CUENTA'].toString().trim();


            if (!dniBeneficiario || isNaN(tipoPersona)) {
              throw new BadRequestException("Los datos requeridos no están presentes o no son válidos.");
            }


            let causantePersona;
            if (dniCausante) {
              causantePersona = await manager.findOne(net_persona, { where: { n_identificacion: dniCausante } });
              if (!causantePersona) {
                causantePersona = manager.create(net_persona, {
                  n_identificacion: dniCausante,
                  primer_nombre: primerNombreCausante,
                  segundo_nombre: segundoNombreCausante,
                  tercer_nombre: tercerNombreCausante,
                  primer_apellido: primerApellidoCausante,
                  segundo_apellido: segundoApellidoCausante
                });
                causantePersona = await manager.save(causantePersona);


                const causanteDetallePersona = manager.create(net_detalle_persona, {
                  ID_PERSONA: causantePersona.id_persona,
                  ID_CAUSANTE: causantePersona.id_persona,
                  ID_TIPO_PERSONA: 1,
                });
                await manager.save(causanteDetallePersona);
              } else {
                const causanteDetallePersona = await manager.findOne(net_detalle_persona, {
                  where: {
                    ID_PERSONA: causantePersona.id_persona,
                    ID_CAUSANTE: causantePersona.id_persona,
                    ID_CAUSANTE_PADRE: null
                  }
                });
                if (!causanteDetallePersona) {
                  throw new InternalServerErrorException("No se encontró el detalle correspondiente para el DNI_CAUSANTE con ID_CAUSANTE_PADRE = null.");
                }
              }
            } else {
              causantePersona = await manager.findOne(net_persona, { where: { n_identificacion: dniBeneficiario } });
              if (!causantePersona) {
                causantePersona = manager.create(net_persona, {
                  n_identificacion: dniBeneficiario,
                  primer_nombre: primerNombreBeneficiario,
                  segundo_nombre: segundoNombreBeneficiario,
                  tercer_nombre: tercerNombreBeneficiario,
                  primer_apellido: primerApellidoBeneficiario,
                  segundo_apellido: segundoApellidoBeneficiario
                });
                causantePersona = await manager.save(causantePersona);
              }
            }


            const detallePersona = manager.create(net_detalle_persona, {
              ID_PERSONA: causantePersona.id_persona,
              ID_CAUSANTE: causantePersona.id_persona,
              ID_CAUSANTE_PADRE: causantePersona.id_persona,
              ID_TIPO_PERSONA: tipoPersona
            });
            const savedDetallePersona = await manager.save(detallePersona);


            const banco = await manager.findOne(Net_Banco, { where: { cod_banco: codigoBanco } });
            if (!banco) {
              throw new BadRequestException(`No se encontró un banco con el código ${codigoBanco}`);
            }


            const personaPorBanco = manager.create(Net_Persona_Por_Banco, {
              persona: causantePersona,
              banco: banco,
              num_cuenta: numeroCuenta,
              estado: 'ACTIVO',
              fecha_activacion: new Date()
            });
            await manager.save(personaPorBanco);


            const detalleBeneficioAfiliado = manager.create(Net_Detalle_Beneficio_Afiliado, {
              ID_DETALLE_PERSONA: savedDetallePersona.ID_DETALLE_PERSONA,
              ID_PERSONA: savedDetallePersona.ID_PERSONA,
              ID_CAUSANTE: savedDetallePersona.ID_CAUSANTE,
              ID_BENEFICIO: idBeneficio,
              monto_primera_cuota: primerPago,
              monto_ultima_cuota: ultimoPago,
              fecha_efectividad: fechaCalculo,
              num_rentas_aprobadas: numeroRentas,
              monto_por_periodo: montoPorPeriodo,
              periodo_inicio: periodoInicio,
              estado_solicitud: 'APROBADO'
            });
            await manager.save(detalleBeneficioAfiliado);


            insertedRows.push({ row: index + 1, dni: dniBeneficiario, status: 'Inserted' });
          });
        } catch (rowError) {
          this.logger.error(`Error en la fila ${index + 1}`, rowError);
          failedRows.push({ row: index + 1, error: rowError.message });
        }
      }
      return { message: 'Proceso completado', insertedRows, failedRows };
    } catch (error) {
      this.logger.error('Error al procesar el archivo Excel', error);
      throw new InternalServerErrorException('No se pudo procesar el archivo');
    }
  }

  async create(createBeneficioDto: CreateBeneficioDto) {
    delete createBeneficioDto['numero_rentas_max']
    try {
      const beneficio = this.beneficioRepository.create(createBeneficioDto);
      return this.beneficioRepository.save(beneficio);
    } catch (error) {
      this.handleException(error);
    }
  }

  async findAll() {
    return this.beneficioRepository.find();
  }

  /*   async findOne(id: string) {
      const beneficio = await this.beneficioRepository.findOne({ where: { id_beneficio: id } });
      if(!beneficio){
        throw new BadRequestException(`beneficio con ID ${id} no encontrado.`);
      }
      return beneficio;
    } */

  async findOne(term: string) {
    let beneficio: Net_Beneficio;
    if (isUUID(term)) {
      beneficio = await this.beneficioRepository.findOneBy({ id_beneficio: term, });
    } else {
      const queryBuilder = this.beneficioRepository.createQueryBuilder('beneficio');
      beneficio = await queryBuilder
        .where('"nombre_beneficio" = :term OR "id_beneficio" = :term', { term })
        .getOne();
    }
    if (!beneficio) {
      throw new NotFoundException(`beneficio con ${term}  no encontrado.`);
    }
    return beneficio;
  }

  async update(id: string, updateBeneficioDto: UpdateBeneficioDto) {
    const beneficio = await this.beneficioRepository.preload({
      id_beneficio: id,
      ...updateBeneficioDto
    });

    if (!beneficio) {
      throw new BadRequestException(`Beneficio con ID ${id} no encontrado.`);
    }

    try {
      await this.beneficioRepository.save(beneficio);
      return beneficio;
    } catch (error) {
      this.handleException(error);
    }
  }


  remove(id: number) {
    return `This action removes a #${id} beneficio`;
  }

  private handleException(error: any): void {
    this.logger.error(error);
    if (error.driverError && error.driverError.errorNum === 1) {
      throw new BadRequestException('El nombre de la empresa o rtn ya existe');
    } else {
      throw new InternalServerErrorException('Ocurrió un error al procesar su solicitud');
    }
  }
}
