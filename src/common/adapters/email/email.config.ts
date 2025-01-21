import { ConfigService } from '@nestjs/config';
import { IsEmail, IsNotEmpty, IsUrl } from 'class-validator';
import { Injectable } from '@nestjs/common';

import { ENV_NAMES } from '../../../env';
import { configValidationUtility } from '../../config/config-validation.utility';

@Injectable()
export class EmailConfig {
  @IsNotEmpty({
    message: 'Set Env variable SMTP_PASSWORD, example: pass',
  })
  smtpPassword: string = this.configService.get(
    ENV_NAMES.SMTP_PASSWORD,
  ) as string;

  @IsEmail(
    {},
    { message: 'Set Env variable SMTP_USER, example: test@gmail.com' },
  )
  smtpUser: string = this.configService.get(ENV_NAMES.SMTP_USER) as string;

  @IsUrl(
    {},
    {
      message: 'Set Env variable HOST, example: https://blogs.com',
    },
  )
  host: string = this.configService.get(ENV_NAMES.HOST) as string;

  constructor(private readonly configService: ConfigService) {
    configValidationUtility.validateConfig(this);
  }
}
