import { Injectable, NotFoundException } from '@nestjs/common';
import { CreateTransaccionesDto } from './dto/create-transacciones.dto';
import { UpdateTranssacionesDto } from './dto/update-transacciones.dto';
import { NET_MOVIMIENTO_CUENTA } from './entities/net_movimiento_cuenta.entity';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { Net_Persona } from '../afiliado/entities/Net_Persona.entity';
import { NET_TIPO_CUENTA } from './entities/net_tipo_cuenta.entity';
import { NET_CUENTA_PERSONA } from './entities/net_cuenta_persona.entity';
import { NET_TIPO_MOVIMIENTO } from './entities/net_tipo_movimiento.entity';

@Injectable()
export class TransaccionesService {

  constructor(
    @InjectRepository(Net_Persona)
    private personaRepository: Repository<Net_Persona>,
    @InjectRepository(NET_MOVIMIENTO_CUENTA)
    private movimientoCuentaRepository: Repository<NET_MOVIMIENTO_CUENTA>,
    @InjectRepository(NET_TIPO_CUENTA)
    private tipoCuentaRepository: Repository<NET_TIPO_CUENTA>,
    @InjectRepository(NET_TIPO_MOVIMIENTO)
    private tipoMovimientoCuentaRepository: Repository<NET_TIPO_MOVIMIENTO>,
    @InjectRepository(NET_CUENTA_PERSONA) // Asegúrate de que el nombre de la entidad sea correcto
    private cuentaPersonaRepository: Repository<NET_CUENTA_PERSONA>
  ){

  }

  async generarVoucherTodosMovimientos(idPersona: number): Promise<any> {
    const persona = await this.personaRepository.findOne({ where: { id_persona: idPersona } });
    if (!persona) {
      throw new NotFoundException(`Persona with ID ${idPersona} not found`);
    }

    const movimientos = await this.movimientoCuentaRepository.find({
      where: { persona: { id_persona: idPersona } },
      relations: ['tipoMovimiento', 'tipoMovimiento.tipoCuenta']
    });

    const voucher = movimientos.map(mov => ({
      fecha: mov.FECHA_MOVIMIENTO instanceof Date ? mov.FECHA_MOVIMIENTO.toISOString().split('T')[0] : mov.FECHA_MOVIMIENTO,
      monto: mov.MONTO,
      descripcion: mov.DESCRIPCION,
      tipoMovimiento: mov.tipoMovimiento.DESCRIPCION,
      tipoCuenta: mov.tipoMovimiento.tipoCuenta.DESCRIPCION
    }));

    return {
      nombreCompleto: `${persona.primer_nombre} ${persona.segundo_nombre} ${persona.primer_apellido} ${persona.segundo_apellido}`,
      dni: persona.dni,
      movimientos: voucher
    };
  }

  async crearMovimiento(
    dni: string,
    numeroCuenta: string,
    descripcionMovimiento: string,
    monto: number
  ): Promise<NET_MOVIMIENTO_CUENTA> {
    const persona = await this.personaRepository.findOne({ where: { dni } });
    if (!persona) {
      throw new Error('Persona no encontrada');
    }

    const cuentaPersona = await this.cuentaPersonaRepository.findOne({
      where: {
        persona: { id_persona: persona.id_persona },
        NUMERO_CUENTA: numeroCuenta
      },
      relations: ['tipoCuenta']
    });
    if (!cuentaPersona) {
      throw new Error('Cuenta de persona no encontrada');
    }

    const tipoMovimiento = await this.tipoMovimientoCuentaRepository.findOne({
      where: { DESCRIPCION: descripcionMovimiento }
    });
    if (!tipoMovimiento) {
      throw new Error('Tipo de movimiento no encontrado');
    }

    const nuevoMovimiento = this.movimientoCuentaRepository.create({
      persona: persona,
      tipoMovimiento: tipoMovimiento,
      MONTO: monto,
      DESCRIPCION: descripcionMovimiento,
      CREADA_POR: 'oscar', 
      FECHA_MOVIMIENTO: new Date(), 
    });

    return this.movimientoCuentaRepository.save(nuevoMovimiento);
  }
  

  async obtenerTiposDeCuentaPorDNI(dni: string): Promise<any[]> {
    const persona = await this.personaRepository.findOne({
      where: { dni }
    });
  
    if (!persona) {
      throw new Error('Persona no encontrada');
    }
  
    // Encuentra todas las cuentas asociadas a la persona
    const cuentasPersona = await this.cuentaPersonaRepository.find({
      where: { persona: { id_persona: persona.id_persona } },
      relations: ['tipoCuenta']
    });
  
    // Verifica si la persona tiene cuentas
    if (cuentasPersona.length === 0) {
      throw new Error('La persona no tiene cuentas asociadas');
    }
  
    // Extrae y devuelve los números de cuenta y las descripciones de los tipos de cuenta
    const cuentasConDescripcion = cuentasPersona.map(cuenta => ({
      NUMERO_CUENTA: cuenta.NUMERO_CUENTA,
      DESCRIPCION: cuenta.tipoCuenta.DESCRIPCION
    }));
  
    return cuentasConDescripcion;
  
  }

  async findMovimientosByDNI(dni: string) {
    return this.movimientoCuentaRepository
      .createQueryBuilder("movimiento")
      .select([
        "movimiento.FECHA_MOVIMIENTO", 
        "movimiento.MONTO"
      ])
      .addSelect("CASE WHEN tipoMovimiento.DEBITO_CREDITO_B = 'C' THEN 'CREDITO' ELSE 'DEBITO' END", "DEBITO_CREDITO_B")
      .addSelect("CASE WHEN tipoMovimiento.ACTIVA_B = 'S' THEN 'ACTIVO' ELSE 'INACTIVO' END", "ACTIVA_B")
      .addSelect("tipoMovimiento.CUENTA_CONTABLE", "CUENTA_CONTABLE")
      .addSelect("tipoCuenta.DESCRIPCION", "DESCRIPCION_TIPO_CUENTA")
      .innerJoin("movimiento.persona", "persona", "persona.dni = :dni", { dni })
      .innerJoin("movimiento.tipoMovimiento", "tipoMovimiento")
      .innerJoin("tipoMovimiento.tipoCuenta", "tipoCuenta")
      .getRawMany();
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
