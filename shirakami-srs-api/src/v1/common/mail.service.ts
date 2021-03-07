import { Injectable } from '@nestjs/common';
import Mail from 'nodemailer/lib/mailer';
import { createTransport } from 'nodemailer';
import { escape as escapeHtml } from 'html-escaper';
import { ConfigService } from '@nestjs/config';

@Injectable()
export class MailService {
  private readonly mail: Mail;
  private readonly fromAddress: string;
  private readonly fromName: string;

  constructor(private configService: ConfigService) {
    this.fromAddress = this.configService.get<string>('SMTP_FROM_ADDRESS');
    this.fromName = this.configService.get<string>('SMTP_FROM_NAME');
    const host = this.configService.get<string>('SMTP_HOST');
    const port = this.configService.get<number>('SMTP_PORT');
    const secure = this.configService.get<boolean>('SMTP_SECURE');
    const user = this.configService.get<string>('SMTP_USER');
    const pass = this.configService.get<string>('SMTP_PASSWORD');
    if (!host || !port || !user || !pass || !this.fromAddress) {
      console.warn('Skipping mailer setup: Missing configuration data');
      return;
    }
    this.mail = createTransport({
      host,
      port,
      secure,
      auth: {
        user,
        pass,
      },
    });
  }

  get from() {
    return this.fromName
      ? `"${this.fromName}" <${this.fromAddress}>`
      : this.fromAddress;
  }

  async sendEmailVerification(
    email: string,
    username: string,
    activationUrl: string,
  ) {
    if (!this.mail) {
      if (this.configService.get<boolean>('SMTP_SUPPRESS')) return;
      throw new Error(
        'Tried sending a confirmation email, but SMTP settings were not configured.',
      );
    }
    await this.mail.sendMail({
      from: this.from,
      to: email,
      subject: 'ShiraKamiSRS: Email Verification',
      html: `
<p>Hi ${escapeHtml(username)}!</p>      
<p>
  To verify your account, please click the <a href="${activationUrl}">here</a>!
</p>
<p>- ShiraKamiSRS</p>`,
    });
  }
}
