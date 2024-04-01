import { BadRequestException, Body, Controller, HttpStatus, Param, Post } from '@nestjs/common';
import { ApiTags } from '@nestjs/swagger';
import { DetallePlanillaIngresoService } from './detalle-planilla-ing.service';
import { CreateDetallePlanIngDto } from './dto/create-detalle-plani-Ing.dto';

@ApiTags('Detalle-Planilla-Ingreso')
@Controller('detalle-plan-ingr')
export class DetallePlanIngrController {
    constructor(private readonly planillaIngresoService: DetallePlanillaIngresoService) { }

    @Post()
    create(@Body() CreateDetallePlanIngDto: CreateDetallePlanIngDto) {
        return this.planillaIngresoService.create(CreateDetallePlanIngDto);
    }
}