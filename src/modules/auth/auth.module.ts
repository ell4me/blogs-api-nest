import { Module } from '@nestjs/common';
import { PassportModule } from '@nestjs/passport';
import { ConfigModule, ConfigService } from '@nestjs/config';
import { JwtModule } from '@nestjs/jwt';

import { UsersModule } from '../users/users.module';
import { ENV_NAMES } from '../../env';
import { EXPIRATION_TOKEN } from '../../constants';

import { BasicStrategy } from './strategies/basic.strategy';
import { EmailAdapter } from './adapters/email.adapter';
import { AuthService } from './auth.service';
import { AuthController } from './auth.controller';
import { JwtStrategy } from './strategies/jwt.strategy';
import { LocalStrategy } from './strategies/local.strategy';

@Module({
  imports: [
    PassportModule,
    ConfigModule,
    UsersModule,
    JwtModule.registerAsync({
      imports: [ConfigModule],
      useFactory: (configService: ConfigService) => ({
        secret: configService.get(ENV_NAMES.JWT_SECRET),
        signOptions: { expiresIn: EXPIRATION_TOKEN.ACCESS },
      }),
      inject: [ConfigService],
    }),
  ],
  controllers: [AuthController],
  providers: [
    BasicStrategy,
    EmailAdapter,
    AuthService,
    JwtStrategy,
    LocalStrategy,
  ],
})
export class AuthModule {}
