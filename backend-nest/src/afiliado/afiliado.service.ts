import { BadRequestException, Injectable, InternalServerErrorException, Logger } from '@nestjs/common';
import { CreateAfiliadoDto } from './dto/create-afiliado.dto';
import { UpdateAfiliadoDto } from './dto/update-afiliado.dto';
import { Connection, Repository } from 'typeorm';
import { Afiliado } from './entities/afiliado.entity';
import { InjectRepository } from '@nestjs/typeorm';
import { HistorialSalario } from './entities/historialSalarios.entity';
import { PerfAfilCentTrab } from './entities/perf_afil_cent_trab';
import { ReferenciaPersonal } from './entities/referencia-personal';
import { ReferenciaPersonalAfiliado } from './entities/referenciaP-Afiliado';
import { AfiliadosPorBanco } from 'src/banco/entities/afiliados-banco';
import { CentroTrabajo } from 'src/modules/Empresarial/centro-trabajo/entities/centro-trabajo.entity';
import { Banco } from 'src/banco/entities/banco.entity';
import { Provincia } from 'src/modules/Regional/provincia/entities/provincia.entity';
import { Pais } from 'src/modules/Regional/pais/entities/pais.entity';
import { TipoIdentificacion } from 'src/modules/tipo_identificacion/entities/tipo_identificacion.entity';

@Injectable()
export class AfiliadoService {

  private readonly logger = new Logger(AfiliadoService.name)

  constructor(
    @InjectRepository(Afiliado)
    private readonly afiliadoRepository : Repository<Afiliado>,
    @InjectRepository(HistorialSalario)
    private readonly historialSalarioRepository : Repository<HistorialSalario>,
    @InjectRepository(PerfAfilCentTrab)
    private readonly perfAfilCentTrabRepository : Repository<PerfAfilCentTrab>,
    @InjectRepository(ReferenciaPersonal)
    private readonly referenciaPersonal : Repository<ReferenciaPersonal>,
    @InjectRepository(ReferenciaPersonalAfiliado)
    private readonly referenciaPersonalAfiliadoRepository : Repository<ReferenciaPersonalAfiliado>,
    @InjectRepository(AfiliadosPorBanco)
    private readonly AfiliadosPorBancoRepository : Repository<AfiliadosPorBanco>,
    @InjectRepository(TipoIdentificacion)
    private readonly tipoIdentificacionRepository: Repository<TipoIdentificacion>,
    @InjectRepository(Pais)
    private readonly paisRepository: Repository<Pais>,
    @InjectRepository(Provincia)
    private readonly provinciaRepository: Repository<Provincia>,
    @InjectRepository(CentroTrabajo)
    private readonly centroTrabajoRepository: Repository<CentroTrabajo>,
    @InjectRepository(Banco)
    private readonly bancoRepository: Repository<Banco>,
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
        const newAfiliado = queryRunner.manager.create(Afiliado, {
            ...createAfiliadoDto,
            tipoIdentificacion,
            pais,
            provincia,
            afiliadosPorBanco: [afiliadoBanco],
            perfAfilCentTrabs,
        });
        await queryRunner.manager.save(newAfiliado);

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

                const afiliadoHijo = queryRunner.manager.create(Afiliado, {
                    ...hijoDto,
                    tipoIdentificacion: tipoIdentificacionHijo,
                    pais: paisHijo,
                    provincia: provinciaHijo,
                    padreIdAfiliado: newAfiliado
                    /* ,
                    afiliadosPorBanco: [afiliadoBancoHijo] */
                });
                await queryRunner.manager.save(afiliadoHijo);
            }
        }

        await queryRunner.commitTransaction();
        return newAfiliado;
    } catch (error) {
        await queryRunner.rollbackTransaction();
        this.handleException(error);
    } finally {
        await queryRunner.release();
    }
}


  findAll() {
    const afiliado = this.afiliadoRepository.find()
    return afiliado;
  }

  findOne(id: string) {
    return `This action returns a #${id} afiliado`;
  }

  update(id: number, updateAfiliadoDto: UpdateAfiliadoDto) {
    return `This action updates a #${id} afiliado`;
  }

  remove(id: number) {
    return `This action removes a #${id} afiliado`;
  }

  private handleException(error: any): void {
    this.logger.error(error);
    if (error.driverError && error.driverError.errorNum === 1) {
      throw new BadRequestException('Algun dato clave ya existe');
    } else {
      throw new InternalServerErrorException('Ocurrió un error al procesar su solicitud');
    }
  }
}
