import { Injectable } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { IsBoolean, IsIn, IsNotEmpty, Min, ValidateIf } from 'class-validator';

import { ENV_NAMES } from '../../env';

import { configValidationUtility } from './config-validation.utility';
import { NODE_ENVS } from '../../constants';
import { TNodeEnvs } from '../../types';

@Injectable()
export class CommonConfig {
  @Min(1, { message: 'Set Env variable PORT, example: 4000' })
  port: number = Number(this.configService.get(ENV_NAMES.PORT));

  @IsNotEmpty({
    message: 'Set Env variable DB_USER, example: root',
  })
  dbUser: string = this.configService.get(ENV_NAMES.DB_USER) as string;

  @IsNotEmpty({
    message: 'Set Env variable DB_PASS, example: password',
  })
  dbPass: string = this.configService.get(ENV_NAMES.DB_PASS) as string;

  @IsNotEmpty({
    message: 'Set Env variable DB_NAME, example: db_name',
  })
  dbName: string = this.configService.get(ENV_NAMES.DB_NAME) as string;

  @IsNotEmpty({
    message: 'Set Env variable DB_HOST, example: mongodb://mongodb:27017',
  })
  dbHost: string = this.configService.get(ENV_NAMES.DB_HOST) as string;

  @IsBoolean({
    message:
      'Set Env variable INCLUDE_TESTING_MODULE to enable/disable Dangerous for production TestingModule, example: true, available values: true, false, 0, 1',
  })
  includeTestingModule: boolean = configValidationUtility.convertToBoolean(
    this.configService.get(ENV_NAMES.INCLUDE_TESTING_MODULE) as string,
  ) as boolean;

  @Min(1, {
    message: 'Set Env variable TTL_RATE_LIMIT, example: 10 (in seconds)',
  })
  ttlRateLimit: number = Number(
    this.configService.get(ENV_NAMES.TTL_RATE_LIMIT),
  );

  @Min(1, {
    message: 'Set Env variable NUMBER_RATE_LIMIT, example: 5 (attempts)',
  })
  numberRateLimit: number = Number(
    this.configService.get(ENV_NAMES.NUMBER_RATE_LIMIT),
  );

  @ValidateIf(({ nodeEnv }) => nodeEnv === 'development')
  @IsNotEmpty({
    message: 'Set Env variable PG_USER, example: postgres',
  })
  pgUser: string = this.configService.get(ENV_NAMES.PG_USER) as string;

  @ValidateIf(({ nodeEnv }) => nodeEnv === 'development')
  @IsNotEmpty({
    message: 'Set Env variable PG_PASSWORD, example: secret',
  })
  pgPassword: string = this.configService.get(ENV_NAMES.PG_PASSWORD) as string;

  @ValidateIf(({ nodeEnv }) => nodeEnv === 'development')
  @IsNotEmpty({
    message: 'Set Env variable PG_DB, example: db_name',
  })
  pgDb: string = this.configService.get(ENV_NAMES.PG_DB) as string;

  @ValidateIf(({ nodeEnv }) => nodeEnv === 'development')
  @Min(1, { message: 'Set Env variable PG_PORT, example: 5050' })
  pgPort: number = Number(this.configService.get(ENV_NAMES.PG_PORT));

  @ValidateIf(({ nodeEnv }) => nodeEnv === 'development')
  @IsNotEmpty({
    message: 'Set Env variable PG_HOST, example: pg',
  })
  pgHost: string = this.configService.get(ENV_NAMES.PG_HOST) as string;

  @IsIn(NODE_ENVS, {
    message: 'Set Env variable NODE_ENV, example: development',
  })
  nodeEnv: TNodeEnvs = this.configService.get(ENV_NAMES.NODE_ENV) as TNodeEnvs;

  @ValidateIf(({ nodeEnv }) => nodeEnv === 'production')
  @IsNotEmpty({
    message: 'Set Env variable PG_URL, example: postgres://user:pass@host:port/database?ssl=true',
  })
  pgUrl: string = this.configService.get(ENV_NAMES.PG_URL) as string;

  constructor(private readonly configService: ConfigService) {
    configValidationUtility.validateConfig(this);
  }
}
