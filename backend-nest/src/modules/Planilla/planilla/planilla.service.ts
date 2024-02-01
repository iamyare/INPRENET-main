import { Injectable } from '@nestjs/common';
import { CreatePlanillaDto } from './dto/create-planilla.dto';
import { UpdatePlanillaDto } from './dto/update-planilla.dto';
import { InjectRepository } from '@nestjs/typeorm';
import { DetalleDeduccion } from '../detalle-deduccion/entities/detalle-deduccion.entity';
import { Repository } from 'typeorm';
/* import { Afiliado } from 'src/afiliado/entities/detalle_afiliado.entity'; */
import { Institucion } from 'src/modules/Empresarial/institucion/entities/institucion.entity';
import { Afiliado } from 'src/afiliado/entities/afiliado';

@Injectable()
export class PlanillaService {

  constructor(
  @InjectRepository(DetalleDeduccion)
  private detalleDeduccionRepository: Repository<DetalleDeduccion>,
  @InjectRepository(Afiliado)
  private afiliadoRepository: Repository<Afiliado>,
  @InjectRepository(Institucion)
  private institucionRepository: Repository<Institucion>,){
   
  }
  create(createPlanillaDto: CreatePlanillaDto) {
    return 'This action adds a new planilla';
  }

  findAll() {
    return `This action returns all planilla`;
  }

  async getDeduccionesNoAplicadas(mes: number, anio: number): Promise<any> {
    const resultado = await this.detalleDeduccionRepository
      .createQueryBuilder('detDed')
      .select('detDed.id_afiliado', 'id_afiliado')
      .addSelect('afil.primer_nombre', 'primer_nombre')
      .addSelect('afil.segundo_nombre', 'segundo_nombre')
      .addSelect('afil.primer_apellido', 'primer_apellido')
      .addSelect('afil.segundo_apellido', 'segundo_apellido')
      .addSelect('afil.dni', 'dni')
      .addSelect('inst.id_institucion', 'id_institucion')
      .addSelect('inst.nombre_institucion', 'nombre_institucion')
      .addSelect('SUM(detDed.monto_total)', 'monto_total')
      .addSelect('SUM(detDed.monto_aplicado)', 'monto_aplicado')
      .innerJoin(Institucion, 'inst', 'detDed.id_institucion = inst.id_institucion')
      .innerJoin(Afiliado, 'afil', 'afil.id_afiliado = detDed.id_afiliado')
      .where('detDed.mes = :mes AND detDed.anio = :anio AND detDed.estado_aplicacion = :estado', {
        mes,
        anio,
        estado: 'NO APLICADO',
      })
      .groupBy('detDed.id_afiliado')
      .addGroupBy('inst.id_institucion')
      .addGroupBy('inst.nombre_institucion')
      .addGroupBy('afil.primer_nombre')
      .addGroupBy('afil.segundo_nombre')
      .addGroupBy('afil.primer_apellido')
      .addGroupBy('afil.segundo_apellido')
      .addGroupBy('afil.dni')
      .getRawMany();

    return resultado;
  }

  findOne(id: number) {
    return `This action returns a #${id} planilla`;
  }

  update(id: number, updatePlanillaDto: UpdatePlanillaDto) {
    return `This action updates a #${id} planilla`;
  }

  remove(id: number) {
    return `This action removes a #${id} planilla`;
  }
}
