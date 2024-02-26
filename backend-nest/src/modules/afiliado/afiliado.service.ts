import { BadRequestException, Injectable, InternalServerErrorException, Logger, NotFoundException } from '@nestjs/common';
import { CreateAfiliadoDto } from './dto/create-afiliado.dto';
import { UpdateAfiliadoDto } from './dto/update-afiliado.dto';
import { Connection, EntityManager, Repository } from 'typeorm';
import { InjectEntityManager, InjectRepository } from '@nestjs/typeorm';
import { PerfAfilCentTrab } from './entities/perf_afil_cent_trab';
import { Net_Afiliados_Por_Banco } from 'src/modules/banco/entities/net_afiliados-banco';
import { Net_Centro_Trabajo } from 'src/modules/Empresarial/centro-trabajo/entities/net_centro-trabajo.entity';
import { Net_Banco } from 'src/modules/banco/entities/net_banco.entity';
import { Provincia } from 'src/modules/Regional/provincia/entities/provincia.entity';
import { Pais } from 'src/modules/Regional/pais/entities/pais.entity';
import { TipoIdentificacion } from 'src/modules/tipo_identificacion/entities/tipo_identificacion.entity';
import { CreateAfiliadoTempDto } from './dto/create-afiliado-temp.dto';
import { validate as isUUID } from 'uuid';
import { Net_Detalle_Afiliado } from './entities/detalle_afiliado.entity';
import { Net_Afiliado } from './entities/net_afiliado';

@Injectable()
export class AfiliadoService {

  private readonly logger = new Logger(AfiliadoService.name)

  constructor(
    @InjectEntityManager() private readonly entityManager: EntityManager,

    @InjectRepository(Net_Afiliado)
    private readonly afiliadoRepository : Repository<Net_Afiliado>,
    @InjectRepository(Net_Detalle_Afiliado)
    private datosIdentificacionRepository: Repository<Net_Detalle_Afiliado>,
    private connection: Connection,
  ){}
  
  async create(createAfiliadoDto: CreateAfiliadoDto): Promise<Net_Afiliado> {
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

        const banco = await queryRunner.manager.findOneBy(Net_Banco, { nombre_banco: createAfiliadoDto.datosBanc.nombreBanco });
        if (!banco) {
            throw new BadRequestException('Banco not found');
        }

        // Crear un nuevo registro en AfiliadosPorBanco para el afiliado principal
        const afiliadoBanco = queryRunner.manager.create(Net_Afiliados_Por_Banco, {
            banco,
            num_cuenta: createAfiliadoDto.datosBanc.numeroCuenta
        });
        await queryRunner.manager.save(afiliadoBanco);

        // Verificar y encontrar los centros de trabajo para cada perfAfilCentTrab
        const perfAfilCentTrabs = await Promise.all(createAfiliadoDto.perfAfilCentTrabs.map(async perfAfilCentTrabDto => {
            const centroTrabajo = await queryRunner.manager.findOneBy(Net_Centro_Trabajo, { nombre_Centro_Trabajo: perfAfilCentTrabDto.nombre_centroTrabajo });
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
    let afiliados: Net_Afiliado;
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
        SELECT DISTINCT
          "detA"."id_detalle_afiliado_padre"
          FROM "Net_Afiliado" "Afil"
          FULL OUTER JOIN
          "net_detalle_afiliado" "detA" ON "Afil"."id_afiliado" = "detA"."id_detalle_afiliado_padre"
        WHERE
          "Afil"."dni" = '${dniAfil}' AND 
          "Afil"."estado" = 'FALLECIDO'  AND
          "detA"."tipo_afiliado" = 'BENEFICIARIO' AND
          "Afil"."id_afiliado" NOT IN 
          (
              SELECT 
              "detA"."id_afiliado"
              FROM "Net_Afiliado" "Afil"
              INNER JOIN
              "net_detalle_afiliado" "detA" ON "Afil"."id_afiliado" = "detA"."id_detalle_afiliado_padre"
          )
        `;

        const beneficios = await this.entityManager.query(query);
        
        const query1 = `
        SELECT 
          "Afil"."dni",
          "Afil"."primer_nombre",
          "Afil"."segundo_nombre",
          "Afil"."tercer_nombre",
          "Afil"."primer_apellido",
          "Afil"."segundo_apellido",
          "Afil"."sexo",
          "detA"."porcentaje",
          "detA"."tipo_afiliado"
        FROM
            "net_detalle_afiliado" "detA" INNER JOIN 
            "Net_Afiliado" "Afil" ON "detA"."id_afiliado" = "Afil"."id_afiliado"
        WHERE 
            "detA"."id_detalle_afiliado_padre" = ${beneficios[0].id_detalle_afiliado_padre} AND 
            "detA"."tipo_afiliado" = 'BENEFICIARIO'
        `;
        
        const beneficios2 = await this.entityManager.query(query1);
  
        return beneficios2;
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
