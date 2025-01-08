import { Controller, Post, Body } from '@nestjs/common';
import { WhatsappPruebaService } from './whatsapp-prueba.service';

@Controller('whatsapp-prueba')
export class WhatsappPruebaController {
  constructor(private readonly whatsappPruebaService: WhatsappPruebaService) {}

  @Post('send')
  async sendMessage(@Body('to') to: string, @Body('message') message: string) {
    try {
      const response = await this.whatsappPruebaService.sendMessage(to, message);
      return { success: true, data: response };
    } catch (error) {
      return { success: false, message: error.message };
    }
  }

  @Post('send-media')
  async sendMedia(
    @Body('to') to: string,
    @Body('mediaPath') mediaPath: string,
    @Body('caption') caption: string,
  ) {
    try {
      const response = await this.whatsappPruebaService.sendMedia(to, mediaPath, caption);
      return { success: true, data: response };
    } catch (error) {
      return { success: false, message: error.message };
    }
  }
}
