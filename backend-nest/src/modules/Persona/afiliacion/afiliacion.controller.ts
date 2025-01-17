import { Body, Controller, Delete, Get, HttpException, HttpStatus, NotFoundException, Param, ParseIntPipe, Patch, Post, Put, Query, UploadedFile, UploadedFiles, UseInterceptors } from '@nestjs/common';
import { AfiliacionService } from './afiliacion.service';
import { net_persona } from '../entities/net_persona.entity';
import { AnyFilesInterceptor, FileInterceptor, FilesInterceptor } from '@nestjs/platform-express';
import { CrearDatosDto } from './dtos/crear-datos.dto';
import { Net_Discapacidad } from '../entities/net_discapacidad.entity';
import { Connection, EntityManager } from 'typeorm';
import { CrearPersonaBancoDto } from './dtos/crear-persona_por_banco.dto';
import { Net_Persona_Por_Banco } from 'src/modules/banco/entities/net_persona-banco.entity';
import { Net_perf_pers_cent_trab } from '../entities/net_perf_pers_cent_trab.entity';
import { CrearPersonaCentroTrabajoDto } from './dtos/crear-perf_pers_cent_trab.dto';
import { CrearPersonaColegiosDto } from './dtos/crear-persona_colegios.dto';
import { Net_Persona_Colegios } from 'src/modules/transacciones/entities/net_persona_colegios.entity';
import { CrearOtraFuenteIngresoDto } from './dtos/crear-otra_fuente_ingreso.dto';
import { net_otra_fuente_ingreso } from '../entities/net_otra_fuente_ingreso.entity';
import { CrearBeneficiarioDto } from './dtos/crear-beneficiario.dto';
import { net_detalle_persona } from '../entities/net_detalle_persona.entity';
import { CrearReferenciaDto } from './dtos/crear-referencia.dto';
import { Net_Familia } from '../entities/net_familia.entity';
import { CrearFamiliaDto } from './dtos/crear-familiar.dto';
import { CrearPepsDto } from './dtos/crear-peps.dto';
import { CrearDiscapacidadDto } from './dtos/crear-discapacidad.dto';
import { ObtenerFallecidosDto } from './dtos/obtener-fallecidos.dto';

@Controller('afiliacion')
export class AfiliacionController {
  constructor(private readonly afiliacionService: AfiliacionService, private readonly connection: Connection, private readonly entityManager: EntityManager,) {
  }

  @Get('fallecidos-reportados')
async obtenerFallecidos(@Query('mes') mes: number, @Query('anio') anio: number) {
  try {
    const fallecidos = await this.afiliacionService.obtenerFallecidosPorMes(mes, anio);
    return { message: 'Personas fallecidas encontradas', data: fallecidos };
  } catch (error) {
    throw new HttpException(
      'Ocurrió un error inesperado. Inténtelo de nuevo más tarde o contacte con soporte si el problema persiste.',
      HttpStatus.INTERNAL_SERVER_ERROR
    );
  }
}


  @Get('buscar-por-nombres-apellidos')
  async buscarPersona(@Query('terminos') terminos: string) {
    const personas = await this.afiliacionService.buscarPersonaPorNombresYApellidos(terminos);
    return {
      message: 'Personas encontradas',
      personas,
    };
  }

  @Patch('persona/:id/foto')
  @UseInterceptors(FileInterceptor('foto'))
  async actualizarFotoPersona(
    @Param('id', ParseIntPipe) idPersona: number,
    @UploadedFile() foto: Express.Multer.File,
  ) {
    if (!foto) {
      throw new HttpException('No se ha proporcionado un archivo válido.', HttpStatus.BAD_REQUEST);
    }

    const persona = await this.afiliacionService.actualizarFotoPersona(idPersona, foto.buffer);

    return {
      message: 'Foto actualizada exitosamente',
      persona,
    };
  }

  @Delete('cargos-publicos/:idCargoPublico')
  async eliminarCargoPublico(
    @Param('idCargoPublico', ParseIntPipe) idCargoPublico: number
  ): Promise<void> {
    await this.afiliacionService.eliminarCargoPublico(idCargoPublico);
  }

  @Delete(':idPersona/discapacidades/:tipoDiscapacidad')
  async eliminarDiscapacidad(
    @Param('idPersona', ParseIntPipe) idPersona: number,
    @Param('tipoDiscapacidad') tipoDiscapacidad: string,
  ): Promise<void> {
    await this.afiliacionService.eliminarDiscapacidad(idPersona, tipoDiscapacidad);
  }

