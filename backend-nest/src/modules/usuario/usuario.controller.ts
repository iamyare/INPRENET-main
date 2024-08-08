import { Controller, Get, Post, Body, Patch, Param, Delete, Query, UseGuards, BadRequestException, HttpCode, HttpStatus, Req, UseInterceptors, ParseIntPipe, Res, Put, UploadedFiles } from '@nestjs/common';
import { UsuarioService } from './usuario.service';
import { UpdateUsuarioDto } from './dto/update-usuario.dto';
import { PaginationDto } from 'src/common/dtos/pagination.dto';
import { ApiTags } from '@nestjs/swagger';
import { FileFieldsInterceptor } from '@nestjs/platform-express';
import { CreatePreRegistroDto } from './dto/create-pre-registro.dto';
import { CompleteRegistrationDto } from './dto/complete-registration.dto';
import { LoginDto } from './dto/login.dto';
import { Net_Usuario_Empresa } from './entities/net_usuario_empresa.entity';
import { net_rol_modulo } from './entities/net_rol_modulo.entity';
import { net_modulo } from './entities/net_modulo.entity';
import { ForgotPasswordDto } from './dto/forgot-password.dto';

@ApiTags('usuario')
@Controller('usuario')
export class UsuarioController {
  constructor(private readonly usuarioService: UsuarioService) { }

  @Post('login')
  async login(@Body() loginDto: LoginDto, @Res() res: Response) {
    return this.usuarioService.login(loginDto, res);
  }

  @Post('logout')
  async logout(@Req() req: Request, @Res() res: Response) {
    return this.usuarioService.logout(req, res);
  }

  @Post('refresh-token')
  async refreshToken(@Req() req: Request, @Res() res: Response) {
    return this.usuarioService.refreshTokens(req, res);
  }

  @Patch(':id/desactivar')
  async desactivarUsuario(
    @Param('id') idUsuario: number,
    @Body('fechaReactivacion') fechaReactivacion: Date | null = null,
  ) {
    await this.usuarioService.desactivarUsuario(idUsuario, fechaReactivacion);
    return { message: 'Usuario desactivado correctamente' };
  }

  @Patch(':id/reactivar')
  async reactivarUsuario(@Param('id') idUsuario: number) {
    await this.usuarioService.reactivarUsuario(idUsuario);
    return { message: 'Usuario reactivado correctamente' };
  }

  @Get('preguntas-seguridad')
  async obtenerPreguntasSeguridad(@Query('correo') correo: string): Promise<string[]> {
    return this.usuarioService.obtenerPreguntasSeguridad(correo);
  }

  @Post('preregistro')
  async preRegistro(@Body() createPreRegistroDto: CreatePreRegistroDto): Promise<void> {
    return this.usuarioService.preRegistro(createPreRegistroDto);
  }

  @Post('preregistro-admin')
  async preRegistroAdmin(@Body() createPreRegistroDto: CreatePreRegistroDto): Promise<void> {
    return this.usuarioService.preRegistroAdmin(createPreRegistroDto);
  }

  @Post('completar-registro')
@UseInterceptors(
  FileFieldsInterceptor([
    { name: 'archivo_identificacion', maxCount: 1 },
    { name: 'foto_empleado', maxCount: 1 }
  ])
)
async completarRegistro(
  @Query('token') token: string,
  @Body('datos') datos: string,
  @UploadedFiles() files: { archivo_identificacion?: Express.Multer.File[], foto_empleado?: Express.Multer.File[] },
): Promise<void> {
  const completeRegistrationDto: CompleteRegistrationDto = JSON.parse(datos);
  const archivoIdentificacionBuffer = files.archivo_identificacion[0].buffer;
  const fotoEmpleadoBuffer = files.foto_empleado[0].buffer;
  return this.usuarioService.completarRegistro(token, completeRegistrationDto, archivoIdentificacionBuffer, fotoEmpleadoBuffer);
}

  @Get('perfil')
  async obtenerPerfilUsuario(@Query('correo') correo: string) {
  return this.usuarioService.obtenerPerfilPorCorreo(correo);
}

  @Put('cambiar-contrasena')
  async cambiarContrasena(@Body() cambiarContrasenaDto: { correo: string; nuevaContrasena: string }) {
    return this.usuarioService.cambiarContrasena(cambiarContrasenaDto.correo, cambiarContrasenaDto.nuevaContrasena);
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

  @Get('modulo-centro-trabajo')
  async obtenerUsuariosPorModuloYCentroTrabajo(
    @Query('modulos') modulos: string[],
    @Query('idCentroTrabajo') idCentroTrabajo: number
  ): Promise<Net_Usuario_Empresa[]> {
    if (typeof modulos === 'string') {
      modulos = [modulos];
    }
    try {
      return await this.usuarioService.obtenerUsuariosPorModuloYCentroTrabajo(modulos, idCentroTrabajo);
    } catch (error) {
      console.error('Error al obtener usuarios por módulo y centro de trabajo:', error);
      throw new Error('Ocurrió un error inesperado. Inténtelo de nuevo más tarde o contacte con soporte si el problema persiste.');
    }
  }

  @Get('roles-modulos/:modulo')
  async obtenerRolesPorModulo(@Param('modulo') modulo: string): Promise<net_rol_modulo[]> {
    return this.usuarioService.obtenerRolesPorModulo(modulo);
  }

  @Get('modulos-centro-trabajo/:idCentroTrabajo')
  async obtenerModulosPorCentroTrabajo(
    @Param('idCentroTrabajo', ParseIntPipe) idCentroTrabajo: number,
  ): Promise<net_modulo[]> {
    return this.usuarioService.obtenerModulosPorCentroTrabajo(idCentroTrabajo);
  }

  /* @Get('roles')
  async getAllRolesExceptAdmin(): Promise<Net_Rol[]> {
    return this.usuarioService.findAllRolesExceptAdmin();
  } */


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

  @Post('olvido-contrasena')
  async olvidoContrasena(@Body() dto: ForgotPasswordDto): Promise<{ message: string }> {
    const usuario = await this.usuarioService.validarPreguntasSeguridad(dto.email, dto);
    const token = await this.usuarioService.crearTokenRestablecimiento(usuario);
    await this.usuarioService.enviarCorreoRestablecimiento(usuario.empleadoCentroTrabajo.correo_1, token);
    return { message: 'Se ha enviado un enlace para restablecer la contraseña a su correo' };
  }

  @Post('restablecer-contrasena/:token')
  async restablecerContrasena(@Param('token') token: string, @Body('nuevaContrasena') nuevaContrasena: string): Promise<{ message: string }> {
    await this.usuarioService.restablecerContrasena(token, nuevaContrasena);
    return { message: 'Contraseña restablecida correctamente' };
  }

  
}