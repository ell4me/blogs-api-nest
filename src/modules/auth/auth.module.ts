import { Module } from '@nestjs/common';
import { PassportModule } from '@nestjs/passport';
import { JwtModule } from '@nestjs/jwt';

import { UsersModule } from '../users/users.module';
import { EXPIRATION_TOKEN } from '../../constants';
import { EmailAdapterModule } from '../../common/adapters/email/email-adapter.module';

import { BasicStrategy } from './application/strategies/basic.strategy';
import { AuthController } from './auth.controller';
import { JwtStrategy } from './application/strategies/jwt.strategy';
import { LocalStrategy } from './application/strategies/local.strategy';
import { AuthConfig } from './config/auth.config';
import { AuthConfigModule } from './config/auth-config.module';
import { RegistrationConfirmationUseCase } from './application/use-cases/registration-confirmation.useCase';
import { RegistrationEmailResendingUseCase } from './application/use-cases/registration-email-resending.useCase';
import { SendPasswordRecoveryEmailUseCase } from './application/use-cases/send-password-recovery-email.useCase';
import { UpdateUserPasswordByRecoveryCodeUseCase } from './application/use-cases/update-user-password-by-recovery-code.useCase';
import { LoginUserUseCase } from './application/use-cases/login-user.useCase';
import { ValidateCorrectUserUseCase } from './application/use-cases/validate-correct-user';

const useCases = [
  RegistrationConfirmationUseCase,
  RegistrationEmailResendingUseCase,
  SendPasswordRecoveryEmailUseCase,
  UpdateUserPasswordByRecoveryCodeUseCase,
  LoginUserUseCase,
  ValidateCorrectUserUseCase,
];

@Module({
  imports: [
    EmailAdapterModule,
    PassportModule,
    UsersModule,
    AuthConfigModule,
    JwtModule.registerAsync({
      imports: [AuthConfigModule],
      useFactory: (authConfig: AuthConfig) => ({
        secret: authConfig.jwtSecret,
        signOptions: { expiresIn: EXPIRATION_TOKEN.ACCESS },
      }),
      inject: [AuthConfig],
    }),
  ],
  controllers: [AuthController],
  providers: [BasicStrategy, JwtStrategy, LocalStrategy, ...useCases],
})
export class AuthModule {}
