import { Injectable } from '@nestjs/common';
import { HttpService } from '@nestjs/axios';
import { firstValueFrom } from 'rxjs';
@Injectable()
export class WhatsappPruebaService {
  private readonly apiUrl = `https://graph.facebook.com/v17.0`;

  constructor(private readonly httpService: HttpService) {}

  async sendMessage(to: string, templateName: string) {
    const url = `${this.apiUrl}/${process.env.WHATSAPP_PHONE_NUMBER_ID}/messages`;
    const headers = {
      Authorization: `Bearer ${process.env.WHATSAPP_ACCESS_TOKEN}`,
      'Content-Type': 'application/json',
    };
    const body = {
      messaging_product: 'whatsapp',
      to,
      type: 'template',
      template: {
        name: templateName,
        language: { code: 'en_US' },
      },
    };

    try {
      const response = await firstValueFrom(
        this.httpService.post(url, body, { headers }),
      );
      return response.data;
    } catch (error) {
      console.error('Error sending message:', error.response?.data || error);
      throw new Error('Failed to send message');
    }
  }
}
