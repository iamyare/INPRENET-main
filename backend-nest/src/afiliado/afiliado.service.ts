import { BadRequestException, Injectable, InternalServerErrorException, Logger, NotFoundException } from '@nestjs/common';
import { CreateAfiliadoDto } from './dto/create-afiliado.dto';
import { UpdateAfiliadoDto } from './dto/update-afiliado.dto';
import { Connection, EntityManager, Repository } from 'typeorm';
import { InjectEntityManager, InjectRepository } from '@nestjs/typeorm';
import { PerfAfilCentTrab } from './entities/perf_afil_cent_trab';
import { AfiliadosPorBanco } from 'src/banco/entities/afiliados-banco';
import { CentroTrabajo } from 'src/modules/Empresarial/centro-trabajo/entities/centro-trabajo.entity';
import { Banco } from 'src/banco/entities/banco.entity';
import { Provincia } from 'src/modules/Regional/provincia/entities/provincia.entity';
import { Pais } from 'src/modules/Regional/pais/entities/pais.entity';
import { TipoIdentificacion } from 'src/modules/tipo_identificacion/entities/tipo_identificacion.entity';
import { CreateAfiliadoTempDto } from './dto/create-afiliado-temp.dto';
import { validate as isUUID } from 'uuid';
import { DetalleAfiliado } from './entities/detalle_afiliado.entity';
import { Afiliado } from './entities/afiliado';

@Injectable()
export class AfiliadoService {

  private readonly logger = new Logger(AfiliadoService.name)

  constructor(
    @InjectEntityManager() private readonly entityManager: EntityManager,

    @InjectRepository(Afiliado)
    private readonly afiliadoRepository : Repository<Afiliado>,
    @InjectRepository(DetalleAfiliado)
    private datosIdentificacionRepository: Repository<DetalleAfiliado>,
    private connection: Connection,
  ){}
  
  async create(createAfiliadoDto: CreateAfiliadoDto): Promise<Afiliado> {
    const queryRunner = this.connection.createQueryRunner();

    await queryRunner.connect();
    await queryRunner.startTransaction();

    try {
        // Verifica y encuentra las entidades necesarias para el afiliado principal
        const tipoIdentificacion = await queryRunner.manager.findOneBy(TipoIdentificacion, { tipo_identificacion: createAfiliadoDto.tipo_identificacion });
        if (!tipoIdentificacion) {
            throw new BadRequestException('Identificacion not found');
        }

        const pais = await queryRunner.manager.findOneBy(Pais, { nombre_pais: createAfiliadoDto.nombre_pais });
        if (!pais) {
            throw new BadRequestException('Pais not found');
        }

        const provincia = await queryRunner.manager.findOneBy(Provincia, { nombre_provincia: createAfiliadoDto.nombre_provincia });
        if (!provincia) {
            throw new BadRequestException('Provincia not found');
        }

        const banco = await queryRunner.manager.findOneBy(Banco, { nombre_banco: createAfiliadoDto.datosBanc.nombreBanco });
        if (!banco) {
            throw new BadRequestException('Banco not found');
        }

        // Crear un nuevo registro en AfiliadosPorBanco para el afiliado principal
        const afiliadoBanco = queryRunner.manager.create(AfiliadosPorBanco, {
            banco,
            num_cuenta: createAfiliadoDto.datosBanc.numeroCuenta
        });
        await queryRunner.manager.save(afiliadoBanco);

        // Verificar y encontrar los centros de trabajo para cada perfAfilCentTrab
        const perfAfilCentTrabs = await Promise.all(createAfiliadoDto.perfAfilCentTrabs.map(async perfAfilCentTrabDto => {
            const centroTrabajo = await queryRunner.manager.findOneBy(CentroTrabajo, { nombre_Centro_Trabajo: perfAfilCentTrabDto.nombre_centroTrabajo });
            if (!centroTrabajo) {
                throw new BadRequestException(`Centro de trabajo no encontrado: ${perfAfilCentTrabDto.nombre_centroTrabajo}`);
            }

            return queryRunner.manager.create(PerfAfilCentTrab, {
                ...perfAfilCentTrabDto,
                centroTrabajo
            });
        }));

        // Crear y preparar el nuevo afiliado principal con datos y relaciones
        /* const newAfiliado = queryRunner.manager.create(Afiliado, {
            ...createAfiliadoDto,
        });
        await queryRunner.manager.save(newAfiliado); */

        // Crear y asociar afiliados hijos
        if (createAfiliadoDto.afiliadosRelacionados && createAfiliadoDto.afiliadosRelacionados.length > 0) {
            for (const hijoDto of createAfiliadoDto.afiliadosRelacionados) {
                const tipoIdentificacionHijo = await queryRunner.manager.findOneBy(TipoIdentificacion, { tipo_identificacion: hijoDto.tipo_identificacion });
                if (!tipoIdentificacionHijo) {
                    throw new BadRequestException('Identificacion not found for related affiliate');
                }

                const paisHijo = await queryRunner.manager.findOneBy(Pais, { nombre_pais: hijoDto.nombre_pais });
                if (!paisHijo) {
                    throw new BadRequestException('Pais not found for related affiliate');
                }

                const provinciaHijo = await queryRunner.manager.findOneBy(Provincia, { nombre_provincia: hijoDto.nombre_provincia });
                if (!provinciaHijo) {
                    throw new BadRequestException('Provincia not found for related affiliate');
                }

                /* const bancoHijo = await queryRunner.manager.findOneBy(Banco, { nombre_banco: hijoDto.datosBanc.nombreBanco });
                if (!bancoHijo) {
                    throw new BadRequestException('Banco not found for related affiliate');
                }

                const afiliadoBancoHijo = queryRunner.manager.create(AfiliadosPorBanco, {
                    banco: bancoHijo,
                    num_cuenta: hijoDto.datosBanc.numeroCuenta
                });
                await queryRunner.manager.save(afiliadoBancoHijo); */

                const afiliadoHijo = 'si'
                await queryRunner.manager.save(afiliadoHijo);
            }
        }

        await queryRunner.commitTransaction();
        return ;
    } catch (error) {
        await queryRunner.rollbackTransaction();
        this.handleException(error);
    } finally {
        await queryRunner.release();
    }
}

