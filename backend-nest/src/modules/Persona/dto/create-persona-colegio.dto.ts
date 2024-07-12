import { Type } from 'class-transformer';
import { IsNumber, ValidateNested } from 'class-validator';

export class NetPersonaColegiosDTO {
    @IsNumber()
    id_colegio: number;
}