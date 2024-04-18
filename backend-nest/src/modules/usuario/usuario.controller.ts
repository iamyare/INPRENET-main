import { Controller, Get, Post, Body, Patch, Param, Delete, Query, UseGuards, BadRequestException, HttpCode, HttpStatus, UnauthorizedException, Req } from '@nestjs/common';
import { UsuarioService } from './usuario.service';
import { CreateUsuarioDto } from './dto/create-usuario.dto';
import { UpdateUsuarioDto } from './dto/update-usuario.dto';
import { PaginationDto } from 'src/common/dtos/pagination.dto';
import { ApiTags } from '@nestjs/swagger';

@ApiTags('usuario')
@Controller('usuario')
export class UsuarioController {
  constructor(private readonly usuarioService: UsuarioService) { }

  @Post('/loginPrivada')
  @HttpCode(HttpStatus.OK)
  async loginPrivada(@Body('email') email: string, @Body('contrasena') contrasena: string) {
    return this.usuarioService.loginPrivada(email, contrasena);
  }

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


  @Post('auth/signup')
  create(@Body() createUsuarioDto: CreateUsuarioDto) {
    return this.usuarioService.create(createUsuarioDto);
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
  
  @Post('auth/login')
  async login(@Body() loginDto: CreateUsuarioDto) {
    return this.usuarioService.login(loginDto.correo, loginDto.contrasena);
  }

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