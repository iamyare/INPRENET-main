import {
  Controller,
  Get,
  Post,
  Body,
  Patch,
  Param,
  Delete,
  NotFoundException,
  Put,
  HttpCode,
  HttpStatus,
} from '@nestjs/common';
import { AfiliadoService } from './afiliado.service';
import { CreateAfiliadoDto } from './dto/create-afiliado.dto';
import { UpdateAfiliadoDto } from './dto/update-afiliado.dto';
import { CreateAfiliadoTempDto } from './dto/create-afiliado-temp.dto';
import { ApiTags } from '@nestjs/swagger';

@ApiTags('Afiliado')
@Controller('afiliado')
export class AfiliadoController {
  constructor(private readonly afiliadoService: AfiliadoService) {}

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

  @Post()
  create(@Body() createAfiliadoDto: CreateAfiliadoDto) {
    return this.afiliadoService.create(createAfiliadoDto);
  }

  @Post('temp')
  createEspecial(@Body() createAfiliadoTempDto: CreateAfiliadoTempDto) {
    return this.afiliadoService.createTemp(createAfiliadoTempDto);
  }

  @Post('createRefPers/:dnireferente')
  createRefPers(@Body() data: any, @Param() dnireferente) {
    return this.afiliadoService.createRefPers(data, dnireferente);
  }
  
  @Post('createCentrosTrabPersona/:dnireferente')
  createCentrosTrabPersona(@Body() data: any, @Param() dnireferente) {
    return this.afiliadoService.createCentrosTrabPersona(data, dnireferente);
  }

  @Get()
  findAll() {
    return this.afiliadoService.findAll();
  }

  @Get('/movimientos/:dni')
  async buscarMovimientosPorDNI(@Param('dni') dni: string) {
    try {
      const resultado =
        await this.afiliadoService.buscarPersonaYMovimientosPorDNI(dni);
      return resultado;
    } catch (error) {
      if (error instanceof NotFoundException) {
        throw error;
      } else {
        throw new NotFoundException(
          `No se pudo procesar la solicitud para el DNI ${dni}`,
        );
      }
    }
  }

  @Get('/dni/:dni')
  async findByDni(@Param('dni') dni: string) {
    return await this.afiliadoService.findByDni(dni);
  }

  @Get(':term')
  findOne(@Param('term') term: number) {
    return this.afiliadoService.findOne(term);
  }

  @Get('obtenerBenDeAfil/:dniAfil')
  async obtenerDatosRelacionados(
    @Param('dniAfil') dniAfil: string,
  ): Promise<any> {
    return this.afiliadoService.obtenerBenDeAfil(dniAfil);
  }

  @Patch(':id')
  update(
    @Param('id') id: string,
    @Body() updateAfiliadoDto: UpdateAfiliadoDto,
  ) {
    return this.afiliadoService.update(+id, updateAfiliadoDto);
  }

  @Delete(':id')
  remove(@Param('id') id: string) {
    return this.afiliadoService.remove(+id);
  }
}
