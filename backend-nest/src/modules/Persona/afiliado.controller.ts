import {
  Controller,
  Get,
  Put,
  Delete,
  Patch,
  Body,
  Param,
  NotFoundException,
  HttpCode,
  HttpStatus,
  ParseIntPipe,
  UseInterceptors,
  UploadedFiles,
  HttpException,
  Req
} from '@nestjs/common';
import { AfiliadoService } from './afiliado.service';
import { UpdatePersonaDto } from './dto/update-persona.dto';
import { ApiTags } from '@nestjs/swagger';
import { UpdatePerfCentTrabDto } from './dto/update.perfAfilCentTrab.dto';
import { net_estado_afiliacion } from './entities/net_estado_afiliacion.entity';
import { AnyFilesInterceptor } from '@nestjs/platform-express';

@ApiTags('Persona')
@Controller('Persona')
export class AfiliadoController {

  constructor(private readonly afiliadoService: AfiliadoService) { }

  @Get('/ubicacion')
  async obtenerUbicacion(@Req() req): Promise<any> {
    const ip = req.headers['x-forwarded-for'] || req.connection.remoteAddress;
    const ipLimpia = ip.includes(':') ? ip.split(':').pop() : ip;
    try {
      const ubicacion = await this.afiliadoService.obtenerUbicacion(ipLimpia);

      if (ubicacion && ubicacion.city) {
        const municipio = this.afiliadoService.obtenerMunicipio(ubicacion.city);
        return { municipio, ubicacion };
      } else {
        return { error: 'No se pudo determinar la ubicación' };
      }
    } catch (error) {
      return { error: 'Error al procesar la solicitud', detalle: error.message };
    }
  }


  @Get(':id_persona/movimientos-ordenados/:id_tipo_cuenta')
  async getMovimientosOrdenados(
    @Param('id_persona', ParseIntPipe) id_persona: number,
    @Param('id_tipo_cuenta', ParseIntPipe) id_tipo_cuenta: number
  ) {
    try {
      const movimientos = await this.afiliadoService.getMovimientosOrdenados(id_persona, id_tipo_cuenta);
      if (!movimientos) {
        throw new NotFoundException(`Movimientos no encontrados para el id_persona ${id_persona} y id_tipo_cuenta ${id_tipo_cuenta}`);
      }
      return { status: HttpStatus.OK, data: movimientos };
    } catch (error) {
      throw new HttpException(
        'Error al obtener los movimientos ordenados',
        HttpStatus.INTERNAL_SERVER_ERROR,
      );
    }
  }

  @Patch('inactivar/:idPersona/:idCausante')
  async inactivarPersona(
    @Param('idPersona') idPersona: number,
    @Param('idCausante') idCausante: number
  ): Promise<void> {
    try {
      await this.afiliadoService.inactivarPersona(idPersona, idCausante);
    } catch (error) {
      if (error instanceof NotFoundException) {
        throw new NotFoundException(error.message);
      }
      throw error;
    }
  }

  @Get('obtenerEstados')
  async getAllEstados(): Promise<net_estado_afiliacion[]> {
    return this.afiliadoService.getAllEstados();
  }

  @Get()
  findAll() {
    return this.afiliadoService.findAll();
  }

  @Get('/movimientos/:dni')
  async buscarMovimientosPorN_IDENTIFICACION(@Param('dni') dni: string) {
    try {
      const resultado =
        await this.afiliadoService.buscarPersonaYMovimientosPorN_IDENTIFICACION(dni);
      return resultado;
    } catch (error) {
      if (error instanceof NotFoundException) {
        throw error;
      } else {
        throw new NotFoundException(
          `No se pudo procesar la solicitud para el N_IDENTIFICACION ${dni}`,
        );
      }
    }
  }

  @Get('/cuentas/:n_identificacion')
  async buscarCuentasPorN_IDENTIFICACION(@Param('n_identificacion') n_identificacion: string) {
    try {
      const resultado =
        await this.afiliadoService.buscarCuentasPorN_IDENTIFICACION(n_identificacion);
      return resultado;
    } catch (error) {
      if (error instanceof NotFoundException) {
        throw error;
      } else {
        throw new NotFoundException(
          `No se pudo procesar la solicitud para el N_IDENTIFICACION ${n_identificacion}`,
        );
      }
    }
  }

