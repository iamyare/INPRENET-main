import { BadRequestException, Injectable, InternalServerErrorException, Logger, NotFoundException } from '@nestjs/common';
import { CreateBeneficioDto } from './dto/create-beneficio.dto';
import { UpdateBeneficioDto } from './dto/update-beneficio.dto';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { Net_Beneficio } from './entities/net_beneficio.entity';
import { isUUID } from 'class-validator';
import * as XLSX from 'xlsx';
import { net_persona } from 'src/modules/Persona/entities/net_persona.entity';
import { net_detalle_persona } from 'src/modules/Persona/entities/net_detalle_persona.entity';

@Injectable()
export class BeneficioService {
  private readonly logger = new Logger(BeneficioService.name)
  constructor(){}
  @InjectRepository(Net_Beneficio)
  private beneficioRepository: Repository<Net_Beneficio>
  @InjectRepository(net_persona)
  private personaRepository: Repository<net_persona>;
  @InjectRepository(net_detalle_persona)
  private detallePersonaRepository: Repository<net_detalle_persona>;
  
    async uploadExcel(file: Express.Multer.File) {
      const insertedRows = [];
      const failedRows = [];
      try {
          const workbook = XLSX.read(file.buffer, { type: 'buffer', cellText: false, cellDates: true, cellNF: true });
          const worksheet = workbook.Sheets[workbook.SheetNames[0]];
          const data = XLSX.utils.sheet_to_json(worksheet, { raw: false, defval: "" });
          
          for (const [index, row] of data.entries()) {
              try {
                  const dniBeneficiario = row['DNI_BENEFICIARIO'] ? row['DNI_BENEFICIARIO'].toString().trim() : "";
                  const dniCausante = row['DNI_CAUSANTE'] ? row['DNI_CAUSANTE'].toString().trim() : "";
                  const tipoPersona = parseInt(row['ID_TIPO_PERSONA'], 10);
  
                  const primerNombreBeneficiario = row['PRIMER_NOMBRE_BENEFICIARIO'] || "";
                  const segundoNombreBeneficiario = row['SEGUNDO_NOMBRE_BENEFICIARIO'] || null;
                  const tercerNombreBeneficiario = row['TERCER_NOMBRE_BENEFICIARIO'] || null;
                  const primerApellidoBeneficiario = row['PRIMER_APELLIDO_BENEFICIARIO'] || "";
                  const segundoApellidoBeneficiario = row['SEGUNDO_APELLIDO_BENEFICIARIO'] || null;
  
                  const primerNombreCausante = row['PRIMER_NOMBRE_CAUSANTE'] || "";
                  const segundoNombreCausante = row['SEGUNDO_NOMBRE_CAUSANTE'] || null;
                  const tercerNombreCausante = row['TERCER_NOMBRE_CAUSANTE'] || null;
                  const primerApellidoCausante = row['PRIMER_APELLIDO_CAUSANTE'] || "";
                  const segundoApellidoCausante = row['SEGUNDO_APELLIDO_CAUSANTE'] || null;
  
                  if (!dniBeneficiario || isNaN(tipoPersona)) {
                      throw new BadRequestException("Los datos requeridos no están presentes o no son válidos.");
                  }
                  if (dniBeneficiario === dniCausante) {
                      let persona = await this.personaRepository.findOne({ where: { n_identificacion: dniBeneficiario } });
                      if (!persona) {
                          persona = this.personaRepository.create({
                              n_identificacion: dniBeneficiario,
                              primer_nombre: primerNombreBeneficiario,
                              segundo_nombre: segundoNombreBeneficiario,
                              tercer_nombre: tercerNombreBeneficiario,
                              primer_apellido: primerApellidoBeneficiario,
                              segundo_apellido: segundoApellidoBeneficiario
                          });
                          persona = await this.personaRepository.save(persona);
                      }
                      const detallePersona = this.detallePersonaRepository.create({
                          ID_PERSONA: persona.id_persona,
                          ID_CAUSANTE: persona.id_persona,
                          ID_CAUSANTE_PADRE: persona.id_persona,
                          ID_DETALLE_PERSONA: persona.id_persona,
                          ID_TIPO_PERSONA: 6,
                      });
                      await this.detallePersonaRepository.save(detallePersona);
                      insertedRows.push({ row: index + 1, dni: dniBeneficiario, status: 'Inserted' });
                      continue;
                  }
                  let causantePersona = await this.personaRepository.findOne({ where: { n_identificacion: dniCausante } });
                  let causanteDetallePersona;
                  if (!causantePersona) {
                      const causante = this.personaRepository.create({
                          n_identificacion: dniCausante,
                          primer_nombre: primerNombreCausante,
                          segundo_nombre: segundoNombreCausante,
                          tercer_nombre: tercerNombreCausante,
                          primer_apellido: primerApellidoCausante,
                          segundo_apellido: segundoApellidoCausante
                      });
                      causantePersona = await this.personaRepository.save(causante);
  
                      causanteDetallePersona = this.detallePersonaRepository.create({
                          ID_PERSONA: causantePersona.id_persona,
                          ID_CAUSANTE: causantePersona.id_persona,
                          ID_TIPO_PERSONA: 1,
                      });
                      causanteDetallePersona = await this.detallePersonaRepository.save(causanteDetallePersona);
                  } else {
                      causanteDetallePersona = await this.detallePersonaRepository.findOne({ 
                          where: { 
                              ID_PERSONA: causantePersona.id_persona, 
                              ID_CAUSANTE: causantePersona.id_persona,
                              ID_CAUSANTE_PADRE: null 
                          } 
                      });
                      if (!causanteDetallePersona) {
                          throw new InternalServerErrorException("No se encontró el detalle correspondiente para el DNI_CAUSANTE con ID_CAUSANTE_PADRE = null.");
                      }
                  }
  
                  let persona = await this.personaRepository.findOne({ where: { n_identificacion: dniBeneficiario } });
                  if (!persona) {
                      persona = this.personaRepository.create({
                          n_identificacion: dniBeneficiario,
                          primer_nombre: primerNombreBeneficiario,
                          segundo_nombre: segundoNombreBeneficiario,
                          tercer_nombre: tercerNombreBeneficiario,
                          primer_apellido: primerApellidoBeneficiario,
                          segundo_apellido: segundoApellidoBeneficiario
                      });
                      persona = await this.personaRepository.save(persona);
                  }
  
                  const detallePersona = this.detallePersonaRepository.create({
                      ID_PERSONA: persona.id_persona,
                      ID_CAUSANTE: causantePersona.id_persona,
                      ID_CAUSANTE_PADRE: causantePersona.id_persona,
                      ID_DETALLE_PERSONA: causanteDetallePersona.ID_DETALLE_PERSONA,
                      ID_TIPO_PERSONA: tipoPersona,
                  });
                  await this.detallePersonaRepository.save(detallePersona);
                  insertedRows.push({ row: index + 1, dni: dniBeneficiario, status: 'Inserted' });
              } catch (rowError) {
                  this.logger.error(`Error en la fila ${index + 1}`, rowError);
                  failedRows.push({ row: index + 1, error: rowError.message });
              }
          }
  
          return { message: 'Proceso completado', insertedRows, failedRows };
      } catch (error) {
          this.logger.error('Error al procesar el archivo Excel', error);
          throw new InternalServerErrorException('No se pudo procesar el archivo');
      }
  }


