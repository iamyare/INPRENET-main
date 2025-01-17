import { Controller, Post, Body } from '@nestjs/common';
import { WhatsappPruebaService } from './whatsapp-prueba.service';

@Controller('whatsapp-prueba')
export class WhatsappPruebaController {
  constructor(private readonly whatsappPruebaService: WhatsappPruebaService) {}

  @Post('send')
  async sendMessage(@Body() body: { to: string; templateName: string }) {
    return this.whatsappPruebaService.sendMessage(body.to, body.templateName);
  }
}