  @Post(':idPersona/discapacidades')
  async crearDiscapacidades(
    @Param('idPersona', ParseIntPipe) idPersona: number,
    @Body() discapacidadesDto: CrearDiscapacidadDto[],
  ): Promise<void> {
    const persona = await this.entityManager.findOne('net_persona', { where: { id_persona: idPersona } });
    if (!persona) {
      throw new NotFoundException(`Persona con ID ${idPersona} no encontrada`);
    }
    await this.connection.transaction(async (entityManager) => {
      await this.afiliacionService.crearDiscapacidades(discapacidadesDto, idPersona, entityManager);
    });
  }

  @Put('actualizar-peps')
  async actualizarPeps(@Body() pepsData: any) {
    return this.entityManager.transaction(async (transactionalEntityManager) => {
      return this.afiliacionService.actualizarPeps(pepsData, transactionalEntityManager);
    });
  }

  @Delete(':idPersona/familiares/:idFamiliar')
  async eliminarFamiliar(
    @Param('idPersona', ParseIntPipe) idPersona: number,
    @Param('idFamiliar', ParseIntPipe) idFamiliar: number,
  ): Promise<string> {
    return this.afiliacionService.eliminarFamiliar(idPersona, idFamiliar);
  }

  @Post('persona/:idPersona/peps')
  async crearPeps(
    @Param('idPersona') idPersona: number,
    @Body() pepsDto: CrearPepsDto[],
  ): Promise<void> {
    try {
      await this.afiliacionService.crearPeps(pepsDto, idPersona, this.entityManager);
    } catch (error) {
      console.error('Error al crear los PEPs:', error);
      throw new HttpException('Error al crear los PEPs', HttpStatus.BAD_REQUEST);
    }
  }

  @Post('persona/:idPersona/familia')
  async crearFamilia(
    @Param('idPersona') idPersona: number,
    @Body() familiaresDto: CrearFamiliaDto[],
  ): Promise<void> {
    await this.afiliacionService.crearFamilia(familiaresDto, idPersona, this.entityManager);
  }

  @Patch('conyuge/:n_identificacion')
  async actualizarConyuge(
    @Param('n_identificacion') n_identificacion: string,
    @Body() updateConyugeDto: any
  ) {
    try {
      return this.afiliacionService.actualizarConyuge(n_identificacion, updateConyugeDto);
    } catch (error) {
      throw new HttpException('Error al actualizar los datos del cónyuge', HttpStatus.BAD_REQUEST);
    }
  }

  @Get('conyuge/:n_identificacion')
  async obtenerConyuge(@Param('n_identificacion') n_identificacion: string): Promise<Net_Familia> {
    return this.afiliacionService.obtenerConyugePorIdentificacion(n_identificacion);
  }

  @Delete('otra-fuente-ingreso/:id')
  async eliminarOtraFuenteIngreso(@Param('id', ParseIntPipe) id: number) {
    return this.afiliacionService.eliminarOtraFuenteIngreso(id);
  }

  @Patch('otra-fuente-ingreso/:id')
  async editarOtraFuenteIngreso(
    @Param('id', ParseIntPipe) id: number,
    @Body() dto: CrearOtraFuenteIngresoDto
  ) {
    return this.afiliacionService.editarOtraFuenteIngreso(id, dto);
  }

  @Post('asignar-centros-trabajo/:idPersona')
  async asignarCentrosTrabajoAPersona(
    @Param('idPersona') idPersona: number,
    @Body() crearPersonaCentrosTrabajoDtos: CrearPersonaCentroTrabajoDto[],
  ): Promise<Net_perf_pers_cent_trab[]> {
    return await this.connection.transaction(async (entityManager: EntityManager) => {
      return this.afiliacionService.crearPersonaCentrosTrabajo(crearPersonaCentrosTrabajoDtos, idPersona, entityManager);
    });
  }

  @Post('asignar-bancos/:idPersona')
  async asignarBancosAPersona(
    @Param('idPersona') idPersona: number,
    @Body() crearPersonaBancosDtos: CrearPersonaBancoDto[],
  ): Promise<Net_Persona_Por_Banco[]> {
    return await this.connection.transaction(async (entityManager: EntityManager) => {
      return this.afiliacionService.crearPersonaBancos(crearPersonaBancosDtos, idPersona, entityManager);
    });
  }

  @Post('asignar-colegios/:idPersona')
  async asignarColegiosAPersona(
    @Param('idPersona') idPersona: number,
    @Body() crearPersonaColegiosDtos: CrearPersonaColegiosDto[],
  ): Promise<Net_Persona_Colegios[]> {
    return await this.connection.transaction(async (entityManager: EntityManager) => {
      return this.afiliacionService.crearPersonaColegios(crearPersonaColegiosDtos, idPersona, entityManager);
    });
  }

  @Post('asignar-fuentes-ingreso/:idPersona')
  async asignarFuentesIngresoAPersona(
    @Param('idPersona') idPersona: number,
    @Body() crearOtrasFuentesIngresoDtos: CrearOtraFuenteIngresoDto[],
  ): Promise<net_otra_fuente_ingreso[]> {
    return await this.connection.transaction(async (entityManager: EntityManager) => {
      return this.afiliacionService.crearOtrasFuentesIngreso(crearOtrasFuentesIngresoDtos, idPersona, entityManager);
    });
  }

