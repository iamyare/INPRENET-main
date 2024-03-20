import { IsNotEmpty, IsNumber, IsOptional, IsString, Length, ValidationOptions, isNumber, registerDecorator } from "class-validator";

function IsNumberCustom(validationOptions?: ValidationOptions) {
    return function (object: Object, propertyName: string) {
      registerDecorator({
        name: "IsNumberCustom",
        target: object.constructor,
        propertyName: propertyName,
        options: validationOptions,
        validator: {
          validate(value: any) {
            return typeof value === "number";
          }
        }
      });
    };
  }

export class CreateDeduccionDto {
    @IsNotEmpty({ message: 'El nombre de la Deduccion no debe estar vacío.' })
    @IsString({ message: 'El nombre de la Deduccion debe ser una cadena de texto.' })
    @Length(5, 50, { message: 'El nombre de la Deduccion debe tener entre 5 y 50 caracteres.' })
    nombre_deduccion : string

    @IsString()
    @IsOptional()
    nombre_institucion?: string;
    
    @IsString()
    @IsOptional()
    descripcion_deduccion: string;

    @IsNumberCustom({ message: 'El valor la prioridad debe ser numérico.' })
    @IsOptional()
    prioridad?: number;

    @IsNumberCustom({ message: 'El valor de codigo deduccion debe ser numérico.' })
    codigo_deduccion: number
}
