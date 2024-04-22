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
import { CrearMovimientoDTO } from './dto/voucher.dto';

@Injectable()
export class TransaccionesService {

  constructor(
    @InjectRepository(Net_Persona)
    private personaRepository: Repository<Net_Persona>,
    @InjectRepository(NET_MOVIMIENTO_CUENTA)
    private movimientoCuentaRepository: Repository<NET_MOVIMIENTO_CUENTA>,
    @InjectRepository(NET_TIPO_CUENTA)
    private tipoCuentaRepository: Repository<NET_TIPO_CUENTA>,
    @InjectRepository(NET_CUENTA_PERSONA) 
    private cuentaPersonaRepository: Repository<NET_CUENTA_PERSONA>,
    @InjectRepository(NET_TIPO_MOVIMIENTO)
    private tipoMovimientoRepository: Repository<NET_TIPO_MOVIMIENTO>,
  ){

  }

  async obtenerVoucherDeMovimientos(dni: string): Promise<CrearMovimientoDTO[]> {
    const movimientos = await this.movimientoCuentaRepository
        .createQueryBuilder('movimiento')
        .innerJoin('movimiento.cuentaPersona', 'cuenta')
        .innerJoin('cuenta.persona', 'persona')
        .innerJoin('movimiento.tipoMovimiento', 'tipoMovimiento')
        .innerJoin('cuenta.tipoCuenta', 'tipoCuenta')
        .select([
          'movimiento.ID_MOVIMIENTO_CUENTA as ID_MOVIMIENTO_CUENTA',
          'movimiento.DESCRIPCION as DESCRIPCION',
          `TO_CHAR(movimiento.MONTO, 'FM999,990.00') || ' L' as MONTO`,
          'TO_CHAR(movimiento.FECHA_MOVIMIENTO, \'DD/MM/YYYY\') as FECHA_MOVIMIENTO',
          'tipoMovimiento.DESCRIPCION as TIPO_MOVIMIENTO',
          `CASE tipoMovimiento.DEBITO_CREDITO_B WHEN 'D' THEN 'DEBITO' WHEN 'C' THEN 'CREDITO' ELSE tipoMovimiento.DEBITO_CREDITO_B END as DEBITO_CREDITO_B`,
          'tipoMovimiento.CUENTA_CONTABLE as CUENTA_CONTABLE',
          'cuenta.NUMERO_CUENTA as NUMERO_CUENTA',
          'persona.CORREO_1 as CORREO_1',
          'persona.DNI as DNI',
          'persona.TELEFONO_1 as TELEFONO_1',
          `CASE tipoMovimiento.ACTIVA_B WHEN 'S' THEN 'ACTIVO' WHEN 'N' THEN 'INACTIVO' ELSE tipoMovimiento.ACTIVA_B END as ESTADO_TIPO_MOVIMIENTO`,
          'tipoCuenta.DESCRIPCION as TIPO_CUENTA_DESCRIPCION',
          'TRIM(NVL(persona.PRIMER_NOMBRE, \'\') || \' \' || NVL(persona.SEGUNDO_NOMBRE, \'\') || \' \' || NVL(persona.PRIMER_APELLIDO, \'\') || \' \' || NVL(persona.SEGUNDO_APELLIDO, \'\')) as NOMBRE_COMPLETO'
      ])
        .where('persona.DNI = :dni', { dni })
        .getRawMany();

    return movimientos;
}

async obtenerVoucherDeMovimientoEspecifico(dni: string, idMovimientoCuenta: number): Promise<CrearMovimientoDTO> {
  const movimiento = await this.movimientoCuentaRepository
      .createQueryBuilder('movimiento')
      .innerJoin('movimiento.cuentaPersona', 'cuenta')
      .innerJoin('cuenta.persona', 'persona')
      .innerJoin('movimiento.tipoMovimiento', 'tipoMovimiento')
      .select([
        'movimiento.ID_MOVIMIENTO_CUENTA as ID_MOVIMIENTO_CUENTA',
        'movimiento.DESCRIPCION as DESCRIPCION',
        'movimiento.MONTO as MONTO',
        'TO_CHAR(movimiento.FECHA_MOVIMIENTO, \'DD/MM/YYYY\') as FECHA_MOVIMIENTO',
        'tipoMovimiento.DESCRIPCION as TIPO_MOVIMIENTO',
        `CASE tipoMovimiento.DEBITO_CREDITO_B WHEN 'D' THEN 'DEBITO' WHEN 'C' THEN 'CREDITO' ELSE tipoMovimiento.DEBITO_CREDITO_B END as DEBITO_CREDITO_B`,
        'tipoMovimiento.CUENTA_CONTABLE as CUENTA_CONTABLE',
        'cuenta.NUMERO_CUENTA as NUMERO_CUENTA',
        'persona.CORREO_1 as CORREO_1',
        'persona.TELEFONO_1 as TELEFONO_1',
        'TRIM(NVL(persona.PRIMER_NOMBRE, \'\') || \' \' || NVL(persona.SEGUNDO_NOMBRE, \'\') || \' \' || NVL(persona.PRIMER_APELLIDO, \'\') || \' \' || NVL(persona.SEGUNDO_APELLIDO, \'\')) as NOMBRE_COMPLETO'
    ])
    .where('persona.DNI = :dni AND movimiento.ID_MOVIMIENTO_CUENTA = :idMovimientoCuenta', { dni, idMovimientoCuenta })
      .getRawOne(); 

  return movimiento;
}

async crearMovimiento(dto: CrearMovimientoDTO): Promise<NET_MOVIMIENTO_CUENTA> {
  const cuentaExistente = await this.cuentaPersonaRepository.findOne({
      where: { NUMERO_CUENTA: dto.numeroCuenta }
  });

  if (!cuentaExistente) {
      throw new NotFoundException(`No se encontró una cuenta con el número: ${dto.numeroCuenta}`);
  }

  const tipoMovimiento = await this.tipoMovimientoRepository.findOne({
      where: { DESCRIPCION: dto.tipoMovimientoDescripcion }
  });

  if (!tipoMovimiento) {
      throw new NotFoundException('Tipo de movimiento no encontrado.');
  }

  const nuevoMovimiento = this.movimientoCuentaRepository.create({
      cuentaPersona: cuentaExistente,
      tipoMovimiento: tipoMovimiento,
      MONTO: dto.monto,
      DESCRIPCION: dto.descripcion,
      FECHA_MOVIMIENTO: new Date(),
      CREADA_POR: "OFICIAL"
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
