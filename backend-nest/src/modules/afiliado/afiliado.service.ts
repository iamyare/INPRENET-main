import { BadRequestException, Injectable, InternalServerErrorException, Logger, NotFoundException } from '@nestjs/common';
import { CreateAfiliadoDto, PersonaResponse } from './dto/create-afiliado.dto';
import { UpdateAfiliadoDto } from './dto/update-afiliado.dto';
import { Connection, EntityManager, Repository } from 'typeorm';
import { InjectEntityManager, InjectRepository } from '@nestjs/typeorm';
import { Net_perf_afil_cent_trab } from './entities/net_perf_afil_cent_trab';
import { Net_Afiliados_Por_Banco } from 'src/modules/banco/entities/net_afiliados-banco';
import { Net_Centro_Trabajo } from 'src/modules/Empresarial/centro-trabajo/entities/net_centro-trabajo.entity';
import { Net_Banco } from 'src/modules/banco/entities/net_banco.entity';
import { Net_TipoIdentificacion } from 'src/modules/tipo_identificacion/entities/net_tipo_identificacion.entity';
/* import { Pais } from 'src/modules/Regional/pais/entities/pais.entity'; */

/* import { departamento } from 'src/modules/Regional/departamento/entities/departamento.entity'; */
import { Net_Pais } from 'src/modules/Regional/pais/entities/pais.entity';
import { CreateAfiliadoTempDto } from './dto/create-afiliado-temp.dto';
import { validate as isUUID } from 'uuid';
import { Net_Detalle_Afiliado } from './entities/Net_detalle_persona.entity';
import { Net_Persona } from './entities/Net_Persona';
import { Net_Departamento } from '../Regional/provincia/entities/net_departamento.entity';
import { map } from 'rxjs';

@Injectable()
export class AfiliadoService {

  private readonly logger = new Logger(AfiliadoService.name)

  constructor(
    @InjectEntityManager() private readonly entityManager: EntityManager,

    @InjectRepository(Net_Persona)
    private readonly afiliadoRepository : Repository<Net_Persona>,
    @InjectRepository(Net_Detalle_Afiliado)
    private datosIdentificacionRepository: Repository<Net_Detalle_Afiliado>,
    private connection: Connection,
  ){}
  
  async create(createAfiliadoDto: CreateAfiliadoDto): Promise<Net_Persona> {
    const queryRunner = this.connection.createQueryRunner();

    await queryRunner.connect();
    await queryRunner.startTransaction();

    try {
        // Verifica y encuentra las entidades necesarias para el afiliado principal
        const tipoIdentificacion = await queryRunner.manager.findOneBy(Net_TipoIdentificacion, { tipo_identificacion: createAfiliadoDto.tipo_identificacion });
        if (!tipoIdentificacion) {
            throw new BadRequestException('Identificacion not found');
        }

        const pais = await queryRunner.manager.findOneBy(Net_Pais, { nombre_pais: createAfiliadoDto.nombre_pais });
        if (!pais) {
            throw new BadRequestException('Pais not found');
        }

        const departamento = await queryRunner.manager.findOneBy(Net_Departamento, { nombre_departamento: createAfiliadoDto.nombre_departamento });
        if (!departamento) {
            throw new BadRequestException('departamento not found');
        }

        const banco = await queryRunner.manager.findOneBy(Net_Banco, { nombre_banco: createAfiliadoDto.datosBanc.nombreBanco });
        if (!banco) {
            throw new BadRequestException('Banco not found');
        }

        // Crear un nuevo registro en AfiliadosPorBanco para el afiliado principal
        const afiliadoBanco = queryRunner.manager.create(Net_Afiliados_Por_Banco, {
            banco,
            num_cuenta: createAfiliadoDto.datosBanc.numeroCuenta
        });
        await queryRunner.manager.save(afiliadoBanco);

        // Verificar y encontrar los centros de trabajo para cada perfAfilCentTrab
        const perfAfilCentTrabs = await Promise.all(createAfiliadoDto.perfAfilCentTrabs.map(async perfAfilCentTrabDto => {
            const centroTrabajo = await queryRunner.manager.findOneBy(Net_Centro_Trabajo, { nombre_centro_trabajo: perfAfilCentTrabDto.nombre_centroTrabajo });
            if (!centroTrabajo) {
                throw new BadRequestException(`Centro de trabajo no encontrado: ${perfAfilCentTrabDto.nombre_centroTrabajo}`);
            }

            return queryRunner.manager.create(Net_perf_afil_cent_trab, {
                ...perfAfilCentTrabDto,
                centroTrabajo
            });
        }));

        // Crear y preparar el nuevo afiliado principal con datos y relaciones
        /* const newAfiliado = queryRunner.manager.create(Afiliado, {
            ...createAfiliadoDto,
        });
        await queryRunner.manager.save(newAfiliado); */

        // Crear y asociar afiliados hijos
        if (createAfiliadoDto.afiliadosRelacionados && createAfiliadoDto.afiliadosRelacionados.length > 0) {
            for (const hijoDto of createAfiliadoDto.afiliadosRelacionados) {
                const tipoIdentificacionHijo = await queryRunner.manager.findOneBy(Net_TipoIdentificacion, { tipo_identificacion: hijoDto.tipo_identificacion });
                if (!tipoIdentificacionHijo) {
                    throw new BadRequestException('Identificacion not found for related affiliate');
                }

                const paisHijo = await queryRunner.manager.findOneBy(Net_Pais, { nombre_pais: hijoDto.nombre_pais });
                if (!paisHijo) {
                    throw new BadRequestException('Pais not found for related affiliate');
                }

                const departamentoHijo = await queryRunner.manager.findOneBy(Net_Departamento, { nombre_departamento: hijoDto.nombre_departamento });
                if (!departamentoHijo) {
                    throw new BadRequestException('departamento not found for related affiliate');
                }

                /* const bancoHijo = await queryRunner.manager.findOneBy(Banco, { nombre_banco: hijoDto.datosBanc.nombreBanco });
                if (!bancoHijo) {
                    throw new BadRequestException('Banco not found for related affiliate');
                }

                const afiliadoBancoHijo = queryRunner.manager.create(AfiliadosPorBanco, {
                    banco: bancoHijo,
                    num_cuenta: hijoDto.datosBanc.numeroCuenta
                });
                await queryRunner.manager.save(afiliadoBancoHijo); */

                const afiliadoHijo = 'si'
                await queryRunner.manager.save(afiliadoHijo);
            }
        }

        await queryRunner.commitTransaction();
        return ;
    } catch (error) {
        await queryRunner.rollbackTransaction();
        this.handleException(error);
    } finally {
        await queryRunner.release();
    }
}

