import { Controller, Get, Post, Body, Patch, Param, Delete, UseInterceptors, UploadedFile, BadRequestException } from '@nestjs/common';
import { BeneficioService } from './beneficio.service';
import { CreateBeneficioDto } from './dto/create-beneficio.dto';
import { UpdateBeneficioDto } from './dto/update-beneficio.dto';
import { ApiTags } from '@nestjs/swagger';
import { FileInterceptor } from '@nestjs/platform-express';

@ApiTags('beneficio')
@Controller('beneficio')
export class BeneficioController {
  constructor(private readonly beneficioService: BeneficioService) { }

  @Post('uploadExcelBeneficios')
  @UseInterceptors(FileInterceptor('file'))
  async uploadExcel(@UploadedFile() file: Express.Multer.File) {
    if (!file) {
      throw new BadRequestException('El archivo es requerido');
    }
    return this.beneficioService.uploadExcel(file);
  }

  @Post("createTipoBeneficio")
  create(@Body() createBeneficioDto: CreateBeneficioDto) {
    return this.beneficioService.create(createBeneficioDto);
  }

  @Get("obtenerTiposBeneficios")
  findAll() {
    return this.beneficioService.findAll();
  }

  @Get(':term')
  findOne(@Param('term') term: string) {
    return this.beneficioService.findOne(term);
  }

  @Patch(':id')
  update(@Param('id') id: string, @Body() updateBeneficioDto: UpdateBeneficioDto) {
    return this.beneficioService.update(id, updateBeneficioDto);
  }

  @Delete(':id')
  remove(@Param('id') id: string) {
    return this.beneficioService.remove(+id);
  }
}
