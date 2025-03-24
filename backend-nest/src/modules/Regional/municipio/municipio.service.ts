import { BadRequestException, Injectable, NotFoundException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { Net_Municipio } from './entities/net_municipio.entity';
import { Net_Departamento } from '../provincia/entities/net_departamento.entity';
import { Net_Aldea } from '../provincia/entities/net_aldea.entity';
import { Net_Colonia } from '../provincia/entities/net_colonia.entity';
import { CreateAldeaDto } from '../provincia/dto/create-aldea.dto';
import { CreateColoniaDto } from '../provincia/dto/CreateColoniaDto';
import { UpdateAldeaColoniaDto } from '../provincia/dto/update-aldea-colonia.dto';

@Injectable()
export class MunicipioService {

  constructor(
    @InjectRepository(Net_Municipio)
    private municipioRepository: Repository<Net_Municipio>,
    @InjectRepository(Net_Aldea)
    private aldeaRepository: Repository<Net_Aldea>,
    @InjectRepository(Net_Colonia)
    private coloniaRepository: Repository<Net_Colonia>
  ) {}

  async findAllAldeas(): Promise<Net_Aldea[]> {
    return await this.aldeaRepository.find({
      relations: ['municipio', 'municipio.departamento']
    });
}

  async findAllColonias(): Promise<Net_Colonia[]> {
    return await this.coloniaRepository.find({
      relations: ['municipio', 'municipio.departamento']
    });
}
  
  async actualizarAldea(id: number, updateDto: UpdateAldeaColoniaDto): Promise<any> {
    const { nombre, estado, observacion } = updateDto;

    const aldea = await this.aldeaRepository.findOne({ where: { id_aldea: id } });
    if (!aldea) {
      throw new NotFoundException(`No se encontró la aldea con ID ${id}.`);
    }

    if (nombre) {
      aldea.nombre_aldea = nombre;
    }
    if (estado) {
      if (!['ACTIVO', 'INACTIVO'].includes(estado)) {
        throw new BadRequestException('Estado no válido. Use "ACTIVO" o "INACTIVO".');
      }
      aldea.estado = estado;
    }
    if (observacion && estado === 'INACTIVO') {
      aldea.observacion = observacion;
    }

    await this.aldeaRepository.save(aldea);
    return { message: 'Aldea actualizada con éxito', id };
  }

  async actualizarColonia(id: number, updateDto: UpdateAldeaColoniaDto): Promise<any> {
    const { nombre, estado, observacion } = updateDto;

    const colonia = await this.coloniaRepository.findOne({ where: { id_colonia: id } });
    if (!colonia) {
        throw new NotFoundException(`No se encontró la colonia con ID ${id}.`);
    }

    if (nombre) {
        colonia.nombre_colonia = nombre;
    }
    if (estado) {
        if (!['ACTIVO', 'INACTIVO'].includes(estado)) {
            throw new BadRequestException('Estado no válido. Use "ACTIVO" o "INACTIVO".');
        }
        colonia.estado = estado;
    }
    if (observacion) {
        colonia.observacion = observacion;
    }

    await this.coloniaRepository.save(colonia);

    // 🔹 DEVOLVER UN OBJETO JSON EN LUGAR DE TEXTO PLANO
    return { message: 'Colonia actualizada con éxito', id };
}

  

  async createColonia(createColoniaDto: CreateColoniaDto): Promise<Net_Colonia> {
    const { nombre_colonia, id_municipio } = createColoniaDto;

    const municipio = await this.municipioRepository.findOne({ where: { id_municipio } });
    if (!municipio) {
      throw new NotFoundException(`El municipio con ID ${id_municipio} no existe.`);
    }

    const colonia = this.coloniaRepository.create({
      nombre_colonia,
      municipio
    });

    return await this.coloniaRepository.save(colonia);
  }

  async createAldea(createAldeaDto: CreateAldeaDto): Promise<Net_Aldea> {
    const { nombre_aldea, id_municipio } = createAldeaDto;

    const municipio = await this.municipioRepository.findOne({ where: { id_municipio } });
    if (!municipio) {
      throw new NotFoundException(`El municipio con ID ${id_municipio} no existe.`);
    }

    const aldea = this.aldeaRepository.create({
      nombre_aldea,
      municipio
    });

    return await this.aldeaRepository.save(aldea);
  }

  async findAll() {
    return await this.municipioRepository.find();
  }

  async getMunicipiosByDepartamento(departamentoId: number): Promise<Net_Municipio[]> {
    return await this.municipioRepository.find({
      where: {
        departamento: { id_departamento: departamentoId }
      },
      relations: ['departamento'] 
    });
  }

  async getDepartamentoByMunicipio(municipioId: number): Promise<Net_Departamento> {
    const municipio = await this.municipioRepository.findOne({
      where: { id_municipio: municipioId },
      relations: ['departamento'] // Incluye el departamento relacionado
    });
  
    if (!municipio) {
      throw new Error(`Municipio con id ${municipioId} no encontrado`);
    }
  
    return municipio.departamento;
  }
  
  async getAldeasByMunicipio(municipioId: number): Promise<{ id_aldea: number; nombre_aldea: string }[]> {
    const aldeas = await this.aldeaRepository.find({
      where: { municipio: { id_municipio: municipioId } }
    });
    return aldeas.map(({ id_aldea, nombre_aldea }) => ({ id_aldea, nombre_aldea }));
  }

  async getColoniasByMunicipio(municipioId: number): Promise<{ id_colonia: number, nombre_colonia: string }[]> {
    const colonias = await this.coloniaRepository.find({
      where: { municipio: { id_municipio: municipioId } },
      relations: ['municipio']
    });

    return colonias.map(({ id_colonia, nombre_colonia }) => ({
      id_colonia,
      nombre_colonia
    }));
  }
}
