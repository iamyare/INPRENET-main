import { Injectable } from '@nestjs/common';
import { CreateBancoDto } from './dto/create-banco.dto';
import { UpdateBancoDto } from './dto/update-banco.dto';
import { Repository } from 'typeorm';
import { Net_Banco } from './entities/net_banco.entity';
import { InjectRepository } from '@nestjs/typeorm';

@Injectable()
export class BancoService {
  @InjectRepository(Net_Banco)
  private bancoRepository: Repository<Net_Banco>
  create(createBancoDto: CreateBancoDto) {
    return 'This action adds a new banco';
  }

  async findAll() {
    const bancos = await this.bancoRepository.find();
    return bancos
  }

  findOne(id: number) {
    return `This action returns a #${id} banco`;
  }

  update(id: number, updateBancoDto: UpdateBancoDto) {
    return `This action updates a #${id} banco`;
  }

  remove(id: number) {
    return `This action removes a #${id} banco`;
  }
}
