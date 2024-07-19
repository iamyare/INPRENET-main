import { Injectable, NotFoundException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { Net_Discapacidad } from '../entities/net_discapacidad.entity';
import { NET_PROFESIONES } from 'src/modules/transacciones/entities/net_profesiones.entity';
import { Net_Colegios_Magisteriales } from 'src/modules/transacciones/entities/net_colegios_magisteriales.entity';
import { CreateDiscapacidadDto } from './dtos/create-discapacidad.dto';
import { UpdateDiscapacidadDto } from './dtos/update-discapacidad.dto';
import { CreateProfesionDto } from './dtos/create-profesion.dto';
import { UpdateProfesionDto } from './dtos/update-profesion.dto';
import { CreateColegioDto } from './dtos/create-colegio.dto';
import { UpdateColegioDto } from './dtos/update-colegio.dto';
import { Net_Banco } from 'src/modules/banco/entities/net_banco.entity';
import { CreateBancoDto } from './dtos/create-banco.dto';
import { UpdateBancoDto } from './dtos/update-banco.dto';
import { Net_Nivel_Educativo } from 'src/modules/Empresarial/entities/net_nivel_educativo.entity';
import { Net_Jornada } from 'src/modules/Empresarial/entities/net_jornada.entity';
import { CreateJornadaDto } from './dtos/create-jornada.dto';
import { UpdateJornadaDto } from './dtos/update-jornada.dto';
import { CreateNivelEducativoDto } from './dtos/create-nivel-educativo.dto';
import { UpdateNivelEducativoDto } from './dtos/update-nivel-educativo.dto';

@Injectable()
export class MantenimientoAfiliacionService {
  constructor(
    @InjectRepository(Net_Discapacidad)
    private discapacidadRepository: Repository<Net_Discapacidad>,
    @InjectRepository(NET_PROFESIONES)
    private profesionesRepository: Repository<NET_PROFESIONES>,
    @InjectRepository(Net_Colegios_Magisteriales)
    private colegiosRepository: Repository<Net_Colegios_Magisteriales>,
    @InjectRepository(Net_Banco)
    private bancoRepository: Repository<Net_Banco>,
    @InjectRepository(Net_Jornada)
    private jornadaRepository: Repository<Net_Jornada>,
    @InjectRepository(Net_Nivel_Educativo)
    private nivelEducativoRepository: Repository<Net_Nivel_Educativo>,
  ) {}

  // Métodos para Discapacidades

  async findAllDiscapacidades(): Promise<Net_Discapacidad[]> {
    return this.discapacidadRepository.find();
  }

  async findOneDiscapacidad(id: number): Promise<Net_Discapacidad> {
    const discapacidad = await this.discapacidadRepository.findOne({ where: { id_discapacidad: id } });
    if (!discapacidad) {
      throw new NotFoundException(`Discapacidad with ID ${id} not found`);
    }
    return discapacidad;
  }

  async createDiscapacidad(createDiscapacidadDto: CreateDiscapacidadDto): Promise<Net_Discapacidad> {
    const newDiscapacidad = this.discapacidadRepository.create(createDiscapacidadDto);
    return this.discapacidadRepository.save(newDiscapacidad);
  }

  async updateDiscapacidad(id: number, updateDiscapacidadDto: UpdateDiscapacidadDto): Promise<Net_Discapacidad> {
    const discapacidad = await this.findOneDiscapacidad(id);
    const updatedDiscapacidad = Object.assign(discapacidad, updateDiscapacidadDto);
    return this.discapacidadRepository.save(updatedDiscapacidad);
  }

  // Métodos para Profesiones

  async findAllProfesiones(): Promise<NET_PROFESIONES[]> {
    return this.profesionesRepository.find();
  }

  async findOneProfesion(id: number): Promise<NET_PROFESIONES> {
    const profesion = await this.profesionesRepository.findOne({ where: { id_profesion: id } });
    if (!profesion) {
      throw new NotFoundException(`Profesion with ID ${id} not found`);
    }
    return profesion;
  }

  async createProfesion(createProfesionDto: CreateProfesionDto): Promise<NET_PROFESIONES> {
    const newProfesion = this.profesionesRepository.create(createProfesionDto);
    return this.profesionesRepository.save(newProfesion);
  }

  async updateProfesion(id: number, updateProfesionDto: UpdateProfesionDto): Promise<NET_PROFESIONES> {
    const profesion = await this.findOneProfesion(id);
    const updatedProfesion = Object.assign(profesion, updateProfesionDto);
    return this.profesionesRepository.save(updatedProfesion);
  }

  // Métodos para Colegios Magisteriales

  async findAllColegios(): Promise<Net_Colegios_Magisteriales[]> {
    return this.colegiosRepository.find();
  }

  async findOneColegio(id: number): Promise<Net_Colegios_Magisteriales> {
    const colegio = await this.colegiosRepository.findOne({ where: { id_colegio: id } });
    if (!colegio) {
      throw new NotFoundException(`Colegio with ID ${id} not found`);
    }
    return colegio;
  }

  createColegio(createColegioDto: CreateColegioDto) {
    const colegio = this.colegiosRepository.create(createColegioDto);
    return this.colegiosRepository.save(colegio);
  }

  async updateColegio(id: number, updateColegioDto: UpdateColegioDto): Promise<Net_Colegios_Magisteriales> {
    const colegio = await this.findOneColegio(id);
    const updatedColegio = Object.assign(colegio, updateColegioDto);
    return this.colegiosRepository.save(updatedColegio);
  }

  // Métodos para Bancos

  async findAllBancos(): Promise<Net_Banco[]> {
    return this.bancoRepository.find();
  }

  async findOneBanco(id: number): Promise<Net_Banco> {
    const banco = await this.bancoRepository.findOne({ where: { id_banco: id } });
    if (!banco) {
      throw new NotFoundException(`Banco with ID ${id} not found`);
    }
    return banco;
  }

  async createBanco(createBancoDto: CreateBancoDto): Promise<Net_Banco> {
    const newBanco = this.bancoRepository.create(createBancoDto);
    return this.bancoRepository.save(newBanco);
  }

  async updateBanco(id: number, updateBancoDto: UpdateBancoDto): Promise<Net_Banco> {
    const banco = await this.findOneBanco(id);
    const updatedBanco = Object.assign(banco, updateBancoDto);
    return this.bancoRepository.save(updatedBanco);
  }

  // Métodos para Jornada

  async findAllJornadas(): Promise<Net_Jornada[]> {
    return this.jornadaRepository.find();
  }

  async findOneJornada(id: number): Promise<Net_Jornada> {
    const jornada = await this.jornadaRepository.findOne({ where: { id_jornada: id } });
    if (!jornada) {
      throw new NotFoundException(`Jornada with ID ${id} not found`);
    }
    return jornada;
  }

  async createJornada(createJornadaDto: CreateJornadaDto): Promise<Net_Jornada> {
    const newJornada = this.jornadaRepository.create(createJornadaDto);
    return this.jornadaRepository.save(newJornada);
  }

  async updateJornada(id: number, updateJornadaDto: UpdateJornadaDto): Promise<Net_Jornada> {
    const jornada = await this.findOneJornada(id);
    const updatedJornada = Object.assign(jornada, updateJornadaDto);
    return this.jornadaRepository.save(updatedJornada);
  }

  // Métodos para Nivel Educativo

  async findAllNivelesEducativos(): Promise<Net_Nivel_Educativo[]> {
    return this.nivelEducativoRepository.find();
  }

  async findOneNivelEducativo(id: number): Promise<Net_Nivel_Educativo> {
    const nivelEducativo = await this.nivelEducativoRepository.findOne({ where: { id_nivel: id } });
    if (!nivelEducativo) {
      throw new NotFoundException(`Nivel Educativo with ID ${id} not found`);
    }
    return nivelEducativo;
  }

  async createNivelEducativo(createNivelEducativoDto: CreateNivelEducativoDto): Promise<Net_Nivel_Educativo> {
    const newNivelEducativo = this.nivelEducativoRepository.create(createNivelEducativoDto);
    return this.nivelEducativoRepository.save(newNivelEducativo);
  }

  async updateNivelEducativo(id: number, updateNivelEducativoDto: UpdateNivelEducativoDto): Promise<Net_Nivel_Educativo> {
    const nivelEducativo = await this.findOneNivelEducativo(id);
    const updatedNivelEducativo = Object.assign(nivelEducativo, updateNivelEducativoDto);
    return this.nivelEducativoRepository.save(updatedNivelEducativo);
  }
}
