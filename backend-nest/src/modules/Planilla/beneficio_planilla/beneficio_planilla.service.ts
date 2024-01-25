import { Injectable, NotFoundException } from '@nestjs/common';
import { CreateBeneficioPlanillaDto } from './dto/create-beneficio_planilla.dto';
import { UpdateBeneficioPlanillaDto } from './dto/update-beneficio_planilla.dto';
import { BeneficioPlanilla } from './entities/beneficio_planilla.entity';
import { isUUID } from 'class-validator';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { Afiliado } from 'src/afiliado/entities/afiliado.entity';
import { Beneficio } from '../beneficio/entities/beneficio.entity';

@Injectable()
export class BeneficioPlanillaService {
  @InjectRepository(Afiliado)
  private readonly afiliadoRepository : Repository<Afiliado>

  @InjectRepository(Beneficio)
  private readonly tipoBeneficioRepository : Repository<Beneficio>

  @InjectRepository(BeneficioPlanilla)
  private readonly benAfilRepository : Repository<BeneficioPlanilla>

  async create(createBeneficioPlanillaDto: any): Promise<any> {
    try {
      //Buscar y retornar id_afiliado
      const afiliadoRepository = await this.afiliadoRepository.findOne({
        where: { dni: createBeneficioPlanillaDto.dni}
      });
      
       //Buscar y retornar id_tipobeneficio
      const tipoBeneficioRepository = await this.tipoBeneficioRepository.findOne({
        where: { nombre_beneficio: createBeneficioPlanillaDto.tipo_beneficio}
      });

      const nuevoDetalle = this.benAfilRepository.create(
        {afiliado: afiliadoRepository, beneficio: tipoBeneficioRepository}
      );

      return this.benAfilRepository.save(nuevoDetalle);
    } catch (error) {
      console.log(error);
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
}