    async createTemp(createAfiliadoTempDto: CreateAfiliadoTempDto) {
        try {
            const afiliado = this.afiliadoRepository.create(createAfiliadoTempDto)
            await this.afiliadoRepository.save(afiliado)
            return afiliado;
          } catch (error) {
            this.handleException(error);
          }
  }


  findAll() {
    const afiliado = this.afiliadoRepository.find()
    return afiliado;
  }

  async findOne(term: string) {
    let afiliados: Afiliado;
    if (isUUID(term)) {
      afiliados = await this.afiliadoRepository.findOne({
        where: { id_afiliado: term },
        relations: ['detalleAfiliado'], // Asegúrate de cargar la relación
      });
    } else {
      const queryBuilder = this.afiliadoRepository.createQueryBuilder('afiliado');
      afiliados = await queryBuilder
        .leftJoinAndSelect('afiliado.detalleAfiliado', 'detalleAfiliado') // Join con la tabla detalleAfiliado
        .where('afiliado.dni = :term AND detalleAfiliado.tipo_afiliado = :tipo_afiliado', { term, tipo_afiliado: "AFILIADO" })
        .getOne();
    }
    if (!afiliados) {
      throw new NotFoundException(`Afiliado con ${term} no existe`);
    }
    return afiliados;
  }

  update(id: number, updateAfiliadoDto: UpdateAfiliadoDto) {
    return `This action updates a #${id} afiliado`;
  }

  remove(id: number) {
    return `This action removes a #${id} afiliado`;
  }

  async obtenerBenDeAfil(dniAfil: string): Promise<any> {
    
      try {
        const query = `
        SELECT "Afil"."dni", "Ben"."dni", "Ben"."primer_nombre", "Ben"."segundo_nombre", "Ben"."tercer_nombre", "Ben"."primer_apellido", "Ben"."segundo_apellido", "Ben"."estado", "Ben"."porcentaje"  
        FROM "afiliado" "Afil" 
        FULL OUTER JOIN
          "afiliado" "Ben" ON "Afil"."id_afiliado" = "Ben"."padreIdAfiliado"
        WHERE 
            "Afil"."dni" = ${dniAfil} AND 
            "Afil"."estado" = 'FALLECIDO'  AND 
            "Afil"."tipo_cotizante" = 'AFILIADO'
        `;
  
        const beneficios = await this.entityManager.query(query);
  
        return beneficios;
      } catch (error) {
        this.logger.error(`Error al consultar beneficios: ${error.message}`);
        throw new Error(`Error al consultar beneficios: ${error.message}`);
      }
    }

    async findByDni(dni: string) {
      //const datosIdentificacion = await this.datosIdentificacionRepository.findOne({ where: { dni } });
      
     /*  if (!datosIdentificacion) {
          throw new NotFoundException(`DatosIdentificacion with DNI "${dni}" not found.`);
      } */

      /* const afiliado = await this.afiliadoRepository.findOne({
          where: { datosIdentificacion: { id_datos_identificacion: datosIdentificacion.id_datos_identificacion } },
          relations: ['datosIdentificacion']
      }); */

      /* if (!afiliado) {
          throw new NotFoundException(`Afiliado with DatosIdentificacion ID "${datosIdentificacion.id_datos_identificacion}" not found.`);
      }

      return afiliado; */
  }
  
    
/*  afiliados = await queryBuilder
    .where('"dni" = :term AND estado = :est', { term, est:"FALLECIDO" })
    .getOne(); */
    
/*     
    console.log(queryBuilder);
    return queryBuilder */
/*     return this.afiliadoRepository.find({
      relations: ['padreIdAfiliado','beneficioPlanilla.beneficio'],
      where: {
        dni: "0801200012345",
        tipo_cotizante: "BENEFICIARIO",
        beneficioPlanilla.beneficio.: "dsadsa"
      },
    }); */
  

  private handleException(error: any): void {
    this.logger.error(error);
    if (error.driverError && error.driverError.errorNum === 1) {
      throw new BadRequestException('Algun dato clave ya existe');
    } else {
      throw new InternalServerErrorException('Ocurrió un error al procesar su solicitud');
    }
  }
}
