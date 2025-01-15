import { Test } from '@nestjs/testing';
import { MongooseModule } from '@nestjs/mongoose';

import {
  closeMongoConnection,
  rootMongooseTestModule,
} from '../../testing/helpers/mongoMemoryServer';
import { ValidationErrorViewDto } from '../../types';
import { VALIDATION_MESSAGES } from '../../constants';
import { createUserByUserService } from '../../testing/helpers/createUserByUserService';

import { UsersService } from './users.service';
import { User, UserDocument, UserSchema } from './users.model';
import { UserCreateDto } from './users.dto';
import { UsersRepository } from './users.repository';

describe('UsersService', () => {
  let usersService: UsersService;
  let usersRepository: UsersRepository;

  beforeAll(async () => {
    const moduleRef = await Test.createTestingModule({
      imports: [
        rootMongooseTestModule(),
        MongooseModule.forFeature([{ name: User.name, schema: UserSchema }]),
      ],
      providers: [UsersService, UsersRepository],
    }).compile();

    usersService = moduleRef.get(UsersService);
    usersRepository = moduleRef.get(UsersRepository);
  });

  describe('Create user', () => {
    let spyUsersRepositoryCreate;
    const userCreateDto: UserCreateDto = {
      email: 'test@mail.ru',
      login: 'test',
      password: 'qwerty',
    };

    beforeEach(() => {
      spyUsersRepositoryCreate = jest.spyOn(usersRepository, 'create');
    });

    afterEach(() => {
      jest.restoreAllMocks();
    });

    it('should create user', async () => {
      const result = await usersService.createUser(userCreateDto);
      const createdUser = await usersService.getUserByEmailOrLogin({
        login: userCreateDto.login,
      });

      expect((result as ValidationErrorViewDto).errorsMessages).toBeUndefined();
      expect(userCreateDto.email).toBe((result as UserDocument).email);
      expect(userCreateDto.login).toBe((result as UserDocument).login);

      expect(createdUser?.email).toEqual(userCreateDto.email);

      expect(spyUsersRepositoryCreate).toHaveBeenCalledTimes(1);
    });

    it('shouldn`t create user with already existed email', async () => {
      const result = await usersService.createUser(userCreateDto);

      expect(result).toMatchObject({
        errorsMessages: [
          {
            field: 'email',
            message: VALIDATION_MESSAGES.FIELD_IS_EXIST('email'),
          },
        ],
      } as ValidationErrorViewDto);

      expect(spyUsersRepositoryCreate).not.toHaveBeenCalled();
    });

    it('shouldn`t create user with already existed login', async () => {
      const result = await usersService.createUser({
        ...userCreateDto,
        email: 'test',
      });

      expect(result).toMatchObject({
        errorsMessages: [
          {
            field: 'login',
            message: VALIDATION_MESSAGES.FIELD_IS_EXIST('login'),
          },
        ],
      } as ValidationErrorViewDto);

      expect(spyUsersRepositoryCreate).not.toHaveBeenCalled();
    });
  });

  describe('Delete user', () => {
    let user: UserDocument;

    beforeAll(async () => {
      await usersRepository.deleteAll();
      user = await createUserByUserService(usersService);
    });

    it('should delete user', async () => {
      const result = await usersService.deleteUserById(user.id);
      const deletedUser = await usersService.getUserByEmailOrLogin({
        login: user.login,
      });

      expect(result).toBe(true);
      expect(deletedUser).toBe(null);
    });

    it('should return false if user doesn`t exist', async () => {
      const result = await usersService.deleteUserById(user.id);

      expect(result).toBe(false);
    });
  });

  describe('Email confirmation', () => {
    let user: UserDocument;

    beforeAll(async () => {
      await usersRepository.deleteAll();
      user = await createUserByUserService(usersService);
    });

    it('should update email confirmation code', async () => {
      const oldConfirmationCode = user.emailConfirmation.code;
      const updatedUser = await usersService.updateUserEmailConfirmation(
        user,
        true,
      );

      expect(updatedUser.emailConfirmation.code).not.toEqual(
        oldConfirmationCode,
      );
      expect(updatedUser.emailConfirmation.code).toBeTruthy();
      expect(updatedUser.emailConfirmation.isConfirmed).toEqual(false);
    });

    it('should return isConfirmed = true, if newConfirmationCode doesnt` pass', async () => {
      const updatedUser = await usersService.updateUserEmailConfirmation(user);
      const userByConfirmationCode =
        await usersService.getUserByConfirmationCode(
          updatedUser.emailConfirmation.code,
        );

      expect(updatedUser.emailConfirmation.isConfirmed).toEqual(true);
      expect(userByConfirmationCode!.emailConfirmation.isConfirmed).toEqual(
        true,
      );
    });
  });

  describe('Password recovery', () => {
    let user: UserDocument;

    beforeAll(async () => {
      await usersRepository.deleteAll();
      user = await createUserByUserService(usersService);
    });

    it('should update password recovery code', async () => {
      const oldPasswordRecoveryCode = user.passwordRecovery?.code;
      const updatedUser = await usersService.updateUserPasswordRecovery(
        user,
        true,
      );

      expect(updatedUser.passwordRecovery?.code).not.toEqual(
        oldPasswordRecoveryCode,
      );
      expect(updatedUser.passwordRecovery?.code).toBeTruthy();
      expect(updatedUser.passwordRecovery?.expiration).toBeTruthy();
    });

    // TODO: разобраться почему обновление пароля приходит с задержкой
    it.skip('should update password', async () => {
      const oldPassword = user.password;
      const updatedUser = await usersService.updateUserPassword(
        user,
        'new password',
      );

      const userByRecoveryCode =
        await usersService.getUserByPasswordRecoveryCode(
          user.passwordRecovery?.code as string,
        );

      expect(userByRecoveryCode?.login).toEqual(user.login);
      expect(userByRecoveryCode?.password).not.toEqual(oldPassword);

      expect(updatedUser.password).not.toEqual(oldPassword);
      expect(updatedUser.password).toBeTruthy();
    });

    it('should remove password recovery code', async () => {
      const oldPasswordRecoveryCode = user.passwordRecovery?.code;
      const updatedUser = await usersService.updateUserPasswordRecovery(user);

      expect(updatedUser.passwordRecovery?.code).not.toEqual(
        oldPasswordRecoveryCode,
      );
      expect(updatedUser.passwordRecovery?.code).toBeFalsy();
      expect(updatedUser.passwordRecovery?.expiration).toBeFalsy();
    });
  });

  afterAll(async () => {
    await closeMongoConnection();
  });
});
