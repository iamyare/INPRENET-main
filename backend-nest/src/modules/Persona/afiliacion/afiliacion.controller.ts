import { Body, Controller, Get, HttpException, HttpStatus, NotFoundException, Param, Patch, Post, UploadedFile, UseInterceptors } from '@nestjs/common';
import { AfiliacionService } from './afiliacion.service';
import { net_persona } from '../entities/net_persona.entity';
import { FileInterceptor } from '@nestjs/platform-express';
import { CrearDatosDto } from './dtos/crear-datos.dto';
import { Net_Discapacidad } from '../entities/net_discapacidad.entity';
import { Net_Ref_Per_Pers } from '../entities/net_ref-per-persona.entity';
import { CrearReferenciaDto } from './dtos/crear-referencia.dto';
import { Connection, EntityManager, getConnection, getManager } from 'typeorm';
import { CrearPersonaBancoDto } from './dtos/crear-persona_por_banco.dto';
import { Net_Persona_Por_Banco } from 'src/modules/banco/entities/net_persona-banco.entity';

@Controller('afiliacion')
export class AfiliacionController {
  constructor(private readonly afiliacionService: AfiliacionService,private readonly connection: Connection,) {
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
  ): Promise<Net_Ref_Per_Pers[]> {
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
    limits: { fileSize: 5 * 1024 * 1024 }, // 5MB file size limit
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
}
