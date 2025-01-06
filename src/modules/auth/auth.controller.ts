import {
  BadRequestException,
  Body,
  Controller,
  HttpCode,
  HttpStatus,
  Post,
} from '@nestjs/common';

import { UserCreateDto } from '../users/users.dto';
import { UsersQueryRepository } from '../users/users.query-repository';
import { ROUTERS_PATH } from '../../constants';

import { AuthService } from './auth.service';
import {
  PasswordRecoveryDto,
  PasswordRecoveryEmailDto,
  RegistrationConfirmationDto,
  RegistrationEmailResendingDto,
} from './auth.dto';

@Controller(ROUTERS_PATH.AUTH)
export class AuthController {
  constructor(
    private readonly authService: AuthService,
    private readonly usersQueryRepository: UsersQueryRepository,
  ) {}

  // @Post('login')
  // async login() {
  //   const token = await this.authService.login(req.user.id);
  //   if (!token) {
  //     res.sendStatus(HTTP_STATUSES.UNAUTHORIZED_401);
  //     return;
  //   }
  //
  //   return token;
  // }

  @HttpCode(HttpStatus.NO_CONTENT)
  @Post('registration')
  async registration(@Body() userCreateDto: UserCreateDto): Promise<void> {
    const result = await this.authService.registration(userCreateDto);

    if (result) {
      throw new BadRequestException(result);
    }

    return;
  }

  // @Get('me')
  // async getCurrentUser(): Promise<CurrentUserViewDto> {
  //   return this.usersQueryRepository.getCurrentUser(req.user?.id!);
  // }

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