  @Post('asignar-beneficiarios/:idPersona/:idDetallePersona')
  async asignarBeneficiariosAPersona(
    @Param('idPersona') idPersona: number,
    @Param('idDetallePersona') idDetallePersona: number,
    @Body() crearBeneficiariosDtos: CrearBeneficiarioDto[],
  ): Promise<net_detalle_persona[]> {
    return await this.connection.transaction(async (entityManager: EntityManager) => {
      return this.afiliacionService.crearBeneficiarios(crearBeneficiariosDtos, idPersona, idDetallePersona, entityManager);
    });
  }

  @Get('referencias/:nIdentificacion')
  async obtenerReferenciasPorIdentificacion(@Param('nIdentificacion') nIdentificacion: string) {
    return await this.afiliacionService.obtenerReferenciasPorIdentificacion(nIdentificacion);
  }

  @Patch('referencia/inactivar/:id')
  async inactivarReferencia(@Param('id') idRefPersonal: number): Promise<void> {
    return this.afiliacionService.eliminarReferencia(idRefPersonal);
  }

  @Post('agregar-referencias/:idPersona')
  async crearReferencia(
    @Param('idPersona') idPersona: number,
    @Body() crearReferenciasDtos: CrearReferenciaDto[],
  ) {
    return await this.connection.transaction(async (entityManager: EntityManager) => {
      return this.afiliacionService.crearReferencias(crearReferenciasDtos, idPersona, entityManager);
    });
  }

  @Get('discapacidades')
  async getAllDiscapacidades(): Promise<Net_Discapacidad[]> {
    return this.afiliacionService.getAllDiscapacidades();
  }

  @Get('persona-dni/:n_identificacion')
  async getPersonaByDni(@Param('n_identificacion') n_identificacion: string): Promise<net_persona> {
    return this.afiliacionService.getPersonaByn_identificacioni(n_identificacion);
  }

  @Get('causantes/:n_identificacion')
  async getCausantesByDniBeneficiario(@Param('n_identificacion') n_identificacion: string): Promise<net_persona[]> {
    try {
      const causantes = await this.afiliacionService.getCausantesByDniBeneficiario(n_identificacion);
      if (!causantes || causantes.length === 0) {
        throw new NotFoundException('Causantes no encontrados');
      }
      return causantes;
    } catch (error) {
      throw new NotFoundException(error.message);
    }
  }

  @Post(':id/foto-perfil')
  @UseInterceptors(FileInterceptor('fotoPerfil', {
    limits: { fileSize: 5 * 1024 * 1024 },
    fileFilter: (req, file, callback) => {
      if (file.mimetype.startsWith('image/')) {
        callback(null, true);
      } else {
        callback(new Error('Solo se permiten archivos de imagen'), false);
      }
    },
  }))
  async updateFotoPerfil(@Param('id') id: string, @UploadedFile() fotoPerfil: Express.Multer.File) {
    if (!fotoPerfil) {
      throw new Error('No se ha subido ningún archivo');
    }
    return await this.afiliacionService.updateFotoPerfil(Number(id), fotoPerfil.buffer);
  }

  @Post('/crear')
  @UseInterceptors(AnyFilesInterceptor())  // Para manejar múltiples archivos de varios campos
  async crear(
    @Body('datos') datos: any,
    @UploadedFiles() files?: Express.Multer.File[],  // Todos los archivos serán capturados aquí
  ): Promise<any> {
    try {
      const crearDatosDto: CrearDatosDto = JSON.parse(datos);

      // Filtrar cada archivo por su campo de entrada (fieldname)
      const fotoPerfil = files?.find(file => file.fieldname === 'foto_perfil');
      const fileIdent = files?.find(file => file.fieldname === 'file_ident');
      return await this.afiliacionService.crearDatos(crearDatosDto, fotoPerfil, fileIdent, files);
    } catch (error) {
      throw new HttpException(error.message, HttpStatus.BAD_REQUEST);
    }
  }

  @Patch('referencia/actualizar/:idReferencia')
  async actualizarReferencia(
    @Param('idReferencia') idReferencia: number,
    @Body() datosActualizados: CrearReferenciaDto
  ): Promise<void> {
    return this.afiliacionService.actualizarReferencia(idReferencia, datosActualizados);
  }

  @Get(':idPersona/familiares')
  async obtenerFamiliaresDePersona(@Param('idPersona', ParseIntPipe) idPersona: number): Promise<Net_Familia[]> {
    return this.afiliacionService.obtenerFamiliaresPorPersona(idPersona);
  }
}
