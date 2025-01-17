import nodemailer, { Transporter } from 'nodemailer';
import Mail from 'nodemailer/lib/mailer';
import { Injectable } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';

import { ENV_NAMES } from '../../../../env';

@Injectable()
export class EmailAdapter {
  private readonly transporter: Transporter;

  constructor(private readonly configService: ConfigService) {
    this.transporter = nodemailer.createTransport({
      service: 'gmail',
      auth: {
        user: this.configService.get(ENV_NAMES.SMTP_USER),
        pass: this.configService.get(ENV_NAMES.SMTP_PASSWORD),
      },
    });
  }

  sendEmailConfirmation(
    emailTo: string,
    emailConfirmationCode: string,
  ): Promise<void> {
    const mailOptions: Mail.Options = {
      from: {
        name: 'Blogs-api',
        address: this.configService.get(ENV_NAMES.SMTP_USER)!,
      },
      to: emailTo,
      subject: 'Confirm your email',
      html:
        '<h1>Thanks for your registration</h1>\n' +
        '<p>To finish registration please follow the link below:\n' +
        '<a href=' +
        this.configService.get(ENV_NAMES.HOST) +
        '/confirm-email?code=' +
        emailConfirmationCode +
        '>complete registration</a>\n' +
        '</p>',
    };

    return this.transporter.sendMail(mailOptions);
  }

  sendEmailRecoveryPassword(
    emailTo: string,
    passwordRecoveryCode: string,
  ): Promise<void> {
    const mailOptions: Mail.Options = {
      from: {
        name: 'Blogs-api',
        address: this.configService.get(ENV_NAMES.SMTP_USER)!,
      },
      to: emailTo,
      subject: 'Password recovery',
      html:
        '<h1>Password recovery</h1>\n' +
        '<p>To finish password recovery please follow the link below:\n' +
        '<a href=' +
        this.configService.get(ENV_NAMES.HOST) +
        '/password-recovery?recoveryCode=' +
        passwordRecoveryCode +
        '>recovery password</a>\n' +
        '</p>',
    };

    return this.transporter.sendMail(mailOptions);
  }
}
