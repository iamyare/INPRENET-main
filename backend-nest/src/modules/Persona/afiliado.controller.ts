import {
  Controller,
  Post,
  Get,
  Put,
  Delete,
  Patch,
  Body,
  Param,
  NotFoundException,
  HttpCode,
  HttpStatus,
  Res,
  ParseIntPipe,
  UseInterceptors,
  UploadedFile,
} from '@nestjs/common';
import { AfiliadoService } from './afiliado.service';
import { UpdatePersonaDto } from './dto/update-persona.dto';
import { ApiTags } from '@nestjs/swagger';
import { EncapsulatedPersonaDTO } from './dto/encapsulated-persona.dto';
import { DataSource, Repository } from 'typeorm';
import { AsignarReferenciasDTO } from './dto/asignarReferencia.dto';
import { Net_Tipo_Persona } from './entities/net_tipo_persona.entity';
import { InjectRepository } from '@nestjs/typeorm';
import { UpdatePerfCentTrabDto } from './dto/update.perfAfilCentTrab.dto';
import { UpdateReferenciaPersonalDTO } from './dto/update-referencia-personal.dto';
import { NET_RELACION_FAMILIAR } from './entities/net_relacion_familiar';
import { UpdateFamiliarDTO } from './dto/update-familiar.dto';
import { NuevoFamiliarDTO } from './dto/nuevo-familiar.dto';
import { FileInterceptor } from '@nestjs/platform-express';

@ApiTags('Persona')
@Controller('Persona')
export class AfiliadoController {
  @InjectRepository(Net_Tipo_Persona)
  private readonly tipoPersonaRepos: Repository<Net_Tipo_Persona>

  constructor(private readonly afiliadoService: AfiliadoService, private dataSource: DataSource) {}

  @Post('afiliacion')
  @UseInterceptors(FileInterceptor('foto_perfil', {
    limits: { fileSize: 5 * 1024 * 1024 }, // Límite de tamaño del archivo a 5 MB
    fileFilter: (req, file, callback) => {
      // Filtra solo archivos de imagen
      if (file.mimetype.startsWith('image/')) {
        callback(null, true);
      } else {
        callback(new Error('Solo se permiten archivos de imagen'), false);
      }
    },
  }))
  async createPersonaWithDetailsAndWorkCenters(
    @UploadedFile() fotoPerfil: Express.Multer.File,
    @Body('encapsulatedDto') encapsulatedDtoStr: string // Se espera recibir un string desde el campo `encapsulatedDto`
  ) {
    console.log(encapsulatedDtoStr);
    
    try {
      // Convertir el string JSON a un objeto
      const encapsulatedDto: EncapsulatedPersonaDTO = JSON.parse(encapsulatedDtoStr);
  
      // Procesar la imagen de perfil si está presente
      if (fotoPerfil) {
        encapsulatedDto.datosGenerales.foto_perfil = fotoPerfil.buffer; // Usar el buffer directamente
      }
  
      // Creación de la persona principal
      const createPersonaDto = encapsulatedDto.datosGenerales;
      const persona = await this.afiliadoService.createPersona(createPersonaDto);
  
      // Creación del detalle de la persona
      const detallePersonaDto = {
        idPersona: persona.id_persona,
        idTipoPersona: createPersonaDto.ID_TIPO_PERSONA,
        porcentaje: 0
      };
      const detallePersona = await this.afiliadoService.createDetallePersona(detallePersonaDto);
  
      // Asignación de centros de trabajo
      let centrosTrabajoAsignados = [];
      if (encapsulatedDto.centrosTrabajo && encapsulatedDto.centrosTrabajo.length > 0) {
        centrosTrabajoAsignados = await this.afiliadoService.assignCentrosTrabajo(persona.id_persona, encapsulatedDto.centrosTrabajo);
      }
  
      // Creación y asignación de referencias personales
      let referenciasAsignadas = [];
      if (encapsulatedDto.referenciasPersonales && encapsulatedDto.referenciasPersonales.length > 0) {
        referenciasAsignadas = await this.afiliadoService.createAndAssignReferences(persona.id_persona, {
          referencias: encapsulatedDto.referenciasPersonales
        });
      }
  
      // Asignación de bancos
      let bancosAsignados = [];
      if (encapsulatedDto.bancos && encapsulatedDto.bancos.length > 0) {
        bancosAsignados = await this.afiliadoService.assignBancosToPersona(persona.id_persona, encapsulatedDto.bancos);
      }
  
      // Creación de beneficiarios
      let beneficiariosAsignados = [];
      const personaReferente = await this.tipoPersonaRepos.findOne({
        where: { tipo_persona: "BENEFICIARIO" },
      });
      if (encapsulatedDto.beneficiarios && encapsulatedDto.beneficiarios.length > 0) {
        for (const beneficiario of encapsulatedDto.beneficiarios) {
          const beneficiarioData = beneficiario.datosBeneficiario;
          const nuevoBeneficiario = await this.afiliadoService.createBeneficiario(beneficiarioData);
          const detalleBeneficiario = {
            idPersona: nuevoBeneficiario.id_persona,
            idCausante: persona.id_persona,
            idCausantePadre: persona.id_persona,
            idTipoPersona: personaReferente.id_tipo_persona,
            porcentaje: beneficiario.porcentaje
          };
          const detalle = await this.afiliadoService.createDetalleBeneficiario(detalleBeneficiario);
          beneficiariosAsignados.push(detalle);
        }
      }
  
      // Asignación de colegios magisteriales
      let colegiosMagisterialesAsignados = [];
      if (encapsulatedDto.colegiosMagisteriales && encapsulatedDto.colegiosMagisteriales.length > 0) {
        colegiosMagisterialesAsignados = await this.afiliadoService.assignColegiosMagisteriales(persona.id_persona, encapsulatedDto.colegiosMagisteriales);
      }
  
      // Manejo de familiares y sus relaciones extendidas
      const familiaresAsignados = [];
      if (encapsulatedDto.familiares && encapsulatedDto.familiares.length > 0) {
        for (const familiarDto of encapsulatedDto.familiares) {
          const familiar = await this.afiliadoService.createPersona(familiarDto);
          await this.afiliadoService.createRelacionFamiliar({
            personaId: persona.id_persona,
            familiarId: familiar.id_persona,
            parentesco: familiarDto.parentescoConPrincipal
          });
          familiaresAsignados.push(familiar);
        }
      }
  
      return {
        message: 'Persona creada con detalles, centros de trabajo, referencias personales, bancos, beneficiarios, colegios magisteriales y relaciones familiares asignadas correctamente.'
      };
    } catch (error) {
      return {
        error: true,
        message: error.message
      };
    }
  }



