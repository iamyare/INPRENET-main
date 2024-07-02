import { Controller, Get, NotFoundException, Param, Post, UploadedFile, UseInterceptors } from '@nestjs/common';
import { AfiliacionService } from './afiliacion.service';
import { net_persona } from '../entities/net_persona.entity';
import { FileInterceptor } from '@nestjs/platform-express';

@Controller('afiliacion')
export class AfiliacionController {
  constructor(private readonly afiliacionService: AfiliacionService) {
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
}
