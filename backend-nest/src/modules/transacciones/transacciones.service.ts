import { Injectable, NotFoundException } from '@nestjs/common';
import { UpdateTranssacionesDto } from './dto/update-transacciones.dto';
import { NET_MOVIMIENTO_CUENTA } from './entities/net_movimiento_cuenta.entity';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { net_persona } from '../Persona/entities/net_persona.entity';
import { NET_TIPO_CUENTA } from './entities/net_tipo_cuenta.entity';
import { NET_CUENTA_PERSONA } from './entities/net_cuenta_persona.entity';
import { NET_TIPO_MOVIMIENTO } from './entities/net_tipo_movimiento.entity';
import { CrearMovimientoDTO } from './dto/voucher.dto';
import { NET_PROFESIONES } from './entities/net_profesiones.entity';
import { Net_Colegios_Magisteriales } from './entities/net_colegios_magisteriales.entity';
import { crearCuentaDTO } from './dto/cuenta-transaccioens.dto';

@Injectable()
export class TransaccionesService {

  constructor(
    @InjectRepository(net_persona)
    private personaRepository: Repository<net_persona>,
    @InjectRepository(NET_MOVIMIENTO_CUENTA)
    private movimientoCuentaRepository: Repository<NET_MOVIMIENTO_CUENTA>,
    @InjectRepository(NET_TIPO_CUENTA)
    private tipoCuentaRepository: Repository<NET_TIPO_CUENTA>,
    @InjectRepository(NET_CUENTA_PERSONA)
    private cuentaPersonaRepository: Repository<NET_CUENTA_PERSONA>,
    @InjectRepository(NET_TIPO_MOVIMIENTO)
    private tipoMovimientoRepository: Repository<NET_TIPO_MOVIMIENTO>,
    @InjectRepository(NET_PROFESIONES)
    private readonly profesionesRepository: Repository<NET_PROFESIONES>,
    @InjectRepository(Net_Colegios_Magisteriales)
    private colegiosMRepository: Repository<Net_Colegios_Magisteriales>,
  ) {
  }

  async obtenerCuentasPorIdentificacion(n_identificacion: string): Promise<any[]> {
    const persona = await this.personaRepository.findOne({
      where: { n_identificacion },
      relations: ['cuentas', 'cuentas.tipoCuenta'], // Incluye el tipo de cuenta
    });
  
    if (!persona) {
      throw new NotFoundException(`Persona con identificación ${n_identificacion} no encontrada.`);
    }
  
    if (!persona.cuentas || persona.cuentas.length === 0) {
      throw new NotFoundException(`La persona con identificación ${n_identificacion} no tiene cuentas asociadas.`);
    }
  
    // Mapear los datos para incluir información del tipo de cuenta
    return persona.cuentas.map(cuenta => ({
      numeroCuenta: cuenta.NUMERO_CUENTA,
      activa: cuenta.ACTIVA_B,
      fechaCreacion: cuenta.FECHA_CREACION,
      creadaPor: cuenta.CREADA_POR,
      tipoCuenta: {
        id: cuenta.tipoCuenta?.ID_TIPO_CUENTA,
        descripcion: cuenta.tipoCuenta?.DESCRIPCION,
      },
    }));
  }
  
  private generarNumeroCuenta(idPersona: number): string {
    const timestamp = Date.now().toString(); // Marca de tiempo única
    const randomDigits = Math.floor(1000 + Math.random() * 9000).toString(); // 4 dígitos aleatorios
    return `${idPersona}${timestamp.substring(timestamp.length - 6)}${randomDigits}`;
  }

  async crearCuenta(idPersona: number, dto: crearCuentaDTO): Promise<any> {
    const persona = await this.personaRepository.findOne({
        where: { id_persona: idPersona },
    });

    if (!persona) {
        throw new NotFoundException(`No se encontró la persona con ID: ${idPersona}`);
    }

    const tipoCuenta = await this.tipoCuentaRepository.findOne({
        where: { DESCRIPCION: dto.tipo_cuenta },
    });

    if (!tipoCuenta) {
        throw new NotFoundException(
            `No se encontró un tipo de cuenta con la descripción: ${dto.tipo_cuenta}`
        );
    }

    const numeroCuenta = this.generarNumeroCuenta(persona.id_persona);

    const nuevaCuenta = this.cuentaPersonaRepository.create({
        persona: persona,
        tipoCuenta: tipoCuenta,
        CREADA_POR: dto.creado_por,
        NUMERO_CUENTA: numeroCuenta,
    });

    const cuentaGuardada = await this.cuentaPersonaRepository.save(nuevaCuenta);

    // Retorna un objeto con el formato esperado por el frontend
    return {
        numero_cuenta: cuentaGuardada.NUMERO_CUENTA,
        tipo_cuenta: {
            descripcion: cuentaGuardada.tipoCuenta.DESCRIPCION,
        },
    };
  }

  async eliminarMovimiento(id: number): Promise<boolean> {
    const movimiento = await this.movimientoCuentaRepository.findOne({ where: { ID_MOVIMIENTO_CUENTA: id } });
    if (!movimiento) {
      return false;
    }
    await this.movimientoCuentaRepository.remove(movimiento);
    return true;
  }

  async findAllProfesiones(): Promise<NET_PROFESIONES[]> {
    try {
      return await this.profesionesRepository.find();
    } catch (error) {

    }
  }

  async findAlltipoMovimientos(): Promise<NET_TIPO_MOVIMIENTO[]> {
    try {
      return await this.tipoMovimientoRepository.find();
    } catch (error) {

    }
  }

