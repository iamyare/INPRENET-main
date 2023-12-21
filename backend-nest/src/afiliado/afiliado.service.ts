import { Injectable } from '@nestjs/common';
import { CreateAfiliadoDto } from './dto/create-afiliado.dto';
import { UpdateAfiliadoDto } from './dto/update-afiliado.dto';

@Injectable()
export class AfiliadoService {
  create(createAfiliadoDto: CreateAfiliadoDto) {
    return 'This action adds a new afiliado';
  }

  findAll() {
    return `This action returns all afiliado`;
  }

  findOne(id: number) {
    return `This action returns a #${id} afiliado`;
  }

  update(id: number, updateAfiliadoDto: UpdateAfiliadoDto) {
    return `This action updates a #${id} afiliado`;
  }

  remove(id: number) {
    return `This action removes a #${id} afiliado`;
  }
}
