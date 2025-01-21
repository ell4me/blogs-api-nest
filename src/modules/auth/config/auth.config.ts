import { ConfigService } from '@nestjs/config';
import { IsNotEmpty } from 'class-validator';
import { Injectable } from '@nestjs/common';

import { configValidationUtility } from '../../../common/config/config-validation.utility';
import { ENV_NAMES } from '../../../env';

@Injectable()
export class AuthConfig {
  @IsNotEmpty({
    message: 'Set Env variable JWT_SECRET, example: secret',
  })
  jwtSecret: string = this.configService.get(ENV_NAMES.JWT_SECRET) as string;

  @IsNotEmpty({
    message: 'Set Env variable LOGIN, example: admin',
  })
  login: string = this.configService.get(ENV_NAMES.LOGIN) as string;

  @IsNotEmpty({
    message: 'Set Env variable PASSWORD, example: password',
  })
  password: string = this.configService.get(ENV_NAMES.PASSWORD) as string;

  @IsNotEmpty({
    message: 'Set Env variable JWT_REFRESH_SECRET, example: dog',
  })
  jwtRefreshSecret: string = this.configService.get(
    ENV_NAMES.JWT_REFRESH_SECRET,
  ) as string;

  constructor(private readonly configService: ConfigService) {
    configValidationUtility.validateConfig(this);
  }
}
