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

  async obtenerRegistrosPorMes(mes: number): Promise<string[]> {
    const registros = await this.detalleEnvEscalafonRepository.createQueryBuilder('detalle')
      .select('detalle.anio', 'anio')
      .addSelect('detalle.mes', 'mes')
      .addSelect('detalle.dni', 'dni')
      .addSelect('SUM(detalle.cuota)', 'cuota')
      .where('detalle.mes = :mes', { mes })
      .groupBy('detalle.anio, detalle.mes, detalle.dni')
      .getRawMany();
    const resultado = registros.map((registro) => {
      const anio = registro.anio?.toString().padStart(4, '0') || '0000';
      const dni = registro.dni;
      const numeroFijo = '0038';
      const cuotaEntera = Math.floor(registro.cuota || 0).toString().padStart(16, '0');
      const cuotaDecimal = ((registro.cuota || 0) % 1).toFixed(2).split('.')[1] || '00';
      const numero44Digitos = `${anio}${registro.mes?.toString().padStart(2, '0')}${dni}${numeroFijo}${cuotaEntera}${cuotaDecimal}`;
      return numero44Digitos;
    });
    return resultado;
  }
  
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