  @Put('/actualizar-salario')
  @HttpCode(HttpStatus.OK)
  async actualizarSalarioBase(
    @Body('dni') dni: string,
    @Body('idCentroTrabajo') idCentroTrabajo: number,
    @Body('salarioBase') salarioBase: number,
  ): Promise<{ message: string }> {
    await this.afiliadoService.updateSalarioBase(
      dni,
      idCentroTrabajo,
      salarioBase,
    );
    return { message: 'Salario base actualizado con éxito.' };
  }


  @Post('/createReferPersonales/:idPersona')
  createReferPersonales(@Param("idPersona") idPersona:number, @Body() createAfiliadoTempDto: any) {
    return this.afiliadoService.createAndAssignReferences(idPersona,createAfiliadoTempDto);
  }
  @Post('/createColegiosMagisteriales/:idPersona')
  createColegiosMagisteriales(@Param("idPersona") idPersona:number, @Body() colegiosMagisterialesData: any) {
    return this.afiliadoService.assignColegiosMagisteriales(idPersona, colegiosMagisterialesData);
  }
  @Post('/createCentrosTrabajo/:idPersona')
  createCentrosTrabajo(@Param("idPersona") idPersona:number, @Body() centrosTrabajoData: any) {
    return this.afiliadoService.assignCentrosTrabajo(idPersona, centrosTrabajoData);
  }
  @Post('/createDatosBancarios/:idPersona')
  createDatosBancarios(@Param("idPersona") idPersona:number, @Body() bancosData: any) {
    return this.afiliadoService.assignBancosToPersona(idPersona, bancosData);
  }

