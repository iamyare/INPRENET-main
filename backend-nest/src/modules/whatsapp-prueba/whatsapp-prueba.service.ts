import { Injectable, OnModuleInit } from '@nestjs/common';
import { Client, MessageMedia } from 'whatsapp-web.js';
import * as qrcode from 'qrcode';

@Injectable()
export class WhatsappPruebaService implements OnModuleInit {
  private client: Client;

  constructor() {
    this.client = new Client({
      puppeteer: {
        headless: true,
      },
    });
  }

  onModuleInit() {
    this.initializeClient();
  }

  private initializeClient() {
    // Evento para generar y mostrar el QR
    /* this.client.on('qr', (qr) => {
      console.log('Escanea este código QR con tu WhatsApp (más pequeño):');
      qrcode.toString(qr, { type: 'terminal', small: true }, (err, url) => {
        if (err) {
          console.error('Error generando QR:', err);
        } else {
          console.log(url); // Código QR más compacto
        }
      });
    });

    // Evento cuando el cliente está listo
    this.client.on('ready', () => {
      console.log('WhatsApp Web client is ready!');
    });

    // Evento cuando el cliente está autenticado
    this.client.on('authenticated', () => {
      console.log('WhatsApp Web client authenticated!');
    });

    // Evento cuando falla la autenticación
    this.client.on('auth_failure', (msg) => {
      console.error('Authentication failed:', msg);
    });

    // Inicializa el cliente de WhatsApp
    this.client.initialize(); */
  }

  private formatHondurasNumber(number: string): string {
    if (!number.startsWith('504')) {
      number = `504${number}`;
    }
    return `${number}@c.us`;
  }

  async sendMessage(to: string, message: string): Promise<any> {
    try {
      const chatId = this.formatHondurasNumber(to); // Formatear el número
      const sentMessage = await this.client.sendMessage(chatId, message);
      return sentMessage;
    } catch (error) {
      throw new Error(`Error sending message: ${error.message}`);
    }
  }

  async sendMedia(to: string, mediaPath: string, caption: string): Promise<any> {
    try {
      const chatId = this.formatHondurasNumber(to); // Formatear el número
      const media = MessageMedia.fromFilePath(mediaPath);
      const sentMedia = await this.client.sendMessage(chatId, media, { caption });
      return sentMedia;
    } catch (error) {
      throw new Error(`Error sending media: ${error.message}`);
    }
  }
}
