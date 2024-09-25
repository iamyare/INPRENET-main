import { Body, Controller, Delete, Get, HttpException, HttpStatus, NotFoundException, Param, ParseIntPipe, Patch, Post, UploadedFile, UseInterceptors } from '@nestjs/common';
import { AfiliacionService } from './afiliacion.service';
import { net_persona } from '../entities/net_persona.entity';
import { FileInterceptor } from '@nestjs/platform-express';
import { CrearDatosDto } from './dtos/crear-datos.dto';
import { Net_Discapacidad } from '../entities/net_discapacidad.entity';
import { Connection, EntityManager} from 'typeorm';
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

@Controller('afiliacion')
export class AfiliacionController {
  constructor(private readonly afiliacionService: AfiliacionService,private readonly connection: Connection, private readonly entityManager: EntityManager,) {
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
  ){
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
  @UseInterceptors(FileInterceptor('foto_perfil'))
  async crear(
    @Body('datos') datos: string,
    @UploadedFile() fotoPerfil: Express.Multer.File
  ): Promise<any> {
    try {
      const crearDatosDto: CrearDatosDto = JSON.parse(datos);
      return await this.afiliacionService.crearDatos(crearDatosDto, fotoPerfil);
    } catch (error) {
      throw new HttpException(error.message, HttpStatus.BAD_REQUEST);
    }
}

  @Patch('referencia/actualizar/:idReferencia')
    async actualizarReferencia(
      @Param('idReferencia') idReferencia: number,
      @Body() datosActualizados: CrearReferenciaDto
    ): Promise<void> {
      console.log(datosActualizados);
      
      return this.afiliacionService.actualizarReferencia(idReferencia, datosActualizados);
    }
}