  async obtenerVoucherDeMovimientos(dni: string, limit: number = 10, offset: number = 0, search: string = ''): Promise<{ movimientos: CrearMovimientoDTO[], total: number }> {
    try {
      const query = this.movimientoCuentaRepository
        .createQueryBuilder('movimiento')
        .innerJoin('movimiento.cuentaPersona', 'cuenta')
        .innerJoin('cuenta.persona', 'persona')
        .innerJoin('movimiento.tipoMovimiento', 'tipoMovimiento')
        .innerJoin('cuenta.tipoCuenta', 'tipoCuenta')
        .select([
          'movimiento.ID_MOVIMIENTO_CUENTA as ID_MOVIMIENTO_CUENTA',
          'movimiento.DESCRIPCION as DESCRIPCION',
          `TO_CHAR(movimiento.MONTO, 'FM999,990.00') || ' L' as MONTO`,
          `TO_CHAR(movimiento.FECHA_MOVIMIENTO, 'DD/MM/YYYY') as FECHA_MOVIMIENTO`,
          'tipoMovimiento.DESCRIPCION as TIPO_MOVIMIENTO',
          `CASE tipoMovimiento.DEBITO_CREDITO_B 
              WHEN 'D' THEN 'DEBITO' 
              WHEN 'C' THEN 'CREDITO' 
              ELSE tipoMovimiento.DEBITO_CREDITO_B 
            END as DEBITO_CREDITO_B`,
          'tipoMovimiento.CUENTA_CONTABLE as CUENTA_CONTABLE',
          'cuenta.NUMERO_CUENTA as NUMERO_CUENTA',
          `CASE tipoMovimiento.ACTIVA_B 
              WHEN 'S' THEN 'ACTIVO' 
              WHEN 'N' THEN 'INACTIVO' 
              ELSE tipoMovimiento.ACTIVA_B 
            END as ESTADO_TIPO_MOVIMIENTO`, 
          'tipoCuenta.DESCRIPCION as TIPO_CUENTA_DESCRIPCION'
        ])
        .where('persona.n_identificacion = :dni', { dni });
  
      if (search) {
        query.andWhere(
          `(
            cuenta.NUMERO_CUENTA LIKE :search OR 
            movimiento.DESCRIPCION LIKE :search OR 
            TO_CHAR(movimiento.MONTO, 'FM999,990.00') LIKE :search OR 
            TO_CHAR(movimiento.FECHA_MOVIMIENTO, 'DD/MM/YYYY') LIKE :search OR
            tipoMovimiento.DESCRIPCION LIKE :search OR 
            tipoCuenta.DESCRIPCION LIKE :search
          )`,
          { search: `%${search}%` }
        );
      }
  
      const total = await query.getCount();
      const movimientos = await query
        .orderBy('movimiento.FECHA_MOVIMIENTO', 'DESC')
        .offset(offset)
        .limit(limit)
        .getRawMany();
  
      return { movimientos, total };
    } catch (error) {
      console.error('Error fetching data:', error);
      throw new Error('Error fetching movimientos');
    }
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
      where: { NUMERO_CUENTA: dto.numeroCuenta },
    });
  
    if (!cuentaExistente) {
      throw new NotFoundException(`No se encontró una cuenta con el número: ${dto.numeroCuenta}`);
    }
  
    const tipoMovimiento = await this.tipoMovimientoRepository.findOne({
      where: { DESCRIPCION: dto.tipoMovimientoDescripcion },
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
      CREADA_POR: 'INPRENET',
      ANO: dto.ANO,
      MES: dto.MES,
    });
  
    return this.movimientoCuentaRepository.save(nuevoMovimiento);
  }
  
  async obtenerTiposDeCuentaPorDNI(n_identificacion: string): Promise<any[]> {
    const persona = await this.personaRepository.findOne({
      where: { n_identificacion }
    });

    if (!persona) {
      throw new Error('Persona no encontrada');
    }
    const cuentasPersona = await this.cuentaPersonaRepository.find({
      where: { persona: { id_persona: persona.id_persona } },
      relations: ['tipoCuenta']
    });

    if (cuentasPersona.length === 0) {
      throw new Error('La persona no tiene cuentas asociadas');
    }

    const cuentasConDescripcion = cuentasPersona.map(cuenta => ({
      NUMERO_CUENTA: cuenta.NUMERO_CUENTA,
      DESCRIPCION: cuenta.tipoCuenta.DESCRIPCION
    }));

    return cuentasConDescripcion;

  }

  async obtenerTiposDeCuenta(): Promise<any[]> {
    // Encuentra todas las cuentas asociadas a la persona
    const cuentas = await this.tipoCuentaRepository.find();

    // Verifica si la persona tiene cuentas
    if (cuentas.length === 0) {
      throw new Error('No hay tipos de cuentas');
    }
    return cuentas;
  }

  async getAllColegiosMagisteriales(): Promise<any[]> {
    const colegiosMagist = await this.colegiosMRepository.find();

    if (!colegiosMagist) {
      throw new Error('colegiosMagist no encontrada');
    }
    return colegiosMagist;
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

  async ActivarCuenta(numCuenta: string): Promise<void> {
    const cuenta = await this.cuentaPersonaRepository.findOne({ where: { NUMERO_CUENTA: numCuenta } });

    cuenta.ACTIVA_B = 'A';

    await this.cuentaPersonaRepository.save(cuenta);
  }

  async desactivarCuenta(numCuenta: string): Promise<void> {
    const cuenta = await this.cuentaPersonaRepository.findOne({ where: { NUMERO_CUENTA: numCuenta } });

    cuenta.ACTIVA_B = 'I';

    await this.cuentaPersonaRepository.save(cuenta);
  }
}
