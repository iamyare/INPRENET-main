import { Injectable } from '@nestjs/common';
import { CreateTipoIdentificacionDto } from './dto/create-tipo_identificacion.dto';
import { UpdateTipoIdentificacionDto } from './dto/update-tipo_identificacion.dto';
import { Net_TipoIdentificacion } from './entities/net_tipo_identificacion.entity';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';

@Injectable()
export class TipoIdentificacionService {

  constructor(
    @InjectRepository(Net_TipoIdentificacion)
    private readonly TipoIdentificacionRepository: Repository<Net_TipoIdentificacion>
  ){
   
  }
  async create(createTipoIdentificacionDto: CreateTipoIdentificacionDto) {
    try {
      const tipoIdentificacion = this.TipoIdentificacionRepository.create(createTipoIdentificacionDto)
      await this.TipoIdentificacionRepository.save(tipoIdentificacion)
      return tipoIdentificacion;
    } catch (error) {
      /* this.handleException(error); */
      console.log(error);
    }
  }

  findAll() {
    return `This action returns all tipoIdentificacion`;
  }

  findOne(id: number) {
    return `This action returns a #${id} tipoIdentificacion`;
  }

  update(id: number, updateTipoIdentificacionDto: UpdateTipoIdentificacionDto) {
    return `This action updates a #${id} tipoIdentificacion`;
  }

  remove(id: number) {
    return `This action removes a #${id} tipoIdentificacion`;
  }
}

/* onstructor(

    @InjectRepository(Empresa)
    private readonly empresaRepository: Repository<Empresa>
  ){}

  async create(createEmpresaDto: CreateEmpresaDto) {
    try {
      const empresa = this.empresaRepository.create(createEmpresaDto)
      await this.empresaRepository.save(empresa)
      return empresa;
    } catch (error) {
      this.handleException(error);
    }
  } */