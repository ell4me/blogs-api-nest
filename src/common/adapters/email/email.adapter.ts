import nodemailer, { Transporter } from 'nodemailer';
import Mail from 'nodemailer/lib/mailer';
import { Injectable } from '@nestjs/common';

import { EmailConfig } from './email.config';

@Injectable()
export class EmailAdapter {
  private readonly transporter: Transporter;

  constructor(private readonly emailConfig: EmailConfig) {
    this.transporter = nodemailer.createTransport({
      service: 'gmail',
      auth: {
        user: this.emailConfig.smtpUser,
        pass: this.emailConfig.smtpPassword,
      },
    });
  }

  sendEmailConfirmation(
    emailTo: string,
    emailConfirmationCode: string | null,
  ): Promise<void> {
    const mailOptions: Mail.Options = {
      from: {
        name: 'Blogs-api',
        address: this.emailConfig.smtpUser,
      },
      to: emailTo,
      subject: 'Confirm your email',
      html:
        '<h1>Thanks for your registration</h1>\n' +
        '<p>To finish registration please follow the link below:\n' +
        '<a href=' +
        this.emailConfig.host +
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
        address: this.emailConfig.smtpUser,
      },
      to: emailTo,
      subject: 'Password recovery',
      html:
        '<h1>Password recovery</h1>\n' +
        '<p>To finish password recovery please follow the link below:\n' +
        '<a href=' +
        this.emailConfig.host +
        '/password-recovery?recoveryCode=' +
        passwordRecoveryCode +
        '>recovery password</a>\n' +
        '</p>',
    };

    return this.transporter.sendMail(mailOptions);
  }
}