  @Post('/createBeneficiarios/:idPersona')
  async createBeneficiarios(@Param("idPersona") idPersona:number, @Body() encapsulatedDto: any) {
    const personaReferente = await this.tipoPersonaRepos.findOne({
      where: { tipo_persona: "BENEFICIARIO" },
    });

    try {
      let beneficiariosAsignados = [];
      if (encapsulatedDto.beneficiarios && encapsulatedDto.beneficiarios.length > 0) {
        for (const beneficiario of encapsulatedDto.beneficiarios) {
            const beneficiarioData = beneficiario.datosBeneficiario;
            const nuevoBeneficiario = await this.afiliadoService.createBeneficiario(beneficiarioData);
            const detalleBeneficiario = {
                idPersona: nuevoBeneficiario.id_persona,
                idCausante: idPersona,
                idCausantePadre: idPersona,
                idTipoPersona: personaReferente.id_tipo_persona,
                porcentaje: beneficiario.porcentaje
            };
            const detalle = await this.afiliadoService.createDetalleBeneficiario(detalleBeneficiario);
            beneficiariosAsignados.push(detalle);
        }
      }
      return beneficiariosAsignados;
    } catch (error) {
      console.log(error);
    }
  }

  @Post('createRefPers/:dnireferente')
  createRefPers(@Body() data: any, @Param() dnireferente) {
    return this.afiliadoService.createRefPers(data, dnireferente);
  }
  
  @Post('createCentrosTrabPersona/:dnireferente')
  createCentrosTrabPersona(@Body() data: any, @Param() dnireferente) {
    return this.afiliadoService.createCentrosTrabPersona(data, dnireferente);
  }

  @Get()
  findAll() {
    return this.afiliadoService.findAll();
  }

  @Get('/movimientos/:dni')
  async buscarMovimientosPorDNI(@Param('dni') dni: string) {
    try {
      const resultado =
        await this.afiliadoService.buscarPersonaYMovimientosPorDNI(dni);
      return resultado;
    } catch (error) {
      if (error instanceof NotFoundException) {
        throw error;
      } else {
        throw new NotFoundException(
          `No se pudo procesar la solicitud para el DNI ${dni}`,
        );
      }
    }
  }

  @Get('/getAllReferenciasPersonales/:dni')
  async getAllReferenciasPersonales(@Param("dni") dni:string) {
    try {
      const resultado =
        await this.afiliadoService.getAllReferenciasPersonales(dni);
      return resultado;
    } catch (error) {
      if (error instanceof NotFoundException) {
        throw error;
      } else {
        throw new NotFoundException(
          `No se pudo procesar la solicitud`,
        );
      }
    }
  }

  @Get('/getAllPerfCentroTrabajo/:dni')
  async getAllPerfCentroTrabajo(@Param("dni") dni:string) {    
    try {
      const resultado =
        await this.afiliadoService.getAllPerfCentroTrabajo(dni);
      return resultado;
    } catch (error) {
      if (error instanceof NotFoundException) {
        throw error;
      } else {
        throw new NotFoundException(
          `No se pudo procesar la solicitud`,
        );
      }
    }
  }
  
  @Patch('updateReferenciaPerson/:id')
async updateReferenciaPerson(@Param('id') id: string, @Body() updateDto: UpdateReferenciaPersonalDTO) {

    const idNum = parseInt(id, 10);
    if (isNaN(idNum)) {
        throw new NotFoundException(`El ID proporcionado (${id}) no es válido`);
    }

    const updatedRefPersonal = await this.afiliadoService.updateReferenciaPersonal(idNum, updateDto);

    return {
        mensaje: `Referencia personal con ID ${idNum} actualizada con éxito.`,
        data: updatedRefPersonal,
    };
}

@Delete('eliminarReferencia/:id')
  async deleteReferenciaPersonal(@Param('id', ParseIntPipe) id: number) {
    await this.afiliadoService.deleteReferenciaPersonal(id);
    return {
      mensaje: `La referencia personal con ID ${id} ha sido eliminada con éxito.`,
    };
  }


  @Patch('updatePerfCentroTrabajo/:id')
  async updatePerfCentroTrabajo(@Param('id') id: string, @Body() updateDto: UpdatePerfCentTrabDto) {
    // Convertir el ID a número para evitar errores de tipo
    const idNum = parseInt(id, 10);
    if (isNaN(idNum)) {
      throw new NotFoundException(`El ID proporcionado (${id}) no es válido`);
    }

    // Llamar al servicio para actualizar el perfil
    const updatedProfile = await this.afiliadoService.updatePerfCentroTrabajo(idNum, updateDto);

    // Devolver el perfil actualizado
    return {
      mensaje: `Perfil de centro de trabajo con ID ${idNum} actualizado con éxito.`,
      data: updatedProfile,
    };
  }

