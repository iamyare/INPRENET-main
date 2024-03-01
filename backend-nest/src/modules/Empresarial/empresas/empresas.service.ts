import { BadRequestException, Injectable, InternalServerErrorException, Logger, NotFoundException, Query } from '@nestjs/common';
import { CreateEmpresaDto } from './dto/create-empresa.dto';
import { UpdateEmpresaDto } from './dto/update-empresa.dto';
import { Net_Empresa } from './entities/net_empresa.entity';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { PaginationDto } from 'src/common/dtos/pagination.dto';
import { validate as isUUID } from 'uuid';

@Injectable()
export class EmpresasService {

  private readonly logger = new Logger(EmpresasService.name)

  constructor(

    @InjectRepository(Net_Empresa)
    private readonly empresaRepository: Repository<Net_Empresa>
  ){}

  async create(createEmpresaDto: CreateEmpresaDto) {
    try {
      const empresa = this.empresaRepository.create(createEmpresaDto)
      await this.empresaRepository.save(empresa)
      return empresa;
    } catch (error) {
      this.handleException(error);
    }
  }

  findAll( paginationDto: PaginationDto) {
    const { limit = 10, offset = 0 } = paginationDto
    return this.empresaRepository.find({
      take: limit,
      skip : offset
    });
  }
  

  async findOne(term: string) {
    let empresa: Net_Empresa;
    if (isUUID(term)) {
      empresa = await this.empresaRepository.findOneBy({ id_empresa: term });
    } else {
      const queryBuilder = this.empresaRepository.createQueryBuilder('empresa');
      empresa = await queryBuilder
        .where('"razon_social" = :term OR "rtn" = :term',
         { term })
        .getOne();
    }
    if (!empresa) {
      throw new NotFoundException(`Empresa con ${term} no existe`);
    }
    return empresa;
  }

  async update(id_empresa: string, updateEmpresaDto: UpdateEmpresaDto) {

    const empresa = await this.empresaRepository.preload({
      id_empresa: id_empresa,
      ...updateEmpresaDto
    });

    if(!empresa) throw new NotFoundException(`Empresa con el id: ${id_empresa} no funciona`)
    
    try{
      await this.empresaRepository.save(empresa);
      return empresa;
    } 
    catch (error) {
      this.handleException(error);
    }
  }

  async remove(id_empresa: string) {
    const empresa = await this.findOne(id_empresa);
    await this.empresaRepository.remove(empresa);
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