  @Get('/getAllPerfCentroTrabajo/:n_identificacion')
  async getAllPerfCentroTrabajo(@Param("n_identificacion") n_identificacion: string) {
    try {
      const resultado =
        await this.afiliadoService.getAllPerfCentroTrabajo(n_identificacion);
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
  @Get('/getAllCargoPublicPeps/:n_identificacion')
  async getAllCargoPublicPeps(@Param("n_identificacion") n_identificacion: string) {
    try {
      const resultado =
        await this.afiliadoService.getAllCargoPublicPeps(n_identificacion);
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

  @Get('/getAllOtrasFuentesIngres/:n_identificacion')
  async getAllOtrasFuentesIngres(@Param("n_identificacion") n_identificacion: string) {
    try {
      const resultado =
        await this.afiliadoService.getAllOtrasFuentesIngres(n_identificacion);
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

  @Delete('eliminarColegioMagisterialPersona/:id')
  async eliminarColegioMagisterialPersona(@Param('id', ParseIntPipe) id: number) {
    await this.afiliadoService.eliminarColegioMagisterialPersona(id);
    return {
      mensaje: `La referencia personal con ID ${id} ha sido eliminada con éxito.`,
    };
  }


  @Patch('updatePerfCentroTrabajo/:id')
  async updatePerfCentroTrabajo(@Param('id') id: string, @Body() updateDto: UpdatePerfCentTrabDto) {
    const idNum = parseInt(id, 10);
    if (isNaN(idNum)) {
      throw new NotFoundException(`El ID proporcionado (${id}) no es válido`);
    }
    const updatedProfile = await this.afiliadoService.updatePerfCentroTrabajo(idNum, updateDto);
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

  @Put('actualizarBeneficiario/:id')
  updatePersona(
    @Param('id') id: number,
    @Body() updateBeneficiarioDto: any,
  ): Promise<any> {
    return this.afiliadoService.updateBeneficiario(id, updateBeneficiarioDto);
  }

  @Put('desactivarCuentaBancaria/:id')
  async desactivarCuentaBancaria(@Param('id') id: string) {
    const idNum = parseInt(id, 10);
    if (isNaN(idNum)) {
      throw new NotFoundException(`El ID proporcionado (${id}) no es válido`);
    }
    await this.afiliadoService.desactivarCuentaBancaria(idNum);
    return {
      mensaje: `Perfil de centro de trabajo con ID ${idNum} ha sido marcado como inactivo.`,
    };
  }

  @Put('/updateDatosGenerales/:idPersona')
  @UseInterceptors(AnyFilesInterceptor())
  updateDatosGenerales(
    @Param('idPersona') idPersona: number,
    @Body('datosGenerales') datosGenerales: any,
    @UploadedFiles() files?: Express.Multer.File[],
  ) {
    const crearDatosDto: any = JSON.parse(datosGenerales);
    const fileIdent = files?.find(file => file.fieldname === 'archivo_identificacion');
    const arch_cert_def = files?.find(file => file.fieldname === 'arch_cert_def');
    const fotoPerfil = files?.find(file => file.fieldname === 'FotoPerfil');

    return this.afiliadoService.updateDatosGenerales(idPersona, crearDatosDto, fileIdent, arch_cert_def, fotoPerfil);
  }

  @Put('activarCuentaBancaria/:id/:id_persona')
  async activarCuentaBancaria(@Param('id') id: string, @Param('id_persona') id_persona: number) {
    const idNum = parseInt(id, 10);
    if (isNaN(idNum)) {
      throw new NotFoundException(`El ID proporcionado (${id}) no es válido`);
    }
    await this.afiliadoService.activarCuentaBancaria(idNum, id_persona);
    return {
      mensaje: `Perfil de centro de trabajo con ID ${idNum} ha sido marcado como inactivo.`,
    };
  }

  @Get('/dni/:dni')
  async findByDni(@Param('dni') dni: string) {
    return await this.afiliadoService.findByDni(dni);
  }

  @Get(':term')
  findOnePersona(@Param('term') term: string) {
    return this.afiliadoService.findOnePersona(term);
  }

  @Get('Afil/:term')
  findOneAFiliado(@Param('term') term: string) {
    return this.afiliadoService.findOneAFiliado(term);
  }

  @Get('personaParaDeduccion/:term')
  findOnePersonaParaDeduccion(@Param('term') term: string) {
    return this.afiliadoService.findOnePersonaParaDeduccion(term);
  }


  @Get('findTipoPersonaByN_ident/:term')
  findTipoPersonaByN_ident(@Param('term') term: string) {
    return this.afiliadoService.findTipoPersonaByN_ident(term);
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
