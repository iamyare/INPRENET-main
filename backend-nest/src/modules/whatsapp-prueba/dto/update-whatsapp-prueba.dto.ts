import { PartialType } from '@nestjs/mapped-types';
import { CreateWhatsappPruebaDto } from './create-whatsapp-prueba.dto';

export class UpdateWhatsappPruebaDto extends PartialType(CreateWhatsappPruebaDto) {}
