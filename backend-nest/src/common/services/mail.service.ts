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
}
