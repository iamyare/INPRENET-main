import { Injectable } from '@nestjs/common';
import { CreateTransaccionesDto } from './dto/create-transacciones.dto';
import { UpdateTranssacionesDto } from './dto/update-transacciones.dto';
import { NET_MOVIMIENTO_CUENTA } from './entities/net_movimiento_cuenta.entity';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { Net_Persona } from '../afiliado/entities/Net_Persona';
import { NET_TIPO_CUENTA } from './entities/net_tipo_cuenta.entitiy';
import { NET_TIPO_MOVIMIENTO_CUENTA } from './entities/net_tipo_movimiento.entity';
import { NET_CUENTA_PERSONA } from './entities/net_cuenta_persona.entity';

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
    private tipoMovimientoCuentaRepository: Repository<NET_TIPO_MOVIMIENTO_CUENTA>,
    @InjectRepository(NET_CUENTA_PERSONA) // Asegúrate de que el nombre de la entidad sea correcto
    private cuentaPersonaRepository: Repository<NET_CUENTA_PERSONA>
  ){

  }

  async asignarMovimiento(dni: string, NUMERO_CUENTA: string, datosMovimiento: any, datosTipoMovimiento: any) {
    console.log(dni, NUMERO_CUENTA, datosMovimiento, datosTipoMovimiento);

    // Encuentra la persona por DNI
    const persona = await this.personaRepository.findOne({ where: { dni } });
    if (!persona) {
      throw new Error('Persona no encontrada');
    }
  
    // Encuentra la cuenta activa por ID_PERSONA y NUMERO_CUENTA
    const cuentaPersona = await this.cuentaPersonaRepository.findOne({
      where: {
        persona: { id_persona: persona.id_persona },  // Usa la propiedad que corresponde al ID de la persona en la entidad
        NUMERO_CUENTA: NUMERO_CUENTA,
        ACTIVA_B: 'S'
      },
      relations: ['tipoCuenta']
    });
    if (!cuentaPersona) {
      throw new Error('Cuenta activa no encontrada para la persona especificada');
    }
  
    // Asegúrate de que ACTIVA_B se establezca explícitamente
    const nuevoTipoMovimiento = this.tipoMovimientoCuentaRepository.create({
      ...datosTipoMovimiento,
      ID_TIPO_CUENTA: cuentaPersona.tipoCuenta.ID_TIPO_CUENTA,
      tipoCuenta: cuentaPersona.tipoCuenta,
      CREADA_POR: datosMovimiento.CREADA_POR,
      ACTIVA_B: 'S' // Establece ACTIVA_B aquí de manera explícita
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
