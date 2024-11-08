import { Injectable } from '@nestjs/common';
import { CreateP60RentaDto } from './dto/create-p_60_renta.dto';
import { UpdateP60RentaDto } from './dto/update-p_60_renta.dto';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { P60Renta } from './entities/p_60_renta.entity';

@Injectable()
export class P60RentasService {
  constructor(
    @InjectRepository(P60Renta)
    private readonly detalle60RentasRepository: 
    Repository<P60Renta>
  ){}

  create(createP60RentaDto: CreateP60RentaDto) {
    return 'This action adds a new p60Renta';
  }


  /*Poner más parámetros según lo que quiera*/
async findOne(dni:string) {
  const identidad = await this.detalle60RentasRepository.find({ where: { dni:dni } });
  return identidad;
}

  update(id: number, updateP60RentaDto: UpdateP60RentaDto) {
    return `This action updates a #${id} p60Renta`;
  }

  remove(id: number) {
    return `This action removes a #${id} p60Renta`;
  }
}
