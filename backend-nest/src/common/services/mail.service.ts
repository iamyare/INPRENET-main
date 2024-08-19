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
        user: 'inpre_net@inprema.gob.hn',  
        pass: 'Inprema*2024',
      },
      /* tls: {
        ciphers: 'SSLv3',
        rejectUnauthorized: false, 
      } */
    });
  }

  async sendMail(to: string, subject: string, text: string, html: string): Promise<void> {
    const mailOptions = {
      from: '"Registro" <inpre_net@inprema.gob.hn>',
      to: to,
      subject: subject,
      text: text,
      html: html,
    };

    await this.transporter.sendMail(mailOptions);
  }
}