    async createTemp(createAfiliadoTempDto: CreateAfiliadoTempDto) {
        try {
            const afiliado = this.afiliadoRepository.create(createAfiliadoTempDto)
            await this.afiliadoRepository.save(afiliado)
            return afiliado;
          } catch (error) {
            this.handleException(error);
          }
  }


  findAll() {
    const afiliado = this.afiliadoRepository.find()
    return afiliado;
  }

  async findOne(term: number) {
    let personas: Net_Persona;
    if (isUUID(term)) {
      personas = await this.afiliadoRepository.findOne({
        where: { id_persona: term },
        relations: ['detalleAfiliado'], // Asegúrate de cargar la relación
      });
    } else {
      const queryBuilder = this.afiliadoRepository.createQueryBuilder('persona');
      personas = await queryBuilder
        .leftJoinAndSelect('persona.detallesAfiliado', 'detallepersona') // Join con la tabla detallepersonas
        .leftJoinAndSelect('detallepersona.tipoAfiliado', 'tipoafiliado') // Join con la tabla detallepersonas
        .where('persona.dni = :term AND tipoafiliado.tipo_afiliado = :tipo_persona', { term, tipo_persona: "AFILIADO" })
        .getOne();
    }
    if (!personas) {
      throw new NotFoundException(`Afiliado con ${term} no existe`);
    }
    return personas;
  }

  update(id: number, updateAfiliadoDto: UpdateAfiliadoDto) {
    return `This action updates a #${id} afiliado`;
  }

  remove(id: number) {
    return `This action removes a #${id} afiliado`;
  }

  async obtenerBenDeAfil(dniAfil: string): Promise<any> {
    
      try {
        const query = `
        SELECT DISTINCT
        "detA"."ID_PERSONA"
        FROM NET_PERSONA "Afil"
        FULL OUTER JOIN
          NET_DETALLE_PERSONA "detA" ON "Afil"."ID_PERSONA" = "detA"."ID_PERSONA" 
        INNER JOIN
        NET_TIPO_PERSONA "tipoP" ON "tipoP"."ID_TIPO_AFILIADO" = "detA"."ID_TIPO_PERSONA"
      WHERE
        "Afil"."DNI" = '${dniAfil}' AND 
        "Afil"."ESTADO" = 'FALLECIDO'  AND
        "tipoP"."TIPO_AFILIADO" = 'AFILIADO'
        `;

        const beneficios = await this.entityManager.query(query);
        
        const query1 = `
        SELECT 
        "Afil"."DNI",
        "Afil"."PRIMER_NOMBRE",
        "Afil"."SEGUNDO_APELLIDO",
        "Afil"."TERCER_NOMBRE",
        "Afil"."PRIMER_APELLIDO",
        "Afil"."SEGUNDO_APELLIDO",
        "Afil"."SEXO",
        "detA"."PORCENTAJE",
        "tipoP"."TIPO_AFILIADO"
      FROM
          "NET_DETALLE_PERSONA" "detA" INNER JOIN 
          "NET_PERSONA" "Afil" ON "detA"."ID_PERSONA" = "Afil"."ID_PERSONA"
          INNER JOIN
        NET_TIPO_PERSONA "tipoP" ON "tipoP"."ID_TIPO_AFILIADO" = "detA"."ID_TIPO_PERSONA"
      WHERE 
          "detA"."ID_CAUSANTE_PADRE" = ${beneficios[0].ID_PERSONA} AND 
          "tipoP"."TIPO_AFILIADO" = 'BENEFICIARIO' 
        `;
        
        const beneficios2 = await this.entityManager.query(query1);
  
        return this.normalizarDatos(beneficios2);
      } catch (error) {
        this.logger.error(`Error al consultar beneficios: ${error.message}`);
        throw new Error(`Error al consultar beneficios: ${error.message}`);
      }
    }
  
