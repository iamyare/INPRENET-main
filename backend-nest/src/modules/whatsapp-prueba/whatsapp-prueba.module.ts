import { Module } from '@nestjs/common';
import { WhatsappPruebaService } from './whatsapp-prueba.service';
import { WhatsappPruebaController } from './whatsapp-prueba.controller';

@Module({
  controllers: [WhatsappPruebaController],
  providers: [WhatsappPruebaService],
})
export class WhatsappPruebaModule {}