  async create(createBeneficioDto: CreateBeneficioDto) {
    delete createBeneficioDto['numero_rentas_max']
    try {
      const beneficio = this.beneficioRepository.create(createBeneficioDto);
      return this.beneficioRepository.save(beneficio);
    } catch (error) {
      this.handleException(error);
    }
  }

  async findAll() {
    return this.beneficioRepository.find();
  }

/*   async findOne(id: string) {
    const beneficio = await this.beneficioRepository.findOne({ where: { id_beneficio: id } });
    if(!beneficio){
      throw new BadRequestException(`beneficio con ID ${id} no encontrado.`);
    }
    return beneficio;
  } */

  async findOne(term: string) {
    let beneficio: Net_Beneficio;
    if (isUUID(term)) {
      beneficio = await this.beneficioRepository.findOneBy({ id_beneficio: term,});
    } else {
      const queryBuilder = this.beneficioRepository.createQueryBuilder('beneficio');
      beneficio = await queryBuilder
        .where('"nombre_beneficio" = :term OR "id_beneficio" = :term', { term } )
        .getOne();
    }
    if (!beneficio) {
      throw new NotFoundException(`beneficio con ${term}  no encontrado.`);
    }
    return beneficio;
  }

  async update(id: string, updateBeneficioDto: UpdateBeneficioDto) {
    const beneficio = await this.beneficioRepository.preload({
      id_beneficio: id, 
      ...updateBeneficioDto
    });

    if (!beneficio) {
      throw new BadRequestException(`Beneficio con ID ${id} no encontrado.`);
    }

    try {
      await this.beneficioRepository.save(beneficio);
      return beneficio;
    } catch (error) {
      this.handleException(error);
    }
  }


  remove(id: number) {
    return `This action removes a #${id} beneficio`;
  }

  private handleException(error: any): void {
    this.logger.error(error);
    if (error.driverError && error.driverError.errorNum === 1) {
      throw new BadRequestException('El nombre de la empresa o rtn ya existe');
    } else {
      throw new InternalServerErrorException('Ocurrió un error al procesar su solicitud');
    }
  }
}