    normalizarDatos(data: any): PersonaResponse[]{
      const newList: PersonaResponse[]= []   
      data.map((el:any)=>{
        const newPersona: PersonaResponse = {
          id_persona: el.ID_PERSONA,
          dni: el.DNI,
          estado_civil: el.ESTADO_CIVIL,
          primer_nombre: el.PRIMER_NOMBRE,
          segundo_nombre: el.SEGUNDO_NOMBRE,
          tercer_nombre: el.TERCER_NOMBRE,
          primer_apellido: el.PRIMER_APELLIDO,
          segundo_apellido: el.SEGUNDO_APELLIDO,
          sexo: el.SEXO,
          cantidad_dependientes: el.CANTIDAD_DEPENDIENTES,
          cantidad_hijos: el.CANTIDAD_HIJOS,
          profesion: el.PROFESION,
          representacion: el.REPRESENTACION,
          telefono_1: el.TELEFONO_1,
          telefono_2: el.TELEFONO_2,
          correo_1: el.CORREO_1,
          correo_2: el.CORREO_2,
          colegio_magisterial: el.COLEGIO_MAGISTERIAL,
          numero_carnet: el.NUMERO_CARNET,
          direccion_residencia: el.DIRECCION_RESIDENCIA,
          estado: el.ESTADO,
          fecha_nacimiento: el.FECHA_NACIMIENTO,
          archivo_identificacion: el.ARCHIVO_IDENTIFICACION,
          tipoIdentificacion: el.TIPOIDENTIFICACION,
        }
        newList.push(newPersona)
      })
      return newList;
    }
    
    async findByDni(dni: string): Promise<Net_Persona | string> {
      const afiliado = await this.afiliadoRepository.findOne({ where: { dni } });
  
      if (!afiliado) {
        throw new NotFoundException(`Afiliado with DNI ${dni} not found`);
      }
  
      switch (afiliado.estado) {
        case 'FALLECIDO':
          return 'El afiliado está fallecido.';
        case 'INACTIVO':
          return 'El afiliado está inactivo.';
        default:
          return afiliado;
      }
    }

    /* async findByDni(dni: string) { */
      //const datosIdentificacion = await this.datosIdentificacionRepository.findOne({ where: { dni } });
      
     /*  if (!datosIdentificacion) {
          throw new NotFoundException(`DatosIdentificacion with DNI "${dni}" not found.`);
      } */

      /* const afiliado = await this.afiliadoRepository.findOne({
          where: { datosIdentificacion: { id_datos_identificacion: datosIdentificacion.id_datos_identificacion } },
          relations: ['datosIdentificacion']
      }); */

      /* if (!afiliado) {
          throw new NotFoundException(`Afiliado with DatosIdentificacion ID "${datosIdentificacion.id_datos_identificacion}" not found.`);
      }

      return afiliado; */
  //}
  
    
/*  afiliados = await queryBuilder
    .where('"dni" = :term AND estado = :est', { term, est:"FALLECIDO" })
    .getOne(); */
    
/*     
    console.log(queryBuilder);
    return queryBuilder */
/*     return this.afiliadoRepository.find({
      relations: ['padreIdAfiliado','beneficioPlanilla.beneficio'],
      where: {
        dni: "0801200012345",
        tipo_cotizante: "BENEFICIARIO",
        beneficioPlanilla.beneficio.: "dsadsa"
      },
    }); */
  

  private handleException(error: any): void {
    this.logger.error(error);
    if (error.driverError && error.driverError.errorNum === 1) {
      throw new BadRequestException('Algun dato clave ya existe');
    } else {
      throw new InternalServerErrorException('Ocurrió un error al procesar su solicitud');
    }
  }
}
