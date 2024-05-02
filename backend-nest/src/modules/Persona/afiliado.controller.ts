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
import { UpdatePersonaDto } from './dto/update-persona.dto';
import { ApiTags } from '@nestjs/swagger';
import { EncapsulatedPersonaDTO } from './dto/encapsulated-persona.dto';
import { DataSource } from 'typeorm';
import { AsignarReferenciasDTO } from './dto/asignarReferencia.dto';

@ApiTags('Persona')
@Controller('Persona')
export class AfiliadoController {
  constructor(private readonly afiliadoService: AfiliadoService, private dataSource: DataSource) {}

  @Post('afiliacion')
    async createPersonaWithDetailsAndWorkCenters(@Body() encapsulatedDto: EncapsulatedPersonaDTO) {
        try {
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
                referenciasAsignadas = await this.afiliadoService.createAndAssignReferences(persona.id_persona,{
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
                        parentezco: familiarDto.parentezcoConPrincipal
                    });

                    if (familiarDto.encargadoDos) {
                        const encargadoDos = await this.afiliadoService.createPersona(familiarDto.encargadoDos);
                        await this.afiliadoService.createRelacionFamiliar({
                            personaId: encargadoDos.id_persona,
                            familiarId: familiar.id_persona,
                            parentezco: familiarDto.encargadoDos.parentezcoConFamiliar
                        });
                    }

                    familiaresAsignados.push(familiar);
                }
            }

            return {
                persona,
                detallePersona,
                centrosTrabajoAsignados,
                referenciasAsignadas,
                bancosAsignados,
                beneficiariosAsignados,
                colegiosMagisterialesAsignados,
                familiaresAsignados,
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
  createColegiosMagisteriales(@Param() idPersona:number, @Body() colegiosMagisterialesData: any) {
    return this.afiliadoService.assignColegiosMagisteriales(idPersona,colegiosMagisterialesData);
  }
  @Post('/createCentrosTrabajo/:idPersona')
  createCentrosTrabajo(@Param("idPersona") idPersona:number, @Body() centrosTrabajoData: any) {
    return this.afiliadoService.assignCentrosTrabajo(idPersona, centrosTrabajoData);
  }
  @Post('/createDatosBancarios/:idPersona')
  createDatosBancarios(@Param("idPersona") idPersona:number, @Body() bancosData: any) {
    return this.afiliadoService.assignBancosToPersona(idPersona, bancosData);
  }

/*   @Post('/createBeneficiarios/')
  createBeneficiarios(@Body() createAfiliadoTempDto: AsignarReferenciasDTO) {
    return this.afiliadoService.createAndAssignReferences(createAfiliadoTempDto);
  } */

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
  
  findOnePersona(@Param('term') term: number) {
    return this.afiliadoService.findOnePersona(term);
  }

  @Get('Afiliado/:term')
  findOne(@Param('term') term: string) {
    console.log(term);
    
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
