import { Injectable } from '@nestjs/common';
import { CreateTransaccionesDto } from './dto/create-transacciones.dto';
import { UpdateTranssacionesDto } from './dto/update-transacciones.dto';
import { NET_MOVIMIENTO_CUENTA } from './entities/net_movimiento_cuenta.entity';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { Net_Persona } from '../afiliado/entities/Net_Persona';
import { NET_TIPO_CUENTA } from './entities/net_tipo_cuenta.entitiy';
import { NET_TIPO_MOVIMIENTO_CUENTA } from './entities/net_tipo_movimiento_cuenta.entity';

@Injectable()
export class TransaccionesService {

  constructor(
    @InjectRepository(Net_Persona)
    private personaRepository: Repository<Net_Persona>,
    @InjectRepository(NET_MOVIMIENTO_CUENTA)
    private movimientoCuentaRepository: Repository<NET_MOVIMIENTO_CUENTA>,
    @InjectRepository(NET_TIPO_CUENTA)
    private tipoCuentaRepository: Repository<NET_TIPO_CUENTA>,
    @InjectRepository(NET_TIPO_MOVIMIENTO_CUENTA)
    private tipoMovimientoCuentaRepository: Repository<NET_TIPO_MOVIMIENTO_CUENTA>
  ){

  }

  async asignarMovimiento(dni: string, descripcionTipoCuenta: string, datosMovimiento: any, datosTipoMovimiento: any) {
    // Encuentra la persona por DNI
    const persona = await this.personaRepository.findOne({ where: { dni } });
    if (!persona) {
      throw new Error('Persona no encontrada');
    }

    // Encuentra el tipo de cuenta por descripción
    const tipoCuenta = await this.tipoCuentaRepository.findOne({ where: { DESCRIPCION: descripcionTipoCuenta } });
    if (!tipoCuenta) {
      throw new Error('Tipo de cuenta no encontrado');
    }

    // Crea un nuevo tipo de movimiento
    const nuevoTipoMovimiento = this.tipoMovimientoCuentaRepository.create({
      ...datosTipoMovimiento,
      ID_TIPO_CUENTA: tipoCuenta.ID_TIPO_CUENTA,
      tipoCuenta: tipoCuenta,
      CREADA_POR: 'Emanuel'
    });
    await this.tipoMovimientoCuentaRepository.save(nuevoTipoMovimiento);

    // Crea un nuevo movimiento de cuenta
    const nuevoMovimientoCuenta = this.movimientoCuentaRepository.create({
      ...datosMovimiento,
      persona: persona,
      tipoMovimiento: nuevoTipoMovimiento,
    });
    await this.movimientoCuentaRepository.save(nuevoMovimientoCuenta);

    return nuevoMovimientoCuenta;

  }

  findAll() {
    return `This action returns all transsaciones`;
  }

  findOne(id: number) {
    return `This action returns a #${id} transsacione`;
  }

  update(id: number, updateTranssacioneDto: UpdateTranssacionesDto) {
    return `This action updates a #${id} transsacione`;
  }

  remove(id: number) {
    return `This action removes a #${id} transsacione`;
  }
}
