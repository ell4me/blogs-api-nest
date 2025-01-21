import {
  BadRequestException,
  Body,
  Controller,
  Get,
  HttpCode,
  HttpStatus,
  Post,
  UseGuards,
} from '@nestjs/common';
import { CommandBus } from '@nestjs/cqrs';

import { UserCreateDto } from '../users/users.dto';
import { UsersQueryRepository } from '../users/infrastructure/users.query-repository';
import { ROUTERS_PATH } from '../../constants';
import { LocalAuthGuard } from '../../common/guards/local-auth.guard';
import { CurrentUser } from '../../common/decorators/currentUser.decorator';
import { JwtAuthGuard } from '../../common/guards/jwt-auth.guard';
import { CurrentUserViewDto } from '../../common/dto/currentUserView.dto';
import { Token } from '../users/users.types';
import { CreateUserCommand } from '../users/application/use-cases/create-user.useCase';
import { ValidationErrorViewDto } from '../../types';

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
  LoginUserCommand,
  TExecuteLoginUserResult,
} from './application/use-cases/login-user.useCase';

@Controller(ROUTERS_PATH.AUTH)
export class AuthController {
  constructor(
    private readonly usersQueryRepository: UsersQueryRepository,
    private readonly commandBus: CommandBus,
  ) {}

  @UseGuards(LocalAuthGuard)
  @HttpCode(HttpStatus.OK)
  @Post('login')
  async login(@CurrentUser('id') userId: string): Promise<Token> {
    return this.commandBus.execute<LoginUserCommand, TExecuteLoginUserResult>(
      new LoginUserCommand(userId),
    );
  }

  @HttpCode(HttpStatus.NO_CONTENT)
  @Post('registration')
  async registration(@Body() userCreateDto: UserCreateDto): Promise<void> {
    const result = await this.commandBus.execute<
      CreateUserCommand,
      { id: string } | ValidationErrorViewDto
    >(new CreateUserCommand(userCreateDto, true));

    if ('errorsMessages' in result) {
      throw new BadRequestException(result);
    }

    return;
  }

  @UseGuards(JwtAuthGuard)
  @Get('me')
  async getCurrentUser(
    @CurrentUser('id') userId: string,
  ): Promise<CurrentUserViewDto> {
    return this.usersQueryRepository.getCurrentUser(userId);
  }

  @HttpCode(HttpStatus.NO_CONTENT)
  @Post('registration-confirmation')
  async registrationConfirmation(
    @Body() registrationConfirmationDto: RegistrationConfirmationDto,
  ): Promise<void> {
    const result = await this.commandBus.execute<
      RegistrationConfirmationCommand,
      TExecuteRegistrationConfirmationResult
    >(new RegistrationConfirmationCommand(registrationConfirmationDto));

    if (result) {
      throw new BadRequestException(result);
    }

    return;
  }

  @HttpCode(HttpStatus.NO_CONTENT)
  @Post('registration-email-resending')
  async registrationEmailResending(
    @Body() registrationEmailResendingDto: RegistrationEmailResendingDto,
  ): Promise<void> {
    const result = await this.commandBus.execute<
      RegistrationEmailResendingCommand,
      TExecuteRegistrationEmailResendingResult
    >(new RegistrationEmailResendingCommand(registrationEmailResendingDto));

    if (result) {
      throw new BadRequestException(result);
    }

    return;
  }

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

  @HttpCode(HttpStatus.NO_CONTENT)
  @Post('new-password')
  async updateUserPasswordByRecoveryCode(
    @Body() passwordRecoveryDto: PasswordRecoveryDto,
  ): Promise<void> {
    const result = await this.commandBus.execute<
      UpdateUserPasswordByRecoveryCodeCommand,
      TExecuteUpdateUserPasswordByRecoveryCodeResult
    >(new UpdateUserPasswordByRecoveryCodeCommand(passwordRecoveryDto));

    if ('errorsMessages' in result) {
      throw new BadRequestException(result);
    }

    return;
  }
}
