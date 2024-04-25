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
} from '@nestjs/common';
import { AfiliadoService } from './afiliado.service';
import { NetPersonaDTO } from './dto/create-persona.dto';
import { UpdatePersonaDto } from './dto/update-persona.dto';
import { CreateAfiliadoTempDto } from './dto/create-afiliado-temp.dto';
import { ApiTags } from '@nestjs/swagger';
import { CreateDetallePersonaDto } from './dto/create-detalle.dto';
import { EncapsulatedPersonaDTO } from './dto/encapsulated-persona.dto';
import { CreateReferenciaPersonalDTO } from './dto/create-referencia.dto ';
import { AsignarReferenciasDTO } from './dto/asignarReferencia.dto';
import { DataSource } from 'typeorm';

@ApiTags('Afiliado')
@Controller('afiliado')
export class AfiliadoController {
  constructor(private readonly afiliadoService: AfiliadoService, private dataSource: DataSource) {}

  @Post('afiliacion')
    async createPersonaWithDetailsAndWorkCenters(@Body() encapsulatedDto: EncapsulatedPersonaDTO) {
        try {
            // Creación de la persona principal
            const createPersonaDto = encapsulatedDto.datosGenerales;
            const persona = await this.afiliadoService.create(createPersonaDto);

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
                referenciasAsignadas = await this.afiliadoService.createAndAssignReferences({
                    idPersona: persona.id_persona,
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
            if (encapsulatedDto.beneficiarios && encapsulatedDto.beneficiarios.length > 0) {
                for (const beneficiario of encapsulatedDto.beneficiarios) {
                    const beneficiarioData = beneficiario.datosBeneficiario;
                    const nuevoBeneficiario = await this.afiliadoService.createBeneficiario(beneficiarioData);
                    const detalleBeneficiario = {
                        idPersona: nuevoBeneficiario.id_persona,
                        idCausante: persona.id_persona,
                        idCausantePadre: persona.id_persona,
                        idTipoPersona: beneficiarioData.ID_TIPO_PERSONA,
                        porcentaje: beneficiario.porcentaje
                    };
                    const detalle = await this.afiliadoService.createDetalleBeneficiario(detalleBeneficiario);
                    beneficiariosAsignados.push(detalle);
                }
            }

            return {
                persona,
                detallePersona,
                centrosTrabajoAsignados,
                referenciasAsignadas,
                bancosAsignados,
                beneficiariosAsignados,
                message: 'Persona creada con detalles, centros de trabajo, referencias personales, bancos y beneficiarios asignados correctamente.'
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

  @Post('temp')
  createEspecial(@Body() createAfiliadoTempDto: CreateAfiliadoTempDto) {
    return this.afiliadoService.createTemp(createAfiliadoTempDto);
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
  
  @Put('/updateReferenciaPerson/:id')
  updateReferenciaPerson(
    @Param('id') id: string,
    @Body() referPersData: any,
  ) {
    
    
    return this.afiliadoService.updateReferenciaPerson(id, referPersData);
  }

  @Put('/updatePerfCentroTrabajo/:id')
  updatePerfCentroTrabajo(
    @Param('id') id: string,
    @Body() PerfCentTrabData: any,
  ) {
    return this.afiliadoService.updatePerfCentroTrabajo(id, PerfCentTrabData);
  }

  @Get('/dni/:dni')
  async findByDni(@Param('dni') dni: string) {
    return await this.afiliadoService.findByDni(dni);
  }

  @Get(':term')
  findOne(@Param('term') term: number) {
    return this.afiliadoService.findOne(term);
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
