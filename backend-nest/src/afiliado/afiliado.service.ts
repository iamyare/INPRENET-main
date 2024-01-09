import { BadRequestException, Injectable, InternalServerErrorException, Logger } from '@nestjs/common';
import { CreateAfiliadoDto } from './dto/create-afiliado.dto';
import { UpdateAfiliadoDto } from './dto/update-afiliado.dto';
import { Repository } from 'typeorm';
import { Afiliado } from './entities/afiliado.entity';
import { InjectRepository } from '@nestjs/typeorm';
import { HistorialSalario } from './entities/historialSalarios.entity';
import { PerfAfilCentTrab } from './entities/perf_afil_cent_trab';
import { ReferenciaPersonal } from './entities/referencia-personal';
import { ReferenciaPersonalAfiliado } from './entities/referenciaP-Afiliado';
import { AfiliadosPorBanco } from 'src/banco/entities/afiliados-banco';
import { TipoIdentificacion } from 'src/tipo_identificacion/entities/tipo_identificacion.entity';
import { Pais } from 'src/pais/entities/pais.entity';
import { Provincia } from 'src/pais/entities/provincia';
import { CentroTrabajo } from 'src/modules/Empresarial/centro-trabajo/entities/centro-trabajo.entity';

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
  ){}
  
  async create(createAfiliadoDto: CreateAfiliadoDto) {
    try {
      const tipoIdentificacion = await this.tipoIdentificacionRepository.findOneBy({ tipo_identificacion: createAfiliadoDto.tipo_identificacion });
      if (!tipoIdentificacion) {
        throw new BadRequestException('Identificacion not found');
      }

      const pais = await this.paisRepository.findOneBy({ nombre_pais: createAfiliadoDto.nombre_pais });
      if (!pais) {
        throw new BadRequestException('Pais not found');
      }

      const provincia = await this.provinciaRepository.findOneBy({ nombre_provincia: createAfiliadoDto.nombre_provincia });
      if (!provincia) {
        throw new BadRequestException('Provincia not found');
      }

      // Crear y guardar el nuevo afiliado
      const newAfiliado = await this.afiliadoRepository.save({
        ...createAfiliadoDto,
        tipoIdentificacion,
        pais,
        provincia
      });

      // Guardar el afiliado
      const savedAfiliado = await this.afiliadoRepository.save(newAfiliado);

      const centroTrabajo = await this.centroTrabajoRepository.findOneBy({ nombre_Centro_Trabajo: createAfiliadoDto.nombre_centroTrabajo });
      if (!centroTrabajo) {
        throw new BadRequestException('CentroTrabajo not found');
      }

      // Crear registro en PerfAfilCentTrab utilizando createAfiliadoDto
      const perfAfilCentTrab = this.perfAfilCentTrabRepository.create({
        ...createAfiliadoDto,
        centroTrabajo,
        afiliado: savedAfiliado
      });

      // Guardar el perfil laboral y centro de trabajo
      await this.perfAfilCentTrabRepository.save(perfAfilCentTrab);

      // Asignar su propio ID como padreIdAfiliado y guardar nuevamente
      savedAfiliado.padreIdAfiliado = savedAfiliado;
      await this.afiliadoRepository.save(savedAfiliado);

      // Elimina la referencia circular para la respuesta
      const responseAfiliado = { ...savedAfiliado, padreIdAfiliado: undefined };

      return responseAfiliado;
    } catch (error) {
      this.handleException(error);
    }
    
  }

  findAll() {
    return `This action returns all afiliado`;
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
