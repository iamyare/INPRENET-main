import { Controller, Get, Post, Body, Patch, Param, Delete, Query, UseGuards } from '@nestjs/common';
import { UsuarioService } from './usuario.service';
import { CreateUsuarioDto } from './dto/create-usuario.dto';
import { UpdateUsuarioDto } from './dto/update-usuario.dto';
import { PaginationDto } from 'src/common/dtos/pagination.dto';
import { RolesGuard } from 'src/guards/auth/auth.guard';

@Controller('usuario')
@UseGuards(RolesGuard)
export class UsuarioController {
  constructor(private readonly usuarioService: UsuarioService) {}
  
  @Post('auth/signup')
  create(@Body() createUsuarioDto: CreateUsuarioDto) {
    return this.usuarioService.create(createUsuarioDto);
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