import { Injectable, HttpException, HttpStatus } from '@nestjs/common';
import { HttpService } from '@nestjs/axios';
import { firstValueFrom } from 'rxjs';

@Injectable()
export class WhatsappPruebaService {
  private readonly whatsappApiUrl = 'https://graph.facebook.com/v22.0/531322080064912/messages';
  private readonly accessToken = 'EAATg3nnCqc4BO1cPg1nShmEgOnBd5erJStefxZCaZAaxGV0YagoxISaNbXd445obTxNw6ZBsPtmJsZAecYZAaZA88mJAjmUpsTtyJtoZA9JFj6rPUJJepFCd9ZBROYWF4fWs2t44SMXwBYL3LypnHEGZCOj9HzZCvmMDnWWMCHdpVJWydZBsRPMtNzpRte7exzkYq9hnZAeByAwJ3r736FFaVv2wCBdRJA9VsYF4pYsZD';

  constructor(private readonly httpService: HttpService) {}

  async sendWhatsappMessage(to: string, parameters: any) {
    const messagePayload = {
      messaging_product: "whatsapp",
      to: to,
      type: "template",
      template: {
        name: "comprobante_pago",
        language: { code: "es" },
        components: [
          {
            type: "header",
            parameters: [
              {
                type: "document",
                document: {
                  link: parameters.document_link 
                }
              }
            ]
          },
          {
            type: "body",
            parameters: [
              { type: "text", text: parameters.nombre },
              { type: "text", text: parameters.periodo },
              { type: "text", text: parameters.factura },
              { type: "text", text: parameters.monto }
            ]
          }
        ]
      }
    };

    try {
      const response = await firstValueFrom(
        this.httpService.post(this.whatsappApiUrl, messagePayload, {
          headers: {
            'Authorization': `Bearer ${this.accessToken}`,
            'Content-Type': 'application/json'
          }
        })
      );
      return response.data;
    } catch (error) {
      throw new HttpException(
        error.response?.data || 'Error sending WhatsApp message',
        HttpStatus.BAD_REQUEST
      );
    }
  }

  async handleIncomingMessage(message: any) {
    const from = message.from;
    const text = message.text?.body || 'Mensaje vacío';

    console.log(`Mensaje recibido de ${from}: ${text}`);

    // Responder automáticamente
    const reply = `Hola! Recibí tu mensaje: "${text}". ¿Cómo puedo ayudarte?`;
    await this.sendTextMessage(from, reply);
  }

  // Enviar un mensaje de texto simple
  async sendTextMessage(to: string, text: string) {
    const messagePayload = {
      messaging_product: 'whatsapp',
      to: to,
      type: 'text',
      text: { body: text },
    };

    return this.sendMessageToWhatsApp(messagePayload);
  }

  // Función para enviar mensajes a WhatsApp API
  private async sendMessageToWhatsApp(payload: any) {
    try {
      const response = await firstValueFrom(
        this.httpService.post(this.whatsappApiUrl, payload, {
          headers: {
            Authorization: `Bearer ${this.accessToken}`,
            'Content-Type': 'application/json',
          },
        }),
      );
      return response.data;
    } catch (error) {
      console.error('Error al enviar mensaje:', error.response?.data);
      throw new HttpException(
        error.response?.data || 'Error enviando mensaje',
        HttpStatus.BAD_REQUEST,
      );
    }
  }
}
