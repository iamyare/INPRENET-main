import { Injectable } from '@nestjs/common';
import * as nodemailer from 'nodemailer';

@Injectable()
export class MailService {
  private transporter: nodemailer.Transporter;

  constructor() {
    this.transporter = nodemailer.createTransport({
      host: 'smtp.gmail.com', // SMTP Host
      port: 587,                // SMTP Port
      secure: false,            // true for 465, false for other ports
      auth: {
        user: 'ematronix77@gmail.com',  // SMTP username
        pass: 'oixl yqpv lckq qhdf',          // SMTP password
      },
    });
  }

  async sendMail(to: string, subject: string, text: string, html: string): Promise<void> {
    const mailOptions = {
      from: '"Registro" <no-reply@gmail.com>',
      to: to,
      subject: subject,
      text: text,
      html: html,
    };

    await this.transporter.sendMail(mailOptions);
  }
}