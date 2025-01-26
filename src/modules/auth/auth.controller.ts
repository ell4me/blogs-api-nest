import { Response } from 'express';
import {
  Body,
  Controller,
  Get,
  HttpCode,
  HttpStatus,
  Post,
  UseGuards,
  Res,
} from '@nestjs/common';
import { CommandBus } from '@nestjs/cqrs';
import { ThrottlerGuard } from '@nestjs/throttler';

import { UserCreateDto } from '../users/users.dto';
import { UsersQueryRepository } from '../users/infrastructure/users.query-repository';
import { REFRESH_TOKEN_COOKIE_NAME, ROUTERS_PATH } from '../../constants';
import { LocalAuthGuard } from '../../common/guards/local-auth.guard';
import { CurrentUser } from '../../common/decorators/current-user.decorator';
import { AccessTokenGuard } from '../../common/guards/access-token.guard';
import { CurrentUserViewDto } from '../../common/dto/currentUserView.dto';
import { CreateUserCommand } from '../users/application/use-cases/create-user.useCase';
import { Ip } from '../../common/decorators/ip.decorator';
import { UserAgent } from '../../common/decorators/user-agent.decorator';
import { UserRequest } from '../../types';
import {
  DeleteSessionByDeviceIdCommand,
  TExecuteDeleteSessionByDeviceIdResult,
} from '../security-devices/application/use-cases/delete-session-by-device-id.useCase';
import { RefreshTokenGuard } from '../../common/guards/refresh-token.guard';

import {
  PasswordRecoveryDto,
  PasswordRecoveryEmailDto,
  RegistrationConfirmationDto,
  RegistrationEmailResendingDto,
} from './auth.dto';
import {
  RegistrationConfirmationCommand,
  TExecuteRegistrationConfirmationResult,
} from './application/use-cases/registration-confirmation.useCase';
import {
  RegistrationEmailResendingCommand,
  TExecuteRegistrationEmailResendingResult,
} from './application/use-cases/registration-email-resending.useCase';
import {
  SendPasswordRecoveryEmailCommand,
  TExecuteSendPasswordRecoveryEmailResult,
} from './application/use-cases/send-password-recovery-email.useCase';
import {
  TExecuteUpdateUserPasswordByRecoveryCodeResult,
  UpdateUserPasswordByRecoveryCodeCommand,
} from './application/use-cases/update-user-password-by-recovery-code.useCase';
import {
  LoginCommand,
  TExecuteLoginResult,
} from './application/use-cases/login.useCase';
import {
  RefreshTokenCommand,
  TExecuteRefreshTokenResult,
} from './application/use-cases/refresh-token.useCase';
import { Tokens } from './auth.types';

@Controller(ROUTERS_PATH.AUTH)
export class AuthController {
  constructor(
    private readonly usersQueryRepository: UsersQueryRepository,
    private readonly commandBus: CommandBus,
  ) {}

  @UseGuards(ThrottlerGuard, LocalAuthGuard)
  @HttpCode(HttpStatus.OK)
  @Post('login')
  async login(
    @Res({ passthrough: true }) res: Response,
    @CurrentUser('id') userId: string,
    @Ip() ip: string,
    @UserAgent() userAgent: string,
  ): Promise<Pick<Tokens, 'accessToken'>> {
    const { accessToken, refreshToken } = await this.commandBus.execute<
      LoginCommand,
      TExecuteLoginResult
    >(new LoginCommand({ userId, ip, deviceName: userAgent }));

    res.cookie(REFRESH_TOKEN_COOKIE_NAME, refreshToken, {
      httpOnly: true,
      secure: true,
    });

    return { accessToken };
  }

  @UseGuards(ThrottlerGuard)
  @HttpCode(HttpStatus.NO_CONTENT)
  @Post('registration')
  async registration(@Body() userCreateDto: UserCreateDto): Promise<void> {
    await this.commandBus.execute(new CreateUserCommand(userCreateDto, true));

    return;
  }

  @UseGuards(AccessTokenGuard)
  @Get('me')
  async getCurrentUser(
    @CurrentUser('id') userId: string,
  ): Promise<CurrentUserViewDto> {
    return this.usersQueryRepository.getCurrentUser(userId);
  }

  @UseGuards(ThrottlerGuard)
  @HttpCode(HttpStatus.NO_CONTENT)
  @Post('registration-confirmation')
  registrationConfirmation(
    @Body() registrationConfirmationDto: RegistrationConfirmationDto,
  ): Promise<void> {
    return this.commandBus.execute<
      RegistrationConfirmationCommand,
      TExecuteRegistrationConfirmationResult
    >(new RegistrationConfirmationCommand(registrationConfirmationDto));
  }

  @UseGuards(ThrottlerGuard, LocalAuthGuard)
  @HttpCode(HttpStatus.NO_CONTENT)
  @Post('registration-email-resending')
  registrationEmailResending(
    @Body() registrationEmailResendingDto: RegistrationEmailResendingDto,
  ): Promise<void> {
    return this.commandBus.execute<
      RegistrationEmailResendingCommand,
      TExecuteRegistrationEmailResendingResult
    >(new RegistrationEmailResendingCommand(registrationEmailResendingDto));
  }

  @UseGuards(ThrottlerGuard)
  @HttpCode(HttpStatus.NO_CONTENT)
  @Post('password-recovery')
  async sendPasswordRecoveryEmail(
    @Body() passwordRecoveryEmailDto: PasswordRecoveryEmailDto,
  ): Promise<void> {
    return this.commandBus.execute<
      SendPasswordRecoveryEmailCommand,
      TExecuteSendPasswordRecoveryEmailResult
    >(new SendPasswordRecoveryEmailCommand(passwordRecoveryEmailDto));
  }

  @UseGuards(ThrottlerGuard)
  @HttpCode(HttpStatus.NO_CONTENT)
  @Post('new-password')
  updateUserPasswordByRecoveryCode(
    @Body() passwordRecoveryDto: PasswordRecoveryDto,
  ): Promise<void> {
    return this.commandBus.execute<
      UpdateUserPasswordByRecoveryCodeCommand,
      TExecuteUpdateUserPasswordByRecoveryCodeResult
    >(new UpdateUserPasswordByRecoveryCodeCommand(passwordRecoveryDto));
  }

  @UseGuards(RefreshTokenGuard)
  @HttpCode(HttpStatus.NO_CONTENT)
  @Post('logout')
  async logout(@CurrentUser() user: UserRequest): Promise<void> {
    return this.commandBus.execute<
      DeleteSessionByDeviceIdCommand,
      TExecuteDeleteSessionByDeviceIdResult
    >(new DeleteSessionByDeviceIdCommand(user.deviceId!, user.id));
  }

  @UseGuards(RefreshTokenGuard)
  @HttpCode(HttpStatus.OK)
  @Post('refresh-token')
  async refreshToken(
    @Res({ passthrough: true }) res: Response,
    @CurrentUser() user: UserRequest,
    @Ip() ip: string,
    @UserAgent() userAgent: string,
  ): Promise<Pick<Tokens, 'accessToken'>> {
    const tokens = await this.commandBus.execute<
      RefreshTokenCommand,
      TExecuteRefreshTokenResult
    >(
      new RefreshTokenCommand(user.deviceId!, {
        userId: user.id,
        ip,
        deviceName: userAgent,
      }),
    );

    res.cookie(REFRESH_TOKEN_COOKIE_NAME, tokens.refreshToken, {
      httpOnly: true,
      secure: true,
    });

    return { accessToken: tokens.accessToken };
  }
}
