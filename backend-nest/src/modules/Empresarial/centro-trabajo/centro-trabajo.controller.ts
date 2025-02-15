import { Controller, Get, Post, Body, Patch, Param, Delete, Res, HttpStatus, Put, UseInterceptors, UploadedFiles, ParseIntPipe, UploadedFile, BadRequestException, NotFoundException, Query } from '@nestjs/common';
import { CentroTrabajoService } from './centro-trabajo.service';
import { CreateCentroTrabajoDto } from './dto/create-centro-trabajo.dto';
import { UpdateCentroTrabajoDto } from './dto/update-centro-trabajo.dto';
import { ApiTags } from '@nestjs/swagger';
import { CreatePrivateCentroTrabajoCompleteDto } from './dto/create-private-centro-trabajo-complete.dto';
import { Net_Centro_Trabajo } from '../entities/net_centro_trabajo.entity';
import { FileFieldsInterceptor, FileInterceptor, FilesInterceptor } from '@nestjs/platform-express';
import { UpdateEmpleadoDto } from './dto/update-empleado.dto';
import { Net_Jornada } from '../entities/net_jornada.entity';
import { Net_Nivel_Educativo } from '../entities/net_nivel_educativo.entity';
import { Net_Empleado } from '../entities/net_empleado.entity';

@ApiTags('centro-trabajo')
@Controller('centro-trabajo')
export class CentroTrabajoController {
  constructor(private readonly centroTrabajoService: CentroTrabajoService) { }

  @Get('buscar')
  async buscarCentroTrabajo(@Query('termino') termino: string) {
    if (!termino || termino.trim().length === 0) {
      throw new NotFoundException('Debe proporcionar un término de búsqueda.');
    }

    const centros = await this.centroTrabajoService.buscarCentroTrabajo(termino);
    
    if (centros.length === 0) {
      throw new NotFoundException(`No se encontraron coincidencias para: ${termino}`);
    }

    return centros;
  }

  @Patch('empleado/:id/archivo-identificacion')
  @UseInterceptors(FileInterceptor('archivo_identificacion'))
  async actualizarArchivoIdentificacion(
    @Param('id') id_empleado: number,
    @UploadedFile() archivo: Express.Multer.File,
  ): Promise<Net_Empleado> {
    // Validar si se recibió un archivo
    if (!archivo) {
      throw new BadRequestException('No se ha subido ningún archivo');
    }

    // Llamar al servicio para actualizar el archivo de identificación
    const empleadoActualizado = await this.centroTrabajoService.updateArchivoIdentificacion(id_empleado, archivo.buffer);

    // Verificar si el empleado fue encontrado y actualizado
    if (!empleadoActualizado) {
      throw new NotFoundException(`Empleado con ID ${id_empleado} no encontrado.`);
    }

    return empleadoActualizado;
  }

  @Get('jornadas')
  async getAllJornadas(): Promise<Net_Jornada[]> {
    return this.centroTrabajoService.getAllJornadas();
  }

  @Get('niveles-educativos')
  async getAllNivelesEducativos(): Promise<Net_Nivel_Educativo[]> {
    return this.centroTrabajoService.getAllNivelesEducativos();
  }

  @Put('actualizar/:id')
  @UseInterceptors(
    FileFieldsInterceptor(
      [
        { name: 'archivoIdentificacion', maxCount: 1 },
        { name: 'fotoEmpleado', maxCount: 1 }
      ]
    )
  )
  async actualizarEmpleado(
    @Param('id') id: number,
    @Body() updateEmpleadoDto: UpdateEmpleadoDto,
    @UploadedFiles() files: { archivoIdentificacion?: Express.Multer.File[], fotoEmpleado?: Express.Multer.File[] }
  ): Promise<any> {
    let archivoIdentificacion: Buffer | null = null;
    let fotoEmpleado: Buffer | null = null;

    if (files.archivoIdentificacion && files.archivoIdentificacion.length > 0) {
      archivoIdentificacion = files.archivoIdentificacion[0].buffer;
    }
    if (files.fotoEmpleado && files.fotoEmpleado.length > 0) {
      fotoEmpleado = files.fotoEmpleado[0].buffer;
    }

    const empleadoActualizado = await this.centroTrabajoService.actualizarEmpleado(id, updateEmpleadoDto, archivoIdentificacion, fotoEmpleado);

    return {
      message: 'Empleado actualizado con éxito',
      empleado: empleadoActualizado,
    };
  }


  @Get('tipo-e')
  async obtenerCentrosDeTrabajoConTipoE(): Promise<Net_Centro_Trabajo[]> {
    return this.centroTrabajoService.obtenerCentrosDeTrabajoConTipoE();
  }

  @Post()
  create(@Body() createCentroTrabajoDto: CreateCentroTrabajoDto) {
    return this.centroTrabajoService.create(createCentroTrabajoDto);
  }

  @Post('create-private')
  async createPrivateCentroTrabajoComplete(@Body() createPrivateCentroTrabajoCompleteDto: CreatePrivateCentroTrabajoCompleteDto) {
    return this.centroTrabajoService.createPrivateCentroTrabajoComplete(createPrivateCentroTrabajoCompleteDto);
  }

  @Get()
  async findAll(@Res() res): Promise<void> {
    try {
      const centrosTrabajo = await this.centroTrabajoService.findAll();
      res.status(HttpStatus.OK).json(centrosTrabajo);
    } catch (error) {
      res.status(HttpStatus.INTERNAL_SERVER_ERROR).json({ message: error.message });
    }
  }

  @Get("Privados")
  async findAllPriv(@Res() res): Promise<void> {
    try {
      const centrosTrabajo = await this.centroTrabajoService.findAllPriv();
      res.status(HttpStatus.OK).json(centrosTrabajo);
    } catch (error) {
      res.status(HttpStatus.INTERNAL_SERVER_ERROR).json({ message: error.message });
    }
  }

  @Get(':id')
  findOne(@Param('id') id: string) {
    return this.centroTrabajoService.findOne(+id);
  }

  @Get('findBy/:content')
  findBy(@Param('content') content: string) {
    return this.centroTrabajoService.findBy(content);
  }

  @Get('getAllReferenciasByCentro/:idCentroTrab')
  getAllReferenciasByCentro(@Param('idCentroTrab') idCentroTrab: number) {
    return this.centroTrabajoService.getAllReferenciasByCentro(idCentroTrab);
  }

  @Get('getPropietarioByCentro/:idCentroTrab')
  getPropietarioByCentro(@Param('idCentroTrab') idCentroTrab: number) {
    return this.centroTrabajoService.getPropietarioByCentro(idCentroTrab);
  }
  @Get('getAdministradorByCentro/:idCentroTrab')
  getAdministradorByCentro(@Param('idCentroTrab') idCentroTrab: number) {
    return this.centroTrabajoService.getAdministradorByCentro(idCentroTrab);
  }
  @Get('getContadorByCentro/:idCentroTrab')
  getContadorByCentro(@Param('idCentroTrab') idCentroTrab: number) {
    return this.centroTrabajoService.getContadorByCentro(idCentroTrab);
  }

  @Patch(':id')
  update(@Param('id') id: string, @Body() updateCentroTrabajoDto: UpdateCentroTrabajoDto) {
    return this.centroTrabajoService.update(+id, updateCentroTrabajoDto);
  }

  @Delete(':id')
  remove(@Param('id') id: string) {
    return this.centroTrabajoService.remove(+id);
  }
}
