import { Controller, Get, Post, Body, Patch, Param, Delete, Query, UseGuards, BadRequestException, HttpCode, HttpStatus, UnauthorizedException, Req, UseInterceptors, UploadedFile, ParseIntPipe, Res } from '@nestjs/common';
import { UsuarioService } from './usuario.service';
import { CreateUsuarioDto } from './dto/create-usuario.dto';
import { UpdateUsuarioDto } from './dto/update-usuario.dto';
import { PaginationDto } from 'src/common/dtos/pagination.dto';
import { ApiTags } from '@nestjs/swagger';
import { FileInterceptor } from '@nestjs/platform-express';
import { CreatePreRegistroDto } from './dto/create-pre-registro.dto';
import { CompleteRegistrationDto } from './dto/complete-registration.dto';
import { LoginDto } from './dto/login.dto';
import { Net_Usuario_Empresa } from './entities/net_usuario_empresa.entity';
import { Net_Rol_Modulo } from './entities/net_rol_modulo.entity';
import { Net_Modulo } from './entities/net_modulo.entity';

@ApiTags('usuario')
@Controller('usuario')
export class UsuarioController {
  constructor(private readonly usuarioService: UsuarioService) { }

  @Post('preregistro')
  async preRegistro(@Body() createPreRegistroDto: CreatePreRegistroDto): Promise<void> {
    return this.usuarioService.preRegistro(createPreRegistroDto);
  }

  @Post('preregistro-admin')
  async preRegistroAdmin(@Body() createPreRegistroDto: CreatePreRegistroDto): Promise<void> {
    return this.usuarioService.preRegistroAdmin(createPreRegistroDto);
  }

  @Post('completar-registro')
  @UseInterceptors(FileInterceptor('archivo_identificacion'))
  async completarRegistro(
    @Query('token') token: string,
    @Body('datos') datos: string,
    @UploadedFile() archivo_identificacion: Express.Multer.File,
  ): Promise<void> {
    const completeRegistrationDto: CompleteRegistrationDto = JSON.parse(datos);
    return this.usuarioService.completarRegistro(token, completeRegistrationDto, archivo_identificacion.buffer);
  }

  @Post('login')
  async login(@Body() loginDto: LoginDto){
    return this.usuarioService.login(loginDto);
  }

  @Get('roles')
  async getRolesByEmpresa(@Query() query: any) {
    return this.usuarioService.getRolesPorEmpresa(query.idEmpresa);
  }


  @Post('/loginPrivada')
  @HttpCode(HttpStatus.OK)
  async loginPrivada(@Body('email') email: string, @Body('contrasena') contrasena: string) {
    return this.usuarioService.loginPrivada(email, contrasena);
  }

  @Get('usuarios-modulos')
  async obtenerUsuariosPorModulos(@Query('modulos') modulos: string[]): Promise<Net_Usuario_Empresa[]> {
    if (typeof modulos === 'string') {
      modulos = [modulos];
    }
    return this.usuarioService.obtenerUsuariosPorModulos(modulos);
  }

  @Get('usuarios-modulos/:modulo')
  async obtenerRolesPorModulo(@Param('modulo') modulo: string): Promise<Net_Rol_Modulo[]> {
    return this.usuarioService.obtenerRolesPorModulo(modulo);
  }

  @Get('modulos-centro-trabajo/:idCentroTrabajo')
  async obtenerModulosPorCentroTrabajo(
    @Param('idCentroTrabajo', ParseIntPipe) idCentroTrabajo: number,
  ): Promise<Net_Modulo[]> {
    return this.usuarioService.obtenerModulosPorCentroTrabajo(idCentroTrabajo);
  }

  /* @Get('roles')
  async getAllRolesExceptAdmin(): Promise<Net_Rol[]> {
    return this.usuarioService.findAllRolesExceptAdmin();
  } */

  @Get('/verificarEstado')
  async verificarEstado(@Req() request: Request) {
      const token = request.headers['authorization']?.split(' ')[1];
      if (!token) {
          throw new UnauthorizedException('Token no proporcionado.');
      }
      return this.usuarioService.verificarEstadoSesion(token);
  }

  @Post('/logout')
async logout(@Req() request: Request): Promise<any> {
  console.log('Authorization Header:', request.headers['authorization']);
  const authHeader: string | undefined = request.headers['authorization'];
  
  if (authHeader && authHeader.startsWith('Bearer ')) {
    const token = authHeader.substring(7); 
    console.log('Extracted Token:', token);
    
    if (token) {
      await this.usuarioService.cerrarSesion(token);
      return { message: 'Sesión cerrada con éxito.' };
    }
  }
  
  throw new UnauthorizedException('Formato de token incorrecto.');
}


@Get('centro/:centroTrabajoId')
  async getUsuariosPorCentro(
    @Param('centroTrabajoId', ParseIntPipe) centroTrabajoId: number,
    @Res() res,
  ): Promise<Response> {
    try {
      const usuarios: any = await this.usuarioService.getUsuariosPorCentro(centroTrabajoId);
      return res.status(HttpStatus.OK).json(usuarios);
    } catch (error) {
      return res.status(HttpStatus.INTERNAL_SERVER_ERROR).json({
        statusCode: HttpStatus.INTERNAL_SERVER_ERROR,
        message: 'Error fetching users for the specified center',
        error: error.message,
      });
    }
  }

  @Post('/crear')
  async createPrivada(
    @Body('email') email: string,
    @Body('contrasena') contrasena: string,
    @Body('nombre_usuario') nombre_usuario: string,
    @Body('idCentroTrabajo') idCentroTrabajo?: number
    ) {
      try {
        const nuevoUsuario = await this.usuarioService.createPrivada(email, contrasena, nombre_usuario, idCentroTrabajo);
      return nuevoUsuario;
    } catch (error) {
      throw new BadRequestException(error.message);
    }
  }
  
  /* @Post('auth/login')
  async login(@Body() loginDto: CreateUsuarioDto) {
    return this.usuarioService.login(loginDto.correo, loginDto.contrasena);
  } */

  @Get()
  findAll(@Query() paginationDto: PaginationDto) {
    return this.usuarioService.findAll(paginationDto);
  }

  @Get(':id')
  findOne(@Param('id') id: string) {
    return this.usuarioService.findOne(+id);
  }

  @Patch('auth/confirm')
  update(@Body() updateUsuarioDto: UpdateUsuarioDto) {
    return this.usuarioService.update(updateUsuarioDto);
  }

  @Delete(':id')
  remove(@Param('id') id: string) {
    return this.usuarioService.remove(+id);
  }

  
}