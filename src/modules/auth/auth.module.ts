import { Module } from '@nestjs/common';
import { PassportModule } from '@nestjs/passport';
import { JwtModule } from '@nestjs/jwt';

import { UsersModule } from '../users/users.module';
import { EmailAdapterModule } from '../../common/adapters/email/email-adapter.module';
import { SecurityDevicesModule } from '../security-devices/security-devices.module';

import { BasicStrategy } from './application/strategies/basic.strategy';
import { AuthController } from './auth.controller';
import { AccessTokenStrategy } from './application/strategies/access-token.strategy';
import { LocalStrategy } from './application/strategies/local.strategy';
import { AuthConfigModule } from './config/auth-config.module';
import { RegistrationConfirmationUseCase } from './application/use-cases/registration-confirmation.useCase';
import { RegistrationEmailResendingUseCase } from './application/use-cases/registration-email-resending.useCase';
import { SendPasswordRecoveryEmailUseCase } from './application/use-cases/send-password-recovery-email.useCase';
import { UpdateUserPasswordByRecoveryCodeUseCase } from './application/use-cases/update-user-password-by-recovery-code.useCase';
import { LoginUseCase } from './application/use-cases/login.useCase';
import { ValidateCorrectUserUseCase } from './application/use-cases/validate-correct-user';
import { RefreshTokenUseCase } from './application/use-cases/refresh-token.useCase';
import { RefreshTokenStrategy } from './application/strategies/refresh-token.strategy';
import { TokensService } from './application/tokens.service';

const useCases = [
  RegistrationConfirmationUseCase,
  RegistrationEmailResendingUseCase,
  SendPasswordRecoveryEmailUseCase,
  UpdateUserPasswordByRecoveryCodeUseCase,
  LoginUseCase,
  ValidateCorrectUserUseCase,
  RefreshTokenUseCase,
];

const strategies = [
  BasicStrategy,
  AccessTokenStrategy,
  RefreshTokenStrategy,
  LocalStrategy,
];

@Module({
  imports: [
    JwtModule,
    EmailAdapterModule,
    PassportModule,
    UsersModule,
    AuthConfigModule,
    SecurityDevicesModule,
  ],
  controllers: [AuthController],
  providers: [TokensService, ...strategies, ...useCases],
})
export class AuthModule {}
