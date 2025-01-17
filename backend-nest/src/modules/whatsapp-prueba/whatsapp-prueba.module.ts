import { Module } from '@nestjs/common';
import { WhatsappPruebaService } from './whatsapp-prueba.service';
import { WhatsappPruebaController } from './whatsapp-prueba.controller';
import { HttpModule } from '@nestjs/axios';

@Module({
  imports: [HttpModule],
  controllers: [WhatsappPruebaController],
  providers: [WhatsappPruebaService],
})
export class WhatsappPruebaModule {}
