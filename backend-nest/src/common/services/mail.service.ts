import { Injectable } from '@nestjs/common';
import * as nodemailer from 'nodemailer';

@Injectable()
export class MailService {
  private transporter: nodemailer.Transporter;
 
  constructor() {
    this.transporter = nodemailer.createTransport({
      service: 'outlook',
      host: 'smtp.office365.com',
      port: 587,                
      secure: false,            
      auth: {
        user: process.env.mail,  
        pass: process.env.password,
      },
    });
  }

  async sendMail(to: string, subject: string, text: string, html: string, attachments?: any[]): Promise<void> {
    const mailOptions = {
      from: '"Registro" <inpre_net@inprema.gob.hn>',
      to: to,
      subject: subject,
      text: text,
      html: html,
      attachments: attachments,
    };

    await this.transporter.sendMail(mailOptions);
  }

  async sendMassiveEmails(
    recipients: string[],
    subject: string,
    text: string,
    html: string,
    attachments?: any[],
    batchSize: number = 500, // Tamaño del lote
  ): Promise<void> {
    const batches = this.splitIntoBatches(recipients, batchSize);

    for (const batch of batches) {
      try {
        const mailOptions = batch.map((email) => ({
          from: '"Registro" <inpre_net@inprema.gob.hn>',
          to: email,
          subject: subject,
          text: text,
          html: html,
          attachments: attachments,
        }));

        // Enviar correos en paralelo para el lote actual
        const promises = mailOptions.map((options) => this.transporter.sendMail(options));
        await Promise.all(promises);

        console.log(`Lote de ${batch.length} correos enviado exitosamente.`);
      } catch (error) {
        console.error(`Error al enviar un lote de correos: ${error.message}`);
      }

      // Espera entre lotes para evitar saturar el servidor SMTP
      await this.delay(5000); // Espera 5 segundos entre lotes
    }
  }

  private splitIntoBatches(recipients: string[], batchSize: number): string[][] {
    const batches: string[][] = [];
    for (let i = 0; i < recipients.length; i += batchSize) {
      batches.push(recipients.slice(i, i + batchSize));
    }
    return batches;
  }

  private delay(ms: number): Promise<void> {
    return new Promise((resolve) => setTimeout(resolve, ms));
  }
}
