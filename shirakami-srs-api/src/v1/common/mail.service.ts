import { Injectable } from '@nestjs/common';
import Mail from 'nodemailer/lib/mailer';
import { createTransport } from 'nodemailer';
import { ConfigService } from '@nestjs/config';
import * as fs from 'fs';
import * as path from 'path';
import Handlebars from 'handlebars';
import * as inlineCss from 'inline-css';

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

  async parseTemplate(templateName: string, variables?: any): Promise<string> {
    const template = Handlebars.compile(
      fs
        .readFileSync(
          path.join(
            __dirname,
            '../../',
            'assets',
            'email-templates',
            `${templateName}.hbs`,
          ),
        )
        .toString('utf8'),
    );
    return inlineCss(template(variables), {
      url: this.configService.get<string>('APP_BASE_URL'),
    });
  }

  async sendEmailVerification(
    email: string,
    username: string,
    verificationUrl: string,
  ) {
    if (this.configService.get<boolean>('SMTP_SUPPRESS')) return;
    if (!this.mail) {
      throw new Error(
        'Tried sending a confirmation email, but SMTP settings were not configured.',
      );
    }
    const html = await this.parseTemplate('email-verification', {
      username,
      verificationUrl,
      publicUrl: this.configService.get<string>('APP_BASE_URL'),
    });
    await this.mail.sendMail({
      from: this.from,
      to: email,
      subject: 'ShiraKamiSRS: Email Verification',
      html,
    });
  }

  async sendPasswordResetMail(
    email: string,
    username: string,
    resetUrl: string,
  ) {
    if (this.configService.get<boolean>('SMTP_SUPPRESS')) return;
    if (!this.mail) {
      throw new Error(
        'Tried sending a password reset email, but SMTP settings were not configured.',
      );
    }
    const html = await this.parseTemplate('password-reset', {
      username,
      resetUrl,
      publicUrl: this.configService.get<string>('APP_BASE_URL'),
    });
    await this.mail.sendMail({
      from: this.from,
      to: email,
      subject: 'ShiraKamiSRS: Password Reset',
      html,
    });
  }
}
