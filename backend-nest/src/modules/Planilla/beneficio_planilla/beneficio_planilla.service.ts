import { BadRequestException, Injectable, InternalServerErrorException, Logger, NotFoundException } from '@nestjs/common';
import { CreateBeneficioPlanillaDto } from './dto/create-beneficio_planilla.dto';
import { UpdateBeneficioPlanillaDto } from './dto/update-beneficio_planilla.dto';
import { BeneficioPlanilla } from './entities/beneficio_planilla.entity';
import { isUUID } from 'class-validator';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { DetalleAfiliado } from 'src/afiliado/entities/detalle_afiliado.entity';
import { Beneficio } from '../beneficio/entities/beneficio.entity';
import { Afiliado } from 'src/afiliado/entities/afiliado';

@Injectable()
export class BeneficioPlanillaService {
  private readonly logger = new Logger(BeneficioPlanillaService.name)
  
  @InjectRepository(Afiliado)
  private readonly afiliadoRepository : Repository<Afiliado>
  @InjectRepository(Beneficio)
  private readonly tipoBeneficioRepository : Repository<Beneficio>

  @InjectRepository(BeneficioPlanilla)
  private readonly benAfilRepository : Repository<BeneficioPlanilla>

  async create(datos: any): Promise<any> {
    let afiliado:any;
    let tipoBeneficio:any;
    
    try {
      if(datos.dni){
         afiliado = await this.afiliadoRepository.findOne({
          /* where: {dni: datos.dni} */
        });
      }
      if (!afiliado) {
        throw new BadRequestException('afiliado no encontrada');
      }

      else if(datos.tipo_beneficio){
       //Buscar y retornar id_tipobeneficio
        tipoBeneficio = await this.tipoBeneficioRepository.findOne({
          where: { nombre_beneficio: datos.tipo_beneficio}
        });
      }
      if (!tipoBeneficio) {
        throw new BadRequestException('tipoBeneficio no encontrada');
      }
      
     /*  if (afiliado && tipoBeneficio){
       const nuevoDetalle = this.benAfilRepository.create(
          {afiliado: afiliado, beneficio: tipoBeneficio, periodoInicio:datos.periodoInicio, periodoFinalizacion:datos.periodoFinalizacion}
          );
          return this.benAfilRepository.save(nuevoDetalle);
        }else{
          throw new BadRequestException('error desconocido');
      } */
    } catch (error) {
      this.handleException(error);
    }
  }

  findAll() {
    return `This action returns all beneficioPlanilla`;
  }

  async findOne(term: string) {
    let benAfil: BeneficioPlanilla;
    if (isUUID(term)) {
      benAfil = await this.benAfilRepository.findOneBy({ id_beneficio_planilla: term });
    } else {
      const queryBuilder = this.benAfilRepository.createQueryBuilder('afiliado');
      benAfil = await queryBuilder
        .where('"id_beneficio_planilla" = :term', { term })
        .getOne();
    }
    if (!benAfil) {
      throw new NotFoundException(`el beneficio  ${term} para el afiliado no existe no existe`);
    }
    return benAfil;
  }

  update(id: number, updateBeneficioPlanillaDto: UpdateBeneficioPlanillaDto) {
    return `This action updates a #${id} beneficioPlanilla`;
  }

  remove(id: number) {
    return `This action removes a #${id} beneficioPlanilla`;
  }

  private handleException(error: any): void {
    this.logger.error(error);
    // Verifica si el error es un BadRequestException y propaga el mismo
    if (error instanceof BadRequestException) {
      throw error;
    }
    // Verifica errores específicos de la base de datos o de la lógica de negocio
    if (error.driverError && error.driverError.errorNum) {
      // Aquí puedes agregar más condiciones según los códigos de error específicos de tu base de datos
      if (error.driverError.errorNum === 1) {
        throw new BadRequestException('El beneficio ya fue asignado');
      }
      // Agregar más casos según sea necesario
    } else {
      // Para cualquier otro tipo de error, lanza una excepción genérica
      throw new InternalServerErrorException('Ocurrió un error al procesar su solicitud');
    }
  }
}
