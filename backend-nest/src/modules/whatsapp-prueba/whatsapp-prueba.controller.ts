import { Controller, Post, Body, HttpException, HttpStatus, Req, Res, Get, Query } from '@nestjs/common';
import { WhatsappPruebaService } from './whatsapp-prueba.service';

@Controller('whatsapp')
export class WhatsappPruebaController {
  constructor(private readonly whatsappService: WhatsappPruebaService) {}

  @Post('send')
  async sendMessage(@Body() body: { to: string, parameters: any }) {
    return this.whatsappService.sendWhatsappMessage(body.to, body.parameters);
  }

  @Get('webhook')
verifyWebhook(@Query() query, @Res() res) {
  res.set('bypass-tunnel-reminder', 'true');

  const { 'hub.mode': mode, 'hub.verify_token': token, 'hub.challenge': challenge } = query;
  if (mode === 'subscribe' && token === '12345678') {
    return res.status(200).send(challenge);
  } else {
    return res.sendStatus(403);
  }
}


  // Manejo de mensajes entrantes de WhatsApp
  @Post('webhook')
  async receiveMessage(@Req() req, @Res() res) {
    const body = req.body;

    if (body.object === 'whatsapp_business_account') {
      const message = body.entry[0]?.changes[0]?.value?.messages?.[0];
      if (message) {
        await this.whatsappService.handleIncomingMessage(message);
      }
    }

    res.sendStatus(200);
  }

}
