import { IsString } from "class-validator";

export class CreateAfiliadoTempDto {
    @IsString()
    dni : string;
}