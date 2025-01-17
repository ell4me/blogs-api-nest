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

import { UserCreateDto } from '../users/users.dto';
import { UsersQueryRepository } from '../users/infrastructure/users.query-repository';
import { ROUTERS_PATH } from '../../constants';
import { LocalAuthGuard } from '../../guards/local-auth.guard';
import { CurrentUser } from '../../decorators/currentUser.decorator';
import { JwtAuthGuard } from '../../guards/jwt-auth.guard';
import { CurrentUserViewDto } from '../../dto/currentUserView.dto';
import { Token } from '../users/users.types';

import {
  PasswordRecoveryDto,
  PasswordRecoveryEmailDto,
  RegistrationConfirmationDto,
  RegistrationEmailResendingDto,
} from './auth.dto';
import { AuthService } from './application/auth.service';

@Controller(ROUTERS_PATH.AUTH)
export class AuthController {
  constructor(
    private readonly authService: AuthService,
    private readonly usersQueryRepository: UsersQueryRepository,
  ) {}

  @UseGuards(LocalAuthGuard)
  @HttpCode(HttpStatus.OK)
  @Post('login')
  async login(@CurrentUser('id') userId: string): Promise<Token> {
    return this.authService.login(userId);
  }

  @HttpCode(HttpStatus.NO_CONTENT)
  @Post('registration')
  async registration(@Body() userCreateDto: UserCreateDto): Promise<void> {
    const result = await this.authService.registration(userCreateDto);
    if (result) {
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
    const result = await this.authService.registrationConfirmation(
      registrationConfirmationDto,
    );

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
    const result = await this.authService.registrationEmailResending(
      registrationEmailResendingDto,
    );

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
    await this.authService.sendPasswordRecoveryEmail(passwordRecoveryEmailDto);
    return;
  }

  @HttpCode(HttpStatus.NO_CONTENT)
  @Post('new-password')
  async updateUserPasswordByRecoveryCode(
    @Body() passwordRecoveryDto: PasswordRecoveryDto,
  ): Promise<void> {
    const result =
      await this.authService.updateUserPasswordByRecoveryCode(
        passwordRecoveryDto,
      );

    if ('errorsMessages' in result) {
      throw new BadRequestException(result);
    }

    return;
  }
}
