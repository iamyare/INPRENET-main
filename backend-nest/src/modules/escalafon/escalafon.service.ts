import { Injectable } from '@nestjs/common';
import { CreateEscalafonDto } from './dto/create-escalafon.dto';
import { UpdateEscalafonDto } from './dto/update-escalafon.dto';
import { net_detalle_envio_escalafon } from './entities/net_detalle_envio_escalafon.entity';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';

@Injectable()
export class EscalafonService {
  constructor(
    @InjectRepository(net_detalle_envio_escalafon)
    private readonly detalleEnvEscalafonRepository: Repository<net_detalle_envio_escalafon>
  ){}
  
  create(createEscalafonDto: CreateEscalafonDto) {
    return 'This action adds a new escalafon';
  }

  /*Poner más parámetros según lo que quiera*/
  async findOne(dni:string) {
    const identidad = await this.detalleEnvEscalafonRepository.find({ where: { dni:dni } });
    return identidad;
  }

  update(id: number, updateEscalafonDto: UpdateEscalafonDto) {
    return `This action updates a #${id} escalafon`;
  }

  remove(id: number) {
    return `This action removes a #${id} escalafon`;
  }
}