  @Patch('desactivarPerfCentroTrabajo/:id')
    async eliminarPerfCentroTrabajo(@Param('id') id: string) {
        const idNum = parseInt(id, 10);
        if (isNaN(idNum)) {
            throw new NotFoundException(`El ID proporcionado (${id}) no es válido`);
        }
        await this.afiliadoService.desactivarPerfCentroTrabajo(idNum);
        return {
            mensaje: `Perfil de centro de trabajo con ID ${idNum} ha sido marcado como inactivo.`,
        };
    }

    @Get('getAllFamiliares/:dni')
  async getVinculosFamiliares(
    @Param('dni') dni: string
  ): Promise<{ nombreCompleto: string, fechaNacimiento: string, parentesco: string }[]> {
    return this.afiliadoService.getVinculosFamiliares(dni);
  }

  @Patch('updateVinculoFamiliar/:dniPersona/:dniFamiliar')
  async updateVinculoFamiliar(
    @Param('dniPersona') dniPersona: string,
    @Param('dniFamiliar') dniFamiliar: string,
    @Body() updateDto: { nombreCompleto?: string, fechaNacimiento?: string, parentesco?: string, dni?: string }
  ) {
    try {
      const result = await this.afiliadoService.updateFamiliarRelation(dniPersona, dniFamiliar, updateDto);
      return result;
    } catch (error) {
      if (error instanceof NotFoundException) {
        throw new NotFoundException(error.message);
      } else {
        throw new Error('No se pudo procesar la solicitud');
      }
    }
  }

  @Post('/agregarFamiliar/:dniPersona')
  async agregarFamiliarYRelacion(
    @Param('dniPersona') dniPersona: string,
    @Body() nuevoFamiliarDto: NuevoFamiliarDTO
  ) {
    return this.afiliadoService.agregarFamiliarYRelacion(dniPersona, nuevoFamiliarDto);
  }

  @Put('/updateDatosBancarios/:idPerf')
  updateDatosBancarios(
    @Param('idPerf') idPerf: string,
    @Body() datosBancarios: any,
  ) {
    return this.afiliadoService.updateDatosBancarios(idPerf, datosBancarios);
  }
  @Put('/updateColegiosMagist/:idPerf')
  updateColegiosMagist(
    @Param('idPerf') idPerf: string,
    @Body() datosColegioMagist: any,
  ) {
    return this.afiliadoService.updateColegiosMagist(idPerf, datosColegioMagist);
  }

  @Get('/dni/:dni')
  async findByDni(@Param('dni') dni: string) {
    return await this.afiliadoService.findByDni(dni);
  }

  @Get(':term')
  findOnePersona(@Param('term') term: string) {
    return this.afiliadoService.findOnePersona(term);
  }

  @Get('Afiliado/:term')
  findOne(@Param('term') term: string) {
    return this.afiliadoService.findOne(term);
  }
  @Get('/getAllPersonaPBanco/:dni')
  getAllPersonaPBanco(@Param('dni') dni: string) {
    return this.afiliadoService.getAllPersonaPBanco(dni);
  }

  @Get('/getAllColMagPPersona/:dni')
  getAllColMagPPersona(@Param('dni') dni: string) {
    return this.afiliadoService.getAllColMagPPersona(dni);
  }

  @Get('obtenerBenDeAfil/:dniAfil')
  async obtenerDatosRelacionados(
    @Param('dniAfil') dniAfil: string,
  ): Promise<any> {
    return this.afiliadoService.obtenerBenDeAfil(dniAfil);
  }

  @Get('getAllBenDeAfil/:dniAfil')
  async getAllBenDeAfil(
    @Param('dniAfil') dniAfil: string,
  ): Promise<any> {
    return this.afiliadoService.getAllBenDeAfil(dniAfil);
  }

  @Patch(':id')
  update(
    @Param('id') id: string,
    @Body() updateAfiliadoDto: UpdatePersonaDto,
  ) {
    return this.afiliadoService.update(+id, updateAfiliadoDto);
  }

  @Delete(':id')
  remove(@Param('id') id: string) {
    return this.afiliadoService.remove(+id);
  }
}
